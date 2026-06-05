import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ClipboardList, Filter, XCircle, CheckCircle2, Clock, ArrowUpRight, ArrowDownRight, Hash, FileText, ChevronDown, Search, Zap, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function OrderBook() {
  const toast = useToast();
  const { user, isLiveMode } = useUser();
  const [orders, setOrders] = useState([]);
  const [gttOrders, setGttOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('orders'); // orders | gtt
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [ordersRes, gttRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/orders?status=${activeFilter}&user_id=${user.id}`),
        axios.get(`${API_BASE_URL}/api/gtt/list?user_id=${user.id}`)
      ]);
      setOrders(ordersRes.data.orders || []);
      setGttOrders(gttRes.data.gtt_orders || []);
    } catch (err) {
      console.error('Order fetch error', err);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [user, activeFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders, isLiveMode]);

  const handleCancel = async (orderId, isGtt = false) => {
    if (!user) return;
    try {
      const endpoint = isGtt ? '/api/gtt/cancel' : '/api/orders/cancel';
      await axios.post(`${API_BASE_URL}${endpoint}?user_id=${user.id}`, { order_id: orderId });
      toast.success(`Order ${orderId} cancelled`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Cancel failed');
    }
  };

  const statusColors = {
    'EXECUTED': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    'PENDING': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
    'CANCELLED': { bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-500/20' },
    'REJECTED': { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
    'ACTIVE': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    'TRIGGERED': { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  };

  const filters = ['ALL', 'EXECUTED', 'PENDING', 'CANCELLED', 'REJECTED'];

  const filteredOrders = orders.filter(o => 
    !searchTerm || o.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) || o.order_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGtt = gttOrders.filter(o => 
    !searchTerm || o.symbol?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const orderStats = {
    total: orders.length,
    executed: orders.filter(o => o.status === 'EXECUTED').length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    cancelled: orders.filter(o => o.status === 'CANCELLED').length,
  };

  if (!user && !loading) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <UserIcon className="w-16 h-16 text-zinc-700 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Access Restricted</h2>
            <p className="text-zinc-500 mb-6">Log in to view your personalized trade history and orders.</p>
            <Link to="/login" className="px-6 py-3 bg-primary text-black font-bold rounded-xl no-underline">Go to Login</Link>
        </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-10">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-white/[0.06] flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-blue-400" />
            </span>
            Order Book
            <button onClick={fetchOrders} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
              <RefreshCw className={`w-4 h-4 text-zinc-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </h1>
          <p className="text-sm text-zinc-500 mt-1 ml-[52px]">Managing active trades for {user?.full_name || user?.username} in {isLiveMode ? 'Live' : 'Demo'} mode</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input
              type="text"
              placeholder="Filter by asset..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/[0.04] border border-white/[0.06] rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/30 w-48 placeholder:text-zinc-600"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: orderStats.total, icon: <ClipboardList className="w-4 h-4" />, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
          { label: 'Executed', value: orderStats.executed, icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
          { label: 'Pending', value: orderStats.pending, icon: <Clock className="w-4 h-4" />, color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
          { label: 'GTT Active', value: gttOrders.filter(g => g.status === 'ACTIVE').length, icon: <Zap className="w-4 h-4" />, color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-5 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-16 h-16 ${stat.bgColor} rounded-full blur-[30px] group-hover:scale-125 transition-transform pointer-events-none`} />
            <div className={`w-8 h-8 ${stat.bgColor} rounded-lg flex items-center justify-center mb-3 ${stat.color} group-hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all`}>
              {stat.icon}
            </div>
            <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-extrabold text-white font-mono-data">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tab + Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex bg-white/[0.03] p-1 rounded-xl border border-white/[0.06]">
          <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'orders' ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}>
            Orders History ({orders.length})
          </button>
          <button onClick={() => setActiveTab('gtt')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'gtt' ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}>
            Trigger Rules ({gttOrders.length})
          </button>
        </div>
        
        {activeTab === 'orders' && (
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-zinc-600" />
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                  activeFilter === f ? 'bg-white/10 text-white border border-white/10' : 'text-zinc-600 hover:text-zinc-400 border border-transparent'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Orders Table */}
      {activeTab === 'orders' && (
        <div className="glass-panel overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-3">
              {[1,2,3,4].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <ClipboardList className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-zinc-400">Order trail empty for this user</h3>
              <p className="text-sm text-zinc-600 mt-1">Acquire stock to generate detailed trade logs.</p>
              <Link to="/" className="inline-block mt-4 px-5 py-2.5 bg-primary/10 border border-primary/20 text-primary text-sm font-bold rounded-xl hover:bg-primary/20 transition-all no-underline">
                Explore Markets
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.06] text-zinc-500 text-[10px] uppercase tracking-widest">
                    <th className="py-5 px-6 font-bold">Order Details</th>
                    <th className="py-5 px-6 font-bold">Trading Symbol</th>
                    <th className="py-5 px-6 font-bold">Transaction</th>
                    <th className="py-5 px-6 font-bold text-right">Fill Qty</th>
                    <th className="py-5 px-6 font-bold text-right">Execution Price</th>
                    <th className="py-5 px-6 font-bold text-center">Status</th>
                    <th className="py-5 px-6 font-bold text-right">Timestamp</th>
                    <th className="py-5 px-6 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, i) => {
                    const isBuy = order.transaction_type === 'BUY';
                    const sc = statusColors[order.status] || statusColors['PENDING'];
                    return (
                      <motion.tr
                        key={order.order_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="py-4 px-6">
                          <p className="text-[11px] font-mono-data text-zinc-400 font-bold tracking-tight">#{order.order_id}</p>
                          <p className="text-[9px] text-zinc-700 font-mono-data uppercase">{order.product_type} • CNC</p>
                        </td>
                        <td className="py-4 px-6">
                          <Link to={`/stock/${order.symbol}`} className="text-sm font-bold text-white group-hover:text-primary transition-colors no-underline">{order.symbol}</Link>
                          <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter">NSE • Equity</p>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`flex items-center gap-1 text-[11px] font-black tracking-wider ${isBuy ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isBuy ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                            {order.transaction_type}
                          </span>
                          <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-black">{order.order_type}</p>
                        </td>
                        <td className="py-4 px-6 text-right font-bold text-zinc-300 font-mono-data text-sm">
                          {order.filled_qty}<span className="text-zinc-600 mx-1">/</span>{order.quantity}
                        </td>
                        <td className="py-4 px-6 text-right font-bold text-white font-mono-data text-sm">
                          ₹{order.avg_fill_price?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || order.price?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${sc.bg} ${sc.text} ${sc.border}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <p className="text-[10px] text-zinc-500 font-mono-data">{order.placed_at?.replace('T', ' ')?.slice(0,19)}</p>
                          <p className="text-[8px] text-zinc-700 tracking-widest">GATEWAY ACTIVE</p>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {order.status === 'PENDING' && (
                            <button
                              onClick={() => handleCancel(order.order_id)}
                              className="px-4 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black rounded-lg hover:bg-rose-500 hover:text-black transition-all uppercase tracking-wider"
                            >
                              Abort
                            </button>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* GTT Table */}
      {activeTab === 'gtt' && (
        <div className="glass-panel overflow-hidden">
          {filteredGtt.length === 0 ? (
            <div className="p-12 text-center">
              <Zap className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-zinc-400">Trigger set empty</h3>
              <p className="text-sm text-zinc-600 mt-1">Configure GTT triggers in stock control to automate trade execution.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.06] text-zinc-500 text-[10px] uppercase tracking-widest">
                    <th className="py-5 px-6 font-bold">Rule ID</th>
                    <th className="py-5 px-6 font-bold">Asset</th>
                    <th className="py-5 px-6 font-bold">Rule Type</th>
                    <th className="py-5 px-6 font-bold text-right">Trigger Threshold</th>
                    <th className="py-5 px-6 font-bold text-right">Rule Qty</th>
                    <th className="py-5 px-6 font-bold text-center">Status</th>
                    <th className="py-5 px-6 font-bold text-right">Valid Thru</th>
                    <th className="py-5 px-6 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGtt.map((gtt, i) => {
                    const sc = statusColors[gtt.status] || statusColors['ACTIVE'];
                    return (
                      <tr key={gtt.order_id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
                        <td className="py-4 px-6 text-[11px] font-mono-data text-zinc-400 font-bold">#{gtt.order_id}</td>
                        <td className="py-4 px-6 text-sm font-bold text-white group-hover:text-primary transition-colors">{gtt.symbol}</td>
                        <td className="py-4 px-6">
                          <span className={`text-[10px] font-black tracking-widest ${gtt.transaction_type === 'BUY' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {gtt.transaction_type}
                          </span>
                          <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">{gtt.trigger_type}</p>
                        </td>
                        <td className="py-4 px-6 text-right font-bold text-amber-400 font-mono-data text-sm">₹{gtt.trigger_price?.toLocaleString()}</td>
                        <td className="py-4 px-6 text-right font-bold text-zinc-300 font-mono-data">{gtt.quantity}</td>
                        <td className="py-4 px-6 text-center">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${sc.bg} ${sc.text} ${sc.border}`}>
                            {gtt.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right text-[10px] text-zinc-500 font-mono-data">{gtt.expiry_date}</td>
                        <td className="py-4 px-6 text-right">
                          {gtt.status === 'ACTIVE' && (
                            <button
                              onClick={() => handleCancel(gtt.order_id, true)}
                              className="px-4 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black rounded-lg hover:bg-red-500 hover:text-white transition-all uppercase tracking-wider"
                            >
                              Discard
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
