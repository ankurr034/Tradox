import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, TrendingUp, TrendingDown, Zap, Target, ChevronRight, Clock, BarChart2, ArrowUpRight, ArrowDownRight, Loader2, Filter, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom';

const PREDICTION_CONFIG = {
  BEAT: { color: '#10b981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: '📈', label: 'Expected to BEAT' },
  MISS: { color: '#ef4444', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: '📉', label: 'Expected to MISS' },
  'IN-LINE': { color: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: '➡️', label: 'Expected IN-LINE' },
};

export default function EarningsCalendar() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('this_month');
  const [filter, setFilter] = useState('ALL');
  const [expandedEntry, setExpandedEntry] = useState(null);

  useEffect(() => { fetchEarnings(); }, [period]);

  const fetchEarnings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/earnings/calendar?period=${period}`);
      setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filteredEntries = data?.entries?.filter(e => filter === 'ALL' || e.ai_prediction === filter) || [];

  if (loading) return <div className="py-20 text-center"><Loader2 className="w-8 h-8 text-primary mx-auto animate-spin" /></div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-400" />
            </div>
            Earnings Calendar
          </h1>
          <p className="text-zinc-500 mt-2 text-sm">AI Whisper Numbers & Earnings Predictions • Exclusive to NexusAI</p>
        </div>
        {data?.season && (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <Calendar size={14} className="text-blue-400" />
            <span className="text-xs font-black text-blue-400 uppercase tracking-widest">{data.season}</span>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      {data?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 border-l-4 border-l-blue-500">
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Upcoming Reports</p>
            <p className="text-3xl font-black text-white font-mono-data">{data.summary.total_upcoming}</p>
            <p className="text-xs text-zinc-500 mt-1">Companies reporting this period</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-panel p-6 border-l-4 border-l-emerald-500">
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">AI Predicts BEAT</p>
            <p className="text-3xl font-black text-emerald-400 font-mono-data">{data.summary.beats_expected}</p>
            <p className="text-xs text-zinc-500 mt-1">Companies expected to beat estimates</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass-panel p-6 border-l-4 border-l-amber-500">
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Avg Implied Move</p>
            <p className="text-3xl font-black text-amber-400 font-mono-data">±{data.summary.avg_implied_move}%</p>
            <p className="text-xs text-zinc-500 mt-1">Expected price movement post-earnings</p>
          </motion.div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {['this_week', 'this_month'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                period === p ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-white/[0.03] text-zinc-600 border border-white/[0.06] hover:text-white'
              }`}>{p.replace('_', ' ')}</button>
          ))}
        </div>
        <div className="flex gap-2">
          {['ALL', 'BEAT', 'MISS', 'IN-LINE'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                filter === f ? 'bg-white/[0.08] text-white' : 'text-zinc-600 hover:text-zinc-300'
              }`}>{f}</button>
          ))}
        </div>
      </div>

      {/* Earnings Cards */}
      <div className="space-y-3">
        {filteredEntries.map((entry, i) => {
          const config = PREDICTION_CONFIG[entry.ai_prediction] || PREDICTION_CONFIG['IN-LINE'];
          const isExpanded = expandedEntry === entry.symbol;
          
          return (
            <motion.div key={entry.symbol} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }} className="glass-panel overflow-hidden">
              
              {/* Main Row */}
              <div className="flex items-center gap-4 p-5 cursor-pointer hover:bg-white/[0.01] transition-all"
                onClick={() => setExpandedEntry(isExpanded ? null : entry.symbol)}>
                
                {/* Date */}
                <div className="w-16 text-center shrink-0">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                    {new Date(entry.earnings_date).toLocaleDateString('en-IN', { month: 'short' })}
                  </p>
                  <p className="text-2xl font-black text-white">
                    {new Date(entry.earnings_date).getDate()}
                  </p>
                  <p className="text-[9px] font-bold text-zinc-700 uppercase">{entry.earnings_time}</p>
                </div>

                <div className="w-px h-12 bg-white/[0.06]" />

                {/* Company Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-black text-white">{entry.symbol}</span>
                    <span className="text-xs text-zinc-600">{entry.name}</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-white/[0.04] text-zinc-500">{entry.sector}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-zinc-600">
                    <span>MCap: {entry.market_cap}</span>
                    <span>Beat Rate: {entry.beat_rate}</span>
                    <span>Days: {entry.days_until}</span>
                  </div>
                </div>

                {/* AI Prediction */}
                <div className="text-center shrink-0">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${config.bg} ${config.border} border`}>
                    <span className="text-sm">{config.icon}</span>
                    <div className="text-left">
                      <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: config.color }}>
                        AI: {entry.ai_prediction}
                      </p>
                      <p className="text-[9px] text-zinc-600">{entry.ai_confidence}% confidence</p>
                    </div>
                  </div>
                </div>

                {/* Whisper Numbers */}
                <div className="text-center shrink-0 w-32">
                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Whisper EPS</p>
                  <p className="text-lg font-black font-mono-data" style={{ color: config.color }}>₹{entry.whisper_eps}</p>
                  <p className="text-[10px] text-zinc-600">vs Est: ₹{entry.analyst_eps_estimate}</p>
                </div>

                {/* Implied Move */}
                <div className="text-center shrink-0">
                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Implied Move</p>
                  <p className="text-lg font-black text-amber-400 font-mono-data">±{entry.implied_move}%</p>
                </div>

                <ChevronRight className={`w-4 h-4 text-zinc-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </div>

              {/* Expanded Detail */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-white/[0.04]">
                    <div className="p-6">
                      <h4 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">Historical Earnings Surprises</h4>
                      <div className="grid grid-cols-4 gap-3">
                        {entry.historical_surprises.map((s, si) => (
                          <div key={si} className={`p-4 rounded-xl border ${s.beat ? 'bg-emerald-500/[0.03] border-emerald-500/10' : 'bg-rose-500/[0.03] border-rose-500/10'}`}>
                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">{s.quarter}</p>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] text-zinc-500">Est</span>
                              <span className="text-xs font-bold text-zinc-400 font-mono-data">₹{s.estimated_eps}</span>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] text-zinc-500">Actual</span>
                              <span className="text-xs font-black text-white font-mono-data">₹{s.actual_eps}</span>
                            </div>
                            <div className={`flex items-center justify-center gap-1 text-xs font-black px-2 py-1 rounded-lg ${
                              s.beat ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                            }`}>
                              {s.beat ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                              {s.surprise_pct > 0 ? '+' : ''}{s.surprise_pct}%
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 flex gap-3">
                        <button onClick={() => navigate(`/stock/${entry.symbol}`)}
                          className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-xs font-black rounded-xl hover:bg-primary/20 transition-all uppercase tracking-widest">
                          <BarChart2 size={14} /> View Chart
                        </button>
                        <button onClick={() => navigate(`/sentiment?symbol=${entry.symbol}`)}
                          className="flex items-center gap-2 px-4 py-2 bg-pink-500/10 text-pink-400 text-xs font-black rounded-xl hover:bg-pink-500/20 transition-all uppercase tracking-widest">
                          <Zap size={14} /> Social Sentiment
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {filteredEntries.length === 0 && (
        <div className="glass-panel p-12 text-center">
          <Calendar className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-zinc-500 mb-2">No earnings in this period</h3>
          <p className="text-sm text-zinc-600">Try switching to "This Month" for more results</p>
        </div>
      )}
    </div>
  );
}
