import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Building2, Clock, FileText, RefreshCw, CheckCircle2, XCircle, Key, Lock, Copy, ExternalLink, AlertTriangle, ChevronRight, Hash, Smartphone, Globe, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function CDSLDashboard() {
  const toast = useToast();
  const { user, isLiveMode } = useUser();
  const [demat, setDemat] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [authHistory, setAuthHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bulkTpin, setBulkTpin] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedForBulk, setSelectedForBulk] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [dematRes, historyRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/cdsl/demat-info?user_id=${user.id}`),
        axios.get(`${API_BASE_URL}/api/cdsl/history?user_id=${user.id}`)
      ]);
      setDemat(dematRes.data.demat);
      setHoldings(dematRes.data.holdings || []);
      setAuthHistory(historyRes.data.history || []);
    } catch (err) {
      console.error('CDSL fetch error', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData, isLiveMode]);

  const toggleBulkSelect = (symbol) => {
    setSelectedForBulk(prev => 
      prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol]
    );
  };

  const handleBulkAuthorize = async () => {
    if (bulkTpin.length < 6 || !user) { toast.error('Enter valid T-PIN'); return; }
    if (selectedForBulk.length === 0) { toast.error('Select at least one holding'); return; }
    
    setBulkLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/cdsl/bulk-authorize?user_id=${user.id}`, {
        symbols: selectedForBulk,
        tpin: bulkTpin
      });
      toast.success(res.data.message);
      setBulkMode(false);
      setBulkTpin('');
      setSelectedForBulk([]);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Bulk authorization failed');
    } finally {
      setBulkLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied');
  };

  const activeAuths = holdings.filter(h => h.authorized);
  const pendingAuths = holdings.filter(h => !h.authorized);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-white/[0.06] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            CDSL E-DIS Dashboard
            <button onClick={fetchData} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
              <RefreshCw className={`w-4 h-4 text-zinc-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </h1>
          <p className="text-sm text-zinc-500 mt-1 ml-[52px]">Managing demat authorizations for {user?.full_name || user?.username}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setBulkMode(!bulkMode)}
            className={`flex items-center gap-2 text-xs font-black px-4 py-2.5 rounded-xl border uppercase tracking-widest transition-all ${
              bulkMode ? 'bg-blue-500 text-white border-blue-500' : 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Bulk Authorize
          </button>
          <a 
            href="https://edis.cdslindia.com" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-black text-zinc-400 bg-white/[0.04] hover:bg-white/[0.08] px-4 py-2.5 rounded-xl border border-white/[0.08] uppercase tracking-widest transition-all"
          >
            <ExternalLink className="w-4 h-4" /> CDSL Portal
          </a>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      ) : (
        <>
          {/* Demat Account Card */}
          {demat && (
            <div className="glass-panel overflow-hidden">
              <div className="bg-gradient-to-r from-[#0d1225] to-[#101830] p-6 border-b border-white/[0.06]">
                <div className="flex items-center gap-3 mb-5">
                  <Building2 className="w-5 h-5 text-blue-400" />
                  <h2 className="text-sm font-black text-white uppercase tracking-widest">Demat Account Details</h2>
                  <span className={`ml-auto px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    demat.demat_status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {demat.demat_status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'DP ID', value: demat.dp_id, copyable: true },
                    { label: 'BO ID (Client)', value: demat.bo_id, copyable: true },
                    { label: 'Client ID', value: demat.client_id },
                    { label: 'Depository', value: demat.depository, badge: true },
                    { label: 'POA Status', value: demat.poa_status, badge: true, badgeColor: 'amber' },
                    { label: 'Registered Mobile', value: demat.registered_mobile },
                    { label: 'Registered Email', value: demat.registered_email },
                    { label: 'PAN', value: demat.pan },
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.04]">
                      <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-1">{item.label}</p>
                      {item.badge ? (
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-md ${
                          item.badgeColor === 'amber' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'
                        }`}>{item.value}</span>
                      ) : (
                        <p className="text-xs font-bold text-white font-mono-data flex items-center gap-1.5">
                          {item.value}
                          {item.copyable && (
                            <button onClick={() => copyToClipboard(item.value)} className="text-zinc-700 hover:text-primary transition-colors">
                              <Copy className="w-3 h-3" />
                            </button>
                          )}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Nominee */}
              <div className="p-4 flex items-center gap-3 bg-white/[0.02]">
                <User className="w-4 h-4 text-zinc-600" />
                <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Nominee:</span>
                <span className="text-xs text-white font-bold">{demat.nominee}</span>
              </div>
            </div>
          )}

          {/* Bulk Authorize Panel */}
          <AnimatePresence>
            {bulkMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-panel p-6 border-2 border-blue-500/20 overflow-hidden"
              >
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Bulk CDSL Authorization</h3>
                  <span className="text-[10px] text-zinc-600">— Select holdings below and enter T-PIN to authorize all</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                      type="password"
                      placeholder="Enter T-PIN"
                      maxLength={6}
                      value={bulkTpin}
                      onChange={(e) => setBulkTpin(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 pl-11 pr-4 text-white font-mono-data tracking-widest focus:border-blue-500/50 outline-none"
                    />
                  </div>
                  <button
                    onClick={handleBulkAuthorize}
                    disabled={bulkTpin.length < 6 || selectedForBulk.length === 0 || bulkLoading}
                    className="px-6 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-all disabled:opacity-40 flex items-center gap-2"
                  >
                    {bulkLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    Authorize {selectedForBulk.length} Stock{selectedForBulk.length !== 1 ? 's' : ''}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Holdings Authorization Status */}
          <div className="glass-panel overflow-hidden">
            <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
              <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Key className="w-4 h-4 text-zinc-500" />
                Holdings Authorization Status
              </h2>
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
                <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {activeAuths.length} Authorized</span>
                <span className="text-amber-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {pendingAuths.length} Pending</span>
              </div>
            </div>

            {holdings.length === 0 ? (
              <div className="p-12 text-center">
                <Lock className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-zinc-400">No Holdings Found</h3>
                <p className="text-sm text-zinc-600 mt-1">Acquire assets to manage authorizations here.</p>
                <Link to="/" className="inline-block mt-4 px-5 py-2.5 bg-primary/10 border border-primary/20 text-primary text-sm font-bold rounded-xl hover:bg-primary/20 transition-all no-underline">
                  Explore Equities
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-zinc-500 text-[10px] uppercase tracking-widest">
                      {bulkMode && <th className="py-4 px-5 font-bold w-10"></th>}
                      <th className="py-4 px-5 font-bold">Symbol</th>
                      <th className="py-4 px-5 font-bold">ISIN</th>
                      <th className="py-4 px-5 font-bold text-right">Qty</th>
                      <th className="py-4 px-5 font-bold text-center">Auth Status</th>
                      <th className="py-4 px-5 font-bold text-right">Auth Qty</th>
                      <th className="py-4 px-5 font-bold text-right">Expiry</th>
                      <th className="py-4 px-5 font-bold">DIS Slip</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((h, i) => (
                      <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                        {bulkMode && (
                          <td className="py-3.5 px-5">
                            <input 
                              type="checkbox"
                              checked={selectedForBulk.includes(h.symbol)}
                              onChange={() => toggleBulkSelect(h.symbol)}
                              disabled={h.authorized}
                              className="accent-blue-500 w-4 h-4 cursor-pointer disabled:opacity-30"
                            />
                          </td>
                        )}
                        <td className="py-3.5 px-5">
                          <Link to={`/stock/${h.symbol}`} className="font-bold text-white hover:text-primary transition-colors text-sm no-underline">{h.symbol}</Link>
                          <p className="text-[9px] text-zinc-600">{h.exchange} • {h.segment}</p>
                        </td>
                        <td className="py-3.5 px-5 text-[11px] font-mono-data text-zinc-400">{h.isin}</td>
                        <td className="py-3.5 px-5 text-right font-bold text-white font-mono-data">{h.quantity}</td>
                        <td className="py-3.5 px-5 text-center">
                          {h.authorized ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Authorized
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-right font-mono-data text-sm">
                          {h.authorized ? <span className="text-emerald-400 font-bold">{h.authorized_qty}</span> : <span className="text-zinc-600">—</span>}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          {h.authorized ? (
                            <div>
                              <p className="text-[10px] font-mono-data text-zinc-400">{h.authorized_until?.replace('T', ' ')?.slice(0,19)}</p>
                              <p className="text-[9px] text-emerald-400 font-bold">{h.remaining_hours}h remaining</p>
                            </div>
                          ) : (
                            <span className="text-zinc-600 text-[10px]">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-5">
                          {h.dis_slip_no ? (
                            <p className="text-[10px] font-mono-data text-zinc-400">{h.dis_slip_no}</p>
                          ) : (
                            <span className="text-zinc-700 text-[10px]">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Authorization History */}
          <div className="glass-panel overflow-hidden">
            <div className="p-5 border-b border-white/[0.06]">
              <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-4 h-4 text-zinc-500" />
                DIS Slip History ({authHistory.length})
              </h2>
            </div>

            {authHistory.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-zinc-400">No DIS slips generated yet</h3>
                <p className="text-sm text-zinc-600 mt-1">Authorization records will appear here after T-PIN verification</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-zinc-500 text-[10px] uppercase tracking-widest">
                      <th className="py-4 px-5 font-bold">DIS Slip No.</th>
                      <th className="py-4 px-5 font-bold">Symbol</th>
                      <th className="py-4 px-5 font-bold">ISIN</th>
                      <th className="py-4 px-5 font-bold text-right">Qty</th>
                      <th className="py-4 px-5 font-bold">DP ID</th>
                      <th className="py-4 px-5 font-bold text-center">Status</th>
                      <th className="py-4 px-5 font-bold text-right">Auth Date</th>
                      <th className="py-4 px-5 font-bold text-right">Expiry</th>
                    </tr>
                  </thead>
                  <tbody>
                    {authHistory.map((h, i) => (
                      <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-5 text-[11px] font-mono-data text-blue-400 font-bold">{h.dis_slip_no}</td>
                        <td className="py-3.5 px-5 font-bold text-white text-sm">{h.symbol}</td>
                        <td className="py-3.5 px-5 text-[11px] font-mono-data text-zinc-400">{h.isin}</td>
                        <td className="py-3.5 px-5 text-right font-bold text-zinc-300 font-mono-data">{h.quantity}</td>
                        <td className="py-3.5 px-5 text-[11px] font-mono-data text-zinc-500">{h.dp_id}</td>
                        <td className="py-3.5 px-5 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            h.status === 'ACTIVE' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                          }`}>
                            {h.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right text-[10px] font-mono-data text-zinc-500">{h.authorized_at?.slice(0,19)}</td>
                        <td className="py-3.5 px-5 text-right text-[10px] font-mono-data text-zinc-500">{h.expiry?.slice(0,19)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}
