import express from 'express';
import MarketDataService from '../services/MarketDataService.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════
//  AUTH: Register
// ═══════════════════════════════════════════════════════════
router.post('/auth/register', async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ detail: 'Username and password are required' });
    }
    // In production, hash password and store in DB
    // For now, return success to unblock the frontend registration flow
    const User = (await import('../models/User.js')).default;
    const mongoose = (await import('mongoose')).default;
    
    // Check if user already exists (by wallet or username)
    const existing = await User.findOne({ walletAddress: (username || '').toLowerCase() });
    if (existing) {
      return res.status(409).json({ detail: 'User already exists' });
    }

    // Create a user record with a deterministic nonce
    const nonce = `Sign this message to verify. Nonce: ${Math.floor(Math.random() * 1000000)}`;
    const user = new User({
      walletAddress: (username || email || '').toLowerCase(),
      nonce,
      account_mode: 'demo'
    });
    await user.save();

    res.json({ success: true, user_id: user._id, message: 'Registration successful' });
  } catch (err) {
    console.error('[AUTH] Register error:', err.message);
    res.status(500).json({ detail: 'Registration failed' });
  }
});

// ═══════════════════════════════════════════════════════════
//  KYC Verification Endpoints
// ═══════════════════════════════════════════════════════════
router.post('/kyc/verify-pan', (req, res) => {
  const { pan } = req.body;
  if (!pan || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
    return res.status(400).json({ success: false, detail: 'Invalid PAN format' });
  }
  res.json({ success: true, name: 'Account Holder', pan, status: 'VERIFIED' });
});

router.post('/kyc/verify-aadhaar', (req, res) => {
  const { aadhaar, otp } = req.body;
  if (!aadhaar || aadhaar.length !== 12) {
    return res.status(400).json({ success: false, detail: 'Invalid Aadhaar number' });
  }
  if (!otp) {
    // Step 1: Send OTP
    return res.json({ success: true, otpSent: true, message: 'OTP sent to registered mobile' });
  }
  // Step 2: Verify OTP
  if (otp.length >= 4) {
    return res.json({ success: true, verified: true, message: 'Aadhaar verified successfully' });
  }
  return res.status(400).json({ success: false, detail: 'Invalid OTP' });
});

router.post('/kyc/verify-bank', (req, res) => {
  const { bank_name, account_number, ifsc } = req.body;
  if (!account_number || !ifsc) {
    return res.status(400).json({ success: false, detail: 'Account number and IFSC required' });
  }
  res.json({ success: true, bankVerified: true, bank_name, message: 'Bank account verified' });
});

router.post('/kyc/upload-document', (req, res) => {
  res.json({ success: true, message: 'Document uploaded successfully', documentId: `DOC_${Date.now()}` });
});

router.post('/kyc/submit', (req, res) => {
  res.json({ success: true, kyc_status: 'VERIFIED', message: 'KYC verification completed' });
});

// ═══════════════════════════════════════════════════════════
//  CDSL Demat Operations
// ═══════════════════════════════════════════════════════════
router.get('/cdsl/demat-info', (req, res) => {
  res.json({
    success: true,
    demat: {
      dp_id: 'IN301549',
      client_id: '16782345',
      bo_id: 'IN301549-16782345',
      status: 'ACTIVE',
      name: 'Account Holder',
      pan: 'ABCPD1234F',
      holdings_count: 3,
      last_settlement: new Date().toISOString().split('T')[0]
    }
  });
});

router.get('/cdsl/history', (req, res) => {
  res.json({
    success: true,
    history: [
      { date: new Date(Date.now() - 86400000).toISOString().split('T')[0], type: 'AUTHORIZED', symbol: 'RELIANCE', quantity: 50, status: 'SUCCESS' },
      { date: new Date(Date.now() - 172800000).toISOString().split('T')[0], type: 'AUTHORIZED', symbol: 'TCS', quantity: 20, status: 'SUCCESS' },
      { date: new Date(Date.now() - 259200000).toISOString().split('T')[0], type: 'PLEDGED', symbol: 'HDFCBANK', quantity: 30, status: 'COMPLETED' }
    ]
  });
});

