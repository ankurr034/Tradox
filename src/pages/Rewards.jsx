import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Flame, Zap, Target, Lock, Award, ChevronUp, Sparkles, TrendingUp, BarChart2, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { API_BASE_URL } from '../config';

const LEVEL_COLORS = {
  'Rookie': '#71717a', 'Beginner': '#0ea5e9', 'Intermediate': '#8b5cf6',
  'Advanced': '#f59e0b', 'Expert': '#ef4444', 'Master': '#ec4899',
  'Legend': '#10b981', 'Grandmaster': '#facc15',
};

export default function Rewards() {
  const { user } = useUser();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUnlocked, setShowUnlocked] = useState(null);

  useEffect(() => { fetchRewards(); }, []);

  const fetchRewards = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/rewards/profile?user_id=${user?.id || 1}`);
      setData(res.data);
      if (res.data.newly_unlocked?.length > 0) {
        setShowUnlocked(res.data.newly_unlocked[0]);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="py-20 text-center"><Loader2 className="w-8 h-8 text-primary mx-auto animate-spin" /></div>;
  if (!data) return null;

  const rankColor = LEVEL_COLORS[data.rank_title] || '#71717a';

  return (
    <div className="space-y-8">
      {/* Unlock Animation */}
      <AnimatePresence>
        {showUnlocked && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowUnlocked(null)} />
            <motion.div initial={{ scale: 0.5, rotateY: 180 }} animate={{ scale: 1, rotateY: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="relative bg-[#0a0a0f] border border-amber-500/20 rounded-3xl p-10 text-center max-w-sm shadow-[0_0_100px_rgba(245,158,11,0.1)]">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-amber-500/5 to-transparent" />
              <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }}
                className="text-6xl mb-4 relative z-10">🏆</motion.div>
              <h2 className="text-2xl font-black text-amber-400 mb-2 relative z-10">Achievement Unlocked!</h2>
              <p className="text-white font-bold text-lg mb-1 relative z-10">
                {data.achievements?.find(a => a.id === showUnlocked)?.name}
              </p>
              <p className="text-zinc-500 text-sm mb-4 relative z-10">
                {data.achievements?.find(a => a.id === showUnlocked)?.description}
              </p>
              <p className="text-amber-400 font-black text-sm relative z-10">
                +{data.achievements?.find(a => a.id === showUnlocked)?.xp} XP
              </p>
              <button onClick={() => setShowUnlocked(null)}
                className="mt-6 px-8 py-3 bg-amber-500 text-black font-black rounded-2xl hover:bg-amber-400 transition-all relative z-10 uppercase tracking-widest text-xs">
                Awesome!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-purple-500/20 border border-amber-500/20 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-amber-400" />
          </div>
          Rewards & Achievements
        </h1>
        <p className="text-zinc-500 mt-2 text-sm">Earn XP, unlock achievements, maintain your streak</p>
      </div>

      {/* Profile Card */}
      <div className="glass-panel p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px]" style={{ background: `${rankColor}10` }} />
        
        <div className="relative z-10 flex items-center gap-8">
          {/* Level Circle */}
          <div className="relative">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
              <circle cx="60" cy="60" r="54" fill="none" stroke={rankColor} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${data.xp_progress_pct * 3.39} 339`} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white">{data.level}</span>
              <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: rankColor }}>{data.rank_title}</span>
            </div>
          </div>

          <div className="flex-1">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Total XP</p>
                <p className="text-2xl font-black text-amber-400 font-mono-data">{data.total_xp.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Next Level</p>
                <p className="text-2xl font-black text-white font-mono-data">{data.xp_for_next_level - (data.total_xp % 500)}<span className="text-sm text-zinc-600"> XP</span></p>
              </div>
              <div>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">🔥 Streak</p>
                <p className="text-2xl font-black text-orange-400 font-mono-data">{data.current_streak}<span className="text-sm text-zinc-600"> days</span></p>
              </div>
              <div>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Best Streak</p>
                <p className="text-2xl font-black text-white font-mono-data">{data.best_streak}<span className="text-sm text-zinc-600"> days</span></p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-zinc-600 mb-1">
                <span>Level {data.level}</span>
                <span>Level {data.level + 1}</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${data.xp_progress_pct}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${rankColor}, ${rankColor}80)` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-panel p-5 text-center">
          <Award className="w-6 h-6 text-amber-400 mx-auto mb-2" />
          <p className="text-2xl font-black text-white">{data.unlocked_count}<span className="text-zinc-600">/{data.total_achievements}</span></p>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-1">Achievements</p>
        </div>
        <div className="glass-panel p-5 text-center">
          <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
          <p className="text-2xl font-black text-orange-400">{data.current_streak} 🔥</p>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-1">Day Streak</p>
        </div>
        <div className="glass-panel p-5 text-center">
          <Sparkles className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <p className="text-2xl font-black text-purple-400" style={{ color: rankColor }}>{data.rank_title}</p>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-1">Current Rank</p>
        </div>
      </div>

      {/* Achievements Grid */}
      <div>
        <h2 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">All Achievements</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {data.achievements?.map((ach, i) => (
            <motion.div key={ach.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
              className={`glass-panel p-5 text-center transition-all relative overflow-hidden ${
                ach.unlocked ? 'border-amber-500/20 hover:border-amber-500/40' : 'opacity-50 grayscale'
              }`}>
              {ach.unlocked && <div className="absolute top-2 right-2"><Star size={12} className="text-amber-400 fill-amber-400" /></div>}
              <div className="text-3xl mb-3">{ach.icon}</div>
              <p className="text-sm font-black text-white mb-1">{ach.name}</p>
              <p className="text-[10px] text-zinc-600 mb-2 line-clamp-2">{ach.description}</p>
              <div className="flex items-center justify-center gap-1">
                <Zap size={10} className="text-amber-400" />
                <span className="text-[10px] font-black text-amber-400">+{ach.xp} XP</span>
              </div>
              {!ach.unlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                  <Lock size={20} className="text-zinc-600" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
