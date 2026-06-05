import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Users, Cpu, Search, ArrowUpRight, ArrowDownRight, Star, RefreshCw, BarChart2 } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function PriceTargets() {
  const [symbol, setSymbol] = useState('RELIANCE');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('RELIANCE');

  const fetchTargets = (sym) => {
    setLoading(true);
    axios.get(`${API_BASE_URL}/api/stock/targets/${sym}`)
      .then(res => { setData(res.data); setSymbol(sym); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTargets('RELIANCE'); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) fetchTargets(searchInput.trim().toUpperCase());
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center flex-col gap-4">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-zinc-400 font-bold animate-pulse text-sm">Aggregating analyst targets...</p>
      </div>
    );
  }

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[28px] border border-white/[0.06] bg-gradient-to-br from-[#040a14] via-surface to-surface p-8 md:p-12">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/20 flex items-center justify-center">
              <Target className="w-7 h-7 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white">AI Price Targets</h1>
              <p className="text-zinc-500 text-sm mt-0.5">Multi-source consensus from analysts, AI, and the crowd</p>
            </div>
          </div>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input value={searchInput} onChange={e => setSearchInput(e.target.value.toUpperCase())} placeholder="Enter symbol..."
                className="bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 pl-10 py-3 text-sm font-bold text-white focus:outline-none focus:border-cyan-500/40 w-48" />
            </div>
            <button type="submit" className="px-6 py-3 bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-cyan-500/25 transition-all">
              Analyze
            </button>
          </form>
        </div>
      </div>

      {data && (
        <>
          {/* Price Target Visual Range */}
          <div className="glass-panel p-8 border border-white/[0.04]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-cyan-400" /> {data.symbol} Target Range
              </h3>
              <span className="text-lg font-black text-white font-mono-data">CMP: ₹{data.current_price?.toLocaleString()}</span>
            </div>

            {/* Visual Range Bar */}
            <div className="relative py-12">
              {/* Range bar */}
              <div className="relative h-3 bg-white/[0.04] rounded-full overflow-visible">
                {/* Colored range */}
                {(() => {
                  const low = data.consensus.low_target;
                  const high = data.consensus.high_target;
                  const range = high - low;
                  const leftPct = 5;
                  const widthPct = 90;
                  return (
                    <>
                      <div className="absolute h-full bg-gradient-to-r from-red-500/30 via-emerald-500/30 to-emerald-500/50 rounded-full"
                        style={{ left: `${leftPct}%`, width: `${widthPct}%` }} />
                      
                      {/* Current Price Marker */}
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20"
                        style={{ left: `${leftPct + ((data.current_price - low) / range) * widthPct}%` }}>
                        <div className="w-5 h-5 rounded-full bg-white border-2 border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                          <p className="text-[10px] font-black text-white bg-white/10 px-2 py-0.5 rounded">CMP ₹{data.current_price?.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* AI Target Marker */}
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
                        style={{ left: `${leftPct + ((data.ai_target.price - low) / range) * widthPct}%` }}>
                        <div className="w-4 h-4 rounded-full bg-violet-500 border-2 border-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.4)]" />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                          <p className="text-[9px] font-black text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded">AI ₹{data.ai_target.price?.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Low / High labels */}
                      <div className="absolute -bottom-8 left-0"><p className="text-[9px] font-black text-red-400">₹{low?.toLocaleString()}</p></div>
                      <div className="absolute -bottom-8 right-0"><p className="text-[9px] font-black text-emerald-400">₹{high?.toLocaleString()}</p></div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Consensus Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[
                { label: 'Mean Target', value: `₹${data.consensus.mean_target?.toLocaleString()}`, upside: ((data.consensus.mean_target - data.current_price) / data.current_price * 100).toFixed(1) },
                { label: 'Median Target', value: `₹${data.consensus.median_target?.toLocaleString()}`, upside: ((data.consensus.median_target - data.current_price) / data.current_price * 100).toFixed(1) },
                { label: 'AI Target', value: `₹${data.ai_target.price?.toLocaleString()}`, upside: data.ai_target.upside },
                { label: 'Crowd Target', value: `₹${data.crowd_consensus.target?.toLocaleString()}`, upside: data.crowd_consensus.upside },
              ].map((c, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">{c.label}</p>
                  <p className="text-lg font-black text-white font-mono-data">{c.value}</p>
                  <p className={`text-xs font-black mt-1 ${c.upside >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {c.upside > 0 ? '+' : ''}{c.upside}% upside
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 border border-white/[0.04] flex flex-col items-center">
              <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">Rating Distribution</h3>
              <div className="flex gap-4 items-end h-32">
                {[
                  { label: 'BUY', count: data.consensus.buy_count, color: 'bg-emerald-500' },
                  { label: 'HOLD', count: data.consensus.hold_count, color: 'bg-amber-500' },
                  { label: 'SELL', count: data.consensus.sell_count, color: 'bg-red-500' },
                ].map((r, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <span className="text-lg font-black text-white">{r.count}</span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(10, (r.count / data.consensus.total_analysts) * 100)}%` }}
                      className={`w-14 ${r.color}/60 rounded-t-lg`}
                    />
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{r.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Target Details */}
            <div className="glass-panel p-6 border border-white/[0.04]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-widest">NexusAI Target</h3>
                  <p className="text-[9px] text-zinc-600 font-bold">{data.ai_target.model}</p>
                </div>
              </div>
              <p className="text-3xl font-black text-violet-400 font-mono-data mb-2">₹{data.ai_target.price?.toLocaleString()}</p>
              <p className={`text-sm font-black ${data.ai_target.upside >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {data.ai_target.upside > 0 ? '+' : ''}{data.ai_target.upside}% upside
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                  <div className="h-full bg-violet-500/60 rounded-full" style={{ width: `${data.ai_target.confidence}%` }} />
                </div>
                <span className="text-[10px] font-black text-zinc-500">{data.ai_target.confidence}% conf</span>
              </div>
              <p className="text-[9px] text-zinc-600 font-bold mt-2">Timeframe: {data.ai_target.timeframe}</p>
            </div>

            {/* Crowd Consensus */}
            <div className="glass-panel p-6 border border-white/[0.04]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                  <Users className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-widest">Crowd Consensus</h3>
                  <p className="text-[9px] text-zinc-600 font-bold">{data.crowd_consensus.total_votes?.toLocaleString()} votes</p>
                </div>
              </div>
              <p className="text-3xl font-black text-amber-400 font-mono-data mb-2">₹{data.crowd_consensus.target?.toLocaleString()}</p>
              <p className={`text-sm font-black ${data.crowd_consensus.upside >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {data.crowd_consensus.upside > 0 ? '+' : ''}{data.crowd_consensus.upside}% upside
              </p>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Bullish</span>
                  <span className="text-[9px] font-black text-emerald-400">{data.crowd_consensus.bullish_pct}%</span>
                </div>
                <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500/50 rounded-full" style={{ width: `${data.crowd_consensus.bullish_pct}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Analyst Breakdown Table */}
          <div className="glass-panel p-6 border border-white/[0.04]">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-5 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" /> Analyst Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.04]">
                    {['Firm', 'Tier', 'Target', 'Upside', 'Rating', 'Confidence', 'Updated'].map(h => (
                      <th key={h} className="text-[9px] font-black text-zinc-600 uppercase tracking-widest py-3 px-4 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.analyst_targets?.map((t, i) => (
                    <tr key={i} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                        <span className="text-sm font-bold text-white">{t.firm}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                          t.tier === 'GLOBAL' ? 'bg-sky-500/10 text-sky-400' : t.tier === 'ASIA' ? 'bg-violet-500/10 text-violet-400' : 'bg-zinc-500/10 text-zinc-400'
                        }`}>{t.tier}</span>
                      </td>
                      <td className="py-3 px-4 text-sm font-black text-white font-mono-data">₹{t.target_price?.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`text-sm font-black ${t.upside >= 0 ? 'text-emerald-400' : 'text-red-400'} flex items-center gap-1`}>
                          {t.upside >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {t.upside > 0 ? '+' : ''}{t.upside}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest ${
                          t.rating.includes('BUY') ? 'bg-emerald-500/10 text-emerald-400' : t.rating === 'HOLD' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                        }`}>{t.rating}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500/50 rounded-full" style={{ width: `${t.confidence}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-zinc-500">{t.confidence}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[10px] text-zinc-600 font-bold">{t.date_updated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Historical Accuracy */}
          <div className="glass-panel p-6 border border-white/[0.04]">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-5">Historical Target Accuracy</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {data.historical_accuracy?.map((h, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">{h.quarter}</p>
                  <p className={`text-2xl font-black font-mono-data ${h.accuracy_pct > 85 ? 'text-emerald-400' : h.accuracy_pct > 70 ? 'text-amber-400' : 'text-red-400'}`}>
                    {h.accuracy_pct}%
                  </p>
                  <p className="text-[9px] text-zinc-600 font-bold mt-1">Accuracy</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
