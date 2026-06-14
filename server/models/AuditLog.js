import mongoose from 'mongoose';
import crypto from 'crypto';

const AuditLogSchema = new mongoose.Schema({
  userId: { type: String, index: true, default: null },
  action: { 
    type: String, 
    required: true,
    enum: [
      'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'TOKEN_REFRESH',
      'WALLET_MUTATION', 'WITHDRAW_REQUEST', 'PAYMENT_VERIFIED', 'PAYMENT_FAILED',
      'ORDER_PLACED', 'ORDER_CANCELLED', 'GTT_CANCELLED',
      'BROKER_CONNECTED', 'BROKER_DISCONNECTED', 'ADMIN_ACTION',
      'SUSPICIOUS_ACTIVITY'
    ],
    index: true 
  },
  status: { type: String, enum: ['SUCCESS', 'FAILURE', 'SUSPICIOUS'], required: true },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  ipAddress: { type: String, default: 'unknown' },
  userAgent: { type: String, default: 'unknown' },
  correlationId: { type: String, index: true, default: null }, 
  previousHash: { type: String, default: null },
  hash: { type: String, default: null },
  timestamp: { type: Date, default: Date.now, index: true }
});

// Immutability: Block update/delete at schema level
const blockMutation = function(next) {
  next(new Error('Audit logs are immutable and cannot be updated or deleted.'));
};

AuditLogSchema.pre('updateOne', blockMutation);
AuditLogSchema.pre('findOneAndUpdate', blockMutation);
AuditLogSchema.pre('updateMany', blockMutation);
AuditLogSchema.pre('deleteOne', blockMutation);
AuditLogSchema.pre('deleteMany', blockMutation);
AuditLogSchema.pre('findOneAndDelete', blockMutation);
AuditLogSchema.pre('findOneAndRemove', blockMutation);

// Cryptographic hash chaining
AuditLogSchema.pre('save', async function(next) {
  if (!this.isNew) {
    return next(new Error('Audit logs are immutable and cannot be modified.'));
  }

  try {
    const AuditLog = mongoose.model('AuditLog');
    const lastLog = await AuditLog.findOne().sort({ timestamp: -1, _id: -1 }).lean();
    this.previousHash = lastLog ? lastLog.hash : 'GENESIS_SEED_HASH';

    const rawContent = JSON.stringify({
      userId: this.userId,
      action: this.action,
      status: this.status,
      details: this.details,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
      correlationId: this.correlationId,
      previousHash: this.previousHash,
      timestamp: this.timestamp
    });

    this.hash = crypto.createHash('sha256').update(rawContent).digest('hex');
    next();
  } catch (err) {
    next(err);
  }
});

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);

export default AuditLog;
