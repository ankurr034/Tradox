import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, PieChart as PieIcon, ChevronRight, Calculator, CheckCircle2, Star, Shield, Sparkles, X } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function MutualFunds() {
  const [sipAmount, setSipAmount] = useState(5000);
  const [sipYears, setSipYears] = useState(10);
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const expectedReturn = 12;

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

  const totalInvestment = sipAmount * 12 * sipYears;
  const estimatedWealth = totalInvestment * Math.pow(1 + (expectedReturn / 100), sipYears);
  const estGains = estimatedWealth - totalInvestment;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-20">

      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] bg-gradient-to-br from-[#071a15] via-surface to-surface shadow-2xl">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/[0.08] rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-secondary/[0.08] rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-6 sm:gap-10 p-5 sm:p-8 md:p-12">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-primary/15 text-primary border border-primary/20 text-[10px] font-bold rounded-full tracking-widest uppercase shadow-[0_0_15px_rgba(0,212,170,0.2)]">
                Zero Commission
              </span>
              <span className="px-3 py-1 bg-white/[0.04] text-zinc-500 border border-white/[0.06] text-[10px] font-bold rounded-full tracking-widest uppercase">
                Direct Plans
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-3 sm:mb-5">
              Build <span className="text-gradient">Financial Freedom</span> with Expert AMCs.
            </h1>
            <div className="text-zinc-500 text-lg leading-relaxed mb-6">
              Auto-invest daily, monthly, or as a lumpsum. Over 5,000+ SEBI registered Mutual Funds, carefully organized using AI risk metrics.
            </div>

            <div className="flex flex-wrap gap-6 text-sm font-semibold text-zinc-400">
              <div className="flex items-center gap-2.5"><CheckCircle2 className="w-5 h-5 text-primary" /> Free Account</div>
              <div className="flex items-center gap-2.5"><CheckCircle2 className="w-5 h-5 text-primary" /> Instant KYC</div>
              <div className="flex items-center gap-2.5"><CheckCircle2 className="w-5 h-5 text-primary" /> 0% AMC Charges</div>
            </div>
          </div>

          {/* SIP Calculator */}
          <div className="bg-surface/60 border border-white/[0.08] rounded-2xl sm:rounded-3xl p-5 sm:p-8 w-full max-w-sm shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden backdrop-blur-3xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/15 blur-[50px] rounded-full pointer-events-none" />
            <div className="text-xs font-black text-white mb-6 uppercase tracking-[0.2em] flex items-center gap-3 relative z-10 opacity-70">
              <Calculator className="w-5 h-5 text-primary" /> Wealth Estimator
            </div>

            <div className="space-y-7 mb-8 relative z-10">
              <div>
                <div className="flex justify-between text-xs font-bold text-zinc-400 mb-3">
                  <span>Monthly Investment</span>
                  <span className="text-primary font-black text-base font-mono-data">₹{sipAmount.toLocaleString()}</span>
                </div>
                <input
                  type="range" min="500" max="100000" step="500"
                  value={sipAmount}
                  onChange={(e) => setSipAmount(Number(e.target.value))}
                  className="w-full accent-[#00d4aa] h-1.5 bg-white/[0.06] rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold text-zinc-400 mb-3">
                  <span>Time Horizon</span>
                  <span className="text-primary font-black text-base">{sipYears} Years</span>
                </div>
                <input
                  type="range" min="1" max="40" step="1"
                  value={sipYears}
                  onChange={(e) => setSipYears(Number(e.target.value))}
                  className="w-full accent-[#00d4aa] h-1.5 bg-white/[0.06] rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 border-t border-white/[0.06] pt-6 relative z-10">
              <div>
                <div className="text-[10px] uppercase font-black text-zinc-600 tracking-widest mb-1">Invested</div>
                <div className="font-bold text-white text-lg font-mono-data">₹{totalInvestment.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-black text-zinc-600 tracking-widest mb-1">Growth</div>
                <div className="font-bold text-emerald-400 text-lg font-mono-data">+₹{estGains.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              </div>
              <div className="col-span-2 mt-2 pt-4 border-t border-white/[0.06]">
                <div className="text-[10px] uppercase font-black text-zinc-500 tracking-widest mb-1">Total Expected Wealth (12% CAGR)</div>
                <div className="font-black text-3xl text-white font-mono-data tracking-tight">₹{estimatedWealth.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fund List */}
      <div>
        <div className="flex justify-between items-end mb-8 px-2">
          <div>
            <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-primary" /> Trending Growth Funds
            </h2>
            <div className="text-zinc-600 text-sm mt-1">Curated high-performance direct plans</div>
          </div>
          <button className="text-[10px] font-black tracking-widest text-primary hover:text-white transition-all bg-primary/5 hover:bg-primary/10 border border-primary/20 px-4 py-2 rounded-full uppercase">
            Browse All 5,000+ Funds
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {loading ? (
            Array.from({ length: 9 }).map((_, i) => (
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
          ) : (
            funds.map((fund, idx) => (
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
              <div className="p-8 space-y-8">
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
                  <button onClick={() => setSelectedFund(null)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
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
                    <div className={`text-lg font-black ${selectedFund.risk === 'Very High' ? 'text-red-400' : 'text-amber-400'}`}>{selectedFund.risk}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" /> Investor Protection & Safety
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 text-xs text-zinc-400 bg-white/[0.02] p-3 rounded-xl">
                      <ChevronRight className="w-3 h-3 text-primary" /> Verified SEBI Registered
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-400 bg-white/[0.02] p-3 rounded-xl">
                      <ChevronRight className="w-3 h-3 text-primary" /> Zero Commission Direct Plan
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-400 bg-white/[0.02] p-3 rounded-xl">
                      <ChevronRight className="w-3 h-3 text-primary" /> Instant Redemption Available
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-400 bg-white/[0.02] p-3 rounded-xl">
                      <ChevronRight className="w-3 h-3 text-primary" /> Multi-Layer Fund AI Analysis
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button className="flex-1 py-4 bg-primary text-black font-black uppercase tracking-widest rounded-2xl hover:shadow-[0_0_30px_rgba(0,212,170,0.3)] transition-all">
                    Start Monthly SIP
                  </button>
                  <button className="flex-1 py-4 bg-white/[0.04] border border-white/10 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-white/[0.08] transition-all">
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