router.post('/cdsl/verify-tpin', (req, res) => {
  const { tpin } = req.body;
  if (!tpin || tpin.length < 4) {
    return res.status(400).json({ success: false, detail: 'Invalid TPIN' });
  }
  res.json({ success: true, otpSent: true, message: 'OTP sent for CDSL verification' });
});

router.post('/cdsl/verify-otp', (req, res) => {
  const { otp } = req.body;
  if (!otp || otp.length < 4) {
    return res.status(400).json({ success: false, detail: 'Invalid OTP' });
  }
  res.json({ success: true, authorized: true, message: 'Holding authorized for settlement' });
});

router.post('/cdsl/bulk-authorize', (req, res) => {
  const { holdings } = req.body;
  const count = Array.isArray(holdings) ? holdings.length : 0;
  res.json({ success: true, authorized_count: count || 3, message: `${count || 3} holdings authorized for settlement` });
});

// ═══════════════════════════════════════════════════════════
//  IPO Dashboard
// ═══════════════════════════════════════════════════════════
router.get('/ipo/upcoming', (req, res) => {
  const today = new Date();
  res.json({
    success: true,
    ipos: [
      {
        name: 'NextGen Fintech Ltd', symbol: 'NEXTFIN', price_band: '₹280 - ₹295',
        lot_size: 50, issue_size: '₹850 Cr', gmp: '+₹45 (15.2%)', gmp_pct: 15.2,
        subscription: { retail: '4.2x', hni: '8.1x', qib: '12.5x', total: '8.3x' },
        open_date: new Date(today.getTime() + 86400000).toISOString().split('T')[0],
        close_date: new Date(today.getTime() + 259200000).toISOString().split('T')[0],
        listing_date: new Date(today.getTime() + 604800000).toISOString().split('T')[0],
        status: 'OPEN', category: 'Mainboard', registrar: 'Link Intime',
        recommendation: 'SUBSCRIBE', ai_score: 82
      },
      {
        name: 'GreenSolar Power', symbol: 'GREENSOL', price_band: '₹140 - ₹148',
        lot_size: 100, issue_size: '₹420 Cr', gmp: '+₹22 (14.8%)', gmp_pct: 14.8,
        subscription: { retail: '2.1x', hni: '3.5x', qib: '6.2x', total: '4.0x' },
        open_date: new Date(today.getTime() + 432000000).toISOString().split('T')[0],
        close_date: new Date(today.getTime() + 691200000).toISOString().split('T')[0],
        listing_date: new Date(today.getTime() + 1209600000).toISOString().split('T')[0],
        status: 'UPCOMING', category: 'SME', registrar: 'KFin Technologies',
        recommendation: 'SUBSCRIBE', ai_score: 75
      },
      {
        name: 'CloudNet AI Services', symbol: 'CLOUDAI', price_band: '₹520 - ₹548',
        lot_size: 25, issue_size: '₹1,200 Cr', gmp: '+₹85 (15.5%)', gmp_pct: 15.5,
        subscription: { retail: '6.5x', hni: '15.2x', qib: '22.0x', total: '14.6x' },
        open_date: new Date(today.getTime() - 172800000).toISOString().split('T')[0],
        close_date: new Date(today.getTime() + 86400000).toISOString().split('T')[0],
        listing_date: new Date(today.getTime() + 432000000).toISOString().split('T')[0],
        status: 'OPEN', category: 'Mainboard', registrar: 'Link Intime',
        recommendation: 'STRONG SUBSCRIBE', ai_score: 91
      }
    ]
  });
});

router.post('/ipo/apply', (req, res) => {
  const { ipo_id, lots, upi_id } = req.body;
  res.json({
    success: true,
    application_id: `IPO_${Date.now()}`,
    message: `IPO application submitted for ${lots || 1} lot(s). Mandate request sent to UPI.`,
    status: 'PENDING'
  });
});

