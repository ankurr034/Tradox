import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Zap, TrendingUp, Info, ChevronRight, Check, AlertTriangle, Users, Sparkles, ArrowRight, X } from 'lucide-react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { useToast } from '../components/Toast';
import { API_BASE_URL } from '../config';

export default function SmartBaskets() {
  const { user } = useUser();
  const { addToast } = useToast();
  const [baskets, setBaskets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBasket, setSelectedBasket] = useState(null);
  const [investAmount, setInvestAmount] = useState('');
  const [buying, setBuying] = useState(false);
  const [buyResult, setBuyResult] = useState(null);

  useEffect(() => {
    fetchBaskets();
  }, []);

  const fetchBaskets = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/baskets`);
      setBaskets(res.data.baskets);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async () => {
    if (!selectedBasket || !investAmount) return;
    setBuying(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/baskets/buy?user_id=${user?.id || 1}`, {
        basket_id: selectedBasket.id,
        investment_amount: parseFloat(investAmount),
      });
      setBuyResult(res.data);
      addToast('success', res.data.message);
    } catch (err) {
      addToast('error', err.response?.data?.detail || 'Purchase failed');
    } finally {
      setBuying(false);
    }
  };

  const handleRebalance = async (basketId) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/baskets/rebalance?user_id=${user?.id || 1}`, {
        basket_id: basketId,
        investment_amount: 0 // Not used for rebalance
      });
      addToast('success', res.data.message);
      fetchBaskets();
    } catch (err) {
      addToast('error', err.response?.data?.detail || 'Rebalance failed');
    }
  };

  const riskColor = (risk) => {
    if (risk === 'Low') return 'text-emerald-400 bg-emerald-500/10';
    if (risk === 'Moderate') return 'text-amber-400 bg-amber-500/10';
    return 'text-red-400 bg-red-500/10';
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center flex-col gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-500 text-sm">Loading Smart Baskets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-8"
        style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(236,72,153,0.08))' }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-pink-500 flex items-center justify-center shadow-xl shadow-amber-500/20">
              <ShoppingBag className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">Smart Baskets</h1>
              <p className="text-zinc-400 text-sm">Thematic one-click investing — diversify in seconds</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
              <Sparkles size={12} className="text-amber-400" />
              <span className="text-xs text-zinc-400">AI-Curated</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
              <Zap size={12} className="text-blue-400" />
              <span className="text-xs text-zinc-400">One-Click Buy</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
              <TrendingUp size={12} className="text-emerald-400" />
              <span className="text-xs text-zinc-400">Auto-Weighted</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Baskets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {baskets.map((basket, i) => (
          <motion.div
            key={basket.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-panel overflow-hidden group hover:border-white/15 transition-all cursor-pointer"
            onClick={() => { setSelectedBasket(basket); setInvestAmount(String(basket.min_investment)); setBuyResult(null); }}
          >
            {/* Color Bar */}
            <div className="h-1" style={{ background: `linear-gradient(90deg, ${basket.color}, transparent)` }} />
            
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{basket.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{basket.name}</h3>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{basket.created_by}</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-zinc-500 mb-5 leading-relaxed">{basket.description}</p>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-white/[0.03] rounded-lg p-2.5 text-center">
                  <p className="text-lg font-black text-emerald-400">{basket.returns_1y}</p>
                  <p className="text-[9px] text-zinc-600 font-bold uppercase">1Y Returns</p>
                </div>
                <div className="bg-white/[0.03] rounded-lg p-2.5 text-center">
                  <p className={`text-sm font-bold px-2 py-0.5 rounded-full inline-block ${riskColor(basket.risk)}`}>{basket.risk}</p>
                  <p className="text-[9px] text-zinc-600 font-bold uppercase mt-1">Risk</p>
                </div>
                <div className="bg-white/[0.03] rounded-lg p-2.5 text-center">
                  <p className="text-sm font-bold text-white">{basket.stocks.length}</p>
                  <p className="text-[9px] text-zinc-600 font-bold uppercase">Stocks</p>
                </div>
              </div>

              {/* Stocks Preview */}
              <div className="space-y-2 mb-5">
                {basket.stocks.slice(0, 3).map((s, j) => (
                  <div key={j} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: basket.color }} />
                      <span className="text-zinc-400">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-600">{s.weight}%</span>
                      <span className="font-mono text-zinc-300">₹{s.price > 0 ? s.price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '—'}</span>
                    </div>
                  </div>
                ))}
                {basket.stocks.length > 3 && (
                  <p className="text-[10px] text-zinc-600 text-center">+{basket.stocks.length - 3} more stocks</p>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
                <div className="flex items-center gap-1.5 text-zinc-600">
                  <Users size={12} />
                  <span className="text-[10px] font-bold">{basket.subscribers?.toLocaleString()} subscribers</span>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleRebalance(basket.id); }}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-500/10 px-2 py-1 rounded-md"
                  >
                    <Zap size={10} className="fill-emerald-400" /> AI Rebalance
                  </button>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                    Invest Now <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Buy Modal */}
      <AnimatePresence>
        {selectedBasket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedBasket(null)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#0d0d12] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/[0.04]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedBasket.icon}</span>
                    <div>
                      <h3 className="text-xl font-bold text-white">{selectedBasket.name}</h3>
                      <p className="text-xs text-zinc-500">{selectedBasket.stocks.length} stocks • {selectedBasket.risk} Risk</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedBasket(null)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                    <X size={18} className="text-zinc-500" />
                  </button>
                </div>
              </div>

              {buyResult ? (
                /* Success State */
                <div className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                    <Check size={32} className="text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Basket Purchased! 🎉</h3>
                  <p className="text-sm text-zinc-500 mb-6">
                    Invested ₹{buyResult.total_invested?.toLocaleString(undefined, { minimumFractionDigits: 2 })} across {buyResult.orders?.length} stocks
                  </p>
                  <div className="space-y-2 mb-6">
                    {buyResult.orders?.map((o, i) => (
                      <div key={i} className="flex items-center justify-between text-sm bg-white/[0.02] rounded-lg px-4 py-2.5">
                        <span className="font-bold text-white">{o.symbol}</span>
                        <span className="text-zinc-500">{o.qty} shares</span>
                        <span className="text-zinc-300 font-mono">₹{o.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setSelectedBasket(null)}
                    className="w-full py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary/80 transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                /* Investment Form */
                <div className="p-6 space-y-6">
                  {/* Stock Allocation */}
                  <div>
                    <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-3">Stock Allocation</h4>
                    <div className="space-y-2">
                      {selectedBasket.stocks.map((s, i) => (
                        <div key={i} className="flex items-center justify-between text-sm bg-white/[0.02] rounded-lg px-4 py-2.5">
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: selectedBasket.color, opacity: 1 - (i * 0.15) }} />
                            <div>
                              <p className="font-bold text-white">{s.symbol}</p>
                              <p className="text-[10px] text-zinc-600">{s.name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold" style={{ color: selectedBasket.color }}>{s.weight}%</p>
                            <p className="text-[10px] text-zinc-500 font-mono">₹{s.price > 0 ? s.price.toFixed(2) : '—'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Weight Bar */}
                  <div className="flex h-2 rounded-full overflow-hidden bg-white/[0.03]">
                    {selectedBasket.stocks.map((s, i) => (
                      <div key={i} style={{ width: `${s.weight}%`, backgroundColor: selectedBasket.color, opacity: 1 - (i * 0.15) }} />
                    ))}
                  </div>

                  {/* Investment Input */}
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Investment Amount (₹)</label>
                    <input
                      type="number"
                      value={investAmount}
                      onChange={(e) => setInvestAmount(e.target.value)}
                      min={selectedBasket.min_investment}
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3.5 px-4 text-xl font-bold text-white focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                      placeholder={`Min ₹${selectedBasket.min_investment}`}
                    />
                    <p className="text-[10px] text-zinc-600 mt-1.5 flex items-center gap-1">
                      <Info size={10} /> Minimum: ₹{selectedBasket.min_investment.toLocaleString()}
                    </p>
                  </div>

                  {/* Quick Amount Buttons */}
                  <div className="flex gap-2">
                    {[5000, 10000, 25000, 50000].map(amt => (
                      <button
                        key={amt}
                        onClick={() => setInvestAmount(String(amt))}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                          investAmount === String(amt)
                            ? 'bg-primary/10 border-primary/30 text-primary'
                            : 'bg-white/[0.02] border-white/[0.06] text-zinc-500 hover:text-white hover:bg-white/[0.04]'
                        }`}
                      >
                        ₹{(amt/1000)}K
                      </button>
                    ))}
                  </div>

                  {/* Buy Button */}
                  <button
                    onClick={handleBuy}
                    disabled={buying || !investAmount || parseFloat(investAmount) < selectedBasket.min_investment}
                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-pink-500 text-white font-black rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-30 shadow-lg shadow-amber-500/20 text-sm"
                  >
                    {buying ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
                    ) : (
                      <><ShoppingBag size={16} /> Invest ₹{Number(investAmount || 0).toLocaleString()} in {selectedBasket.name}</>
                    )}
                  </button>

                  <p className="text-[9px] text-zinc-600 text-center flex items-center justify-center gap-1">
                    <AlertTriangle size={9} /> Investment is subject to market risks. Read all documents carefully.
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
