import mongoose from 'mongoose';
import { createLogger } from './logger.js';

const log = createLogger('MongooseMockFallback');

// In-memory store for documents
export const memDB = {};

// Helper to convert schemas to plain objects and match Query syntax
export function setupMongooseMockFallback() {
  log.info('Initializing Mongoose In-Memory/Mock Fallback Engine...');

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

  // 3. Mock Model.insertMany
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

  // 4. Mock Query.prototype.exec
  mongoose.Query.prototype.exec = async function() {
    const modelName = this.model.modelName;
    const op = this.op;
    const filter = this.getFilter();
    const update = this.getUpdate();

    if (!memDB[modelName]) memDB[modelName] = [];
    const list = memDB[modelName];

    // Basic query matching helper
    const match = (item) => {
      for (const key in filter) {
        const val = filter[key];
        
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

    log.info(`[MockDB Query] ${modelName}.${op}`, { filter, update });

    if (op === 'find') {
      const results = list.filter(match);
      return results.map(item => new this.model(item));
    }
    
    if (op === 'findOne' || op === 'findById') {
      const found = list.find(match);
      return found ? new this.model(found) : null;
    }

    if (op === 'findOneAndUpdate' || op === 'updateOne') {
      const found = list.find(match);
      if (found) {
        if (update && update.$set) {
          Object.assign(found, update.$set);
        } else if (update) {
          // Merge updates directly if they are simple objects
          if (!update.$inc && !update.$push && !update.$pull) {
            Object.assign(found, update);
          }
        }
        
        // Handle basic modifiers if present
        if (update && update.$inc) {
          for (const k in update.$inc) {
            found[k] = (found[k] || 0) + update.$inc[k];
          }
        }
        
        return new this.model(found);
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