// ═══════════════════════════════════════════════════════════
//  F&O Chain Data
// ═══════════════════════════════════════════════════════════
router.get('/fno/chain/:index', (req, res) => {
  const { index } = req.params;
  const spotPrice = index === 'NIFTY' ? MarketDataService.getCurrentPrice('NIFTY 50') : MarketDataService.getCurrentPrice('BANKNIFTY');
  const baseStrike = Math.round(spotPrice / 50) * 50;
  
  const chain = [];
  for (let i = -5; i <= 5; i++) {
    const strike = baseStrike + i * 50;
    chain.push({
      strike,
      ce: {
        oi: Math.floor(50000 + Math.abs(i) * 12000),
        change_oi: Math.floor((5 - Math.abs(i)) * 2000),
        volume: Math.floor(15000 + Math.abs(i) * 3000),
        iv: parseFloat((12 + Math.abs(i) * 1.5).toFixed(1)),
        ltp: parseFloat(Math.max(0, spotPrice - strike + 50 + (5 - Math.abs(i)) * 10).toFixed(2)),
        bid: parseFloat(Math.max(0, spotPrice - strike + 48).toFixed(2)),
        ask: parseFloat(Math.max(0, spotPrice - strike + 52).toFixed(2))
      },
      pe: {
        oi: Math.floor(45000 + Math.abs(i) * 10000),
        change_oi: Math.floor((5 - Math.abs(i)) * 1500),
        volume: Math.floor(12000 + Math.abs(i) * 2500),
        iv: parseFloat((13 + Math.abs(i) * 1.8).toFixed(1)),
        ltp: parseFloat(Math.max(0, strike - spotPrice + 50 + (5 - Math.abs(i)) * 10).toFixed(2)),
        bid: parseFloat(Math.max(0, strike - spotPrice + 48).toFixed(2)),
        ask: parseFloat(Math.max(0, strike - spotPrice + 52).toFixed(2))
      }
    });
  }

  res.json({
    success: true,
    index,
    spot_price: spotPrice,
    expiry: getNextThursday(),
    chain,
    pcr: 0.85,
    max_pain: baseStrike
  });
});

// ═══════════════════════════════════════════════════════════
//  Mutual Funds
// ═══════════════════════════════════════════════════════════
router.get('/mutual-funds', (req, res) => {
  res.json({
    success: true,
    categories: ['Equity', 'Debt', 'Hybrid', 'Index', 'ELSS'],
    funds: [
      { name: 'Axis Bluechip Fund', category: 'Equity', nav: 48.52, aum: '32,450 Cr', returns_1y: 18.5, returns_3y: 14.2, returns_5y: 16.8, risk: 'Moderate', rating: 5, min_sip: 500 },
      { name: 'SBI Small Cap Fund', category: 'Equity', nav: 125.80, aum: '18,200 Cr', returns_1y: 28.4, returns_3y: 22.1, returns_5y: 24.5, risk: 'High', rating: 4, min_sip: 500 },
      { name: 'HDFC Corporate Bond Fund', category: 'Debt', nav: 28.15, aum: '25,600 Cr', returns_1y: 7.2, returns_3y: 6.8, returns_5y: 7.5, risk: 'Low', rating: 5, min_sip: 1000 },
      { name: 'UTI Nifty 50 Index Fund', category: 'Index', nav: 145.20, aum: '12,800 Cr', returns_1y: 15.2, returns_3y: 12.8, returns_5y: 14.1, risk: 'Moderate', rating: 4, min_sip: 500 },
      { name: 'Mirae Asset Tax Saver', category: 'ELSS', nav: 38.90, aum: '15,400 Cr', returns_1y: 22.1, returns_3y: 18.5, returns_5y: 20.2, risk: 'Moderate', rating: 5, min_sip: 500 },
      { name: 'ICICI Prudential Balanced Advantage', category: 'Hybrid', nav: 56.45, aum: '48,200 Cr', returns_1y: 12.8, returns_3y: 11.5, returns_5y: 13.2, risk: 'Low', rating: 4, min_sip: 100 }
    ]
  });
});

