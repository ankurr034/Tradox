import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, Target, DollarSign, ArrowUpRight, Wallet, ChevronDown, PiggyBank, Home, GraduationCap, Car } from 'lucide-react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { API_BASE_URL } from '../config';

const GOALS = [
  { id: 'retirement', name: 'Retirement', icon: <PiggyBank size={20} />, amount: 50000000, years: 25, color: '#8b5cf6' },
  { id: 'house', name: 'Dream House', icon: <Home size={20} />, amount: 20000000, years: 15, color: '#0ea5e9' },
  { id: 'education', name: "Child's Education", icon: <GraduationCap size={20} />, amount: 10000000, years: 18, color: '#f59e0b' },
  { id: 'car', name: 'Luxury Car', icon: <Car size={20} />, amount: 3000000, years: 5, color: '#10b981' },
];

export default function SIPCalculator() {
  const [mode, setMode] = useState('sip'); // sip | goal
  const [monthly, setMonthly] = useState(25000);
  const [years, setYears] = useState(15);
  const [rate, setRate] = useState(12);
  const [sipData, setSipData] = useState(null);
  const [goalAmount, setGoalAmount] = useState(10000000);
  const [goalData, setGoalData] = useState(null);
  const fetchSIP = React.useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/calculator/sip?monthly=${monthly}&years=${years}&rate=${rate}`);
      setSipData(res.data);
    } catch (e) { console.error(e); }
  }, [monthly, years, rate]);

  const fetchGoal = React.useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/calculator/goal?goal_amount=${goalAmount}&years=${years}&rate=${rate}`);
      setGoalData(res.data);
    } catch (e) { console.error(e); }
  }, [goalAmount, years, rate]);

  useEffect(() => {
    Promise.resolve().then(() => {
      if (mode === 'sip') fetchSIP();
      else fetchGoal();
    });
  }, [mode, fetchSIP, fetchGoal]);

  const formatCurrency = (val) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 flex items-center justify-center">
            <Calculator className="w-6 h-6 text-blue-400" />
          </div>
          SIP Calculator & Goal Planner
        </h1>
        <p className="text-zinc-500 mt-2 text-sm">Plan your investments with AI-powered projections</p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-1.5 w-fit">
        {[
          { id: 'sip', label: 'SIP Calculator', icon: <TrendingUp size={14} /> },
          { id: 'goal', label: 'Goal Planner', icon: <Target size={14} /> },
        ].map(m => (
          <button key={m.id} onClick={() => setMode(m.id)}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
              mode === m.id ? 'bg-primary text-black shadow-lg' : 'text-zinc-500 hover:text-white'
            }`}>
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="glass-panel p-6 space-y-6">
          <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Parameters</h3>
          
          {mode === 'sip' ? (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Monthly Investment</label>
                  <span className="text-primary font-black font-mono-data">₹{monthly.toLocaleString()}</span>
                </div>
                <input type="range" min={500} max={200000} step={500} value={monthly} onChange={e => setMonthly(+e.target.value)}
                  className="w-full accent-[#00D09C] h-1.5 rounded-full bg-white/10" />
                <div className="flex justify-between text-[9px] text-zinc-700 mt-1"><span>₹500</span><span>₹2,00,000</span></div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Duration (Years)</label>
                  <span className="text-white font-black">{years}Y</span>
                </div>
                <input type="range" min={1} max={40} value={years} onChange={e => setYears(+e.target.value)}
                  className="w-full accent-[#00D09C] h-1.5 rounded-full bg-white/10" />
                <div className="flex justify-between text-[9px] text-zinc-700 mt-1"><span>1 Year</span><span>40 Years</span></div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3 block">Select Goal</label>
                <div className="grid grid-cols-2 gap-2">
                  {GOALS.map(g => (
                    <button key={g.id} onClick={() => { setGoalAmount(g.amount); setYears(g.years); }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        goalAmount === g.amount ? 'border-primary bg-primary/10' : 'border-white/[0.06] hover:bg-white/[0.03]'
                      }`}>
                      <div style={{ color: g.color }} className="text-lg mb-1">{g.icon}</div>
                      <p className="text-xs font-bold text-white">{g.name}</p>
                      <p className="text-[10px] text-zinc-600">{formatCurrency(g.amount)}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Target Amount</label>
                  <span className="text-primary font-black font-mono-data">{formatCurrency(goalAmount)}</span>
                </div>
                <input type="range" min={500000} max={100000000} step={500000} value={goalAmount} onChange={e => setGoalAmount(+e.target.value)}
                  className="w-full accent-[#00D09C] h-1.5 rounded-full bg-white/10" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Duration</label>
                  <span className="text-white font-black">{years} Years</span>
                </div>
                <input type="range" min={1} max={40} value={years} onChange={e => setYears(+e.target.value)}
                  className="w-full accent-[#00D09C] h-1.5 rounded-full bg-white/10" />
              </div>
            </div>
          )}

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Expected Return (% p.a.)</label>
              <span className="text-amber-400 font-black">{rate}%</span>
            </div>
            <input type="range" min={4} max={30} step={0.5} value={rate} onChange={e => setRate(+e.target.value)}
              className="w-full accent-[#f59e0b] h-1.5 rounded-full bg-white/10" />
            <div className="flex justify-between text-[9px] text-zinc-700 mt-1"><span>4%</span><span>30%</span></div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {mode === 'sip' && sipData && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="glass-panel p-5 text-center">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Total Invested</p>
                  <p className="text-2xl font-black text-white font-mono-data">{formatCurrency(sipData.sip.total_invested)}</p>
                </div>
                <div className="glass-panel p-5 text-center border-primary/20">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Future Value</p>
                  <p className="text-2xl font-black text-primary font-mono-data">{formatCurrency(sipData.sip.future_value)}</p>
                </div>
                <div className="glass-panel p-5 text-center">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Wealth Gained</p>
                  <p className="text-2xl font-black text-emerald-400 font-mono-data">{formatCurrency(sipData.sip.wealth_gained)}</p>
                </div>
              </div>

              {/* Growth Chart */}
              <div className="glass-panel p-6">
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">Year-by-Year Growth</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={sipData.yearly_breakdown}>
                    <defs>
                      <linearGradient id="investedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="valueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00D09C" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00D09C" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#52525b' }} tickFormatter={v => `Y${v}`} />
                    <YAxis tick={{ fontSize: 10, fill: '#52525b' }} tickFormatter={v => v >= 10000000 ? `${(v/10000000).toFixed(0)}Cr` : v >= 100000 ? `${(v/100000).toFixed(0)}L` : v} />
                    <Tooltip contentStyle={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}
                      formatter={(v) => [formatCurrency(v)]} labelFormatter={v => `Year ${v}`} />
                    <Area type="monotone" dataKey="invested" stroke="#3b82f6" fill="url(#investedGrad)" strokeWidth={2} name="Invested" />
                    <Area type="monotone" dataKey="value" stroke="#00D09C" fill="url(#valueGrad)" strokeWidth={2} name="Portfolio Value" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* SIP vs Lumpsum */}
              <div className="glass-panel p-6">
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">SIP vs Lumpsum Comparison</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 text-center">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">SIP Returns</p>
                    <p className="text-2xl font-black text-primary font-mono-data">{formatCurrency(sipData.sip.future_value)}</p>
                    <p className="text-xs text-emerald-400 mt-1">Wealth Gained: {formatCurrency(sipData.sip.wealth_gained)}</p>
                  </div>
                  <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-5 text-center">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Lumpsum Returns</p>
                    <p className="text-2xl font-black text-blue-400 font-mono-data">{formatCurrency(sipData.lumpsum.future_value)}</p>
                    <p className="text-xs text-blue-400 mt-1">Wealth Gained: {formatCurrency(sipData.lumpsum.wealth_gained)}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {mode === 'goal' && goalData && (
            <>
              <div className="glass-panel p-8 text-center border-primary/20 bg-primary/[0.02]">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Start a SIP of</p>
                <p className="text-5xl font-black text-primary font-mono-data mb-2">₹{goalData.required_monthly_sip?.toLocaleString('en-IN')}<span className="text-lg text-zinc-600">/month</span></p>
                <p className="text-sm text-zinc-500">to reach <span className="text-white font-bold">{formatCurrency(goalData.goal_amount)}</span> in {goalData.duration_years} years at {goalData.return_rate}% p.a.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="glass-panel p-5 text-center">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">You'll Invest</p>
                  <p className="text-xl font-black text-white font-mono-data">{formatCurrency(goalData.total_invested)}</p>
                </div>
                <div className="glass-panel p-5 text-center">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Market Will Add</p>
                  <p className="text-xl font-black text-emerald-400 font-mono-data">{formatCurrency(goalData.wealth_gained)}</p>
                </div>
              </div>

              {/* Milestones */}
              <div className="glass-panel p-6">
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">Goal Milestones</h3>
                <div className="space-y-3">
                  {goalData.milestones?.map((m, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-primary font-black text-sm">{m.percent}%</span>
                      </div>
                      <div className="flex-1">
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-1">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${m.percent}%` }} transition={{ delay: i * 0.2, duration: 0.8 }}
                            className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full" />
                        </div>
                        <p className="text-xs text-zinc-500">{formatCurrency(m.amount)} in <span className="text-white font-bold">{m.years} years</span> ({m.months} months)</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
