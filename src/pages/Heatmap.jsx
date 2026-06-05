import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, TrendingUp, TrendingDown, ArrowRight, RefreshCw, BarChart3, Activity } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

function getHeatColor(pct) {
  if (pct > 3) return { bg: '#064e3b', text: '#34d399', border: '#065f46' };
  if (pct > 1.5) return { bg: '#064e3b99', text: '#6ee7b7', border: '#065f4699' };
  if (pct > 0) return { bg: '#064e3b44', text: '#a7f3d0', border: '#064e3b66' };
  if (pct > -1.5) return { bg: '#7f1d1d44', text: '#fca5a5', border: '#7f1d1d66' };
  if (pct > -3) return { bg: '#7f1d1d99', text: '#f87171', border: '#7f1d1d99' };
  return { bg: '#7f1d1d', text: '#ef4444', border: '#991b1b' };
}

export default function Heatmap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHeatmap();
  }, []);

  const fetchHeatmap = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/heatmap`);
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center flex-col gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-500 text-sm">Building market heatmap...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-8"
        style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(16,185,129,0.08))' }}
      >
        <div className="absolute top-0 right-20 w-72 h-72 bg-red-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-20 w-60 h-60 bg-emerald-500/5 rounded-full blur-[100px]" />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-emerald-500 flex items-center justify-center shadow-xl">
              <Flame className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">Market Heatmap</h1>
              <p className="text-zinc-400 text-sm">Real-time NIFTY 50 performance visualization</p>
            </div>
          </div>
          <button 
            onClick={fetchHeatmap}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </motion.div>

      {/* Market Breadth */}
      {data?.breadth && (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-4 text-center">
            <p className="text-2xl font-black text-emerald-400">{data.breadth.advancers}</p>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Advancers</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-panel p-4 text-center">
            <p className="text-2xl font-black text-red-400">{data.breadth.decliners}</p>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Decliners</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-4 text-center">
            <p className="text-2xl font-black text-zinc-400">{data.breadth.unchanged}</p>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Unchanged</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-panel p-4 text-center hidden md:block">
            {/* Breadth Bar */}
            <div className="flex h-3 rounded-full overflow-hidden mb-2 bg-white/5">
              <div className="bg-emerald-500 transition-all" style={{ width: `${(data.breadth.advancers / data.breadth.total) * 100}%` }} />
              <div className="bg-zinc-700 transition-all" style={{ width: `${(data.breadth.unchanged / data.breadth.total) * 100}%` }} />
              <div className="bg-red-500 transition-all" style={{ width: `${(data.breadth.decliners / data.breadth.total) * 100}%` }} />
            </div>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Market Breadth</p>
          </motion.div>
        </div>
      )}

      {/* Heatmap Grid */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 size={18} className="text-primary" />
            Sector Performance
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-emerald-700" />
              <span className="text-[10px] text-zinc-500">Gainers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-red-800" />
              <span className="text-[10px] text-zinc-500">Losers</span>
            </div>
          </div>
        </div>

        {/* Sector Cards */}
        <div className="space-y-4">
          {data?.sectors?.map((sector, i) => {
            const color = getHeatColor(sector.change_pct);
            const isExpanded = selectedSector === sector.sector;

            return (
              <motion.div
                key={sector.sector}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                {/* Sector Header */}
                <button
                  onClick={() => setSelectedSector(isExpanded ? null : sector.sector)}
                  className="w-full flex items-center justify-between p-4 rounded-xl transition-all hover:brightness-110"
                  style={{ backgroundColor: color.bg, border: `1px solid ${color.border}` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                      <Activity size={18} style={{ color: color.text }} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-bold" style={{ color: color.text }}>{sector.sector}</h3>
                      <p className="text-[10px] text-zinc-500">{sector.stocks.length} stocks</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-black font-mono" style={{ color: color.text }}>
                      {sector.change_pct >= 0 ? '+' : ''}{sector.change_pct.toFixed(2)}%
                    </span>
                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowRight size={16} style={{ color: color.text }} />
                    </motion.div>
                  </div>
                </button>

                {/* Stock Tiles (Expanded) */}
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mt-2"
                  >
                    {sector.stocks.map((stock, j) => {
                      const sColor = getHeatColor(stock.change_pct);
                      return (
                        <motion.button
                          key={stock.symbol}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: j * 0.04 }}
                          onClick={() => navigate(`/stock/${stock.symbol}`)}
                          className="p-3 rounded-xl text-center transition-all hover:brightness-125 hover:scale-105 group"
                          style={{ backgroundColor: sColor.bg, border: `1px solid ${sColor.border}` }}
                        >
                          <p className="text-sm font-black mb-1" style={{ color: sColor.text }}>
                            {stock.symbol}
                          </p>
                          <p className="text-xs font-mono text-zinc-400 mb-1">
                            ₹{stock.price?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </p>
                          <p className="text-sm font-bold font-mono" style={{ color: sColor.text }}>
                            {stock.change_pct >= 0 ? '+' : ''}{stock.change_pct.toFixed(2)}%
                          </p>
                          <p className="text-[8px] text-zinc-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to view →
                          </p>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="glass-panel p-4">
        <div className="flex items-center justify-center gap-1 flex-wrap">
          {[
            { label: '< -3%', color: '#7f1d1d' },
            { label: '-3% to -1.5%', color: '#7f1d1d99' },
            { label: '-1.5% to 0%', color: '#7f1d1d44' },
            { label: '0% to +1.5%', color: '#064e3b44' },
            { label: '+1.5% to +3%', color: '#064e3b99' },
            { label: '> +3%', color: '#064e3b' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 px-2.5 py-1">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
              <span className="text-[9px] text-zinc-500 font-bold">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timestamp */}
      {data?.timestamp && (
        <p className="text-center text-[10px] text-zinc-600">
          Last updated: {data.timestamp} • Auto-refreshes every 60 seconds
        </p>
      )}
    </div>
  );
}