// ═══════════════════════════════════════════════════════════
//  Options Chain
// ═══════════════════════════════════════════════════════════
router.get('/options/chain/:symbol', (req, res) => {
  const { symbol } = req.params;
  const spotPrice = MarketDataService.getCurrentPrice(symbol);
  const baseStrike = Math.round(spotPrice / 10) * 10;
  
  const chain = [];
  for (let i = -5; i <= 5; i++) {
    const strike = baseStrike + i * 10;
    chain.push({
      strike,
      ce_ltp: parseFloat(Math.max(0.5, spotPrice - strike + 20).toFixed(2)),
      ce_oi: Math.floor(30000 + Math.abs(i) * 8000),
      ce_iv: parseFloat((15 + Math.abs(i) * 2).toFixed(1)),
      ce_delta: parseFloat((0.5 - i * 0.08).toFixed(3)),
      pe_ltp: parseFloat(Math.max(0.5, strike - spotPrice + 20).toFixed(2)),
      pe_oi: Math.floor(25000 + Math.abs(i) * 7000),
      pe_iv: parseFloat((16 + Math.abs(i) * 2.2).toFixed(1)),
      pe_delta: parseFloat((-0.5 + i * 0.08).toFixed(3))
    });
  }

  res.json({ success: true, symbol, spot: spotPrice, expiry: getNextThursday(), chain });
});

// ═══════════════════════════════════════════════════════════
//  Earnings Calendar
// ═══════════════════════════════════════════════════════════
router.get('/earnings/calendar', (req, res) => {
  const today = new Date();
  const earnings = [];
  const companies = [
    { symbol: 'RELIANCE', name: 'Reliance Industries', sector: 'Energy' },
    { symbol: 'TCS', name: 'Tata Consultancy', sector: 'IT' },
    { symbol: 'INFY', name: 'Infosys', sector: 'IT' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank', sector: 'Banking' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank', sector: 'Banking' },
    { symbol: 'TATAMOTORS', name: 'Tata Motors', sector: 'Auto' },
    { symbol: 'WIPRO', name: 'Wipro Ltd', sector: 'IT' },
    { symbol: 'BAJFINANCE', name: 'Bajaj Finance', sector: 'NBFC' }
  ];

  companies.forEach((c, i) => {
    const date = new Date(today.getTime() + (i - 2) * 86400000 * 3);
    earnings.push({
      ...c,
      date: date.toISOString().split('T')[0],
      time: i % 2 === 0 ? 'BMO' : 'AMC',
      eps_estimate: parseFloat((15 + i * 3).toFixed(2)),
      eps_actual: i < 3 ? parseFloat((16 + i * 2.8).toFixed(2)) : null,
      revenue_estimate: `₹${(10000 + i * 5000).toLocaleString()} Cr`,
      surprise_pct: i < 3 ? parseFloat((2 + i * 1.5).toFixed(1)) : null,
      status: i < 3 ? 'REPORTED' : 'UPCOMING'
    });
  });

  res.json({ success: true, earnings });
});

// ═══════════════════════════════════════════════════════════
//  Copy Trading
// ═══════════════════════════════════════════════════════════
router.get('/copytrading/traders', (req, res) => {
  res.json({
    success: true,
    traders: [
      { id: 'T001', name: 'AlphaTrader Pro', avatar: null, win_rate: 72, total_return: 156.4, followers: 2450, risk_score: 'MODERATE', strategy: 'Momentum', aum: '₹4.2 Cr', max_drawdown: 12, trades_per_week: 8, badge: 'VERIFIED' },
      { id: 'T002', name: 'ValueHunter', avatar: null, win_rate: 68, total_return: 89.2, followers: 1820, risk_score: 'LOW', strategy: 'Value Investing', aum: '₹2.8 Cr', max_drawdown: 8, trades_per_week: 3, badge: 'VERIFIED' },
      { id: 'T003', name: 'SwingMaster', avatar: null, win_rate: 65, total_return: 124.8, followers: 3100, risk_score: 'HIGH', strategy: 'Swing Trading', aum: '₹6.1 Cr', max_drawdown: 18, trades_per_week: 12, badge: 'TOP PERFORMER' }
    ]
  });
});

router.post('/copytrading/follow', (req, res) => {
  const { trader_id, allocation } = req.body;
  res.json({
    success: true,
    message: `Now following trader ${trader_id} with ₹${allocation || 50000} allocation`,
    follow_id: `FOLLOW_${Date.now()}`
  });
});

