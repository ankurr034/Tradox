import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CreditCard, Landmark, CheckCircle2, Smartphone, ChevronRight, ArrowLeft, Lock, Building2, AlertCircle, FileCheck, UserCheck, RefreshCw, Upload, FileImage, X, Eye } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { useUser } from '../context/UserContext';
import { API_BASE_URL } from '../config';

const steps = [
  { id: 'PAN', title: 'Identity Verification', subtitle: 'Step 1 of 5', icon: <CreditCard className="w-6 h-6" /> },
  { id: 'AADHAAR', title: 'Digital ID Sync', subtitle: 'Step 2 of 5', icon: <Smartphone className="w-6 h-6" /> },
  { id: 'BANK', title: 'Bank Linkage', subtitle: 'Step 3 of 5', icon: <Landmark className="w-6 h-6" /> },
  { id: 'DOCUMENTS', title: 'Document Upload', subtitle: 'Step 4 of 5', icon: <Upload className="w-6 h-6" /> },
  { id: 'SUCCESS', title: 'Verification Complete', subtitle: 'Step 5 of 5', icon: <CheckCircle2 className="w-6 h-6" /> },
];

const DOC_TYPES = [
  { key: 'pan_card', label: 'PAN Card', desc: 'Front side photo or scan' },
  { key: 'aadhaar_front', label: 'Aadhaar Front', desc: 'Front side with photo' },
  { key: 'aadhaar_back', label: 'Aadhaar Back', desc: 'Back side with address' },
  { key: 'bank_statement', label: 'Bank Statement', desc: 'Last 3 months (PDF)' },
  { key: 'selfie', label: 'Live Selfie', desc: 'Clear face photo for verification' },
];

