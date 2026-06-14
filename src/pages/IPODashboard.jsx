import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, ArrowUp, ArrowDown, TrendingUp, TrendingDown, Star, Clock, Rocket, FileText, Users, DollarSign, ChevronRight, ExternalLink, Bell, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { useToast } from '../components/Toast';
import { API_BASE_URL } from '../config';

const STATUS_COLORS = {
  OPEN: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  UPCOMING: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  LISTED: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
};

export default function IPODashboard() {
  const { user } = useUser();
  const toast = useToast();
  const [ipos, setIpos] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedIPO, setSelectedIPO] = useState(null);
  const [applyModal, setApplyModal] = useState(null);
  const [lots, setLots] = useState(1);
  const [upiId, setUpiId] = useState('');
  const [applying, setApplying] = useState(false);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => { fetchIPOs(); }, []);

  const fetchIPOs = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/ipo/upcoming`);
      setIpos(res.data.ipos);
      setStats(res.data.stats);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleApply = async (ipo) => {
    setApplying(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/ipo/apply?user_id=${user?.id || 1}`, {
        ipo_id: ipo.id, lots, upi_id: upiId, category: 'RETAIL'
      });
      toast.success(res.data.message);
      setApplyModal(null);
    } catch { toast.error('Application failed'); }
    finally { setApplying(false); }
  };

  const filtered = filter === 'ALL' ? ipos : ipos.filter(i => i.status === filter);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-rose-500/20 flex items-center justify-center">
            <Rocket className="w-6 h-6 text-rose-400" />
          </div>
          IPO Dashboard
        </h1>
        <p className="text-zinc-500 mt-2 text-sm">Track upcoming IPOs with GMP, subscription status & one-click apply</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Open Now', value: stats.total_open, color: 'text-emerald-400', icon: <CheckCircle2 size={16} /> },
            { label: 'Upcoming', value: stats.total_upcoming, color: 'text-blue-400', icon: <Clock size={16} /> },
            { label: 'Recently Listed', value: stats.total_listed, color: 'text-purple-400', icon: <TrendingUp size={16} /> },
            { label: 'Avg GMP', value: `${stats.avg_gmp}%`, color: 'text-amber-400', icon: <ArrowUp size={16} /> },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="glass-panel p-5 text-center">
              <div className={`flex items-center justify-center gap-2 mb-2 ${s.color}`}>{s.icon}</div>
              <p className={`text-2xl font-black ${s.color} font-mono-data`}>{s.value}</p>
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {['ALL', 'OPEN', 'UPCOMING', 'LISTED'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              filter === f ? 'bg-primary text-black' : 'bg-white/[0.03] text-zinc-500 hover:text-white border border-white/[0.06]'
            }`}>{f}</button>
        ))}
      </div>

      {/* IPO Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center"><Loader2 className="w-8 h-8 text-primary mx-auto animate-spin" /></div>
        ) : filtered.map((ipo, i) => {
          const sc = STATUS_COLORS[ipo.status] || STATUS_COLORS.UPCOMING;
          return (
            <motion.div key={ipo.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className={`glass-panel p-6 hover:border-white/10 transition-all cursor-pointer ${selectedIPO === ipo.id ? 'border-primary/30' : ''}`}
              onClick={() => setSelectedIPO(selectedIPO === ipo.id ? null : ipo.id)}>
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl ${sc.bg} flex items-center justify-center shrink-0`}>
                    <span className="text-2xl">{ipo.sector === 'Technology' ? '💻' : ipo.sector === 'Renewable Energy' ? '☀️' : ipo.sector === 'Fintech' ? '💳' : ipo.sector === 'Agriculture' ? '🌾' : '🏥'}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white mb-1">{ipo.name}</h3>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`text-[9px] font-black px-2.5 py-1 rounded-full ${sc.bg} ${sc.text} ${sc.border} border uppercase tracking-widest`}>{ipo.status}</span>
                      <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-white/5 text-zinc-500 uppercase tracking-widest">{ipo.category}</span>
                      <span className="text-xs text-zinc-500">{ipo.sector}</span>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, si) => (
                          <Star key={si} size={12} className={si < ipo.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-800'} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-white">{ipo.price_band}</p>
                  <p className={`text-sm font-bold ${ipo.gmp_value > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{ipo.gmp}</p>
                </div>
              </div>

              {/* Key Info Row */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { l: 'Issue Size', v: ipo.issue_size },
                  { l: 'Lot Size', v: `${ipo.lot_size} shares` },
                  { l: 'Min Investment', v: `₹${ipo.min_investment.toLocaleString()}` },
                  { l: 'Listing Date', v: ipo.listing_date },
                ].map((info, ki) => (
                  <div key={ki} className="bg-white/[0.02] rounded-xl p-3 text-center">
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">{info.l}</p>
                    <p className="text-xs font-bold text-white">{info.v}</p>
                  </div>
                ))}
              </div>

              {/* Subscription Status */}
              <div className="flex items-center gap-3 mb-4">
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest shrink-0">Subscription:</p>
                {Object.entries(ipo.subscription).map(([cat, val]) => (
                  <span key={cat} className={`text-xs font-bold px-3 py-1 rounded-lg ${val !== '—' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/[0.03] text-zinc-600'}`}>
                    {cat.toUpperCase()}: {val}
                  </span>
                ))}
              </div>

              {/* Recommendation + Apply */}
              <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
                <div className="flex items-center gap-3">
                  {ipo.recommendation === 'SUBSCRIBE' ? (
                    <span className="text-xs font-black px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">✅ SUBSCRIBE</span>
                  ) : ipo.recommendation === 'NEUTRAL' ? (
                    <span className="text-xs font-black px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">⚠️ NEUTRAL</span>
                  ) : (
                    <span className="text-xs font-black px-4 py-1.5 rounded-full bg-white/5 text-zinc-500">—</span>
                  )}
                  <p className="text-xs text-zinc-600 italic">{ipo.recommendation_reason}</p>
                </div>
                {ipo.status === 'OPEN' && (
                  <button onClick={(e) => { e.stopPropagation(); setApplyModal(ipo); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-primary-hover transition-all shadow-lg shadow-primary/20">
                    Apply Now <ChevronRight size={14} />
                  </button>
                )}
                {ipo.status === 'LISTED' && (
                  <div className="text-right">
                    <p className="text-xs text-zinc-500">Listed at</p>
                    <p className="text-lg font-black text-emerald-400">{ipo.listing_price} <span className="text-sm">({ipo.listing_gain})</span></p>
                  </div>
                )}
              </div>

              {/* Expanded Details */}
              {selectedIPO === ipo.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-4 pt-4 border-t border-white/[0.04] grid grid-cols-2 gap-4">
                  <div><p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Registrar</p><p className="text-xs text-white">{ipo.registrar}</p></div>
                  <div><p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Lead Manager</p><p className="text-xs text-white">{ipo.lead_manager}</p></div>
                  <div><p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Open Date</p><p className="text-xs text-white">{ipo.open_date}</p></div>
                  <div><p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Close Date</p><p className="text-xs text-white">{ipo.close_date}</p></div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Apply Modal */}
      {applyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setApplyModal(null)} />
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-md bg-[#0a0a0f] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl p-6 space-y-6">
            <h3 className="text-lg font-black text-white">Apply for {applyModal.name}</h3>
            <div className="bg-white/[0.02] rounded-2xl p-4">
              <p className="text-sm text-zinc-500">Price Band: <span className="text-white font-bold">{applyModal.price_band}</span></p>
              <p className="text-sm text-zinc-500">Lot Size: <span className="text-white font-bold">{applyModal.lot_size} shares</span></p>
            </div>
            <div>
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2 block">Number of Lots</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setLots(n)}
                    className={`w-12 h-12 rounded-xl font-black transition-all ${lots === n ? 'bg-primary text-black' : 'bg-white/[0.03] text-zinc-500 border border-white/[0.06]'}`}>{n}</button>
                ))}
              </div>
              <p className="text-xs text-zinc-600 mt-2">Amount: <span className="text-white font-bold">₹{(lots * applyModal.min_investment).toLocaleString()}</span></p>
            </div>
            <div>
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2 block">UPI ID</label>
              <input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi"
                className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-primary/30" />
            </div>
            <button onClick={() => handleApply(applyModal)} disabled={applying}
              className="w-full py-4 bg-primary text-black font-black uppercase tracking-widest rounded-2xl hover:bg-primary-hover transition-all disabled:opacity-30">
              {applying ? 'Submitting...' : `Apply for ${lots} Lot(s)`}
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
