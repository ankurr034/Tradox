import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellRing, Plus, Trash2, Sparkles, TrendingUp, TrendingDown, Target, Zap, ChevronDown, X, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { useToast } from '../components/Toast';
import { API_BASE_URL } from '../config';

const CONDITIONS = {
  CROSSES_ABOVE: { label: 'Crosses Above', icon: <TrendingUp size={14} />, color: '#10b981' },
  CROSSES_BELOW: { label: 'Crosses Below', icon: <TrendingDown size={14} />, color: '#ef4444' },
  PERCENT_CHANGE: { label: '% Change Alert', icon: <Zap size={14} />, color: '#f59e0b' },
  RSI_ABOVE: { label: 'RSI Above 70', icon: <AlertTriangle size={14} />, color: '#8b5cf6' },
  RSI_BELOW: { label: 'RSI Below 30', icon: <Target size={14} />, color: '#0ea5e9' },
};

export default function SmartAlerts() {
  const { user } = useUser();
  const toast = useToast();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [symbol, setSymbol] = useState('');
  const [condition, setCondition] = useState('CROSSES_ABOVE');
  const [targetPrice, setTargetPrice] = useState('');
  const [note, setNote] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [suggestLoading, setSuggestLoading] = useState(false);

  useEffect(() => { fetchAlerts(); }, []);

  const fetchAlerts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/alerts?user_id=${user?.id || 1}`);
      setAlerts(res.data.alerts);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const createAlert = async () => {
    if (!symbol || !targetPrice) return toast.error('Please fill symbol and price');
    try {
      await axios.post(`${API_BASE_URL}/api/alerts/create?user_id=${user?.id || 1}`, {
        symbol, condition, target_price: parseFloat(targetPrice), note
      });
      toast.success(`Alert created for ${symbol.toUpperCase()}`);
      setShowCreate(false);
      setSymbol(''); setTargetPrice(''); setNote('');
      fetchAlerts();
    } catch (e) { toast.error('Failed to create alert'); }
  };

  const deleteAlert = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/alerts/${id}?user_id=${user?.id || 1}`);
      setAlerts(prev => prev.filter(a => a.id !== id));
      toast.success('Alert deleted');
    } catch (e) { toast.error('Failed'); }
  };

  const fetchAISuggestions = async () => {
    if (!symbol) return toast.error('Enter a symbol first');
    setSuggestLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/alerts/ai-suggest/${symbol}`);
      setAiSuggestions(res.data);
    } catch (e) { toast.error('Failed to get suggestions'); }
    finally { setSuggestLoading(false); }
  };

  const applySuggestion = (s) => {
    setCondition(s.condition);
    setTargetPrice(String(s.price));
    setNote(s.note);
  };

  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE');
  const triggeredAlerts = alerts.filter(a => a.status === 'TRIGGERED');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 flex items-center justify-center">
              <BellRing className="w-6 h-6 text-amber-400" />
            </div>
            Smart Price Alerts
          </h1>
          <p className="text-zinc-500 mt-2 text-sm">AI-powered alerts with support/resistance detection</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-black font-black rounded-2xl hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 uppercase tracking-widest text-xs">
          <Plus size={16} /> New Alert
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Alerts', value: activeAlerts.length, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Triggered Today', value: triggeredAlerts.length, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Total Created', value: alerts.length, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        ].map((s, i) => (
          <div key={i} className="glass-panel p-5 text-center">
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">{s.label}</p>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Active Alerts */}
      <div>
        <h2 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">Active Alerts</h2>
        <div className="space-y-3">
          {activeAlerts.length === 0 ? (
            <div className="glass-panel p-12 text-center">
              <Bell className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-600 text-sm font-bold">No active alerts. Create one to get started!</p>
            </div>
          ) : activeAlerts.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-panel p-5 flex items-center gap-5 group hover:border-white/10 transition-all">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${a.condition.includes('ABOVE') ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                {a.condition.includes('ABOVE') ? <TrendingUp className="w-5 h-5 text-emerald-400" /> : <TrendingDown className="w-5 h-5 text-rose-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-white font-black text-lg">{a.symbol}</span>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-white/5 text-zinc-500 uppercase tracking-widest">
                    {CONDITIONS[a.condition]?.label || a.condition}
                  </span>
                  {a.ai_suggested && <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400">AI SUGGESTED</span>}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-zinc-500">Target: <span className="text-white font-bold font-mono-data">₹{a.target_price.toLocaleString()}</span></span>
                  <span className="text-zinc-500">CMP: <span className={`font-bold font-mono-data ${a.change_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>₹{a.current_price?.toLocaleString()}</span></span>
                  <span className="text-zinc-600 text-xs">Distance: {a.distance_pct}%</span>
                </div>
                {a.note && <p className="text-xs text-zinc-600 mt-1 italic">{a.note}</p>}
              </div>
              <button onClick={() => deleteAlert(a.id)} className="p-2 text-zinc-700 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Triggered Alerts */}
      {triggeredAlerts.length > 0 && (
        <div>
          <h2 className="text-xs font-black text-amber-400 uppercase tracking-[0.2em] mb-4">🔔 Triggered Alerts</h2>
          <div className="space-y-3">
            {triggeredAlerts.map(a => (
              <div key={a.id} className="glass-panel p-5 border-amber-500/20 bg-amber-500/[0.02] flex items-center gap-5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <BellRing className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1">
                  <span className="text-white font-bold">{a.symbol}</span>
                  <span className="text-zinc-500 ml-3 text-sm">hit ₹{a.target_price.toLocaleString()}</span>
                </div>
                <button onClick={() => deleteAlert(a.id)} className="text-zinc-600 hover:text-rose-400"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Alert Modal */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowCreate(false)} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#0a0a0f] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/[0.04] flex items-center justify-between">
                <h3 className="text-lg font-black text-white">Create Price Alert</h3>
                <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-white/5 rounded-full text-zinc-500"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-5">
                {/* Symbol */}
                <div>
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2 block">Stock Symbol</label>
                  <div className="flex gap-2">
                    <input value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())} placeholder="e.g. RELIANCE"
                      className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-primary/30" />
                    <button onClick={fetchAISuggestions} disabled={suggestLoading}
                      className="px-4 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl flex items-center gap-2 text-xs font-black hover:bg-purple-500/20 transition-all">
                      <Sparkles size={14} /> AI Suggest
                    </button>
                  </div>
                </div>

                {/* AI Suggestions */}
                <AnimatePresence>
                  {aiSuggestions && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="bg-purple-500/5 border border-purple-500/10 rounded-2xl p-4 overflow-hidden">
                      <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-3">🤖 AI Suggested Levels for {aiSuggestions.symbol} (CMP: ₹{aiSuggestions.current_price?.toLocaleString()})</p>
                      <div className="grid grid-cols-2 gap-2">
                        {aiSuggestions.suggestions?.map((s, i) => (
                          <button key={i} onClick={() => applySuggestion(s)}
                            className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-left hover:border-purple-500/30 transition-all">
                            <p className="text-xs font-bold text-zinc-400 mb-1">{s.label}</p>
                            <p className="text-lg font-black text-white font-mono-data">₹{s.price.toLocaleString()}</p>
                            <p className="text-[9px] text-zinc-600 mt-1">{s.confidence}% confidence</p>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Condition */}
                <div>
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2 block">Alert Condition</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(CONDITIONS).slice(0, 3).map(([key, val]) => (
                      <button key={key} onClick={() => setCondition(key)}
                        className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                          condition === key ? 'border-primary bg-primary/10 text-primary' : 'border-white/[0.06] text-zinc-500 hover:bg-white/[0.03]'
                        }`}>
                        {val.icon} {val.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Price */}
                <div>
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2 block">Target Price (₹)</label>
                  <input type="number" value={targetPrice} onChange={e => setTargetPrice(e.target.value)} placeholder="e.g. 2500"
                    className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-primary/30 font-mono-data" />
                </div>

                {/* Note */}
                <div>
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2 block">Note (Optional)</label>
                  <input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Buy at support level"
                    className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-primary/30" />
                </div>

                <button onClick={createAlert}
                  className="w-full py-4 bg-primary text-black font-black uppercase tracking-widest rounded-2xl hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                  <Bell size={16} /> Create Alert
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
