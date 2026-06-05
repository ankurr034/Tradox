import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Crown, Flame, Target, Users, Clock, TrendingUp, ArrowUp, ArrowDown, Zap, Award, Star, ChevronRight, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { useToast } from '../components/Toast';
import { API_BASE_URL } from '../config';

export default function Tournament() {
  const { user } = useUser();
  const toast = useToast();
  const [tournament, setTournament] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [tRes, lRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/tournament/active`),
        axios.get(`${API_BASE_URL}/api/tournament/leaderboard`),
      ]);
      setTournament(tRes.data.tournament);
      setLeaderboard(lRes.data.leaderboard);
      setTotalParticipants(lRes.data.total_participants);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleJoin = async () => {
    setJoining(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/tournament/join?user_id=${user?.id || 1}`);
      toast.success(res.data.message);
    } catch (e) { toast.error('Failed to join'); }
    finally { setJoining(false); }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-amber-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-zinc-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-xs font-black text-zinc-600 w-5 text-center">{rank}</span>;
  };

  const getRankBg = (rank) => {
    if (rank === 1) return 'bg-amber-500/5 border-amber-500/20';
    if (rank === 2) return 'bg-zinc-400/5 border-zinc-400/10';
    if (rank === 3) return 'bg-amber-700/5 border-amber-700/10';
    return '';
  };

  if (loading) return <div className="py-20 text-center"><Loader2 className="w-8 h-8 text-primary mx-auto animate-spin" /></div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/20 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-amber-400" />
          </div>
          Trading Tournament
        </h1>
        <p className="text-zinc-500 mt-2 text-sm">Compete against thousands. Prove your trading skills.</p>
      </div>

      {/* Tournament Banner */}
      {tournament && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-transparent to-purple-500/10 border border-amber-500/20 p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px]" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em]">LIVE TOURNAMENT</span>
            </div>
            <h2 className="text-2xl font-black text-white mb-2">{tournament.name}</h2>
            <p className="text-sm text-zinc-400 mb-6 max-w-lg">{tournament.description}</p>

            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { icon: <Target size={16} />, label: 'Prize Pool', value: tournament.prize_pool, color: 'text-amber-400' },
                { icon: <Users size={16} />, label: 'Participants', value: totalParticipants.toLocaleString(), color: 'text-blue-400' },
                { icon: <Clock size={16} />, label: 'Days Left', value: tournament.days_remaining, color: 'text-emerald-400' },
                { icon: <Zap size={16} />, label: 'Starting Capital', value: '₹10L', color: 'text-purple-400' },
              ].map((s, i) => (
                <div key={i} className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.04]">
                  <div className={`flex items-center gap-2 ${s.color} mb-2`}>{s.icon}<span className="text-[9px] font-black uppercase tracking-widest">{s.label}</span></div>
                  <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button onClick={handleJoin} disabled={joining}
                className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black uppercase tracking-widest rounded-2xl hover:from-amber-400 hover:to-amber-500 transition-all shadow-[0_20px_40px_rgba(245,158,11,0.2)] text-sm disabled:opacity-50">
                {joining ? 'Joining...' : <>Join Now <ChevronRight size={16} /></>}
              </button>
              <div className="text-xs text-zinc-600 max-w-xs">
                <p className="font-bold text-zinc-400 mb-1">Rules:</p>
                <ul className="space-y-0.5">
                  {tournament.rules?.slice(0, 3).map((r, i) => <li key={i}>• {r}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Leaderboard */}
      <div className="glass-panel overflow-hidden">
        <div className="p-5 border-b border-white/[0.04] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">Live Leaderboard</h3>
          </div>
          <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{totalParticipants.toLocaleString()} traders</span>
        </div>

        <div className="divide-y divide-white/[0.02]">
          {leaderboard.map((entry, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              className={`flex items-center gap-4 px-6 py-4 hover:bg-white/[0.01] transition-all ${entry.is_you ? 'bg-primary/[0.03] border-l-2 border-l-primary' : ''} ${getRankBg(entry.rank)}`}>
              
              <div className="w-8 flex items-center justify-center shrink-0">
                {getRankIcon(entry.rank)}
              </div>

              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm"
                style={{ background: `hsl(${(i * 47) % 360}, 60%, 20%)`, color: `hsl(${(i * 47) % 360}, 80%, 65%)` }}>
                {entry.avatar_initial}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-white">{entry.username}</p>
                  {entry.is_you && <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase">YOU</span>}
                  {entry.rank <= 3 && <Star size={12} className="text-amber-400 fill-amber-400" />}
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-600 mt-0.5">
                  <span>{entry.total_trades} trades</span>
                  <span>Win: {entry.win_rate}%</span>
                  <span>Best: {entry.best_trade}</span>
                </div>
              </div>

              <div className="text-right">
                <p className={`text-lg font-black font-mono-data ${entry.pnl_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {entry.pnl_pct >= 0 ? '+' : ''}{entry.pnl_pct}%
                </p>
                <p className={`text-xs ${entry.pnl_amount >= 0 ? 'text-emerald-400/60' : 'text-rose-400/60'} font-mono-data`}>
                  {entry.pnl_amount >= 0 ? '+' : ''}₹{Math.abs(entry.pnl_amount).toLocaleString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
