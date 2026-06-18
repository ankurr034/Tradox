import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, TrendingUp, TrendingDown, Flame, MessageCircle, Heart, Search, ArrowUp, Loader2, BarChart2, Globe, Zap, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import axios from '../utils/axiosSetup';
import { API_BASE_URL } from '../config';

const TREND_CONFIG = {
  SURGING: { color: '#10b981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: '🔥 SURGING' },
  RISING: { color: '#0ea5e9', bg: 'bg-sky-500/10', border: 'border-sky-500/20', label: '📈 RISING' },
  STABLE: { color: '#a1a1aa', bg: 'bg-zinc-500/10', border: 'border-zinc-500/20', label: '➡️ STABLE' },
  VOLATILE: { color: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: '⚡ VOLATILE' },
};

export default function SentimentRadar() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => { fetchRadar(); }, []);

  const fetchRadar = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/sentiment/radar`);
      setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchDetail = async (symbol) => {
    setSelectedSymbol(symbol);
    setDetailLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/sentiment/radar?symbol=${symbol}`);
      setDetail(res.data.detail);
    } catch (e) { console.error(e); }
    finally { setDetailLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) fetchDetail(searchInput.trim().toUpperCase());
  };

  if (loading) return <div className="py-20 text-center"><Loader2 className="w-8 h-8 text-primary mx-auto animate-spin" /></div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/20 flex items-center justify-center">
            <Radio className="w-6 h-6 text-pink-400" />
          </div>
          Social Sentiment Radar
        </h1>
        <p className="text-zinc-500 mt-2 text-sm">Live social media sentiment tracking • Exclusive to Tradox — no other Indian app has this</p>
      </div>

      {/* Market Mood Banner */}
      {data?.market_mood && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-cyan-500/5 border border-pink-500/10 p-6 flex items-center gap-8">
          <div className="absolute top-0 left-0 w-64 h-64 bg-pink-500/5 rounded-full blur-[100px]" />
          <div className="relative z-10 flex items-center gap-6 flex-1">
            <div className="relative">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
                <circle cx="60" cy="60" r="50" fill="none" stroke="#ec4899" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${data.market_mood.overall_score * 3.14} 314`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white">{data.market_mood.overall_score}</span>
                <span className="text-[8px] font-black text-pink-400 uppercase tracking-widest">MOOD</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-1">Overall Market Sentiment</p>
              <p className="text-2xl font-black text-white mb-1">{data.market_mood.label}</p>
              <p className="text-xs text-zinc-500">Aggregated from 50,000+ social media posts across Twitter, Reddit & financial forums</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            <span className="text-[10px] font-black text-pink-400 uppercase tracking-widest">LIVE</span>
          </div>
        </motion.div>
      )}

      {/* Search */}
      <form onSubmit={handleSearch} className="glass-panel p-4 flex gap-3 items-center">
        <Search className="w-5 h-5 text-zinc-600 shrink-0" />
        <input value={searchInput} onChange={e => setSearchInput(e.target.value.toUpperCase())}
          placeholder="Search any stock for detailed sentiment analysis..."
          className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder:text-zinc-700" />
        <button type="submit"
          className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:opacity-90 transition-all">
          Analyze
        </button>
      </form>

      {/* Trending Stocks Grid */}
      <div>
        <h2 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
          <Flame size={14} className="text-orange-400" /> Trending on Social Media
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {data?.trending?.map((stock, i) => {
            const config = TREND_CONFIG[stock.trend] || TREND_CONFIG.STABLE;
            return (
              <motion.div key={stock.symbol} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => fetchDetail(stock.symbol)}
                className={`glass-panel p-5 cursor-pointer hover:border-white/15 transition-all group relative overflow-hidden ${
                  selectedSymbol === stock.symbol ? 'border-pink-500/30 bg-pink-500/[0.02]' : ''
                }`}>
                <div className="absolute top-0 right-0 w-16 h-16 rounded-full blur-[40px] pointer-events-none" style={{ background: `${config.color}10` }} />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black"
                        style={{ background: `${config.color}20`, color: config.color }}>
                        {stock.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-white group-hover:text-primary transition-colors">{stock.symbol}</p>
                        <p className="text-[10px] text-zinc-600">{stock.name}</p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg ${config.bg} ${config.border} border`}
                      style={{ color: config.color }}>
                      {config.label}
                    </span>
                  </div>
                  
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-0.5">Sentiment</p>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${stock.sentiment_score}%`, background: config.color }} />
                        </div>
                        <span className="text-xs font-black font-mono-data" style={{ color: config.color }}>{stock.sentiment_score}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-0.5">Mentions</p>
                      <p className="text-xs font-black text-white font-mono-data">{(stock.mentions / 1000).toFixed(1)}K</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.04]">
                    <span className="text-xs font-bold text-white font-mono-data">₹{stock.price.toLocaleString()}</span>
                    <span className={`text-xs font-black font-mono-data ${stock.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {stock.positive ? '+' : ''}{stock.change_pct}%
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {(detail || detailLoading) && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden">
            {detailLoading ? (
              <div className="glass-panel p-12 text-center">
                <Loader2 className="w-8 h-8 text-pink-400 mx-auto animate-spin mb-4" />
                <p className="text-sm text-zinc-500">Analyzing social sentiment for {selectedSymbol}...</p>
              </div>
            ) : detail && (
              <div className="space-y-6">
                {/* Detail Header */}
                <div className="glass-panel p-6 bg-gradient-to-r from-pink-500/[0.03] to-purple-500/[0.03] border-pink-500/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <h2 className="text-xl font-black text-white">{detail.symbol} Sentiment Analysis</h2>
                      <span className={`text-xs font-black px-3 py-1 rounded-lg ${
                        detail.sentiment_label.includes('BULLISH') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        detail.sentiment_label === 'BEARISH' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                      }`}>{detail.sentiment_label}</span>
                    </div>
                    <button onClick={() => { setDetail(null); setSelectedSymbol(''); }}
                      className="text-xs font-bold text-zinc-500 hover:text-white px-3 py-1.5 bg-white/[0.04] rounded-lg border border-white/[0.06]">CLOSE</button>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.04]">
                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Overall Score</p>
                      <p className="text-2xl font-black text-pink-400 font-mono-data">{detail.overall_score}</p>
                    </div>
                    <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.04]">
                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">24h Mentions</p>
                      <p className="text-2xl font-black text-white font-mono-data">{(detail.total_mentions_24h / 1000).toFixed(1)}K</p>
                    </div>
                    <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.04]">
                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Mentions Change</p>
                      <p className={`text-2xl font-black font-mono-data ${detail.mentions_change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {detail.mentions_change >= 0 ? '+' : ''}{detail.mentions_change}%
                      </p>
                    </div>
                    <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.04]">
                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Breakdown</p>
                      <div className="flex items-center gap-1">
                        <ThumbsUp size={12} className="text-emerald-400" />
                        <span className="text-xs font-black text-emerald-400">{detail.breakdown.bullish}%</span>
                        <Minus size={12} className="text-zinc-600 mx-1" />
                        <ThumbsDown size={12} className="text-rose-400" />
                        <span className="text-xs font-black text-rose-400">{detail.breakdown.bearish}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Sentiment Timeline */}
                  <div className="glass-panel p-6">
                    <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">24h Sentiment Timeline</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={detail.timeline}>
                        <defs>
                          <linearGradient id="sentGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="hour" tick={{ fontSize: 9, fill: '#52525b' }} interval={3} />
                        <YAxis tick={{ fontSize: 9, fill: '#52525b' }} domain={[0, 100]} />
                        <Tooltip contentStyle={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }} />
                        <Area type="monotone" dataKey="score" stroke="#ec4899" fill="url(#sentGrad)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Source Breakdown */}
                  <div className="glass-panel p-6">
                    <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">Source Breakdown</h3>
                    <div className="space-y-3">
                      {detail.source_breakdown.map((src, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 bg-white/[0.02] rounded-xl">
                          <span className="text-xl">{src.icon}</span>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-white">{src.source}</p>
                            <p className="text-[10px] text-zinc-600">{src.mentions.toLocaleString()} mentions</p>
                          </div>
                          <div className="w-24 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                            <div className="h-full bg-pink-500 rounded-full" style={{ width: `${src.sentiment}%` }} />
                          </div>
                          <span className="text-xs font-black font-mono-data text-pink-400">{src.sentiment}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Social Posts */}
                <div className="glass-panel p-6">
                  <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <MessageCircle size={14} className="text-purple-400" /> Latest Social Posts
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {detail.posts.map((post, i) => (
                      <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                        className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04] hover:border-white/[0.08] transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{post.platform}</span>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded ${
                            post.sentiment === 'BULLISH' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                          }`}>{post.sentiment}</span>
                        </div>
                        <p className="text-sm text-zinc-300 mb-3 leading-relaxed">{post.text}</p>
                        <div className="flex items-center justify-between text-[10px] text-zinc-600">
                          <span className="flex items-center gap-1"><Heart size={10} /> {post.likes}</span>
                          <span>{post.time}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* AI Summary */}
                <div className="glass-panel p-5 bg-purple-500/[0.02] border-purple-500/10 flex items-start gap-4">
                  <Zap className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-black text-purple-400 uppercase tracking-[0.2em] mb-1">AI Sentiment Summary</p>
                    <p className="text-sm text-zinc-400 leading-relaxed">{detail.ai_summary}</p>
                  </div>
                </div>

                {/* Word Cloud */}
                <div className="glass-panel p-6">
                  <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">Trending Keywords</h3>
                  <div className="flex flex-wrap gap-2 justify-center py-4">
                    {detail.word_cloud.map((word, i) => (
                      <motion.span key={i} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] font-bold transition-all hover:bg-pink-500/10 hover:border-pink-500/20 hover:text-pink-400 cursor-default"
                        style={{ fontSize: Math.max(11, Math.min(24, word.value / 8)), color: `hsl(${(i * 30) % 360}, 60%, 65%)` }}>
                        {word.text}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
