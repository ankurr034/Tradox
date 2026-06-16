import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Zap, Globe, Building, BarChart2, RefreshCw, ArrowRight, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-[#0a0a12]/95 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl min-w-[200px]">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">{d.date}</p>
        <div className="space-y-1.5">
          <div className="flex justify-between"><span className="text-xs text-sky-400 font-bold">FII Net</span><span className={`text-xs font-black ${d.fii_net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>₹{d.fii_net?.toLocaleString()} Cr</span></div>
          <div className="flex justify-between"><span className="text-xs text-amber-400 font-bold">DII Net</span><span className={`text-xs font-black ${d.dii_net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>₹{d.dii_net?.toLocaleString()} Cr</span></div>
        </div>
      </div>
    );
  }
  return null;
};

export default function SmartMoneyFlow() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('1M');

  useEffect(() => {
    Promise.resolve().then(() => setLoading(true));
    axios.get(`${API_BASE_URL}/api/smartmoney/flow?period=${period}`)
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center flex-col gap-4">
        <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
        <p className="text-zinc-400 font-bold animate-pulse text-sm">Tracking institutional flows...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[28px] border border-white/[0.06] bg-gradient-to-br from-[#020a18] via-surface to-surface p-8 md:p-12">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500/20 to-blue-600/20 border border-sky-500/20 flex items-center justify-center">
              <Building className="w-7 h-7 text-sky-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white">Smart Money Flow</h1>
              <p className="text-zinc-500 text-sm mt-0.5">Track FII/DII institutional movements in real-time</p>
            </div>
          </div>
          
          {/* Period Selector */}
          <div className="flex gap-2">
            {['1W', '1M', '3M', '6M', '1Y'].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                  period === p ? 'bg-sky-500/15 border-sky-500/30 text-sky-400' : 'bg-white/[0.02] border-white/[0.06] text-zinc-500 hover:text-white'
                }`}>{p}</button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Signal Banner */}
      <div className={`rounded-2xl border p-6 flex items-center gap-6 ${
        data.ai_signal?.includes('ACCUMULATION') || data.ai_signal?.includes('RALLY') ? 'bg-emerald-500/5 border-emerald-500/20' :
        data.ai_signal?.includes('EXODUS') ? 'bg-red-500/5 border-red-500/20' : 'bg-amber-500/5 border-amber-500/20'
      }`}>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
          data.ai_signal?.includes('ACCUMULATION') || data.ai_signal?.includes('RALLY') ? 'bg-emerald-500/15' :
          data.ai_signal?.includes('EXODUS') ? 'bg-red-500/15' : 'bg-amber-500/15'
        }`}>
          <Zap className={`w-7 h-7 ${
            data.ai_signal?.includes('ACCUMULATION') || data.ai_signal?.includes('RALLY') ? 'text-emerald-400' :
            data.ai_signal?.includes('EXODUS') ? 'text-red-400' : 'text-amber-400'
          }`} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-black text-white">{data.ai_signal}</h3>
          <p className="text-sm text-zinc-400 mt-1">{data.ai_detail}</p>
        </div>
        <div className="live-dot" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'FII Net Flow', value: `₹${Math.abs(data.summary?.total_fii_net).toLocaleString()} Cr`, positive: data.summary?.total_fii_net >= 0, trend: data.summary?.fii_trend, icon: <Globe className="w-4 h-4" />, color: 'sky' },
          { label: 'DII Net Flow', value: `₹${Math.abs(data.summary?.total_dii_net).toLocaleString()} Cr`, positive: data.summary?.total_dii_net >= 0, trend: data.summary?.dii_trend, icon: <Building className="w-4 h-4" />, color: 'amber' },
          { label: 'Total Net', value: `₹${Math.abs(data.summary?.total_net).toLocaleString()} Cr`, positive: data.summary?.total_net >= 0, icon: <BarChart2 className="w-4 h-4" />, color: 'violet' },
          { label: 'Block Deals', value: data.block_deals?.length || 0, icon: <AlertTriangle className="w-4 h-4" />, color: 'rose', positive: true },
        ].map((m, i) => (
          <div key={i} className="glass-panel p-5 border border-white/[0.04] group hover:border-white/[0.1] transition-all">
            <div className={`flex items-center gap-2 mb-3 text-${m.color}-400`}>
              {m.icon}
              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{m.label}</span>
            </div>
            <p className="text-xl font-black text-white font-mono-data flex items-center gap-2">
              {m.positive !== undefined && (m.positive ?
                <ArrowUpRight className="w-4 h-4 text-emerald-400" /> :
                <ArrowDownRight className="w-4 h-4 text-red-400" />
              )}
              {m.value}
            </p>
            {m.trend && <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${m.positive ? 'text-emerald-400' : 'text-red-400'}`}>{m.trend}</p>}
          </div>
        ))}
      </div>

      {/* Cumulative Flow Chart */}
      <div className="glass-panel p-6 border border-white/[0.04]">
        <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-sky-400" /> Cumulative Flow
        </h3>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.daily_flow} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="fiiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="diiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
              <XAxis dataKey="date" stroke="#52525b" tick={{ fill: '#71717a', fontSize: 10 }} minTickGap={40} />
              <YAxis stroke="#52525b" tick={{ fill: '#71717a', fontSize: 10 }} tickFormatter={v => `₹${v}`} />
              <ReferenceLine y={0} stroke="#ffffff15" strokeDasharray="3 3" />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="cumulative_fii" name="FII Cumulative" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#fiiGrad)" />
              <Area type="monotone" dataKey="cumulative_dii" name="DII Cumulative" stroke="#f59e0b" strokeWidth={2.5} fill="url(#diiGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-6 mt-4 justify-center">
          <div className="flex items-center gap-2"><div className="w-3 h-1 bg-sky-500 rounded-full" /><span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">FII Flow</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-1 bg-amber-500 rounded-full" /><span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">DII Flow</span></div>
        </div>
      </div>

      {/* Daily Net Flow Bar Chart */}
      <div className="glass-panel p-6 border border-white/[0.04]">
        <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" /> Daily Net Flow
        </h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.daily_flow?.slice(-22)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
              <XAxis dataKey="date" stroke="#52525b" tick={{ fill: '#71717a', fontSize: 9 }} minTickGap={30} />
              <YAxis stroke="#52525b" tick={{ fill: '#71717a', fontSize: 10 }} />
              <ReferenceLine y={0} stroke="#ffffff15" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total_net" radius={[4, 4, 0, 0]}>
                {data.daily_flow?.slice(-22).map((entry, index) => (
                  <Cell key={index} fill={entry.total_net >= 0 ? '#10b981' : '#ef4444'} fillOpacity={0.7} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sector Flow + Block Deals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sector Flow */}
        <div className="glass-panel p-6 border border-white/[0.04]">
          <h3 className="text-xs font-black text-white uppercase tracking-widest mb-5 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-amber-400" /> Sector-wise Flow
          </h3>
          <div className="space-y-3">
            {data.sector_flow?.map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all">
                <span className="text-xs font-black text-white w-20">{s.sector}</span>
                <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${s.net_flow >= 0 ? 'bg-emerald-500/60' : 'bg-red-500/60'}`}
                    style={{ width: `${Math.min(100, Math.abs(s.net_flow) / 80)}%` }}
                  />
                </div>
                <span className={`text-xs font-black font-mono-data w-24 text-right ${s.net_flow >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {s.net_flow >= 0 ? '+' : ''}₹{s.net_flow?.toLocaleString()}
                </span>
                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                  s.trend === 'ACCUMULATION' ? 'bg-emerald-500/10 text-emerald-400' :
                  s.trend === 'DISTRIBUTION' ? 'bg-red-500/10 text-red-400' : 'bg-zinc-500/10 text-zinc-400'
                }`}>{s.trend}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Block Deals */}
        <div className="glass-panel p-6 border border-white/[0.04]">
          <h3 className="text-xs font-black text-white uppercase tracking-widest mb-5 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" /> Today's Block Deals
          </h3>
          <div className="space-y-3">
            {data.block_deals?.map((deal, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black px-2 py-0.5 rounded ${deal.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{deal.type}</span>
                    <span className="text-sm font-black text-white">{deal.symbol}</span>
                  </div>
                  <span className="text-xs font-bold text-zinc-500">{deal.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 font-bold">{deal.buyer} • {deal.quantity?.toLocaleString()} qty</span>
                  <span className="text-sm font-black text-amber-400">₹{deal.value_cr} Cr</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
