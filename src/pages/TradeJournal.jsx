import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Trophy, TrendingUp, TrendingDown, Calendar, Target, AlertTriangle, Lightbulb, Zap, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { API_BASE_URL } from '../config';

export default function TradeJournal() {
  const { user } = useUser();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchJournal();
  }, []);

  const fetchJournal = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/journal?user_id=${user?.id || 1}`);
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-[#121214]/95 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-2xl">
          <p className="text-zinc-400 text-xs mb-1 font-semibold">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm font-medium py-0.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-zinc-300">{entry.name}:</span>
              <span className="text-white">{typeof entry.value === 'number' ? (entry.name === 'P&L' ? `₹${entry.value.toFixed(0)}` : entry.value) : entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center flex-col gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-500 text-sm">Analyzing your trades...</p>
      </div>
    );
  }

  const analytics = data?.analytics || {};
  const isEmpty = analytics.total_trades === 0;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-8"
        style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.08))' }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-xl shadow-blue-500/20">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">Trade Journal</h1>
            <p className="text-zinc-400 text-sm">AI-powered diary of your trading journey • Auto-generated analytics</p>
          </div>
        </div>
      </motion.div>

      {isEmpty ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-panel p-16 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
            <BookOpen size={36} className="text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Trades Yet</h3>
          <p className="text-sm text-zinc-500 max-w-md mx-auto">
            Start trading to build your journal. The AI will automatically track and analyze your performance, 
            identify patterns, and provide personalized lessons.
          </p>
        </motion.div>
      ) : (
        <>
          {/* Analytics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { label: 'Total Trades', value: analytics.total_trades, icon: <BarChart3 size={16} />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: 'Win Rate', value: `${analytics.win_rate}%`, icon: <Trophy size={16} />, color: analytics.win_rate > 50 ? 'text-emerald-400' : 'text-red-400', bg: analytics.win_rate > 50 ? 'bg-emerald-500/10' : 'bg-red-500/10' },
              { label: 'Total P&L', value: `₹${analytics.total_pnl?.toLocaleString()}`, icon: analytics.total_pnl >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />, color: analytics.total_pnl >= 0 ? 'text-emerald-400' : 'text-red-400', bg: analytics.total_pnl >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10' },
              { label: 'Avg Return', value: `₹${analytics.avg_return?.toLocaleString()}`, icon: <Target size={16} />, color: 'text-purple-400', bg: 'bg-purple-500/10' },
              { label: 'Avg Hold Days', value: analytics.avg_holding_days, icon: <Calendar size={16} />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { label: 'Win Streak', value: `${analytics.streak?.current}/${analytics.streak?.best}`, icon: <Zap size={16} />, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass-panel p-4"
              >
                <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center mb-3 ${card.color}`}>
                  {card.icon}
                </div>
                <p className={`text-xl font-black ${card.color}`}>{card.value}</p>
                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider mt-0.5">{card.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white/[0.02] border border-white/[0.06] rounded-xl p-1.5">
            {['overview', 'entries', 'insights'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  activeTab === tab
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-zinc-500 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Day of Week Performance */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-panel p-6"
              >
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Calendar size={16} className="text-primary" />
                  Day-of-Week P&L
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.day_of_week_performance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                      <XAxis dataKey="day" stroke="#a1a1aa" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                      <YAxis stroke="#a1a1aa" tick={{ fill: '#a1a1aa', fontSize: 11 }} tickFormatter={v => `₹${v}`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="pnl" name="P&L" radius={[6, 6, 0, 0]}>
                        {data.day_of_week_performance?.map((entry, index) => (
                          <motion.rect key={index} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Monthly Breakdown */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-panel p-6"
              >
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <BarChart3 size={16} className="text-primary" />
                  Monthly Trading Activity
                </h3>
                {data.monthly_breakdown?.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.monthly_breakdown}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                        <XAxis dataKey="month" stroke="#a1a1aa" tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                        <YAxis stroke="#a1a1aa" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="buys" name="Buys" fill="#8b5cf6" radius={[4, 4, 0, 0]} stackId="a" />
                        <Bar dataKey="sells" name="Sells" fill="#0ea5e9" radius={[4, 4, 0, 0]} stackId="a" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-zinc-600 text-sm">
                    Not enough data yet
                  </div>
                )}
              </motion.div>

              {/* Best & Worst Trades */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-6"
              >
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Trophy size={16} className="text-amber-400" />
                  Best & Worst Trades
                </h3>
                <div className="space-y-3">
                  {analytics.best_trade && (
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <ArrowUpRight size={18} className="text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500 font-bold uppercase">Best Trade</p>
                          <p className="text-sm font-bold text-white">{analytics.best_trade.symbol}</p>
                        </div>
                      </div>
                      <p className="text-lg font-black text-emerald-400">+₹{analytics.best_trade.pnl?.toFixed(0)}</p>
                    </div>
                  )}
                  {analytics.worst_trade && (
                    <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                          <ArrowDownRight size={18} className="text-red-400" />
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500 font-bold uppercase">Worst Trade</p>
                          <p className="text-sm font-bold text-white">{analytics.worst_trade.symbol}</p>
                        </div>
                      </div>
                      <p className="text-lg font-black text-red-400">₹{analytics.worst_trade.pnl?.toFixed(0)}</p>
                    </div>
                  )}
                  {analytics.most_traded_stock && (
                    <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                          <Zap size={18} className="text-purple-400" />
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500 font-bold uppercase">Most Traded</p>
                          <p className="text-sm font-bold text-white">{analytics.most_traded_stock}</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-purple-400">#{analytics.total_trades} trades</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Win Rate Gauge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-6 flex flex-col items-center justify-center"
              >
                <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                  <Target size={16} className="text-primary" />
                  Win Rate
                </h3>
                <div className="relative w-40 h-40">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
                    <circle
                      cx="50" cy="50" r="42" fill="none"
                      stroke={analytics.win_rate > 50 ? '#10b981' : '#ef4444'}
                      strokeWidth="10"
                      strokeDasharray={`${(analytics.win_rate / 100) * 264} 264`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-3xl font-black ${analytics.win_rate > 50 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {analytics.win_rate}%
                    </span>
                    <span className="text-[9px] text-zinc-600 font-bold uppercase">Win Rate</span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {activeTab === 'entries' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-panel overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      {['Date', 'Symbol', 'Type', 'Qty', 'Price', 'Amount', 'Product'].map(h => (
                        <th key={h} className="px-5 py-3.5 text-left text-[10px] font-black text-zinc-600 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.journal_entries?.map((entry, i) => (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-5 py-3 text-xs text-zinc-500 font-mono">{entry.date?.slice(0, 16) || '—'}</td>
                        <td className="px-5 py-3 text-xs font-bold text-white">{entry.symbol}</td>
                        <td className="px-5 py-3">
                          <span className={`text-[10px] px-2 py-1 rounded-full font-black ${
                            entry.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                          }`}>{entry.type}</span>
                        </td>
                        <td className="px-5 py-3 text-xs text-zinc-400 font-mono">{entry.quantity}</td>
                        <td className="px-5 py-3 text-xs text-zinc-300 font-mono">₹{entry.price?.toFixed(2)}</td>
                        <td className="px-5 py-3 text-xs text-white font-mono font-bold">₹{entry.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="px-5 py-3 text-[10px] text-zinc-600 font-bold">{entry.product_type}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data.journal_entries?.length === 0 && (
                <div className="py-16 text-center text-zinc-600 text-sm">No trade entries found</div>
              )}
            </motion.div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Lightbulb size={16} className="text-amber-400" />
                  AI-Generated Trading Lessons
                </h3>
                <div className="space-y-3">
                  {data.ai_lessons?.map((lesson, i) => {
                    const iconMap = {
                      SUCCESS: { icon: <Trophy size={16} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                      WARNING: { icon: <AlertTriangle size={16} />, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
                      INFO: { icon: <BarChart3 size={16} />, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
                      TIP: { icon: <Lightbulb size={16} />, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
                      INSIGHT: { icon: <Zap size={16} />, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
                    };
                    const style = iconMap[lesson.type] || iconMap.INFO;

                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`${style.bg} border ${style.border} rounded-xl p-5 flex items-start gap-4`}
                      >
                        <div className={`w-9 h-9 rounded-lg ${style.bg} flex items-center justify-center shrink-0 ${style.color}`}>
                          {style.icon}
                        </div>
                        <div>
                          <p className={`text-[10px] font-black uppercase tracking-wider mb-1 ${style.color}`}>{lesson.type}</p>
                          <p className="text-sm text-zinc-300 leading-relaxed">{lesson.text}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              <div className="glass-panel p-5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Lightbulb size={14} className="text-primary" />
                </div>
                <p className="text-xs text-zinc-500">
                  <strong className="text-zinc-400">Pro Tip:</strong> Trade Journal insights improve as you build more trading history. 
                  The AI learns from your patterns to provide increasingly personalized recommendations.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
