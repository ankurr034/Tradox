const BASE_URL = 'http://localhost:8000/api';
const USER_ID = `e2e_test_user_${Date.now()}`;

async function runTest() {
  console.log(`\x1b[36m=== STARTING E2E TRADING LIFECYCLE TEST ===\x1b[0m`);
  console.log(`Testing with unique USER_ID: ${USER_ID}\n`);

  // Helper for requests
  const req = async (path, options = {}) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    const text = await res.text();
    try {
      return { status: res.status, data: JSON.parse(text) };
    } catch {
      return { status: res.status, data: text };
    }
  };

  // 1. Initial Wallet Fetch
  console.log('1. Checking initial wallet...');
  let w1 = await req(`/wallet?user_id=${USER_ID}`);
  if (w1.status !== 200) {
    throw new Error(`Failed initial wallet check: ${JSON.stringify(w1)}`);
  }
  console.log(`Initial wallet balance: ₹${w1.data.balance} (Expected ₹1,000,000 for new user)`);
  if (w1.data.balance !== 1000000) {
    throw new Error('Balance mismatch: initial user wallet should be ₹1,000,000');
  }

  // 2. Deposit Funds
  console.log('\n2. Testing wallet refill...');
  let refill = await req(`/wallet/refill?user_id=${USER_ID}`, {
    method: 'POST',
    body: JSON.stringify({ amount: 50000 })
  });
  if (refill.status !== 200 || !refill.data.success) {
    throw new Error(`Failed to refill: ${JSON.stringify(refill)}`);
  }
  console.log(`Refilled wallet successfully. New Balance: ₹${refill.data.balance} (Expected ₹1,050,000)`);
  if (refill.data.balance !== 1050000) {
    throw new Error('Balance mismatch after refill');
  }

  // 3. Place BUY Order
  console.log('\n3. Placing BUY paper order for RELIANCE (10 shares at ₹2,500)...');
  let buyOrder = await req('/broker/order', {
    method: 'POST',
    body: JSON.stringify({
      broker_name: 'Zerodha Kite',
      user_id: USER_ID,
      order_config: {
        symbol: 'RELIANCE',
        action: 'BUY',
        quantity: 10,
        price: 2500.0,
        isPaperTrade: true,
        order_type: 'LIMIT',
        product: 'CNC'
      }
    })
  });
  if (buyOrder.status !== 200 || !buyOrder.data.success) {
    throw new Error(`Buy order placement failed: ${JSON.stringify(buyOrder)}`);
  }
  console.log(`Buy order placed successfully! Execution price: ₹${buyOrder.data.price || buyOrder.data.executedPrice}`);

  // 4. Verify Wallet balance decreases after buy
  console.log('\n4. Verifying balance deduction...');
  let w2 = await req(`/wallet?user_id=${USER_ID}`);
  console.log(`New balance after buy: ₹${w2.data.balance}`);
  const expectedDeduction = (buyOrder.data.price || buyOrder.data.executedPrice || 2500) * 10;
  console.log(`Expected deduction: ₹${expectedDeduction}`);
  const expectedBalance = 1050000 - expectedDeduction;
  console.log(`Expected balance: ₹${expectedBalance}`);
  if (Math.abs(w2.data.balance - expectedBalance) > 1) {
    throw new Error(`Balance deduction mismatch: Got ₹${w2.data.balance}, Expected ₹${expectedBalance}`);
  }
  console.log('Balance successfully deducted!');

  // 5. Place SELL Order (10 shares of RELIANCE at ₹2,600)
  console.log('\n5. Placing SELL paper order for RELIANCE (10 shares at ₹2,600)...');
  let sellOrder = await req('/broker/order', {
    method: 'POST',
    body: JSON.stringify({
      broker_name: 'Zerodha Kite',
      user_id: USER_ID,
      order_config: {
        symbol: 'RELIANCE',
        action: 'SELL',
        quantity: 10,
        price: 2600.0,
        isPaperTrade: true,
        order_type: 'LIMIT',
        product: 'CNC'
      }
    })
  });
  if (sellOrder.status !== 200 || !sellOrder.data.success) {
    throw new Error(`Sell order placement failed: ${JSON.stringify(sellOrder)}`);
  }
  console.log(`Sell order placed successfully! Execution price: ₹${sellOrder.data.price || sellOrder.data.executedPrice}`);

  // 6. Verify Wallet balance increases after sell
  console.log('\n6. Verifying balance credit...');
  let w3 = await req(`/wallet?user_id=${USER_ID}`);
  console.log(`Final balance after sell: ₹${w3.data.balance}`);
  const expectedCredit = (sellOrder.data.price || sellOrder.data.executedPrice || 2600) * 10;
  const finalExpectedBalance = w2.data.balance + expectedCredit;
  if (Math.abs(w3.data.balance - finalExpectedBalance) > 1) {
    throw new Error(`Balance credit mismatch: Got ₹${w3.data.balance}, Expected ₹${finalExpectedBalance}`);
  }
  console.log(`Balance successfully credited! Net Profit: ₹${expectedCredit - expectedDeduction}`);

  // 7. Verify transaction list
  console.log('\n7. Verifying transaction history...');
  if (w3.data.transactions.length < 3) {
    throw new Error(`Expected at least 3 transactions in ledger, found ${w3.data.transactions.length}`);
  }
  console.log(`Transaction ledger looks correct. Found entries:`);
  w3.data.transactions.forEach(t => {
    console.log(`- ${t.type}: ₹${t.amount} [${t.status}]`);
  });

  console.log(`\n\x1b[32m=== E2E TRADING LIFECYCLE TEST PASSED SUCCESSFULY! ===\x1b[0m`);
}

runTest().catch(err => {
  console.error(`\n\x1b[31m=== E2E TEST FAILED ===\x1b[0m`);
  console.error(err);
  process.exit(1);
});
