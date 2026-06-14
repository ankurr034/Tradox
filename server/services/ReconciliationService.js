import { PaperPosition, PaperOrder, PaperAccount } from '../models/PaperTrading.js';
import { writeAuditLog } from '../middleware/audit.js';
import { createLogger } from '../utils/logger.js';
import Big from 'big.js';

const log = createLogger('ReconciliationService');

class ReconciliationService {
  async reconcileUser(userId) {
    log.info(`Initiating reconciliation check for user: ${userId}`);
    const reports = [];
    let severity = 'INFO';
    let hasAnomaly = false;

    try {
      // 1. Reconcile Account Balance
      const account = await PaperAccount.findOne({ userId });
      const orders = await PaperOrder.find({ userId, status: 'FILLED' }).lean();

      if (account) {
        let expectedBalance = new Big(1000000); // 10L starting balance
        for (const order of orders) {
          const orderVal = new Big(order.fillPrice).times(order.quantity);
          if (order.action === 'BUY') {
            expectedBalance = expectedBalance.minus(orderVal);
          } else {
            expectedBalance = expectedBalance.plus(orderVal);
          }
        }

        const actualBalance = new Big(account.balance);
        const drift = actualBalance.minus(expectedBalance).abs();

        if (drift.gt(0.01)) { // Allow minor rounding differences
          hasAnomaly = true;
          severity = 'CRITICAL';
          reports.push({
            type: 'BALANCE_DRIFT',
            detail: `Balance mismatch detected. Expected: ₹${expectedBalance.toFixed(2)}, Actual: ₹${actualBalance.toFixed(2)}, Drift: ₹${drift.toFixed(2)}`
          });
        }
      }

      // 2. Reconcile Stock Quantities
      const positions = await PaperPosition.find({ userId }).lean();
      for (const pos of positions) {
        let expectedQty = new Big(0);
        const stockOrders = orders.filter(o => o.symbol === pos.symbol);

        for (const order of stockOrders) {
          if (order.action === 'BUY') {
            expectedQty = expectedQty.plus(order.quantity);
          } else {
            expectedQty = expectedQty.minus(order.quantity);
          }
        }

        const actualQty = new Big(pos.quantity);
        if (!actualQty.eq(expectedQty)) {
          hasAnomaly = true;
          severity = 'WARNING';
          reports.push({
            type: 'HOLDINGS_DRIFT',
            symbol: pos.symbol,
            detail: `Holding quantity mismatch for ${pos.symbol}. Expected: ${expectedQty.toString()}, Actual: ${actualQty.toString()}`
          });
        }
      }

      // 3. Log results to Immutable Audit log
      if (hasAnomaly) {
        log.warn(`Reconciliation anomaly found for user ${userId}:`, reports);
        writeAuditLog(userId, 'SUSPICIOUS_ACTIVITY', 'SUSPICIOUS', {
          reason: 'RECONCILIATION_DRIFT',
          severity,
          reports
        });
      } else {
        log.info(`Reconciliation passed successfully for user ${userId}`);
      }

      return { success: !hasAnomaly, reports, severity };
    } catch (err) {
      log.error(`Reconciliation error for user ${userId}: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  async reconcileAllUsers() {
    try {
      const activeAccounts = await PaperAccount.find({}, 'userId').lean();
      const summary = [];
      for (const acc of activeAccounts) {
        const result = await this.reconcileUser(acc.userId);
        summary.push({ userId: acc.userId, ...result });
      }
      return summary;
    } catch (err) {
      log.error(`Global reconciliation failed: ${err.message}`);
      throw err;
    }
  }
}

export default new ReconciliationService();
