import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, MessageSquare, Key, X, Smartphone, CheckCircle2, Lock, RefreshCw, FileText, Building2, Clock, AlertTriangle, ExternalLink, Copy, Hash } from 'lucide-react';
import axios from 'axios';
import { useToast } from './Toast';
import { useUser } from '../context/UserContext';
import { API_BASE_URL } from '../config';

export default function CDSLModal({ isOpen, onClose, onAuthorized, stockSymbol, quantity }) {
  const toast = useToast();
  const { user } = useUser();
  const [step, setStep] = useState(0); // 0: Info, 1: T-PIN, 2: OTP, 3: Success
  const [tpin, setTpin] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [authData, setAuthData] = useState(null);
  const [dematInfo, setDematInfo] = useState(null);
  const [otpTimer, setOtpTimer] = useState(120);
  const [isin, setIsin] = useState('');
  const [hashingEffect, setHashingEffect] = useState(false);
  const otpRefs = useRef([]);

  const fetchDematInfo = React.useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/cdsl/demat-info?user_id=${user.id}`);
      setDematInfo(res.data.demat);
      const holding = res.data.holdings?.find(h => h.symbol === stockSymbol?.toUpperCase()?.replace('.NS', ''));
      if (holding) setIsin(holding.isin);
    } catch (e) {
      console.error('Demat fetch err', e);
    }
  }, [user, stockSymbol]);

  useEffect(() => {
    if (isOpen && user) {
      Promise.resolve().then(() => {
        setStep(0);
        setTpin('');
        setOtp(['', '', '', '', '', '']);
        setAuthData(null);
        setOtpTimer(120);
        fetchDematInfo();
      });
    }
  }, [isOpen, user, fetchDematInfo]);

  useEffect(() => {
    let interval;
    if (step === 2 && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, otpTimer]);

  const handleVerifyTPIN = async () => {
    if (tpin.length < 6 || !user) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/cdsl/verify-tpin?user_id=${user.id}`, {
        ticker: stockSymbol,
        tpin: tpin
      });
      toast.success(res.data.message);
      setIsin(res.data.isin);
      setHashingEffect(true);
      setTimeout(() => {
        setHashingEffect(false);
        setStep(2);
        setOtpTimer(120);
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid T-PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpStr = otp.join('');
    if (otpStr.length < 6 || !user) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/cdsl/verify-otp?user_id=${user.id}`, {
        ticker: stockSymbol,
        otp: otpStr,
        quantity: quantity
      });
      setAuthData(res.data);
      setHashingEffect(true);
      setTimeout(() => {
        setHashingEffect(false);
        setStep(3);
        setTimeout(() => {
          onAuthorized();
          onClose();
        }, 4000);
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const cleanSymbol = stockSymbol?.toUpperCase()?.replace('.NS', '') || '';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
      />
      
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 30 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-lg bg-[#0a0e1a] border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.8)]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0d1225] to-[#101830] p-6 border-b border-white/[0.06]">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                <ShieldCheck className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white leading-none flex items-center gap-2">
                  CDSL E-DIS
                  <span className="text-[8px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded-full font-bold uppercase tracking-widest border border-blue-500/20">Secure</span>
                </h3>
                <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mt-1 font-bold">
                  Electronic Delivery Instruction Slip
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
              <X className="w-5 h-5 text-zinc-500" />
            </button>
          </div>

          {/* Stock Info Bar */}
          <div className="mt-5 flex items-center gap-4 p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
            <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
              <span className="font-black text-primary text-lg">{cleanSymbol.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">{cleanSymbol}</p>
              <p className="text-[10px] text-zinc-600 font-mono-data truncate">{isin || 'Loading ISIN...'}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-white font-mono-data">{quantity} shares</p>
              <p className="text-[10px] text-zinc-600">Auth. Quantity</p>
            </div>
          </div>
        </div>

        {/* Step Progress */}
        <div className="px-6 pt-5 pb-2">
          <div className="flex items-center gap-2">
            {['Verify Identity', 'OTP Verification', 'DIS Generated'].map((label, idx) => (
              <div key={idx} className="flex-1 flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                  idx < step ? 'bg-emerald-500 text-white' :
                  idx === step || (step === 0 && idx === 0) ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' :
                  'bg-white/[0.06] text-zinc-600'
                }`}>
                  {idx < step ? '✓' : idx + 1}
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wider hidden sm:inline ${
                  idx <= step ? 'text-zinc-400' : 'text-zinc-700'
                }`}>{label}</span>
                {idx < 2 && <div className={`flex-1 h-px ${idx < step ? 'bg-emerald-500' : 'bg-white/[0.06]'}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 relative">
          {/* Hashing Overlay */}
          <AnimatePresence>
            {hashingEffect && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-[#0a0e1a]/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center"
              >
                 <div className="relative w-24 h-24 mb-6">
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 border-2 border-dashed border-blue-500/40 rounded-full" 
                    />
                    <motion.div 
                      animate={{ rotate: -360 }} 
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-2 border-t-2 border-blue-400 rounded-full" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <ShieldCheck className="w-10 h-10 text-blue-400" />
                    </div>
                 </div>
                 <h4 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-2">Establishing Nexus Tunnel</h4>
                 <div className="w-full max-w-[200px] bg-white/[0.04] h-1.5 rounded-full overflow-hidden mb-3 border border-white/[0.06]">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2 }}
                      className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                    />
                 </div>
                 <p className="text-[10px] font-mono text-zinc-500 flex flex-wrap justify-center gap-1">
                    {['0x82f', 'SHA-256', 'SSL_PIN', 'CDSL_AUTH', 'TR_ID_882', 'NONCE_71'].map((tag, i) => (
                      <motion.span 
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity }}
                        className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.08]"
                      >
                        {tag}
                      </motion.span>
                    ))}
                 </p>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence mode="wait">
            {/* STEP 0: Demat Info & Authorization Notice */}
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                
                {/* Demat Details Card */}
                {dematInfo && (
                  <div className="p-4 bg-[#0c1020] rounded-2xl border border-white/[0.06] space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Building2 className="w-4 h-4 text-blue-400" />
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Demat Account</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2.5 bg-white/[0.03] rounded-xl">
                        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">DP ID</p>
                        <p className="text-xs font-bold text-white font-mono-data flex items-center gap-1.5">
                          {dematInfo.dp_id}
                          <button onClick={() => copyToClipboard(dematInfo.dp_id)} className="text-zinc-600 hover:text-primary"><Copy className="w-3 h-3" /></button>
                        </p>
                      </div>
                      <div className="p-2.5 bg-white/[0.03] rounded-xl">
                        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">BO ID</p>
                        <p className="text-xs font-bold text-white font-mono-data flex items-center gap-1.5">
                          {dematInfo.bo_id?.slice(-8)}
                          <button onClick={() => copyToClipboard(dematInfo.bo_id)} className="text-zinc-600 hover:text-primary"><Copy className="w-3 h-3" /></button>
                        </p>
                      </div>
                      <div className="p-2.5 bg-white/[0.03] rounded-xl">
                        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">Depository</p>
                        <p className="text-xs font-bold text-blue-400">{dematInfo.depository}</p>
                      </div>
                      <div className="p-2.5 bg-white/[0.03] rounded-xl">
                        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">POA Status</p>
                        <p className="text-xs font-bold text-amber-400">{dematInfo.poa_status}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sell Info Notice */}
                <div className="p-4 bg-amber-500/5 border border-amber-500/15 rounded-2xl flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      To sell <span className="text-white font-bold">{quantity} shares</span> of <span className="text-primary font-bold">{cleanSymbol}</span>, 
                      CDSL E-DIS authorization is mandatory as per SEBI regulations.
                    </p>
                    <p className="text-[10px] text-zinc-600 mt-2">
                      Authorization valid for <span className="text-white font-bold">24 hours</span> from verification.
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setStep(1)}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl hover:shadow-[0_0_40px_rgba(59,130,246,0.25)] transition-all flex items-center justify-center gap-2"
                >
                  <Key className="w-5 h-5" /> Proceed with T-PIN
                </button>
              </motion.div>
            )}

            {/* STEP 1: T-PIN Entry */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                    <Key className="w-8 h-8 text-blue-400" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-1">Enter CDSL T-PIN</h4>
                  <p className="text-xs text-zinc-500">The 6-digit T-PIN set via your CDSL account</p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type="password"
                      placeholder="● ● ● ● ● ●"
                      maxLength={6}
                      value={tpin}
                      onChange={(e) => setTpin(e.target.value.replace(/\D/g, ''))}
                      onKeyDown={(e) => e.key === 'Enter' && handleVerifyTPIN()}
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl py-4 pl-12 pr-4 text-white text-lg font-mono-data tracking-[0.5em] focus:border-blue-500/50 outline-none transition-all placeholder:tracking-[0.3em] placeholder:text-zinc-700 placeholder:text-base text-center"
                      autoFocus
                    />
                  </div>
                  <button 
                    onClick={handleVerifyTPIN}
                    disabled={tpin.length < 6 || loading}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl hover:shadow-[0_0_40px_rgba(59,130,246,0.25)] transition-all disabled:opacity-40 disabled:shadow-none flex items-center justify-center gap-2"
                  >
                    {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Verify & Send OTP'}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button onClick={() => setStep(0)} className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest hover:text-zinc-400 transition-colors">← Back</button>
                  <a href="https://edis.cdslindia.com/home/generatetpin" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors flex items-center gap-1">
                    Generate T-PIN <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </motion.div>
            )}

            {/* STEP 2: OTP Entry */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div className="text-center">
                  <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
                    <Smartphone className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-1">OTP Verification</h4>
                  <p className="text-xs text-zinc-500">
                    Sent to {dematInfo?.registered_mobile || '******XX'} & {dematInfo?.registered_email || 'd***@email.com'}
                  </p>
                </div>

                {/* OTP Input Grid */}
                <div className="flex justify-center gap-3">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => otpRefs.current[idx] = el}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value.replace(/\D/g, ''))}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-12 h-14 bg-white/[0.03] border border-white/[0.08] rounded-xl text-center text-xl font-black text-white font-mono-data focus:border-indigo-500/50 focus:bg-indigo-500/5 outline-none transition-all"
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>

                {/* Timer */}
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-zinc-600" />
                  <span className={`text-xs font-bold font-mono-data ${otpTimer <= 30 ? 'text-red-400' : 'text-zinc-500'}`}>
                    {otpTimer > 0 ? `OTP expires in ${formatTimer(otpTimer)}` : 'OTP Expired'}
                  </span>
                  {otpTimer === 0 && (
                    <button onClick={() => { setOtpTimer(120); toast.info('OTP resent!'); }} className="text-[10px] font-bold text-blue-400 uppercase tracking-wider ml-2">Resend</button>
                  )}
                </div>

                <button 
                  onClick={handleVerifyOTP}
                  disabled={otp.join('').length < 6 || loading || otpTimer === 0}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black uppercase tracking-widest rounded-2xl hover:shadow-[0_0_40px_rgba(99,102,241,0.25)] transition-all disabled:opacity-40 disabled:shadow-none flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><ShieldCheck className="w-5 h-5" /> Authorize E-DIS</>}
                </button>

                <button onClick={() => setStep(1)} className="text-center w-full text-[10px] font-bold text-zinc-600 uppercase tracking-widest hover:text-zinc-400 transition-colors">← Re-enter T-PIN</button>
              </motion.div>
            )}

            {/* STEP 3: Success with DIS Slip */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 py-4">
                <div className="text-center">
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    transition={{ type: 'spring', damping: 12 }}
                    className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_60px_rgba(16,185,129,0.4)] relative"
                  >
                    <CheckCircle2 className="w-10 h-10 text-white" />
                    <motion.div 
                      animate={{ scale: [1, 1.3, 1], opacity: [0, 0.3, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute inset-0 bg-emerald-500 rounded-full"
                    />
                  </motion.div>
                  <h3 className="text-2xl font-black text-white mt-4">E-DIS Authorized!</h3>
                  <p className="text-zinc-500 text-sm mt-1">Sell order will be executed automatically</p>
                </div>

                {/* DIS Slip Details */}
                {authData && (
                  <div className="p-4 bg-[#0c1020] rounded-2xl border border-emerald-500/20 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">DIS Slip Details</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-white/[0.03] rounded-lg">
                        <p className="text-[9px] text-zinc-600 font-bold uppercase">DIS No.</p>
                        <p className="font-bold text-white font-mono-data text-[11px]">{authData.dis_slip_no}</p>
                      </div>
                      <div className="p-2 bg-white/[0.03] rounded-lg">
                        <p className="text-[9px] text-zinc-600 font-bold uppercase">ISIN</p>
                        <p className="font-bold text-white font-mono-data text-[11px]">{authData.isin}</p>
                      </div>
                      <div className="p-2 bg-white/[0.03] rounded-lg">
                        <p className="text-[9px] text-zinc-600 font-bold uppercase">DP ID</p>
                        <p className="font-bold text-white font-mono-data text-[11px]">{authData.dp_id}</p>
                      </div>
                      <div className="p-2 bg-white/[0.03] rounded-lg">
                        <p className="text-[9px] text-zinc-600 font-bold uppercase">Settlement</p>
                        <p className="font-bold text-white font-mono-data text-[11px]">{authData.settlement_id}</p>
                      </div>
                      <div className="col-span-2 p-2 bg-white/[0.03] rounded-lg">
                        <p className="text-[9px] text-zinc-600 font-bold uppercase">Auth Expiry</p>
                        <p className="font-bold text-amber-400 font-mono-data text-[11px]">{authData.expiry}</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-5 bg-white/[0.02] border-t border-white/[0.04]">
          <div className="flex items-center justify-center gap-5 text-[8px] font-bold text-zinc-600 uppercase tracking-[0.2em]">
            <span className="flex items-center gap-1.5"><Lock className="w-3 h-3" /> 256-bit Encrypted</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> SEBI Regulated</span>
            <span className="flex items-center gap-1.5"><Building2 className="w-3 h-3" /> CDSL Depository</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