// ═══════════════════════════════════════════════════════════
//  Screener
// ═══════════════════════════════════════════════════════════
router.get('/screener/scan', (req, res) => {
  const { filter } = req.query;
  const stocks = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'TATAMOTORS', 'NTPC', 'POWERGRID'];
  
  const results = stocks.map((symbol, idx) => {
    const price = MarketDataService.getCurrentPrice(symbol);
    const changePct = MarketDataService.priceCache.get(symbol)?.changePercent || 0;
    const hash = symbol.charCodeAt(0) + symbol.charCodeAt(1);
    return {
      symbol,
      price,
      change_pct: parseFloat(changePct.toFixed(2)),
      volume: 800000 + (hash * 37 % 2000000),
      pe_ratio: parseFloat((15 + (hash % 20)).toFixed(1)),
      market_cap: `₹${(price * 1000000 / 10000000).toFixed(0)} Cr`,
      rsi: parseFloat((40 + (hash % 30)).toFixed(1)),
      macd_signal: changePct >= 0 ? 'BULLISH' : 'BEARISH'
    };
  });

  res.json({ success: true, results, total: results.length });
});

// ═══════════════════════════════════════════════════════════
//  Trade Journal
// ═══════════════════════════════════════════════════════════
import { PaperOrder } from '../models/PaperTrading.js';

router.get('/journal/entries', async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ detail: 'user_id required' });

    const orders = await PaperOrder.find({ userId: user_id, status: 'FILLED' })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const entries = orders.map(o => ({
      id: o.orderId,
      symbol: o.symbol,
      action: o.action,
      quantity: o.quantity,
      entry_price: o.fillPrice,
      date: new Date(o.createdAt).toISOString().split('T')[0],
      time: new Date(o.createdAt).toLocaleTimeString(),
      pnl: o.slippage ? -o.slippage * o.quantity : 0,
      notes: '',
      tags: [o.orderType, o.action]
    }));

    res.json({ success: true, entries });
  } catch (err) {
    console.error('[JOURNAL] Fetch error:', err.message);
    res.status(500).json({ detail: 'Failed to fetch journal entries' });
  }
});

router.post('/journal/entries', (req, res) => {
  const { symbol, action, notes, tags } = req.body;
  res.json({
    success: true,
    entry_id: `JOURNAL_${Date.now()}`,
    message: 'Journal entry saved'
  });
});

// ═══════════════════════════════════════════════════════════
//  Microstructure REST endpoint (for initial load)
// ═══════════════════════════════════════════════════════════
router.get('/microstructure/:symbol', (req, res) => {
  const { symbol } = req.params;
  const current_price = MarketDataService.getCurrentPrice(symbol);
  
  res.json({
    symbol,
    current_price,
    signals: {
      order_imbalance: 'STRONG BUY (68%)',
      spread_trend: 'TIGHTENING',
      large_order_alert: true,
      hidden_liquidity: true
    },
    spread: {
      quality: 'TIGHT',
      absolute: parseFloat((current_price * 0.0002).toFixed(2)),
      percentage: 0.02
    },
    liquidity: {
      total_bid_depth: 450000,
      total_ask_depth: 320000,
      bid_ask_ratio: 1.4,
      vwap: parseFloat((current_price + current_price * 0.001).toFixed(2)),
      avg_trade_size: '850 qty',
      impact_cost_1cr: 0.04
    },
    order_book: {
      asks: [
        { orders: 12, price: parseFloat((current_price + 1.5).toFixed(2)), quantity: 15000 },
        { orders: 24, price: parseFloat((current_price + 1.0).toFixed(2)), quantity: 45000 },
        { orders: 8, price: parseFloat((current_price + 0.5).toFixed(2)), quantity: 12000 }
      ],
      bids: [
        { orders: 15, price: parseFloat((current_price - 0.5).toFixed(2)), quantity: 22000 },
        { orders: 30, price: parseFloat((current_price - 1.0).toFixed(2)), quantity: 55000 },
        { orders: 5, price: parseFloat((current_price - 1.5).toFixed(2)), quantity: 8000 }
      ]
    },
    ofi_timeline: [
      { time: '10:00', ofi: 12, buy_volume: 120000, sell_volume: 90000 },
      { time: '10:05', ofi: 24, buy_volume: 150000, sell_volume: 80000 },
      { time: '10:10', ofi: -8, buy_volume: 70000, sell_volume: 95000 },
      { time: '10:15', ofi: 45, buy_volume: 210000, sell_volume: 60000 }
    ],
    trade_tape: [
      { time: new Date().toLocaleTimeString(), side: 'BUY', price: current_price, quantity: 500, value: current_price * 500, is_block: false },
      { time: new Date().toLocaleTimeString(), side: 'SELL', price: parseFloat((current_price - 0.5).toFixed(2)), quantity: 15000, value: (current_price - 0.5) * 15000, is_block: true },
      { time: new Date().toLocaleTimeString(), side: 'BUY', price: current_price, quantity: 200, value: current_price * 200, is_block: false }
    ]
  });
});

