import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Calendar, TrendingUp, TrendingDown, Target, Shield, Zap, Clock, ArrowRight, BarChart2, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function TradeSimulator() {
  const [symbol, setSymbol] = useState('RELIANCE');
  const [entryDate, setEntryDate] = useState('2023-01-01');
  const [exitDate, setExitDate] = useState('2023-12-31');
  const [quantity, setQuantity] = useState(100);
  const [tradeType, setTradeType] = useState('BUY');
  const [stopLoss, setStopLoss] = useState(0);
  const [targetPct, setTargetPct] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/simulator/suggestions`)
      .then(res => setSuggestions(res.data.suggestions))
      .catch(() => {});
  }, []);

  const runBacktest = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/simulator/backtest`, {
        symbol, entry_date: entryDate, exit_date: exitDate,
        quantity, trade_type: tradeType,
        stop_loss_pct: stopLoss, target_pct: targetPct,
      });
      setResult(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = (s) => {
    setSymbol(s.symbol);
    setEntryDate(s.entry);
    setExitDate(s.exit);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-[#0a0a12]/95 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">{d.date}</p>
          <p className="text-sm font-bold text-white mb-1">₹{d.price?.toLocaleString()}</p>
          <p className={`text-xs font-black ${d.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            P&L: ₹{d.pnl?.toLocaleString()} ({d.pnl_pct > 0 ? '+' : ''}{d.pnl_pct}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[28px] border border-white/[0.06] bg-gradient-to-br from-[#0a0618] via-surface to-surface p-8 md:p-12">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white">AI Trade Simulator</h1>
              <p className="text-zinc-500 text-sm mt-0.5">Time-travel any trade idea. Backtest against real market data.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Suggestions */}
      {suggestions.length > 0 && (
        <div>
          <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
            <Zap className="w-3 h-3 text-violet-400" /> Popular Scenarios
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => applySuggestion(s)}
                className="shrink-0 px-5 py-3 glass-panel border border-white/[0.06] hover:border-violet-500/30 hover:bg-violet-500/5 transition-all rounded-2xl text-left group"
              >
                <p className="text-xs font-black text-white group-hover:text-violet-400 transition-colors">{s.label}</p>
                <p className="text-[10px] text-zinc-600 font-bold mt-0.5">{s.symbol} • {s.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="glass-panel p-6 md:p-8 border border-white/[0.06]">
        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" /> Configure Your Trade
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Symbol</label>
            <input value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-violet-500/40" />
          </div>
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Entry Date</label>
            <input type="date" value={entryDate} onChange={e => setEntryDate(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/40 [color-scheme:dark]" />
          </div>
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Exit Date</label>
            <input type="date" value={exitDate} onChange={e => setExitDate(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/40 [color-scheme:dark]" />
          </div>
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Quantity</label>
            <input type="number" value={quantity} onChange={e => setQuantity(+e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-violet-500/40" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Direction</label>
            <div className="flex gap-2">
              {['BUY', 'SHORT'].map(t => (
                <button key={t} onClick={() => setTradeType(t)}
                  className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all border ${
                    tradeType === t
                      ? t === 'BUY' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-red-500/15 border-red-500/30 text-red-400'
                      : 'bg-white/[0.02] border-white/[0.06] text-zinc-500 hover:text-white'
                  }`}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Stop Loss %</label>
            <input type="number" value={stopLoss} onChange={e => setStopLoss(+e.target.value)} placeholder="0 = none"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/40" />
          </div>
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Target %</label>
            <input type="number" value={targetPct} onChange={e => setTargetPct(+e.target.value)} placeholder="0 = none"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/40" />
          </div>
          <div className="flex items-end">
            <button onClick={runBacktest} disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-500/20 disabled:opacity-50">
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {loading ? 'SIMULATING...' : 'RUN BACKTEST'}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* AI Verdict Banner */}
            <div className={`rounded-2xl border p-6 flex items-center gap-6 ${
              result.pnl >= 0
                ? 'bg-emerald-500/5 border-emerald-500/20'
                : 'bg-red-500/5 border-red-500/20'
            }`}>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                result.pnl >= 0 ? 'bg-emerald-500/15' : 'bg-red-500/15'
              }`}>
                {result.pnl >= 0 ? <CheckCircle className="w-8 h-8 text-emerald-400" /> : <XCircle className="w-8 h-8 text-red-400" />}
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-black ${result.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {result.ai_verdict}
                </h3>
                <p className="text-sm text-zinc-400 mt-1">{result.ai_detail}</p>
              </div>
              <div className="text-right">
                <p className={`text-3xl font-black font-mono-data ${result.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {result.pnl >= 0 ? '+' : ''}₹{result.pnl?.toLocaleString()}
                </p>
                <p className={`text-sm font-bold ${result.pnl_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {result.pnl_pct > 0 ? '+' : ''}{result.pnl_pct}%
                </p>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'Entry Price', value: `₹${result.entry_price?.toLocaleString()}`, icon: <ArrowRight className="w-4 h-4" />, color: 'text-sky-400' },
                { label: 'Exit Price', value: `₹${result.exit_price?.toLocaleString()}`, icon: <Target className="w-4 h-4" />, color: 'text-violet-400' },
                { label: 'Investment', value: `₹${result.investment?.toLocaleString()}`, icon: <BarChart2 className="w-4 h-4" />, color: 'text-amber-400' },
                { label: 'Max Drawdown', value: `${result.max_drawdown}%`, icon: <AlertTriangle className="w-4 h-4" />, color: 'text-red-400' },
                { label: 'Win Rate', value: `${result.win_rate}%`, icon: <TrendingUp className="w-4 h-4" />, color: 'text-emerald-400' },
              ].map((m, i) => (
                <div key={i} className="glass-panel p-5 border border-white/[0.04]">
                  <div className={`flex items-center gap-2 mb-3 ${m.color}`}>
                    {m.icon}
                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{m.label}</span>
                  </div>
                  <p className="text-lg font-black text-white font-mono-data">{m.value}</p>
                </div>
              ))}
            </div>

            {/* P&L Chart */}
            <div className="glass-panel p-6 border border-white/[0.04]">
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-violet-400" /> P&L Timeline
              </h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={result.pnl >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={result.pnl >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                    <XAxis dataKey="date" stroke="#52525b" tick={{ fill: '#71717a', fontSize: 10 }} minTickGap={40} />
                    <YAxis stroke="#52525b" tick={{ fill: '#71717a', fontSize: 10 }} tickFormatter={v => `₹${v}`} />
                    <ReferenceLine y={0} stroke="#ffffff15" strokeDasharray="3 3" />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="pnl" stroke={result.pnl >= 0 ? '#10b981' : '#ef4444'} strokeWidth={2.5} fill="url(#pnlGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Benchmark Comparison */}
            <div className="glass-panel p-6 border border-white/[0.04]">
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4">Benchmark Comparison</h3>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Your Trade', value: result.pnl_pct, emoji: '🎯' },
                  { label: 'Nifty 50', value: result.benchmarks?.nifty_return, emoji: '📊' },
                  { label: 'Fixed Deposit', value: result.benchmarks?.fd_return, emoji: '🏦' },
                  { label: 'Gold', value: result.benchmarks?.gold_return, emoji: '✨' },
                ].map((b, i) => (
                  <div key={i} className="text-center p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                    <p className="text-2xl mb-2">{b.emoji}</p>
                    <p className={`text-lg font-black font-mono-data ${b.value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {b.value > 0 ? '+' : ''}{b.value}%
                    </p>
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mt-1">{b.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* SL/Target Status */}
            {(result.sl_hit || result.target_hit) && (
              <div className={`glass-panel p-5 border flex items-center gap-4 ${
                result.target_hit ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'
              }`}>
                {result.target_hit ? <CheckCircle className="w-6 h-6 text-emerald-400" /> : <Shield className="w-6 h-6 text-red-400" />}
                <div>
                  <p className="text-sm font-black text-white">
                    {result.target_hit ? `🎯 Target Hit!` : `🛡️ Stop Loss Triggered`}
                  </p>
                  <p className="text-xs text-zinc-500">
                    Exited on {result.exit_date} at ₹{result.exit_price?.toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
