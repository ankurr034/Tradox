import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, TrendingUp, Star, Shield, Zap, Target, Award, ChevronRight, BarChart2, Clock, Trophy, CheckCircle, AlertTriangle, Loader2, Copy, UserPlus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { useToast } from '../components/Toast';
import { API_BASE_URL } from '../config';

const STYLE_COLORS = {
  Momentum: '#f59e0b', Value: '#8b5cf6', 'Day Trading': '#ef4444', Dividend: '#10b981',
  Algorithmic: '#0ea5e9', 'Swing Trading': '#ec4899', Growth: '#6366f1', Options: '#f97316',
};

const RISK_CONFIG = {
  LOW: { color: '#10b981', bg: 'bg-emerald-500/10', label: 'Low Risk' },
  MEDIUM: { color: '#f59e0b', bg: 'bg-amber-500/10', label: 'Medium Risk' },
  HIGH: { color: '#ef4444', bg: 'bg-rose-500/10', label: 'High Risk' },
};

export default function CopyTrading() {
  const { user } = useUser();
  const toast = useToast();
  const [traders, setTraders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrader, setSelectedTrader] = useState(null);
  const [followModal, setFollowModal] = useState(null);
  const [allocation, setAllocation] = useState(10);
  const [following, setFollowing] = useState(false);
  const [sortBy, setSortBy] = useState('return');

  useEffect(() => { fetchTraders(); }, []);

  const fetchTraders = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/copytrading/traders`);
      setTraders(res.data.traders);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleFollow = async (traderId) => {
    setFollowing(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/copytrading/follow`, {
        trader_id: traderId, allocation_pct: allocation,
      }, { params: { user_id: user?.id || 1 } });
      toast.success(res.data.message);
      setFollowModal(null);
    } catch { toast.error('Failed to follow trader'); }
    finally { setFollowing(false); }
  };

  const sortedTraders = [...traders].sort((a, b) => {
    if (sortBy === 'return') return b.total_return_ytd - a.total_return_ytd;
    if (sortBy === 'winrate') return b.win_rate - a.win_rate;
    if (sortBy === 'followers') return b.followers - a.followers;
    if (sortBy === 'consistency') return b.consistency_score - a.consistency_score;
    return 0;
  });

  if (loading) return <div className="py-20 text-center"><Loader2 className="w-8 h-8 text-primary mx-auto animate-spin" /></div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center">
            <Users className="w-6 h-6 text-cyan-400" />
          </div>
          Copy Trading
        </h1>
        <p className="text-zinc-500 mt-2 text-sm">Follow top traders & mirror their strategies • eToro-level feature — First in India 🇮🇳</p>
      </div>

      {/* Hero Banner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 border border-cyan-500/10 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[100px]" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">EXCLUSIVE — NOT ON GROWW OR ZERODHA</span>
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Mirror the Best Traders Automatically</h2>
          <p className="text-sm text-zinc-500 max-w-xl mb-4">Browse verified top performers, analyze their track records, and automatically copy their trades with customizable allocation. No manual work needed.</p>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <CheckCircle size={14} className="text-cyan-400" /> 8 Verified Traders
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Shield size={14} className="text-emerald-400" /> Risk Controls
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Zap size={14} className="text-amber-400" /> Real-Time Copying
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sort Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
          <Trophy size={14} className="text-amber-400" /> Top Traders
        </h2>
        <div className="flex gap-2">
          {[
            { id: 'return', label: 'Returns' },
            { id: 'winrate', label: 'Win Rate' },
            { id: 'followers', label: 'Followers' },
            { id: 'consistency', label: 'Consistency' },
          ].map(s => (
            <button key={s.id} onClick={() => setSortBy(s.id)}
              className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                sortBy === s.id ? 'bg-white/[0.08] text-white' : 'text-zinc-600 hover:text-zinc-300'
              }`}>{s.label}</button>
          ))}
        </div>
      </div>

      {/* Traders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedTraders.map((trader, i) => {
          const riskConfig = RISK_CONFIG[trader.risk_level] || RISK_CONFIG.MEDIUM;
          const styleColor = STYLE_COLORS[trader.style] || '#0ea5e9';
          const isSelected = selectedTrader === trader.id;
          
          return (
            <motion.div key={trader.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`glass-panel overflow-hidden transition-all ${isSelected ? 'border-cyan-500/20' : ''}`}>
              
              {/* Main Card */}
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shrink-0"
                    style={{ background: `${styleColor}20`, color: styleColor }}>
                    {trader.avatar_initial}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-base font-black text-white truncate">{trader.name}</h3>
                      {trader.verified && <CheckCircle size={14} className="text-cyan-400 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-zinc-600 font-bold">{trader.handle}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-lg" style={{ background: `${styleColor}15`, color: styleColor }}>
                        {trader.style}
                      </span>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg ${riskConfig.bg}`} style={{ color: riskConfig.color }}>
                        {riskConfig.label}
                      </span>
                    </div>
                  </div>
                  
                  {/* YTD Return */}
                  <div className="text-right shrink-0">
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-0.5">YTD Return</p>
                    <p className={`text-2xl font-black font-mono-data ${trader.total_return_ytd >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {trader.total_return_ytd >= 0 ? '+' : ''}{trader.total_return_ytd}%
                    </p>
                  </div>
                </div>
                
                <p className="text-xs text-zinc-500 mb-4 line-clamp-1">{trader.bio}</p>
                
                {/* Stats Row */}
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {[
                    { label: 'Win Rate', value: `${trader.win_rate}%`, color: trader.win_rate > 65 ? 'text-emerald-400' : 'text-white' },
                    { label: 'Trades', value: trader.total_trades, color: 'text-white' },
                    { label: 'Followers', value: trader.followers > 1000 ? `${(trader.followers/1000).toFixed(1)}K` : trader.followers, color: 'text-cyan-400' },
                    { label: 'Max DD', value: `${trader.max_drawdown}%`, color: trader.max_drawdown > 15 ? 'text-rose-400' : 'text-emerald-400' },
                    { label: 'Sharpe', value: trader.sharpe_ratio, color: trader.sharpe_ratio > 2 ? 'text-emerald-400' : 'text-white' },
                  ].map((stat, si) => (
                    <div key={si} className="text-center">
                      <p className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest mb-0.5">{stat.label}</p>
                      <p className={`text-xs font-black font-mono-data ${stat.color}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Monthly Returns Mini Chart */}
                <div className="h-12 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={(trader.monthly_returns || []).map((r, mi) => ({ month: mi, return: r }))}>
                      <Bar dataKey="return" radius={[2, 2, 0, 0]}>
                        {(trader.monthly_returns || []).map((r, mi) => (
                          <Cell key={mi} fill={r >= 0 ? '#10b98140' : '#ef444440'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Top Stocks & Recent Trades */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1">
                    {(trader.top_stocks || []).map((s, si) => (
                      <span key={si} className="text-[9px] font-bold px-2 py-0.5 rounded bg-white/[0.04] text-zinc-500">{s}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-zinc-600">
                    <Clock size={10} /> Avg hold: {trader.avg_holding_days}d
                  </div>
                </div>

                {/* Recent Trades */}
                <div className="space-y-1 mb-4">
                  {(trader.recent_trades || []).map((trade, ti) => (
                    <div key={ti} className="flex items-center gap-3 text-xs py-1.5 px-2 rounded-lg bg-white/[0.01]">
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                        trade.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>{trade.type}</span>
                      <span className="font-bold text-white">{trade.symbol}</span>
                      <span className="text-zinc-600 flex-1">{trade.date}</span>
                      <span className={`font-black font-mono-data ${trade.return_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {trade.return_pct >= 0 ? '+' : ''}{trade.return_pct}%
                      </span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button onClick={() => setFollowModal(trader)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:opacity-90 transition-all shadow-[0_10px_30px_rgba(6,182,212,0.15)]">
                    <UserPlus size={14} /> Follow & Copy
                  </button>
                  <button onClick={() => setSelectedTrader(isSelected ? null : trader.id)}
                    className="px-4 py-3 bg-white/[0.04] border border-white/[0.08] text-zinc-400 text-xs font-bold rounded-xl hover:text-white hover:bg-white/[0.06] transition-all">
                    Details
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                    className="overflow-hidden border-t border-white/[0.04]">
                    <div className="p-6 bg-white/[0.01]">
                      <h4 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-3">12-Month Performance</h4>
                      <ResponsiveContainer width="100%" height={150}>
                        <AreaChart data={(trader.monthly_returns || []).map((r, mi) => ({
                          month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][mi],
                          return: r,
                          cumulative: (trader.monthly_returns || []).slice(0, mi + 1).reduce((a, b) => a + b, 0),
                        }))}>
                          <defs>
                            <linearGradient id={`copyGrad${trader.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.2} />
                              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                          <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#52525b' }} />
                          <YAxis tick={{ fontSize: 9, fill: '#52525b' }} tickFormatter={v => `${v}%`} />
                          <Tooltip contentStyle={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 11 }} />
                          <Area type="monotone" dataKey="cumulative" stroke="#06b6d4" fill={`url(#copyGrad${trader.id})`} strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                      
                      <div className="mt-4 p-3 bg-cyan-500/[0.03] rounded-xl border border-cyan-500/10 flex items-start gap-3">
                        <AlertTriangle size={14} className="text-amber-400 mt-0.5 shrink-0" />
                        <p className="text-[11px] text-zinc-500 leading-relaxed">
                          <span className="text-amber-400 font-bold">Risk Disclaimer:</span> Past performance does not guarantee future results. 
                          Copy trading involves risk. Consistency score: <span className="text-white font-bold">{trader.consistency_score}/100</span>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Follow Modal */}
      <AnimatePresence>
        {followModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setFollowModal(null)} />
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="relative bg-[#0a0a0f] border border-cyan-500/20 rounded-3xl p-8 max-w-md w-full shadow-[0_0_60px_rgba(6,182,212,0.1)]">
              
              <h2 className="text-xl font-black text-white mb-2 flex items-center gap-3">
                <UserPlus size={20} className="text-cyan-400" />
                Follow {followModal.name}
              </h2>
              <p className="text-xs text-zinc-500 mb-6">Configure your copy trading settings</p>
              
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 block">
                    Portfolio Allocation: {allocation}%
                  </label>
                  <input type="range" min="5" max="50" value={allocation} onChange={e => setAllocation(Number(e.target.value))}
                    className="w-full h-2 bg-white/[0.06] rounded-full appearance-none cursor-pointer accent-cyan-500" />
                  <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
                    <span>5% (Conservative)</span>
                    <span>50% (Aggressive)</span>
                  </div>
                </div>
                
                <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-zinc-500">Trader Style</span>
                    <span className="font-bold text-white">{followModal.style}</span>
                  </div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-zinc-500">YTD Return</span>
                    <span className={`font-bold ${followModal.total_return_ytd >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {followModal.total_return_ytd >= 0 ? '+' : ''}{followModal.total_return_ytd}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Risk Level</span>
                    <span className="font-bold" style={{ color: RISK_CONFIG[followModal.risk_level]?.color }}>
                      {followModal.risk_level}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button onClick={() => handleFollow(followModal.id)} disabled={following}
                    className="flex-1 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:opacity-90 transition-all disabled:opacity-50">
                    {following ? 'Following...' : 'Start Copy Trading'}
                  </button>
                  <button onClick={() => setFollowModal(null)}
                    className="px-4 py-3.5 bg-white/[0.04] text-zinc-500 text-xs font-bold rounded-xl hover:text-white transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
