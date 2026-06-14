import Big from 'big.js';

/**
 * Apply a slippage model to a base execution price.
 * BUY fills slightly worse (higher), SELL slightly worse (lower).
 * @param {number} basePrice
 * @param {'BUY'|'SELL'} action
 * @param {number} slippagePct - fractional (e.g. 0.001 = 0.1%)
 * @returns {{ fillPrice: number, slippageVal: number }}
 */
export function applySlippage(basePrice, action, slippagePct) {
  const base = new Big(basePrice);
  const slippagePctBig = new Big(slippagePct);
  const slippageVal = base.times(slippagePctBig);
  const fillPrice = action === 'BUY' ? base.plus(slippageVal) : base.minus(slippageVal);
  return { 
    fillPrice: parseFloat(fillPrice.toFixed(4)), 
    slippageVal: parseFloat(slippageVal.toFixed(4)) 
  };
}

/**
 * Compute the resulting position + cash delta for a BUY.
 * Average price is the cost-basis weighted average.
 * @param {{quantity:number, averagePrice:number, realizedPnl:number}} position
 * @param {number} qty
 * @param {number} fillPrice
 * @returns {{ position: object, cashDelta: number }}  cashDelta is negative (cash out)
 */
export function applyBuy(position, qty, fillPrice) {
  if (qty <= 0) throw new Error('Buy quantity must be positive');
  const fillPriceBig = new Big(fillPrice);
  const qtyBig = new Big(qty);
  const orderValue = fillPriceBig.times(qtyBig);
  
  const currentQtyBig = new Big(position.quantity);
  const currentAvgBig = new Big(position.averagePrice);
  const currentCost = currentQtyBig.times(currentAvgBig);
  
  const totalQtyBig = currentQtyBig.plus(qtyBig);
  const totalCost = currentCost.plus(orderValue);
  const newAvgPrice = totalQtyBig.gt(0) ? totalCost.div(totalQtyBig) : new Big(0);

  return {
    position: {
      quantity: parseFloat(totalQtyBig.toFixed(4)),
      averagePrice: parseFloat(newAvgPrice.toFixed(4)),
      realizedPnl: position.realizedPnl
    },
    cashDelta: parseFloat(orderValue.times(-1).toFixed(4))
  };
}

/**
 * Compute the resulting position + cash delta + realized P&L for a SELL.
 * Rejects selling more than held (no short-selling in sandbox).
 * @returns {{ position: object, cashDelta: number, pnl: number }}  cashDelta is positive (cash in)
 */
export function applySell(position, qty, fillPrice) {
  if (qty <= 0) throw new Error('Sell quantity must be positive');
  if (position.quantity < qty) throw new Error('Insufficient quantity — short selling not permitted');
  const fillPriceBig = new Big(fillPrice);
  const qtyBig = new Big(qty);
  const orderValue = fillPriceBig.times(qtyBig);
  
  const currentAvgBig = new Big(position.averagePrice);
  const pnl = fillPriceBig.minus(currentAvgBig).times(qtyBig);
  const remaining = new Big(position.quantity).minus(qtyBig);

  return {
    position: {
      quantity: parseFloat(remaining.toFixed(4)),
      averagePrice: remaining.eq(0) ? 0 : position.averagePrice,
      realizedPnl: parseFloat(new Big(position.realizedPnl).plus(pnl).toFixed(4))
    },
    cashDelta: parseFloat(orderValue.toFixed(4)),
    pnl: parseFloat(pnl.toFixed(4))
  };
}

/**
 * Build a STABLE idempotency key for an order. Never include a raw
 * timestamp here, or every key is unique and dedup can never fire.
 * An optional time bucket (whole seconds) gives a coarse retry window
 * without making every call unique.
 */
export function buildIdempotencyKey({ accountRef, symbol, action, quantity, bucketSeconds }) {
  const base = `${accountRef}_${symbol}_${action}_${quantity}`;
  return bucketSeconds ? `${base}_${bucketSeconds}` : base;
}
