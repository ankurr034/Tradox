import mongoose from 'mongoose';

const triggerSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  symbol: { type: String, required: true, index: true },
  triggerPrice: { type: Number, required: true, index: true },
  triggerType: { type: String, enum: ['STOP_LOSS', 'TARGET', 'GTT'], required: true },
  action: { type: String, enum: ['BUY', 'SELL'], required: true },
  quantity: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'FILLED', 'CANCELLED'], default: 'PENDING', index: true },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
});

// Compound index for active trigger scanning performance
triggerSchema.index({ status: 1, symbol: 1, triggerPrice: 1 });

const Trigger = mongoose.models.Trigger || mongoose.model('Trigger', triggerSchema);

export default Trigger;
