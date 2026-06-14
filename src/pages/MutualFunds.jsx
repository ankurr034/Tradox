import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Calculator, CheckCircle2, Star, Shield, Sparkles, X, ChevronRight, HelpCircle, Layers, ArrowUpRight } from 'lucide-react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { API_BASE_URL } from '../config';

const CATEGORIES = [
  { id: 'All', label: 'All Funds' },
  { id: 'Equity', label: 'High Return (Equity)' },
  { id: 'Debt', label: 'Low Risk (Debt)' },
  { id: 'Hybrid', label: 'Balanced (Hybrid)' },
  { id: 'Index', label: 'Low Cost (Index)' }
];

export default function MutualFunds() {
  // Calculator states
  const [calcMode, setCalcMode] = useState('sip'); // sip | lumpsum
  const [monthlyInvest, setMonthlyInvest] = useState(5000);
  const [lumpsumInvest, setLumpsumInvest] = useState(25000);
  const [calcYears, setCalcYears] = useState(10);
  const [expectedRate, setExpectedRate] = useState(12);

  // Funds list states
  const [funds, setFunds] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedFund, setSelectedFund] = useState(null);

  useEffect(() => {
    const fetchFunds = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/mutual-funds`);
        setFunds(res.data.funds || []);
      } catch (e) {
        console.error("Failed to fetch mutual funds", e);
      } finally {
        setLoading(false);
      }
    };
    fetchFunds();
  }, []);

  // Calculator logic
  const calcData = useMemo(() => {
    let invested = 0;
    let totalValue = 0;
    let gains = 0;

    if (calcMode === 'sip') {
      const P = monthlyInvest;
      const i = expectedRate / 12 / 100;
      const n = calcYears * 12;
      invested = P * n;
      totalValue = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
      gains = Math.max(0, totalValue - invested);
    } else {
      const P = lumpsumInvest;
      const r = expectedRate / 100;
      const n = calcYears;
      invested = P;
      totalValue = P * Math.pow(1 + r, n);
      gains = Math.max(0, totalValue - invested);
    }

    return {
      invested: Math.round(invested),
      gains: Math.round(gains),
      total: Math.round(totalValue),
      chartData: [
        { name: 'Invested Amount', value: Math.round(invested), color: '#3b82f6' },
        { name: 'Est. Returns', value: Math.round(gains), color: '#00d4aa' }
      ]
    };
  }, [calcMode, monthlyInvest, lumpsumInvest, calcYears, expectedRate]);

  // Filtering funds based on categorisation
  const filteredFunds = useMemo(() => {
    if (selectedCategory === 'All') return funds;
    return funds.filter(fund => fund.category.toLowerCase().includes(selectedCategory.toLowerCase()));
  }, [funds, selectedCategory]);

  const formatCurrency = (val) => {
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-24">
      {/* Banner / Header */}
      <div className="relative rounded-3xl overflow-hidden border border-white/[0.06] bg-gradient-to-br from-[#091e19] via-surface to-surface shadow-2xl p-6 sm:p-10 md:p-12">
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-primary/[0.08] rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-secondary/[0.08] rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="px-3 py-1 bg-primary/15 text-primary border border-primary/20 text-[10px] font-black rounded-full tracking-widest uppercase shadow-[0_0_15px_rgba(0,212,170,0.2)]">
              Direct Plans • 0% Commission
            </span>
            <span className="px-3 py-1 bg-white/[0.04] text-zinc-500 border border-white/[0.06] text-[10px] font-bold rounded-full tracking-widest uppercase">
              SEBI Registered
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-4">
            Invest in <span className="text-gradient">Mutual Funds</span> Like a Pro
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed mb-6">
            Compare and choose from 5,000+ mutual funds. Estimate returns instantly with our live interactive calculators and track direct growth parameters.
          </p>

          <div className="flex flex-wrap gap-5 text-xs font-bold text-zinc-400">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4.5 h-4.5 text-primary" /> Zero Commission</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4.5 h-4.5 text-primary" /> Instant SIP Setup</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4.5 h-4.5 text-primary" /> Multi-AMC Support</div>
          </div>
        </div>
      </div>

      {/* Groww-style Interactive SIP & Lumpsum Calculator */}
      <div className="glass-panel p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-white/[0.06] pb-5">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2.5">
              <Calculator className="w-5 h-5 text-primary" /> Mutual Fund Return Calculator
            </h2>
            <p className="text-xs text-zinc-500 mt-1">Estimate wealth gained through regular monthly SIPs or single one-time lumpsums</p>
          </div>

          {/* Tab buttons */}
          <div className="flex gap-1.5 bg-white/[0.02] border border-white/[0.06] rounded-xl p-1 shrink-0">
            <button
              onClick={() => setCalcMode('sip')}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                calcMode === 'sip' ? 'bg-primary text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              SIP (Monthly)
            </button>
            <button
              onClick={() => setCalcMode('lumpsum')}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                calcMode === 'lumpsum' ? 'bg-primary text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Lumpsum (One-time)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Sliders (Left Column) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            {calcMode === 'sip' ? (
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-zinc-400 mb-3">
                  <span>Monthly Investment</span>
                  <div className="bg-primary/10 border border-primary/20 text-primary font-mono-data font-black text-sm px-3 py-1 rounded-lg">
                    {formatCurrency(monthlyInvest)}
                  </div>
                </div>
                <input
                  type="range" min="500" max="100000" step="500"
                  value={monthlyInvest}
                  onChange={(e) => setMonthlyInvest(Number(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-white/[0.06] rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
                  <span>₹500</span>
                  <span>₹1,00,000</span>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-zinc-400 mb-3">
                  <span>Total Lumpsum Investment</span>
                  <div className="bg-primary/10 border border-primary/20 text-primary font-mono-data font-black text-sm px-3 py-1 rounded-lg">
                    {formatCurrency(lumpsumInvest)}
                  </div>
                </div>
                <input
                  type="range" min="1000" max="1000000" step="1000"
                  value={lumpsumInvest}
                  onChange={(e) => setLumpsumInvest(Number(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-white/[0.06] rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
                  <span>₹1,000</span>
                  <span>₹10,00,000</span>
                </div>
              </div>
            )}

            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-zinc-400 mb-3">
                <span>Expected Return Rate (p.a.)</span>
                <div className="bg-amber-400/10 border border-amber-400/20 text-amber-400 font-mono-data font-black text-sm px-3 py-1 rounded-lg">
                  {expectedRate}%
                </div>
              </div>
              <input
                type="range" min="1" max="30" step="0.5"
                value={expectedRate}
                onChange={(e) => setExpectedRate(Number(e.target.value))}
                className="w-full accent-amber-400 h-1.5 bg-white/[0.06] rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
                <span>1%</span>
                <span>30%</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-zinc-400 mb-3">
                <span>Time Period</span>
                <div className="bg-white/5 border border-white/10 text-white font-mono-data font-black text-sm px-3 py-1 rounded-lg">
                  {calcYears} Years
                </div>
              </div>
              <input
                type="range" min="1" max="40" step="1"
                value={calcYears}
                onChange={(e) => setCalcYears(Number(e.target.value))}
                className="w-full accent-white h-1.5 bg-white/[0.06] rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
                <span>1 Year</span>
                <span>40 Years</span>
              </div>
            </div>
          </div>

          {/* Visuals & Donut Chart (Right Column) */}
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col items-center gap-6 border-t lg:border-t-0 lg:border-l border-white/[0.06] pt-6 lg:pt-0 lg:pl-8">
            {/* Recharts Donut Chart */}
            <div className="w-48 h-48 shrink-0 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={calcData.chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {calcData.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}
                    formatter={(val) => [formatCurrency(val)]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none">Est. Wealth</span>
                <span className="text-base font-black text-white mt-1 leading-none truncate max-w-[130px]">{formatCurrency(calcData.total)}</span>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="w-full space-y-4">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-500" />
                  <span className="text-zinc-500 font-bold">Invested Amount</span>
                </div>
                <span className="font-bold text-white font-mono-data">{formatCurrency(calcData.invested)}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-primary" />
                  <span className="text-zinc-500 font-bold">Est. Returns</span>
                </div>
                <span className="font-bold text-emerald-400 font-mono-data">+{formatCurrency(calcData.gains)}</span>
              </div>

              <div className="h-px bg-white/[0.06] pt-1" />

              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase text-zinc-400 tracking-wider">Total Value</span>
                <span className="text-lg font-black text-white font-mono-data">{formatCurrency(calcData.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fund Categories Selector */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4 px-2">
          <div>
            <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
              <Sparkles className="w-6 h-6 text-primary" /> Popular Mutual Funds
            </h2>
            <div className="text-zinc-500 text-sm mt-1">Direct plans with high direct compound annual returns</div>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-full pb-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-primary/20 text-primary border-primary/30'
                    : 'bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10 hover:text-zinc-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Funds Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-panel p-6 space-y-4 animate-pulse">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-white/[0.04] rounded-2xl" />
                  <div className="w-20 h-6 bg-white/[0.04] rounded-lg" />
                </div>
                <div className="space-y-2">
                  <div className="w-full h-5 bg-white/[0.04] rounded-md" />
                  <div className="w-2/3 h-4 bg-white/[0.04] rounded-md" />
                </div>
                <div className="pt-4 border-t border-white/[0.04] grid grid-cols-3 gap-2">
                  <div className="h-10 bg-white/[0.04] rounded-xl" />
                  <div className="h-10 bg-white/[0.04] rounded-xl" />
                  <div className="h-10 bg-white/[0.04] rounded-xl" />
                </div>
              </div>
            ))
          ) : filteredFunds.length > 0 ? (
            filteredFunds.map((fund, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, rotateX: -10, y: 20 }}
                animate={{ opacity: 1, rotateX: 0, y: 0 }}
                transition={{ delay: idx * 0.04, type: 'spring', damping: 20 }}
                onClick={() => setSelectedFund(fund)}
                className="glass-panel-hover p-6 group flex flex-col justify-between min-h-[250px] cursor-pointer hover:shadow-primary/5 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div>
                  <div className="flex justify-between items-start mb-5">
                    <div className="w-12 h-12 rounded-2xl border border-white/[0.06] flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform" style={{ backgroundColor: `${fund.color}15` }}>
                      <span className="font-black text-2xl" style={{ color: fund.color }}>{fund.name.charAt(0)}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="px-2.5 py-1 bg-white/[0.03] border border-white/[0.06] text-[10px] rounded-lg text-emerald-400 font-black flex items-center gap-1.5 uppercase tracking-tighter">
                        <TrendingUp className="w-3.5 h-3.5" /> {fund.returns3Y} 
                      </span>
                      <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">3Y Returns</span>
                    </div>
                  </div>
                  <h3 className="font-extrabold text-white text-lg leading-tight group-hover:text-primary transition-colors pr-6 group-hover:translate-x-1 duration-300">
                    {fund.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{fund.category}</div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < fund.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-800'}`} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-white/[0.06] grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-[10px] uppercase font-black text-zinc-600 tracking-wider mb-1">AUM</div>
                    <div className="font-bold text-zinc-300 text-xs">{fund.aum}</div>
                  </div>
                  <div className="text-center border-x border-white/[0.04]">
                    <div className="text-[10px] uppercase font-black text-zinc-600 tracking-wider mb-1">Min SIP</div>
                    <div className="font-bold text-zinc-300 text-xs">₹{fund.minSip}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] uppercase font-black text-zinc-600 tracking-wider mb-1">Risk</div>
                    <div className={`font-bold text-[10px] uppercase tracking-tighter ${fund.risk === 'Very High' ? 'text-red-400' : fund.risk === 'High' ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {fund.risk}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center">
              <p className="text-sm text-zinc-500">No mutual funds matching this category currently found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Fund Detail Modal */}
      <AnimatePresence>
        {selectedFund && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFund(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-surface border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)]"
            >
              <div className="p-8 space-y-8 text-left">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl border border-white/10 flex items-center justify-center" style={{ backgroundColor: `${selectedFund.color}15` }}>
                      <span className="font-black text-3xl" style={{ color: selectedFund.color }}>{selectedFund.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white leading-tight">{selectedFund.name}</h2>
                      <div className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-1">{selectedFund.category}</div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedFund(null)} className="p-2 hover:bg-white/5 rounded-xl transition-colors cursor-pointer">
                    <X className="w-6 h-6 text-zinc-500" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/[0.04]">
                    <div className="text-[10px] uppercase font-black text-zinc-600 mb-1">Returns (3Y)</div>
                    <div className="text-lg font-black text-emerald-400">{selectedFund.returns3Y}</div>
                  </div>
                  <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/[0.04]">
                    <div className="text-[10px] uppercase font-black text-zinc-600 mb-1">AUM</div>
                    <div className="text-lg font-black text-white">{selectedFund.aum}</div>
                  </div>
                  <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/[0.04]">
                    <div className="text-[10px] uppercase font-black text-zinc-600 mb-1">Min SIP</div>
                    <div className="text-lg font-black text-white">₹{selectedFund.minSip}</div>
                  </div>
                  <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/[0.04]">
                    <div className="text-[10px] uppercase font-black text-zinc-600 mb-1">Risk Scale</div>
                    <div className={`text-lg font-black ${selectedFund.risk === 'Very High' ? 'text-red-400' : selectedFund.risk === 'High' ? 'text-amber-400' : 'text-emerald-400'}`}>{selectedFund.risk}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" /> Investor Protection & Safety
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 text-xs text-zinc-400 bg-white/[0.02] p-3 rounded-xl">
                      <ChevronRight className="w-3.5 h-3.5 text-primary" /> Verified SEBI Registered
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-400 bg-white/[0.02] p-3 rounded-xl">
                      <ChevronRight className="w-3.5 h-3.5 text-primary" /> Zero Commission Direct Plan
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-400 bg-white/[0.02] p-3 rounded-xl">
                      <ChevronRight className="w-3.5 h-3.5 text-primary" /> Instant Redemption Available
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-400 bg-white/[0.02] p-3 rounded-xl">
                      <ChevronRight className="w-3.5 h-3.5 text-primary" /> Multi-Layer Fund AI Analysis
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button className="flex-1 py-4 bg-primary text-black font-black uppercase tracking-widest rounded-2xl hover:shadow-[0_0_30px_rgba(0,212,170,0.3)] transition-all cursor-pointer">
                    Start Monthly SIP
                  </button>
                  <button className="flex-1 py-4 bg-white/[0.04] border border-white/10 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-white/[0.08] transition-all cursor-pointer">
                    One-time Lumpsum
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
