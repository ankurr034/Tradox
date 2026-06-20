import mongoose from 'mongoose';
import { createLogger } from './logger.js';

const log = createLogger('MongooseMockFallback');

// In-memory store for documents
export const memDB = {};

// Helper to convert schemas to plain objects and match Query syntax
export function setupMongooseMockFallback() {
  log.info('Initializing Mongoose In-Memory/Mock Fallback Engine...');

  // 0. Re-enable bufferCommands so queries reach our mock exec() instead of
  //    throwing "Cannot call X before initial connection is complete".
  mongoose.set('bufferCommands', true);

  // 1. Mock connection readyState
  Object.defineProperty(mongoose.connection, 'readyState', {
    get: () => 1,
    configurable: true
  });

  // 2. Mock Model.prototype.save
  mongoose.Model.prototype.save = async function() {
    const modelName = this.constructor.modelName;
    if (!memDB[modelName]) memDB[modelName] = [];

    if (!this._id) {
      this._id = new mongoose.Types.ObjectId();
    }

    const obj = this.toObject();
    const index = memDB[modelName].findIndex(d => d._id.toString() === obj._id.toString());
    if (index >= 0) {
      memDB[modelName][index] = obj;
    } else {
      memDB[modelName].push(obj);
    }
    
    // Set version key if concurrency controls exist
    this.__v = (this.__v || 0) + 1;
    
    log.info(`[MockDB] Saved document in ${modelName}`, { id: this._id.toString() });
    return this;
  };

  // 3. Mock Model.create and Model.insertMany
  mongoose.Model.create = async function(docs, _options) {
    const isArray = Array.isArray(docs);
    const docsArray = isArray ? docs : [docs];
    const inserted = [];
    for (const doc of docsArray) {
      const instance = new this(doc);
      await instance.save();
      inserted.push(instance);
    }
    return isArray ? inserted : inserted[0];
  };

  mongoose.Model.insertMany = async function(docs, _options) {
    const modelName = this.modelName;
    if (!memDB[modelName]) memDB[modelName] = [];
    const inserted = [];
    
    const docsArray = Array.isArray(docs) ? docs : [docs];
    for (const doc of docsArray) {
      const instance = doc instanceof mongoose.Model ? doc : new this(doc);
      if (!instance._id) {
        instance._id = new mongoose.Types.ObjectId();
      }
      const obj = instance.toObject();
      memDB[modelName].push(obj);
      inserted.push(instance);
    }
    log.info(`[MockDB] Inserted ${inserted.length} documents in ${modelName}`);
    return inserted;
  };

  // 4. Mock Query.prototype.exec — handles all query operations
  mongoose.Query.prototype.exec = async function() {
    const modelName = this.model.modelName;
    const op = this.op;
    const filter = this.getFilter();
    const update = this.getUpdate();

    if (!memDB[modelName]) memDB[modelName] = [];
    const list = memDB[modelName];

    // Check if .lean() was called on this query
    const isLean = !!(this._mongooseOptions && this._mongooseOptions.lean);

    // Basic query matching helper
    const match = (item) => {
      for (const key in filter) {
        const val = filter[key];
        
        // Handle $or operator
        if (key === '$or' && Array.isArray(val)) {
          const orMatch = val.some(cond => {
            for (const k in cond) {
              if (item[k]?.toString() === cond[k]?.toString()) return true;
            }
            return false;
          });
          if (!orMatch) return false;
          continue;
        }

        // Handle nested or complex key checks
        if (val && typeof val === 'object') {
          if (val.$oid) {
            if (item[key]?.toString() !== val.$oid.toString()) return false;
          } else if (val instanceof mongoose.Types.ObjectId) {
            if (item[key]?.toString() !== val.toString()) return false;
          } else if (Array.isArray(val.$in)) {
            const itemVal = item[key]?.toString() || '';
            const matchIn = val.$in.some(v => v?.toString() === itemVal);
            if (!matchIn) return false;
          } else if (val.$ne !== undefined) {
            if (item[key] === val.$ne) return false;
          } else if (val.$gt !== undefined) {
            if (!(item[key] > val.$gt)) return false;
          } else if (val.$gte !== undefined) {
            if (!(item[key] >= val.$gte)) return false;
          } else if (val.$lt !== undefined) {
            if (!(item[key] < val.$lt)) return false;
          } else if (val.$lte !== undefined) {
            if (!(item[key] <= val.$lte)) return false;
          } else if (val.toString() !== item[key]?.toString()) {
            return false;
          }
        } else {
          // Standard scalar value match
          if (item[key] !== val) {
            // Support string vs ObjectId matching
            if (item[key]?.toString() !== val?.toString()) {
              return false;
            }
          }
        }
      }
      return true;
    };

    // Helper to wrap result depending on lean mode
    const wrap = (item) => isLean ? { ...item } : new this.model(item);

    log.info(`[MockDB Query] ${modelName}.${op}`, { filter });

    if (op === 'find') {
      let results = list.filter(match);
      
      // Handle sort
      const sortOpts = this.options?.sort || this.getOptions()?.sort;
      if (sortOpts) {
        const sortKey = typeof sortOpts === 'string' ? sortOpts : Object.keys(sortOpts)[0];
        const sortDir = typeof sortOpts === 'string' ? 1 : (sortOpts[sortKey] || 1);
        results.sort((a, b) => {
          if (a[sortKey] < b[sortKey]) return -1 * sortDir;
          if (a[sortKey] > b[sortKey]) return 1 * sortDir;
          return 0;
        });
      }

      // Handle limit
      const limitVal = this.options?.limit;
      if (limitVal && limitVal > 0) {
        results = results.slice(0, limitVal);
      }

      return results.map(item => wrap(item));
    }
    
    if (op === 'findOne' || op === 'findById') {
      const found = list.find(match);
      return found ? wrap(found) : null;
    }

    if (op === 'findOneAndUpdate' || op === 'updateOne') {
      const found = list.find(match);
      if (found) {
        if (update && update.$set) {
          Object.assign(found, update.$set);
        } else if (update) {
          if (!update.$inc && !update.$push && !update.$pull) {
            Object.assign(found, update);
          }
        }
        
        if (update && update.$inc) {
          for (const k in update.$inc) {
            found[k] = (found[k] || 0) + update.$inc[k];
          }
        }
        
        return wrap(found);
      }
      return null;
    }

    if (op === 'findOneAndDelete') {
      const idx = list.findIndex(match);
      if (idx >= 0) {
        const [removed] = list.splice(idx, 1);
        return wrap(removed);
      }
      return null;
    }

    if (op === 'countDocuments' || op === 'count') {
      return list.filter(match).length;
    }

    if (op === 'deleteOne' || op === 'deleteMany') {
      const beforeLen = list.length;
      memDB[modelName] = list.filter(item => !match(item));
      return { deletedCount: beforeLen - memDB[modelName].length };
    }

    return null;
  };
}
