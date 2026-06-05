import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, Target, TrendingUp, Clock, BarChart2, Star, Shield, Award, RefreshCw, Flame, Brain } from 'lucide-react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { API_BASE_URL } from '../config';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };

export default function TradingDNA() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    const uid = user?.id || 1;
    axios.get(`${API_BASE_URL}/api/trading-dna?user_id=${uid}`)
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center flex-col gap-4">
        <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
        <p className="text-zinc-400 font-bold animate-pulse text-sm">Analyzing your trading DNA...</p>
      </div>
    );
  }

  if (!data) return null;

  const radarData = Object.entries(data.skills || {}).map(([key, value]) => ({
    skill: key, value, fullMark: 100,
  }));

  const scoreColor = data.overall_score > 75 ? 'emerald' : data.overall_score > 55 ? 'amber' : 'red';

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      {/* Hero Header */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-[28px] border border-white/[0.06] bg-gradient-to-br from-[#0d0806] via-surface to-surface p-8 md:p-12">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[180px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 flex items-center justify-center text-4xl shadow-2xl shadow-amber-500/10">
              {data.personality?.emoji || '🧬'}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl md:text-4xl font-black text-white">Trading DNA</h1>
                <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest bg-${scoreColor}-500/10 text-${scoreColor}-400 border border-${scoreColor}-500/20`}>
                  {data.skill_score_label}
                </span>
              </div>
              <p className="text-zinc-500 text-sm">Your personalized trading identity, skills & analytics</p>
            </div>
          </div>
          
          {/* Level Badge */}
          <div className="ml-auto flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="text-3xl">{data.level?.current?.icon}</div>
            <div>
              <p className="text-sm font-black text-white">{data.level?.current?.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-24 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${data.level?.progress_pct}%` }}
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
                </div>
                <span className="text-[9px] font-black text-zinc-500">{data.level?.xp} XP</span>
              </div>
              <p className="text-[9px] text-zinc-600 font-bold mt-0.5">Next: {data.level?.next?.icon} {data.level?.next?.name}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Personality Card + Overall Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Personality */}
        <motion.div variants={fadeUp} className="glass-panel p-8 border border-white/[0.04] flex flex-col items-center text-center">
          <div className="text-6xl mb-4">{data.personality?.emoji}</div>
          <h3 className="text-xl font-black text-white mb-2">{data.personality?.type}</h3>
          <p className="text-sm text-zinc-400 mb-5 leading-relaxed">{data.personality?.desc}</p>
          <div className="flex gap-2 flex-wrap justify-center">
            {data.personality?.traits?.map((t, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest">
                {t}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Skill Radar */}
        <motion.div variants={fadeUp} className="glass-panel p-6 border border-white/[0.04]">
          <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 text-center flex items-center justify-center gap-2">
            <Brain className="w-4 h-4 text-violet-400" /> Skill Radar
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="70%">
                <PolarGrid stroke="#ffffff08" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: '#a1a1aa', fontSize: 9, fontWeight: 700 }} />
                <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                <Radar name="Skills" dataKey="value" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Overall Score */}
        <motion.div variants={fadeUp} className="glass-panel p-8 border border-white/[0.04] flex flex-col items-center justify-center">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6">Overall Score</p>
          <div className="relative w-44 h-44">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#ffffff06" strokeWidth="6" />
              <circle cx="50" cy="50" r="42" fill="none"
                stroke={data.overall_score > 75 ? '#10b981' : data.overall_score > 55 ? '#f59e0b' : '#ef4444'}
                strokeWidth="6" strokeLinecap="round"
                strokeDasharray={`${data.overall_score * 2.64} 264`}
                className="transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-5xl font-black text-${scoreColor}-400`}>{Math.round(data.overall_score)}</span>
              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mt-1">/100</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Core Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: 'Total Trades', value: data.stats?.total_trades, icon: <BarChart2 className="w-4 h-4" />, color: 'sky' },
          { label: 'Win Rate', value: `${data.stats?.win_rate}%`, icon: <Target className="w-4 h-4" />, color: 'emerald' },
          { label: 'Profit Factor', value: data.stats?.profit_factor, icon: <TrendingUp className="w-4 h-4" />, color: 'violet' },
          { label: 'Risk:Reward', value: `1:${data.stats?.risk_reward_ratio}`, icon: <Shield className="w-4 h-4" />, color: 'cyan' },
          { label: 'Avg Win', value: `+${data.stats?.avg_win_pct}%`, icon: <Zap className="w-4 h-4" />, color: 'amber' },
          { label: 'Expectancy', value: `${data.stats?.expectancy > 0 ? '+' : ''}${data.stats?.expectancy}%`, icon: <Star className="w-4 h-4" />, color: data.stats?.expectancy > 0 ? 'emerald' : 'red' },
        ].map((s, i) => (
          <div key={i} className="glass-panel p-4 border border-white/[0.04] group hover:border-white/[0.1] transition-all">
            <div className={`text-${s.color}-400 mb-2 group-hover:scale-110 transition-transform`}>{s.icon}</div>
            <p className="text-lg font-black text-white font-mono-data">{s.value}</p>
            <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mt-0.5">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Streaks + Time Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Streaks */}
        <motion.div variants={fadeUp} className="glass-panel p-6 border border-white/[0.04]">
          <h3 className="text-xs font-black text-white uppercase tracking-widest mb-5 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" /> Trading Streaks
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
              <div className="flex items-center justify-center gap-1 mb-2">
                {data.streaks?.current_type === 'WIN' ? 
                  <Flame className="w-5 h-5 text-emerald-400" /> : 
                  <TrendingUp className="w-5 h-5 text-red-400" />}
              </div>
              <p className="text-2xl font-black text-white">{data.streaks?.current}</p>
              <p className={`text-[9px] font-black uppercase tracking-widest ${data.streaks?.current_type === 'WIN' ? 'text-emerald-400' : 'text-red-400'}`}>
                Current {data.streaks?.current_type}
              </p>
            </div>
            <div className="text-center p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
              <p className="text-3xl mb-1">🔥</p>
              <p className="text-2xl font-black text-emerald-400">{data.streaks?.best}</p>
              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Best Streak</p>
            </div>
            <div className="text-center p-4 rounded-2xl bg-red-500/5 border border-red-500/10">
              <p className="text-3xl mb-1">❄️</p>
              <p className="text-2xl font-black text-red-400">{data.streaks?.worst}</p>
              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Worst Streak</p>
            </div>
          </div>
        </motion.div>

        {/* Time Analysis */}
        <motion.div variants={fadeUp} className="glass-panel p-6 border border-white/[0.04]">
          <h3 className="text-xs font-black text-white uppercase tracking-widest mb-5 flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" /> Time Analysis
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Best Trading Day', value: data.time_analysis?.best_day, emoji: '📅' },
              { label: 'Peak Performance Hour', value: data.time_analysis?.best_hour, emoji: '⏰' },
              { label: 'Avg Holding Period', value: data.time_analysis?.avg_holding_period, emoji: '📊' },
            ].map((t, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="text-2xl">{t.emoji}</span>
                <div className="flex-1">
                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{t.label}</p>
                  <p className="text-sm font-black text-white">{t.value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Monthly Performance */}
      <motion.div variants={fadeUp} className="glass-panel p-6 border border-white/[0.04]">
        <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-emerald-400" /> Monthly Returns
        </h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.monthly_returns} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
              <XAxis dataKey="month" stroke="#52525b" tick={{ fill: '#71717a', fontSize: 11, fontWeight: 700 }} />
              <YAxis stroke="#52525b" tick={{ fill: '#71717a', fontSize: 10 }} tickFormatter={v => `${v}%`} />
              <Tooltip content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-[#0a0a12]/95 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl">
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{d.month}</p>
                      <p className={`text-sm font-black ${d.return_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{d.return_pct > 0 ? '+' : ''}{d.return_pct}%</p>
                      <p className="text-[10px] text-zinc-500">{d.trades} trades</p>
                    </div>
                  );
                }
                return null;
              }} />
              <Bar dataKey="return_pct" radius={[4, 4, 0, 0]}>
                {data.monthly_returns?.map((entry, index) => (
                  <Cell key={index} fill={entry.return_pct >= 0 ? '#10b981' : '#ef4444'} fillOpacity={0.6} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Sector Performance */}
      <motion.div variants={fadeUp} className="glass-panel p-6 border border-white/[0.04]">
        <h3 className="text-xs font-black text-white uppercase tracking-widest mb-5 flex items-center gap-2">
          <Target className="w-4 h-4 text-amber-400" /> Sector Performance
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(data.sector_performance || {}).map(([sector, perf], i) => (
            <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-white">{sector}</span>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${perf.win_rate > 60 ? 'bg-emerald-500/10 text-emerald-400' : perf.win_rate > 40 ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                  {perf.win_rate}% WR
                </span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className={`text-lg font-black font-mono-data ${perf.avg_return >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {perf.avg_return > 0 ? '+' : ''}{perf.avg_return}%
                  </p>
                  <p className="text-[9px] text-zinc-600 font-bold">Avg Return</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-zinc-400">{perf.trades} trades</p>
                  <p className={`text-[10px] font-black ${perf.total_pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    ₹{perf.total_pnl?.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div variants={fadeUp} className="glass-panel p-6 border border-white/[0.04]">
        <h3 className="text-xs font-black text-white uppercase tracking-widest mb-5 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" /> Achievements Unlocked
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {data.achievements?.map((a, i) => (
            <motion.div key={i} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/10 flex items-center gap-4 hover:border-amber-500/20 transition-all group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{a.icon}</span>
              <div>
                <p className="text-sm font-black text-white">{a.name}</p>
                <p className="text-[10px] text-zinc-500 font-bold">{a.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
