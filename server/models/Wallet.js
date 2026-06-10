import mongoose from 'mongoose';

// ═══════════════════════════════════════════════════════════
//  Ledger-based Wallet System
//  Atomic balance updates with full audit trail
//  Optimistic locking via __v for concurrent modification safety
// ═══════════════════════════════════════════════════════════

const walletAccountSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  balance: { type: Number, default: 1000000, min: 0 }, // Default 10L for demo
  usedMargin: { type: Number, default: 0 },
  totalDeposits: { type: Number, default: 0 },
  totalWithdrawals: { type: Number, default: 0 },
  accountType: { type: String, enum: ['demo', 'live'], default: 'demo' },
  lastIntegrityCheck: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Enable optimistic concurrency control (version key __v)
walletAccountSchema.set('optimisticConcurrency', true);

const walletTransactionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  type: { 
    type: String, 
    enum: [
      'WALLET REFILL', 'WITHDRAW', 'BUY', 'SELL', 'DIVIDEND', 
      'RESET', 'RAZORPAY_CREDIT', 'REFUND',
      'ORDER_DEBIT', 'ORDER_CREDIT', 'ORDER_ROLLBACK'
    ], 
    required: true 
  },
  amount: { type: Number, required: true },
  balanceBefore: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['COMPLETED', 'PROCESSING', 'FAILED', 'REVERSED'], 
    default: 'COMPLETED' 
  },
  reference: { type: String, default: null },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  date: { type: Date, default: Date.now }
});

// Indexes for performance
walletTransactionSchema.index({ userId: 1, date: -1 });
walletTransactionSchema.index({ reference: 1 }, { sparse: true });
walletTransactionSchema.index({ userId: 1, type: 1 }); // For audit queries

export const WalletAccount = mongoose.models.WalletAccount || mongoose.model('WalletAccount', walletAccountSchema);
export const WalletTransaction = mongoose.models.WalletTransaction || mongoose.model('WalletTransaction', walletTransactionSchema);