export default function KYC() {
  const { user, refreshUser, profile } = useUser();
  const [currentStep, setCurrentStep] = useState('PAN');
  const [formData, setFormData] = useState({ pan: '', aadhaar: '', otp: '', bankName: '', accNo: '', ifsc: '', beneficiaryName: '', isInitialized: false, otpRequested: false });
  const [loading, setLoading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState({});
  const [uploading, setUploading] = useState(null);
  const fileInputRef = useRef(null);
  const [activeDocType, setActiveDocType] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (profile && user && !formData.isInitialized) {
      setFormData({
        pan: profile.pan || '', aadhaar: profile.aadhaar || '', otp: '', bankName: profile.bank_name || '',
        accNo: profile.bank_acc_no || '', ifsc: profile.bank_ifsc || '', beneficiaryName: user.full_name || 'USER',
        isInitialized: true, otpRequested: false
      });
      if (profile.bank_acc_no) setCurrentStep('DOCUMENTS');
      else if (profile.aadhaar) setCurrentStep('BANK');
      else if (profile.pan) setCurrentStep('AADHAAR');
    }
  }, [profile, user, formData.isInitialized]);

  const verifyPAN = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/kyc/verify-pan`, { pan: formData.pan }, { params: { user_id: user?.id } });
      toast.success('PAN Verified: ' + res.data.name);
      setFormData({ ...formData, beneficiaryName: res.data.name });
      setCurrentStep('AADHAAR');
    } catch (e) { toast.error(e.response?.data?.detail || 'PAN Verification Failed'); }
    finally { setLoading(false); }
  };

  const verifyAadhaar = async () => {
    setLoading(true);
    try {
      if (!formData.otp) {
        const res = await axios.post(`${API_BASE_URL}/api/kyc/verify-aadhaar`, { aadhaar: formData.aadhaar }, { params: { user_id: user?.id } });
        toast.info(res.data.message);
        setFormData({ ...formData, otpRequested: true });
      } else {
        await axios.post(`${API_BASE_URL}/api/kyc/verify-aadhaar`, { aadhaar: formData.aadhaar, otp: formData.otp }, { params: { user_id: user?.id } });
        toast.success('Aadhaar Verified Successfully');
        setCurrentStep('BANK');
      }
    } catch (e) { toast.error(e.response?.data?.detail || 'Aadhaar Verification Failed'); }
    finally { setLoading(false); }
  };

  const verifyBank = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/kyc/verify-bank`, {
        bank_name: formData.bankName, acc_no: formData.accNo, ifsc: formData.ifsc, beneficiary_name: formData.beneficiaryName
      }, { params: { user_id: user?.id } });
      toast.success('Bank Account Verified');
      setCurrentStep('DOCUMENTS');
    } catch (e) { toast.error(e.response?.data?.detail || 'Bank Verification Failed'); }
    finally { setLoading(false); }
  };

  const handleDocUpload = async (docType, file) => {
    if (!file) return;
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) { toast.error('File too large. Max 5MB.'); return; }
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['jpg','jpeg','png','pdf'].includes(ext)) { toast.error('Only JPG, PNG, PDF allowed'); return; }

    setUploading(docType);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('doc_type', docType);
    fd.append('user_id', user?.id || 1);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/kyc/upload-document`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUploadedDocs(prev => ({ ...prev, [docType]: { name: file.name, size: file.size, status: 'uploaded' } }));
      toast.success(res.data.message);
    } catch (e) { toast.error(e.response?.data?.detail || 'Upload failed'); }
    finally { setUploading(null); }
  };

  const triggerFileInput = (docType) => {
    setActiveDocType(docType);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0] && activeDocType) {
      handleDocUpload(activeDocType, e.target.files[0]);
    }
    e.target.value = '';
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/kyc/submit`, null, { params: { user_id: user?.id } });
      toast.success('KYC Verified! You are now authorized for live trading.');
      refreshUser();
      setCurrentStep('SUCCESS');
    } catch { toast.error('Final Submission Failed'); }
    finally { setLoading(false); }
  };

  const stepIdx = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 px-2 sm:px-4">
      <input type="file" ref={fileInputRef} className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} />

      {/* Progress */}
      <div className="flex justify-between items-center mb-6 sm:mb-12 relative overflow-x-auto pb-2 hide-scrollbar">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/[0.06] -z-10" />
        {steps.map((step, i) => {
          const isActive = currentStep === step.id;
          const isCompleted = stepIdx > i;
          return (
            <div key={step.id} className="flex flex-col items-center gap-1.5 sm:gap-3 bg-background px-1.5 sm:px-3 shrink-0">
              <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-500 border-2 ${
                isActive ? 'bg-primary/10 border-primary shadow-[0_0_30px_rgba(16,185,129,0.2)] scale-110' :
                isCompleted ? 'bg-emerald-500 border-emerald-500 text-black' :
                'bg-white/[0.02] border-white/[0.06] text-zinc-600'
              }`}>
                {isCompleted ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <span className="[&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-6 sm:[&>svg]:h-6">{step.icon}</span>}
              </div>
              <div className="text-center hidden sm:block">
                <p className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-primary' : 'text-zinc-600'}`}>{step.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* PAN */}
        {currentStep === 'PAN' && (
          <motion.div key="pan" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass-card p-5 sm:p-8 md:p-12 max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20"><CreditCard className="w-7 h-7 text-blue-400" /></div>
              <div><h2 className="text-2xl font-black text-white">PAN Verification</h2><p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mt-1">Required for Tax Compliance</p></div>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">PAN Number</label>
                <input type="text" placeholder="ABCDE1234F" maxLength={10}
                  className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 text-lg font-black font-mono-data text-white placeholder:text-zinc-800 focus:outline-none focus:border-primary/50 transition-all uppercase tracking-[0.2em]"
                  value={formData.pan} onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })} />
                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 mt-1 px-1"><Shield size={11} className="text-blue-500/50" /> 256-bit AES encrypted</div>
              </div>
              <button onClick={verifyPAN} disabled={loading || formData.pan.length !== 10}
                className="w-full py-4 bg-primary text-black font-black uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-primary/10 disabled:opacity-30 flex items-center justify-center gap-2 text-sm">
                {loading ? 'Verifying...' : 'Verify Identity'} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* AADHAAR */}
        {currentStep === 'AADHAAR' && (
          <motion.div key="aadhaar" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass-card p-5 sm:p-8 md:p-12 max-w-2xl mx-auto">
            <button onClick={() => setCurrentStep('PAN')} className="mb-6 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"><ArrowLeft size={13} /> Back</button>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20"><Smartphone className="w-7 h-7 text-amber-400" /></div>
              <div><h2 className="text-2xl font-black text-white">Aadhaar Sync</h2><p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mt-1">E-KYC via Government Gateway</p></div>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Aadhaar Number</label>
                <input type="text" placeholder="0000 0000 0000" maxLength={12} disabled={formData.otpRequested}
                  className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 text-lg font-black font-mono-data text-white placeholder:text-zinc-800 focus:outline-none focus:border-amber-500/50 transition-all tracking-[0.2em] disabled:opacity-50"
                  value={formData.aadhaar} onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value.replace(/\D/g, '') })} />
              </div>
              {formData.otpRequested && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">OTP (Use 123456 for demo)</label>
                  <input type="text" placeholder="Enter 6-digit OTP" maxLength={6}
                    className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 text-lg font-black font-mono-data text-white placeholder:text-zinc-800 focus:outline-none focus:border-primary/50 transition-all tracking-[0.4em] text-center"
                    value={formData.otp} onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })} />
                </motion.div>
              )}
              <button onClick={verifyAadhaar} disabled={loading || formData.aadhaar.length < 12}
                className="w-full py-4 bg-amber-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/10 disabled:opacity-30 flex items-center justify-center gap-2 text-sm">
                {loading ? 'Processing...' : formData.otpRequested ? 'Verify OTP' : 'Request OTP'} <Lock className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* BANK */}
        {currentStep === 'BANK' && (
          <motion.div key="bank" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass-card p-5 sm:p-8 md:p-12 max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20"><Building2 className="w-7 h-7 text-primary" /></div>
              <div><h2 className="text-2xl font-black text-white">Bank Verification</h2><p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mt-1">Penny Drop Verification</p></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Bank Name</label>
                <input type="text" placeholder="e.g. HDFC Bank" className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl p-3.5 text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all"
                  value={formData.bankName} onChange={(e) => setFormData({ ...formData, bankName: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">IFSC Code</label>
                <input type="text" placeholder="HDFC0001234" className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl p-3.5 text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all uppercase tracking-widest"
                  value={formData.ifsc} onChange={(e) => setFormData({ ...formData, ifsc: e.target.value.toUpperCase() })} />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Account Number</label>
                <input type="text" placeholder="Account Number" className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl p-3.5 text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all tracking-widest"
                  value={formData.accNo} onChange={(e) => setFormData({ ...formData, accNo: e.target.value })} />
              </div>
            </div>
            <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl mb-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Beneficiary</span>
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Auto-Synced</span>
              </div>
              <p className="text-lg font-black text-white mt-1">{formData.beneficiaryName || 'LOADING...'}</p>
            </div>
            <button onClick={verifyBank} disabled={loading || !formData.accNo || !formData.ifsc}
              className="w-full py-4 bg-primary text-black font-black uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-primary/10 disabled:opacity-30 flex items-center justify-center gap-2 text-sm">
              {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Verifying...</> : 'Link Bank Account'}
            </button>
          </motion.div>
        )}

        {/* DOCUMENTS */}
        {currentStep === 'DOCUMENTS' && (
          <motion.div key="docs" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass-card p-5 sm:p-8 md:p-12 max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20"><Upload className="w-7 h-7 text-violet-400" /></div>
              <div><h2 className="text-2xl font-black text-white">Document Upload</h2><p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mt-1">Upload verification documents</p></div>
            </div>
            <div className="space-y-3 mb-8">
              {DOC_TYPES.map(doc => {
                const isUploaded = uploadedDocs[doc.key];
                const isUploading = uploading === doc.key;
                return (
                  <div key={doc.key} className={`p-4 rounded-2xl border transition-all ${isUploaded ? 'bg-emerald-500/[0.04] border-emerald-500/20' : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isUploaded ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/[0.04] text-zinc-500'}`}>
                          {isUploaded ? <CheckCircle2 size={18} /> : <FileImage size={18} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{doc.label}</p>
                          <p className="text-[10px] text-zinc-600 font-medium">{isUploaded ? isUploaded.name : doc.desc}</p>
                        </div>
                      </div>
                      <button onClick={() => triggerFileInput(doc.key)} disabled={isUploading}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                          isUploaded ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          isUploading ? 'bg-white/[0.04] text-zinc-500' :
                          'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
                        }`}>
                        {isUploading ? <RefreshCw size={12} className="animate-spin" /> : isUploaded ? 'Replace' : 'Upload'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-4 bg-amber-500/[0.04] border border-amber-500/10 rounded-2xl mb-6 flex gap-3">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-zinc-400 font-medium">Documents are optional but recommended for faster KYC approval. Accepted: JPG, PNG, PDF (max 5MB).</p>
            </div>
            <button onClick={handleFinalSubmit} disabled={loading}
              className="w-full py-4 bg-primary text-black font-black uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-primary/10 disabled:opacity-30 flex items-center justify-center gap-2 text-sm">
              {loading ? 'Submitting...' : 'Complete KYC Verification'} <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* SUCCESS */}
        {currentStep === 'SUCCESS' && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 sm:p-12 md:p-16 max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 bg-emerald-500/20 border-2 border-emerald-500/40 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_60px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            </div>
            <h2 className="text-3xl font-black text-white mb-3">KYC Verified</h2>
            <p className="text-zinc-500 text-sm mb-10 max-w-sm mx-auto">Your identity has been verified. You are now authorized for live trading on NexusAI.</p>
            <div className="grid grid-cols-2 gap-3 mb-10">
              <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
                <FileCheck className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-[10px] font-black text-zinc-600 uppercase">Documents</p>
                <p className="text-xs font-bold text-white mt-1">AUTHORIZED</p>
              </div>
              <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
                <UserCheck className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-[10px] font-black text-zinc-600 uppercase">Identity</p>
                <p className="text-xs font-bold text-white mt-1">VERIFIED</p>
              </div>
            </div>
            <button onClick={() => navigate('/profile')}
              className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-all text-sm">
              Go to Profile
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
