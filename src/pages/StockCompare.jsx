import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, ArrowUpDown, TrendingUp, TrendingDown, Plus, X, Search, Target, Zap, Award } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom';

const PRESET_COMPARISONS = [
  { label: 'IT Giants', symbols: 'TCS,INFY,WIPRO,HCLTECH' },
  { label: 'Banks', symbols: 'HDFCBANK,ICICIBANK,SBIN,KOTAKBANK' },
  { label: 'Auto', symbols: 'TATAMOTORS,MARUTI,M&M' },
  { label: 'Pharma', symbols: 'SUNPHARMA,CIPLA,DRREDDY' },
];

const SCORE_COLORS = ['#8b5cf6', '#0ea5e9', '#f59e0b', '#10b981', '#ef4444'];

export default function StockCompare() {
  const navigate = useNavigate();
  const [symbols, setSymbols] = useState('TCS,INFY');
  const [inputVal, setInputVal] = useState('TCS,INFY');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchComparison = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/compare?symbols=${symbols}`);
      setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [symbols]);

  useEffect(() => { fetchComparison(); }, [fetchComparison]);

  const handleCompare = () => {
    if (inputVal.trim()) setSymbols(inputVal.trim().toUpperCase());
  };

  const radarData = data?.stocks ? Object.keys(data.stocks[0]?.scores || {}).map(key => {
    const point = { metric: key.charAt(0).toUpperCase() + key.slice(1) };
    data.stocks.forEach(s => { point[s.symbol] = s.scores[key]; });
    return point;
  }) : [];

  const returnsData = data?.stocks ? Object.keys(data.stocks[0]?.returns || {}).map(period => {
    const point = { period };
    data.stocks.forEach(s => { point[s.symbol] = s.returns[period]; });
    return point;
  }) : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center">
            <ArrowUpDown className="w-6 h-6 text-cyan-400" />
          </div>
          Stock Comparison
        </h1>
        <p className="text-zinc-500 mt-2 text-sm">Compare fundamentals, technicals & scores side-by-side</p>
      </div>

      {/* Search Bar */}
      <div className="glass-panel p-5">
        <div className="flex gap-3 items-center">
          <Search className="w-5 h-5 text-zinc-600 shrink-0" />
          <input value={inputVal} onChange={e => setInputVal(e.target.value.toUpperCase())}
            placeholder="Enter symbols separated by commas (e.g. TCS,INFY,WIPRO)"
            onKeyDown={e => e.key === 'Enter' && handleCompare()}
            className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder:text-zinc-700" />
          <button onClick={handleCompare}
            className="px-5 py-2.5 bg-primary text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-primary-hover transition-all">Compare</button>
        </div>
        <div className="flex gap-2 mt-3">
          <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest py-1">Quick:</span>
          {PRESET_COMPARISONS.map(p => (
            <button key={p.label} onClick={() => { setInputVal(p.symbols); setSymbols(p.symbols); }}
              className="text-[10px] font-bold px-3 py-1 rounded-lg bg-white/[0.03] text-zinc-500 hover:text-white hover:bg-white/[0.06] border border-white/[0.06] transition-all">{p.label}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : data && (
        <>
          {/* AI Recommendation */}
          <div className="glass-panel p-5 border-primary/20 bg-primary/[0.02] flex items-center gap-4">
            <Award className="w-8 h-8 text-primary shrink-0" />
            <p className="text-sm text-zinc-400">{data.recommendation}</p>
          </div>

          {/* Price Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {data.stocks.map((s, i) => (
              <motion.div key={s.symbol} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                onClick={() => navigate(`/stock/${s.symbol}`)}
                className="glass-panel p-5 text-center hover:border-white/15 transition-all cursor-pointer group">
                <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center font-black text-sm text-white"
                  style={{ background: `${SCORE_COLORS[i % SCORE_COLORS.length]}20`, color: SCORE_COLORS[i % SCORE_COLORS.length] }}>
                  {s.symbol.slice(0, 2)}
                </div>
                <p className="text-lg font-black text-white group-hover:text-primary transition-colors">{s.symbol}</p>
                <p className="text-xl font-black text-white font-mono-data mt-1">₹{s.price.toLocaleString()}</p>
                <p className={`text-sm font-bold mt-1 ${s.change_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{s.change_pct >= 0 ? '+' : ''}{s.change_pct}%</p>
              </motion.div>
            ))}
          </div>

          {/* Radar Chart */}
          <div className="glass-panel p-6">
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">Score Radar</h3>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#71717a', fontSize: 11 }} />
                <PolarRadiusAxis tick={{ fill: '#52525b', fontSize: 9 }} />
                {data.stocks.map((s, i) => (
                  <Radar key={s.symbol} name={s.symbol} dataKey={s.symbol} stroke={SCORE_COLORS[i % SCORE_COLORS.length]}
                    fill={SCORE_COLORS[i % SCORE_COLORS.length]} fillOpacity={0.15} strokeWidth={2} />
                ))}
              </RadarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-6 mt-2">
              {data.stocks.map((s, i) => (
                <div key={s.symbol} className="flex items-center gap-2 text-xs text-zinc-500">
                  <div className="w-3 h-3 rounded" style={{ background: SCORE_COLORS[i % SCORE_COLORS.length] }} />
                  {s.symbol}
                </div>
              ))}
            </div>
          </div>

          {/* Returns Comparison */}
          <div className="glass-panel p-6">
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">Returns Comparison (%)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={returnsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#52525b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#52525b' }} tickFormatter={v => `${v}%`} />
                <Tooltip contentStyle={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }} />
                {data.stocks.map((s, i) => (
                  <Bar key={s.symbol} dataKey={s.symbol} fill={SCORE_COLORS[i % SCORE_COLORS.length]} radius={[4, 4, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Fundamentals Table */}
          <div className="glass-panel overflow-hidden">
            <div className="p-5 border-b border-white/[0.04]">
              <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Fundamental Comparison</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.04]">
                    <th className="text-left p-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Metric</th>
                    {data.stocks.map(s => (
                      <th key={s.symbol} className="text-center p-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">{s.symbol}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Market Cap', key: 'market_cap' },
                    { label: 'P/E Ratio', key: 'pe_ratio', winner: data.winners.pe_ratio },
                    { label: 'P/B Ratio', key: 'pb_ratio' },
                    { label: 'ROE (%)', key: 'roe', winner: data.winners.roe },
                    { label: 'EPS', key: 'eps' },
                    { label: 'Div. Yield (%)', key: 'dividend_yield', winner: data.winners.dividend_yield },
                    { label: 'D/E Ratio', key: 'debt_equity' },
                    { label: 'Beta', key: 'beta', winner: data.winners.beta },
                    { label: '52W High', key: '52w_high' },
                    { label: '52W Low', key: '52w_low' },
                    { label: 'Rev Growth (%)', key: 'revenue_growth' },
                    { label: 'Profit Growth (%)', key: 'profit_growth' },
                  ].map((metric) => (
                    <tr key={metric.key} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors">
                      <td className="p-4 text-xs font-bold text-zinc-500">{metric.label}</td>
                      {data.stocks.map(s => (
                        <td key={s.symbol} className={`p-4 text-center font-mono-data text-xs ${metric.winner === s.symbol ? 'text-primary font-black' : 'text-white'}`}>
                          {typeof s[metric.key] === 'number' ? s[metric.key].toLocaleString() : s[metric.key]}
                          {metric.winner === s.symbol && <span className="ml-1 text-primary">★</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
