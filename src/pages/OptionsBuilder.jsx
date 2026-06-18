import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, Minus, Trash2, Zap, TrendingUp, TrendingDown, Shield, AlertTriangle, BarChart2, Loader2, Info, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import axios from '../utils/axiosSetup';
import { API_BASE_URL } from '../config';

export default function OptionsBuilder() {
  const [symbol, setSymbol] = useState('NIFTY');
  const [chain, setChain] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [legs, setLegs] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [chainView, setChainView] = useState('both'); // calls, puts, both

  const fetchChain = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/options/chain/${symbol}`);
      setChain(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [symbol]);

  const fetchTemplates = React.useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/options/strategies/templates`);
      setTemplates(res.data.templates);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchChain(); fetchTemplates(); }, [fetchChain, fetchTemplates]);

  const addLeg = (type, strike, premium, position) => {
    setLegs(prev => [...prev, { option_type: type, strike, premium, position, quantity: 1 }]);
    setAnalysis(null);
  };

  const removeLeg = (index) => {
    setLegs(prev => prev.filter((_, i) => i !== index));
    setAnalysis(null);
  };

  const analyzeStrategy = async () => {
    if (legs.length === 0) return;
    setAnalyzing(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/options/strategy/analyze`, {
        symbol, legs, lot_size: chain?.lot_size || 50,
      });
      setAnalysis(res.data);
    } catch (e) { console.error(e); }
    finally { setAnalyzing(false); }
  };

  const applyTemplate = (template) => {
    if (!chain) return;
    const atm = chain.atm_strike;
    const interval = chain.strikes.length > 1 ? Math.abs(chain.strikes[1].strike - chain.strikes[0].strike) : 50;
    const newLegs = [];
    
    const getStrike = (offset) => atm + offset * interval;
    const getPremium = (strike, type) => {
      const found = chain.strikes.find(s => s.strike === strike);
      return found ? (type === 'CALL' ? found.ce_premium : found.pe_premium) : 50;
    };

    if (template.name === 'Long Straddle') {
      newLegs.push({ option_type: 'CALL', strike: atm, premium: getPremium(atm, 'CALL'), position: 'BUY', quantity: 1 });
      newLegs.push({ option_type: 'PUT', strike: atm, premium: getPremium(atm, 'PUT'), position: 'BUY', quantity: 1 });
    } else if (template.name === 'Short Straddle') {
      newLegs.push({ option_type: 'CALL', strike: atm, premium: getPremium(atm, 'CALL'), position: 'SELL', quantity: 1 });
      newLegs.push({ option_type: 'PUT', strike: atm, premium: getPremium(atm, 'PUT'), position: 'SELL', quantity: 1 });
    } else if (template.name === 'Bull Call Spread') {
      newLegs.push({ option_type: 'CALL', strike: atm, premium: getPremium(atm, 'CALL'), position: 'BUY', quantity: 1 });
      newLegs.push({ option_type: 'CALL', strike: getStrike(2), premium: getPremium(getStrike(2), 'CALL'), position: 'SELL', quantity: 1 });
    } else if (template.name === 'Bear Put Spread') {
      newLegs.push({ option_type: 'PUT', strike: atm, premium: getPremium(atm, 'PUT'), position: 'BUY', quantity: 1 });
      newLegs.push({ option_type: 'PUT', strike: getStrike(-2), premium: getPremium(getStrike(-2), 'PUT'), position: 'SELL', quantity: 1 });
    } else if (template.name === 'Iron Condor') {
      newLegs.push({ option_type: 'PUT', strike: getStrike(-3), premium: getPremium(getStrike(-3), 'PUT'), position: 'BUY', quantity: 1 });
      newLegs.push({ option_type: 'PUT', strike: getStrike(-2), premium: getPremium(getStrike(-2), 'PUT'), position: 'SELL', quantity: 1 });
      newLegs.push({ option_type: 'CALL', strike: getStrike(2), premium: getPremium(getStrike(2), 'CALL'), position: 'SELL', quantity: 1 });
      newLegs.push({ option_type: 'CALL', strike: getStrike(3), premium: getPremium(getStrike(3), 'CALL'), position: 'BUY', quantity: 1 });
    }
    
    setLegs(newLegs);
    setAnalysis(null);
  };

  const SYMBOLS = ['NIFTY', 'BANKNIFTY', 'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'SBIN', 'TATAMOTORS'];

  if (loading) return <div className="py-20 text-center"><Loader2 className="w-8 h-8 text-primary mx-auto animate-spin" /></div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/20 flex items-center justify-center">
            <Target className="w-6 h-6 text-orange-400" />
          </div>
          Options Strategy Builder
        </h1>
        <p className="text-zinc-500 mt-2 text-sm">Visual P&L payoff diagrams • Multi-leg strategies • Exclusive to NexusAI</p>
      </div>

      {/* Symbol Selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {SYMBOLS.map(sym => (
          <button key={sym} onClick={() => { setSymbol(sym); setLegs([]); setAnalysis(null); }}
            className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl shrink-0 transition-all ${
              symbol === sym ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-white/[0.03] text-zinc-600 border border-white/[0.06] hover:text-white'
            }`}>{sym}</button>
        ))}
      </div>

      {/* Strategy Templates */}
      <div>
        <h2 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
          <Zap size={14} className="text-orange-400" /> Quick Strategies
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {templates.map((t, i) => (
            <motion.button key={t.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => applyTemplate(t)}
              className="glass-panel p-4 text-left hover:border-orange-500/20 transition-all group">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{t.icon}</span>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${
                  t.difficulty === 'BEGINNER' ? 'bg-emerald-500/10 text-emerald-400' :
                  t.difficulty === 'INTERMEDIATE' ? 'bg-amber-500/10 text-amber-400' :
                  t.difficulty === 'ADVANCED' ? 'bg-purple-500/10 text-purple-400' :
                  'bg-rose-500/10 text-rose-400'
                }`}>{t.difficulty}</span>
              </div>
              <p className="text-xs font-black text-white mb-1 group-hover:text-orange-400 transition-colors">{t.name}</p>
              <p className="text-[10px] text-zinc-600 line-clamp-2">{t.description}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[9px] font-bold text-zinc-700">{t.market_view}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Options Chain */}
        <div className="lg:col-span-2 glass-panel overflow-hidden">
          <div className="p-4 border-b border-white/[0.04] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Options Chain</h3>
              {chain && <span className="text-xs font-bold text-white font-mono-data">Spot: ₹{chain.spot_price.toLocaleString()}</span>}
              {chain && <span className="text-[10px] text-zinc-600 font-mono-data">Lot: {chain.lot_size}</span>}
            </div>
            <div className="flex gap-1">
              {['calls', 'both', 'puts'].map(v => (
                <button key={v} onClick={() => setChainView(v)}
                  className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                    chainView === v ? 'bg-white/[0.08] text-white' : 'text-zinc-600 hover:text-white'
                  }`}>{v}</button>
              ))}
            </div>
          </div>
          
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-surface z-10">
                <tr className="border-b border-white/[0.04]">
                  {(chainView !== 'puts') && (
                    <>
                      <th className="p-2 text-[9px] font-black text-zinc-600 tracking-widest text-center">OI</th>
                      <th className="p-2 text-[9px] font-black text-zinc-600 tracking-widest text-center">IV</th>
                      <th className="p-2 text-[9px] font-black text-emerald-400 tracking-widest text-center">CE ₹</th>
                      <th className="p-2 text-[9px] font-black text-emerald-400 tracking-widest text-center">BUY</th>
                      <th className="p-2 text-[9px] font-black text-rose-400 tracking-widest text-center">SELL</th>
                    </>
                  )}
                  <th className="p-2 text-[9px] font-black text-amber-400 tracking-widest text-center bg-white/[0.02]">STRIKE</th>
                  {(chainView !== 'calls') && (
                    <>
                      <th className="p-2 text-[9px] font-black text-emerald-400 tracking-widest text-center">BUY</th>
                      <th className="p-2 text-[9px] font-black text-rose-400 tracking-widest text-center">SELL</th>
                      <th className="p-2 text-[9px] font-black text-red-400 tracking-widest text-center">PE ₹</th>
                      <th className="p-2 text-[9px] font-black text-zinc-600 tracking-widest text-center">IV</th>
                      <th className="p-2 text-[9px] font-black text-zinc-600 tracking-widest text-center">OI</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {chain?.strikes.map((s, i) => (
                  <tr key={i} className={`border-b border-white/[0.02] hover:bg-white/[0.02] transition-all ${
                    s.is_atm ? 'bg-amber-500/[0.04] border-l-2 border-l-amber-500' : ''
                  }`}>
                    {(chainView !== 'puts') && (
                      <>
                        <td className="p-2 text-center text-zinc-600 font-mono-data">{(s.ce_oi / 1000).toFixed(0)}K</td>
                        <td className="p-2 text-center text-zinc-500 font-mono-data">{s.ce_iv}%</td>
                        <td className="p-2 text-center font-bold text-emerald-400 font-mono-data">{s.ce_premium}</td>
                        <td className="p-2 text-center">
                          <button onClick={() => addLeg('CALL', s.strike, s.ce_premium, 'BUY')}
                            className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center justify-center mx-auto">
                            <Plus size={12} />
                          </button>
                        </td>
                        <td className="p-2 text-center">
                          <button onClick={() => addLeg('CALL', s.strike, s.ce_premium, 'SELL')}
                            className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all flex items-center justify-center mx-auto">
                            <Minus size={12} />
                          </button>
                        </td>
                      </>
                    )}
                    <td className={`p-2 text-center font-black font-mono-data bg-white/[0.02] ${s.is_atm ? 'text-amber-400' : 'text-white'}`}>
                      {s.strike}
                      {s.is_atm && <span className="text-[8px] ml-1 text-amber-500">ATM</span>}
                    </td>
                    {(chainView !== 'calls') && (
                      <>
                        <td className="p-2 text-center">
                          <button onClick={() => addLeg('PUT', s.strike, s.pe_premium, 'BUY')}
                            className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center justify-center mx-auto">
                            <Plus size={12} />
                          </button>
                        </td>
                        <td className="p-2 text-center">
                          <button onClick={() => addLeg('PUT', s.strike, s.pe_premium, 'SELL')}
                            className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all flex items-center justify-center mx-auto">
                            <Minus size={12} />
                          </button>
                        </td>
                        <td className="p-2 text-center font-bold text-red-400 font-mono-data">{s.pe_premium}</td>
                        <td className="p-2 text-center text-zinc-500 font-mono-data">{s.pe_iv}%</td>
                        <td className="p-2 text-center text-zinc-600 font-mono-data">{(s.pe_oi / 1000).toFixed(0)}K</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Strategy Builder Panel */}
        <div className="space-y-4">
          <div className="glass-panel p-5">
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Target size={14} className="text-orange-400" /> Your Strategy
            </h3>
            
            {legs.length === 0 ? (
              <div className="py-8 text-center">
                <Target className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                <p className="text-xs text-zinc-600">Click BUY/SELL on the chain or use Quick Strategies above</p>
              </div>
            ) : (
              <div className="space-y-2">
                {legs.map((leg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${
                      leg.position === 'BUY' ? 'bg-emerald-500/[0.03] border-emerald-500/10' : 'bg-rose-500/[0.03] border-rose-500/10'
                    }`}>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                      leg.position === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>{leg.position}</span>
                    <span className={`text-xs font-bold ${leg.option_type === 'CALL' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {leg.option_type}
                    </span>
                    <span className="text-xs font-black text-white font-mono-data">{leg.strike}</span>
                    <span className="text-xs text-zinc-500 font-mono-data">₹{leg.premium}</span>
                    <button onClick={() => removeLeg(i)} className="ml-auto p-1 text-zinc-600 hover:text-rose-400 transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </motion.div>
                ))}
                
                <button onClick={analyzeStrategy} disabled={analyzing}
                  className="w-full mt-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {analyzing ? <Loader2 size={14} className="animate-spin" /> : <BarChart2 size={14} />}
                  {analyzing ? 'Analyzing...' : 'Analyze Strategy'}
                </button>
                
                <button onClick={() => { setLegs([]); setAnalysis(null); }}
                  className="w-full py-2 text-xs font-bold text-zinc-600 hover:text-white transition-colors">
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* Analysis Results */}
          {analysis && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-orange-400" />
                <h3 className="text-xs font-black text-accent uppercase tracking-[0.2em]">{analysis.strategy_name}</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-emerald-500/[0.05] rounded-xl border border-emerald-500/10">
                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Max Profit</p>
                  <p className="text-lg font-black text-emerald-400 font-mono-data">
                    {analysis.max_profit > 100000 ? 'Unlimited' : `₹${analysis.max_profit.toLocaleString()}`}
                  </p>
                </div>
                <div className="p-3 bg-rose-500/[0.05] rounded-xl border border-rose-500/10">
                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Max Loss</p>
                  <p className="text-lg font-black text-rose-400 font-mono-data">₹{Math.abs(analysis.max_loss).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-white/[0.02] rounded-lg">
                  <p className="text-[9px] text-zinc-600 font-bold uppercase mb-0.5">PoP</p>
                  <p className="text-sm font-black text-white">{analysis.probability_of_profit}%</p>
                </div>
                <div className="text-center p-2 bg-white/[0.02] rounded-lg">
                  <p className="text-[9px] text-zinc-600 font-bold uppercase mb-0.5">R:R</p>
                  <p className="text-sm font-black text-amber-400">{analysis.risk_reward_ratio}x</p>
                </div>
                <div className="text-center p-2 bg-white/[0.02] rounded-lg">
                  <p className="text-[9px] text-zinc-600 font-bold uppercase mb-0.5">Net ₹</p>
                  <p className={`text-sm font-black ${analysis.net_premium >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {analysis.net_premium >= 0 ? '+' : ''}₹{analysis.net_premium.toLocaleString()}
                  </p>
                </div>
              </div>
              
              {analysis.breakevens.length > 0 && (
                <div className="p-3 bg-amber-500/[0.03] rounded-xl border border-amber-500/10">
                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Breakeven(s)</p>
                  <p className="text-sm font-black text-amber-400 font-mono-data">
                    {analysis.breakevens.map(b => `₹${b.toLocaleString()}`).join(' | ')}
                  </p>
                </div>
              )}
              
              <div className="p-3 bg-white/[0.02] rounded-xl">
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">Greeks</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div><span className="text-zinc-600">Δ</span> <span className="font-bold text-white">{analysis.greeks.delta}</span></div>
                  <div><span className="text-zinc-600">Θ</span> <span className="font-bold text-white">{analysis.greeks.theta}</span></div>
                  <div><span className="text-zinc-600">V</span> <span className="font-bold text-white">{analysis.greeks.vega}</span></div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* P&L Payoff Chart */}
      {analysis && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6">
          <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <BarChart2 size={14} className="text-orange-400" /> P&L Payoff Diagram — {analysis.strategy_name}
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={analysis.payoff}>
              <defs>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="40%" stopColor="#10b981" stopOpacity={0.05} />
                  <stop offset="60%" stopColor="#ef4444" stopOpacity={0.05} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="spot" tick={{ fontSize: 10, fill: '#52525b' }}
                tickFormatter={v => `₹${v.toLocaleString()}`} interval={10} />
              <YAxis tick={{ fontSize: 10, fill: '#52525b' }}
                tickFormatter={v => `₹${v.toLocaleString()}`} />
              <Tooltip contentStyle={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 12 }}
                formatter={(v) => [`₹${v.toLocaleString()}`, 'P&L']}
                labelFormatter={(v) => `Spot: ₹${v.toLocaleString()}`} />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
              <ReferenceLine x={analysis.spot_price} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: 'Current', fill: '#f59e0b', fontSize: 10 }} />
              {analysis.breakevens.map((be, i) => (
                <ReferenceLine key={i} x={be} stroke="#8b5cf6" strokeDasharray="3 3" />
              ))}
              <Area type="monotone" dataKey="pnl" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#profitGrad)" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-3 text-[10px] font-bold text-zinc-600">
            <span className="flex items-center gap-1"><div className="w-3 h-[2px] bg-[#f59e0b]" /> Current Price</span>
            <span className="flex items-center gap-1"><div className="w-3 h-[2px] bg-[#8b5cf6] border-dashed" /> Breakeven</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-500/20" /> Profit Zone</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-rose-500/20" /> Loss Zone</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