// ═══════════════════════════════════════════════════════════
//  SIP Calculator Route
// ═══════════════════════════════════════════════════════════
router.get('/calculator/sip', (req, res) => {
  const P = parseFloat(req.query.monthly) || 5000;
  const years = parseFloat(req.query.years) || 10;
  const rate = parseFloat(req.query.rate) || 12;

  const r = rate / 12 / 100;
  const n = years * 12;

  // SIP Future Value Formula: P * [((1 + r)^n - 1) / r] * (1 + r)
  const futureValueSIP = P * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
  const totalInvested = P * n;
  const wealthGainedSIP = Math.max(0, futureValueSIP - totalInvested);

  // Lumpsum Future Value: P_total * (1 + rate/100)^years
  const futureValueLumpsum = totalInvested * Math.pow(1 + rate / 100, years);
  const wealthGainedLumpsum = Math.max(0, futureValueLumpsum - totalInvested);

  // Generate yearly breakdown
  const yearly_breakdown = [];
  for (let y = 1; y <= years; y++) {
    const ny = y * 12;
    const fvy = P * (((Math.pow(1 + r, ny) - 1) / r) * (1 + r));
    yearly_breakdown.push({
      year: y,
      invested: Math.round(P * ny),
      value: Math.round(fvy)
    });
  }

  res.json({
    sip: {
      total_invested: Math.round(totalInvested),
      future_value: Math.round(futureValueSIP),
      wealth_gained: Math.round(wealthGainedSIP)
    },
    lumpsum: {
      total_invested: Math.round(totalInvested),
      future_value: Math.round(futureValueLumpsum),
      wealth_gained: Math.round(wealthGainedLumpsum)
    },
    yearly_breakdown
  });
});

// ═══════════════════════════════════════════════════════════
//  Goal Planner Route
// ═══════════════════════════════════════════════════════════
router.get('/calculator/goal', (req, res) => {
  const goalAmount = parseFloat(req.query.goal_amount) || 10000000;
  const years = parseFloat(req.query.years) || 15;
  const rate = parseFloat(req.query.rate) || 12;

  const r = rate / 12 / 100;
  const n = years * 12;

  // Required Monthly SIP: Goal * r / [((1 + r)^n - 1) * (1 + r)]
  const requiredSip = (goalAmount * r) / ((Math.pow(1 + r, n) - 1) * (1 + r));
  const totalInvested = requiredSip * n;
  const wealthGained = Math.max(0, goalAmount - totalInvested);

  // Calculate milestones (25%, 50%, 75%, 100%)
  const percentages = [25, 50, 75, 100];
  const milestones = percentages.map(pct => {
    const milestoneAmt = goalAmount * (pct / 100);
    // Solve for m (months): m = ln(1 + (M * r) / (P * (1 + r))) / ln(1 + r)
    const m = Math.log(1 + (milestoneAmt * r) / (requiredSip * (1 + r))) / Math.log(1 + r);
    const mRounded = Math.max(1, Math.round(m));
    const yVal = parseFloat((mRounded / 12).toFixed(1));
    return {
      percent: pct,
      amount: Math.round(milestoneAmt),
      years: yVal,
      months: mRounded
    };
  });

  res.json({
    goal_amount: goalAmount,
    duration_years: years,
    return_rate: rate,
    required_monthly_sip: Math.round(requiredSip),
    total_invested: Math.round(totalInvested),
    wealth_gained: Math.round(wealthGained),
    milestones
  });
});

// ═══════════════════════════════════════════════════════════
//  Helpers
// ═══════════════════════════════════════════════════════════
function getNextThursday() {
  const d = new Date();
  const day = d.getDay();
  const diff = (4 - day + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

export default router;
