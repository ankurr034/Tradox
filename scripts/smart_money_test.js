const BASE_URL = 'http://localhost:8000/api';
const USER_ID = 'mock_web2_user';

async function runTest() {
  console.log(`\x1b[36m=== STARTING SMART MONEY MODULES E2E TEST ===\x1b[0m\n`);

  const req = async (path) => {
    const res = await fetch(`${BASE_URL}${path}`);
    const status = res.status;
    const data = await res.json();
    return { status, data };
  };

  // 1. My DNA
  console.log('1. Testing 🧬 My DNA Endpoint...');
  const dna = await req(`/trading-dna?user_id=${USER_ID}`);
  if (dna.status !== 200) throw new Error(`DNA failed: ${JSON.stringify(dna)}`);
  console.log(`PASS - DNA Overall Score: ${dna.data.overall_score}, Personality: ${dna.data.personality?.type}`);

  // 2. SIP Targets
  console.log('\n2. Testing 🎯 SIP Targets (Calculator) Endpoint...');
  const sip = await req('/calculator/sip?monthly=25000&years=15&rate=12');
  if (sip.status !== 200) throw new Error(`SIP failed: ${JSON.stringify(sip)}`);
  console.log(`PASS - SIP Future Value: ₹${sip.data.sip?.future_value?.toLocaleString()} (Invested: ₹${sip.data.sip?.total_invested?.toLocaleString()})`);

  // 3. Goal Planner Targets
  console.log('\n3. Testing 🎯 Goal Planner Targets Endpoint...');
  const goal = await req('/calculator/goal?goal_amount=10000000&years=15&rate=12');
  if (goal.status !== 200) throw new Error(`Goal failed: ${JSON.stringify(goal)}`);
  console.log(`PASS - Required Monthly SIP: ₹${goal.data.required_monthly_sip?.toLocaleString()} to reach ₹${(goal.data.goal_amount/10000000).toFixed(1)} Cr`);

  // 4. Stress Test
  console.log('\n4. Testing 🛡️ Stress Test Endpoint...');
  const stress = await req(`/portfolio/stresstest?user_id=${USER_ID}`);
  if (stress.status !== 200) throw new Error(`Stress Test failed: ${JSON.stringify(stress)}`);
  console.log(`PASS - Stress Test Portfolio Value: ₹${stress.data.stress_test?.portfolio_value?.toLocaleString()}, Risk Score: ${stress.data.stress_test?.portfolio_risk}%`);

  // 5. X-Ray
  console.log('\n5. Testing 🧬 X-Ray Endpoint...');
  const xray = await req(`/portfolio/xray?user_id=${USER_ID}`);
  if (xray.status !== 200) throw new Error(`X-Ray failed: ${JSON.stringify(xray)}`);
  console.log(`PASS - X-Ray Health Score: ${xray.data.xray?.health_score}, Total holdings detailed: ${xray.data.xray?.holdings_detail?.length}`);

  console.log(`\n\x1b[32m=== ALL SMART MONEY MODULE APIS TESTED & FULLY FUNCTIONAL! ===\x1b[0m`);
}

runTest().catch(err => {
  console.error(`\n\x1b[31m=== TEST FAILED ===\x1b[0m`);
  console.error(err);
  process.exit(1);
});
