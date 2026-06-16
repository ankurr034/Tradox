import Trigger from '../models/Trigger.js';
import PaperTradingEngine from './PaperTradingEngine.js';
import { createLogger } from '../utils/logger.js';


const log = createLogger('TriggerService');

class TriggerService {
  async addTrigger({ userId, symbol, triggerPrice, triggerType, action, quantity }) {
    const trigger = await Trigger.create({
      userId,
      symbol: symbol.toUpperCase(),
      triggerPrice: parseFloat(triggerPrice),
      triggerType,
      action,
      quantity: parseInt(quantity, 10),
      status: 'PENDING'
    });
    log.info(`GTT Trigger created: ID ${trigger._id} for ${symbol} at ₹${triggerPrice}`);
    return trigger;
  }

  async cancelTrigger(triggerId, userId) {
    const trigger = await Trigger.findOne({ _id: triggerId, userId });
    if (!trigger) {
      throw new Error('Trigger not found');
    }
    trigger.status = 'CANCELLED';
    trigger.updatedAt = Date.now();
    await trigger.save();
    log.info(`GTT Trigger cancelled: ID ${triggerId}`);
    return trigger;
  }

  async checkTriggers(symbol, currentPrice) {
    const sym = symbol.toUpperCase();
    
    // Find pending triggers for the symbol
    const pendingTriggers = await Trigger.find({
      symbol: sym,
      status: 'PENDING'
    }).lean();

    for (const t of pendingTriggers) {
      let isTriggered = false;
      
      // Determine if threshold is crossed based on action
      if (t.action === 'BUY' && currentPrice <= t.triggerPrice) {
        isTriggered = true;
      } else if (t.action === 'SELL' && currentPrice >= t.triggerPrice) {
        isTriggered = true;
      }

      if (isTriggered) {
        // Atomic status update to FILLED to prevent double execution (Idempotency check)
        const updated = await Trigger.findOneAndUpdate(
          { _id: t._id, status: 'PENDING' },
          { $set: { status: 'FILLED', updatedAt: Date.now() } },
          { new: true }
        );

        if (updated) {
          log.info(`Triggering GTT order execution for ID: ${t._id} - ${sym} at ₹${currentPrice}`);
          try {
            await PaperTradingEngine.executeOrder(t.userId, {
              symbol: t.symbol,
              action: t.action,
              quantity: t.quantity,
              type: 'MARKET',
              price: currentPrice,
              isPaperTrade: true
            });
            log.info(`Successfully executed GTT order for trigger ID: ${t._id}`);
          } catch (err) {
            log.error(`GTT trigger execution failed for trigger ID: ${t._id}`, { error: err.message });
            // Revert status to PENDING if trigger execution fails, allowing retry
            await Trigger.updateOne({ _id: t._id }, { $set: { status: 'PENDING' } });
          }
        }
      }
    }
  }
}

export default new TriggerService();
