import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, TrendingUp, TrendingDown, Target, Zap, Activity, Info, ChevronRight, Sliders, BarChart4, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function Screener() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 10000,
    minConfidence: 0,
    sector: 'ALL',
    search: ''
  });

  const sectors = ['ALL', 'FINANCIALS', 'IT', 'ENERGY', 'FMCG', 'HEALTHCARE', 'AUTO', 'METALS'];

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/screener/search`, { params: filters });
      setStocks(res.data.stocks);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, [filters]);

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-white/[0.08] flex items-center justify-center shadow-lg shadow-amber-500/10">
                 <Target className="w-6 h-6 text-amber-400" />
              </div>
              Nexus AI Screener
           </h1>
           <p className="text-zinc-500 text-sm mt-2 ml-1">Discover high-probability setups using deep learning filters</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex -space-x-2">
              {[1,2,3,4].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-zinc-800" />)}
           </div>
           <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Used by 4.2k Traders</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel p-4 sm:p-6 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-4 sm:gap-6 border-white/[0.08]">
         <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input 
              type="text" 
              placeholder="Search symbols or sectors..."
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:border-amber-500/50 transition-all outline-none"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
         </div>
         
         <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex flex-col">
               <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1.5 ml-1">Sector</span>
               <select 
                 value={filters.sector}
                 onChange={(e) => setFilters({...filters, sector: e.target.value})}
                 className="bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none cursor-pointer hover:bg-white/[0.05]"
               >
                  {sectors.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
            </div>

            <div className="flex flex-col">
               <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1.5 ml-1">Min AI Confidence</span>
               <div className="flex items-center gap-3">
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={filters.minConfidence}
                    onChange={(e) => setFilters({...filters, minConfidence: parseInt(e.target.value)})}
                    className="accent-amber-500 w-32" 
                  />
                  <span className="text-xs font-mono font-bold text-amber-400 w-8">{filters.minConfidence}%</span>
               </div>
            </div>
         </div>

         <button 
           onClick={fetchStocks}
           className="px-6 py-3 bg-amber-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-amber-400 transition-all ml-auto shadow-lg shadow-amber-500/20"
         >
            Live Scan
         </button>
      </div>

      {/* Results Table */}
      <div className="glass-panel overflow-hidden border-white/[0.08]">
         {loading ? (
            <div className="p-20 text-center space-y-4">
               <RefreshCw className="w-10 h-10 text-amber-500 animate-spin mx-auto" />
               <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs">Scanning 5,000+ NSE scripts...</p>
            </div>
         ) : (
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="border-b border-white/[0.06] text-zinc-500 text-[10px] uppercase tracking-widest">
                        <th className="py-5 px-8 font-bold">Trading Script</th>
                        <th className="py-5 px-8 font-bold text-center">AI Signal</th>
                        <th className="py-5 px-8 font-bold text-right">LTP</th>
                        <th className="py-5 px-8 font-bold text-right">Day Chg</th>
                        <th className="py-5 px-8 font-bold text-center">Confidence</th>
                        <th className="py-5 px-8 font-bold text-center">RSI (14)</th>
                        <th className="py-5 px-8 font-bold text-right">Volume</th>
                        <th className="py-5 px-8 font-bold text-right"></th>
                     </tr>
                  </thead>
                  <tbody>
                     {stocks.map((s, i) => (
                        <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
                           <td className="py-5 px-8">
                              <Link to={`/stock/${s.symbol}`} className="flex items-center gap-3 no-underline">
                                 <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center group-hover:border-amber-500/40 transition-colors">
                                    <span className="text-xs font-black text-zinc-400">{s.symbol.charAt(0)}</span>
                                 </div>
                                 <div>
                                    <p className="font-bold text-white group-hover:text-amber-400 transition-colors mb-0">{s.symbol}</p>
                                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">{s.sector}</p>
                                 </div>
                              </Link>
                           </td>
                           <td className="py-5 px-8 text-center text-xs font-black">
                              <span className={`px-3 py-1 rounded-full border ${
                                 s.signal === 'STRONG BUY' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                 s.signal === 'BUY' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500' :
                                 s.signal === 'SELL' ? 'bg-red-500/5 border-red-500/10 text-red-500' :
                                 'bg-zinc-800 border-white/5 text-zinc-400'
                              }`}>
                                 {s.signal}
                              </span>
                           </td>
                           <td className="py-5 px-8 text-right font-black text-white font-mono-data text-base">₹{s.price.toLocaleString()}</td>
                           <td className={`py-5 px-8 text-right font-black font-mono-data ${s.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {s.change >= 0 ? '+' : ''}{s.change}%
                           </td>
                           <td className="py-5 px-8 text-center">
                              <div className="flex flex-col items-center gap-1.5">
                                 <div className="w-24 h-1.5 bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.04]">
                                    <div className="h-full bg-amber-500" style={{ width: `${s.confidence}%` }} />
                                 </div>
                                 <span className="text-[10px] font-mono font-bold text-amber-500">{s.confidence}%</span>
                              </div>
                           </td>
                           <td className="py-5 px-8 text-center">
                              <span className={`text-xs font-mono font-bold ${s.rsi > 70 ? 'text-red-400' : s.rsi < 30 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                                 {s.rsi}
                              </span>
                           </td>
                           <td className="py-5 px-8 text-right font-bold text-zinc-500 font-mono-data text-xs">{s.volume}</td>
                           <td className="py-5 px-8 text-right">
                              <Link to={`/stock/${s.symbol}`} className="p-2 hover:bg-white/5 rounded-full transition-colors inline-block no-underline">
                                 <ChevronRight className="w-5 h-5 text-zinc-700" />
                              </Link>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}
      </div>

      {/* Pro Tip Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-10">
         <div className="glass-panel p-8 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-indigo-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[40px] group-hover:bg-indigo-500/10 transition-all" />
            <div className="flex items-center gap-4 mb-4">
               <Sparkles className="w-6 h-6 text-indigo-400" />
               <h3 className="text-lg font-black text-white">Sentiment Alpha</h3>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
               Stocks with <span className="text-white font-bold">RSI below 30</span> and <span className="text-emerald-400 font-bold">AI Confidence above 85%</span> have shown 74% win-rate in historical backtests over the last 12 months.
            </p>
            <div className="flex gap-3">
               <button className="flex-1 py-3 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-500 transition-all">Apply Alpha Filter</button>
            </div>
         </div>

         <div className="glass-panel p-8 bg-gradient-to-br from-amber-500/5 to-orange-500/5 border-amber-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[40px] group-hover:bg-amber-500/10 transition-all" />
            <div className="flex items-center gap-4 mb-4">
               <Zap className="w-6 h-6 text-amber-400" />
               <h3 className="text-lg font-black text-white">Breakout Alerts</h3>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
               Get real-time push notifications when a script enters the <span className="text-amber-400 font-bold">Nexus Golden Zone</span> (High Volume + High AI Score + Range Breakout).
            </p>
            <div className="flex gap-3">
               <button className="flex-1 py-3 bg-amber-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-amber-500 transition-all">Setup Alerts</button>
            </div>
         </div>
      </div>
    </div>
  );
}
