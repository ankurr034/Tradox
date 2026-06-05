import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, Zap, ArrowRight, TrendingUp, Wallet, Shield, User, Globe, Calculator, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useToast } from './Toast';

export default function CommandBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { isLiveMode, toggleMode } = useUser();
  const navigate = useNavigate();
  const toast = useToast();
  const inputRef = useRef(null);

  const actions = [
    { id: 'explore', label: 'Explore Markets', icon: <Globe size={18} />, action: () => navigate('/') },
    { id: 'portfolio', label: 'My Holdings', icon: <TrendingUp size={18} />, action: () => navigate('/portfolio') },
    { id: 'wallet', label: 'Manage Wallet', icon: <Wallet size={18} />, action: () => navigate('/wallet') },
    { id: 'profile', label: 'User Profile', icon: <User size={18} />, action: () => navigate('/profile') },
    { id: 'mode', label: `Switch to ${isLiveMode ? 'Demo' : 'Live'} Mode`, icon: <Shield size={18} />, action: toggleMode },
    { id: 'screener', label: 'AI Stock Screener', icon: <Zap size={18} />, action: () => navigate('/screener') },
  ];

  const filteredActions = actions.filter(a => 
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredActions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredActions[selectedIndex]) {
        filteredActions[selectedIndex].action();
        setIsOpen(false);
      } else if (query.trim()) {
        navigate(`/stock/${query.toUpperCase().trim()}`);
        setIsOpen(false);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[500] flex items-start justify-center pt-[10vh] sm:pt-[15vh] px-3 sm:px-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl" 
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-[#0a0f1a] border border-white/[0.1] rounded-2xl sm:rounded-[32px] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            <div className="flex items-center px-6 py-5 border-b border-white/[0.08] bg-white/[0.02]">
              <Search className="w-5 h-5 text-zinc-500 mr-4" />
              <input 
                ref={inputRef}
                type="text" 
                placeholder="Type a command or stock symbol (e.g. RELIANCE)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent border-none outline-none text-white text-lg font-medium placeholder:text-zinc-700"
              />
              <div className="flex items-center gap-2">
                 <span className="px-2 py-1 bg-white/[0.04] border border-white/10 rounded text-[10px] font-black text-zinc-500">ESC</span>
                 <X className="w-4 h-4 text-zinc-700 cursor-pointer hover:text-white" onClick={() => setIsOpen(false)} />
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto p-3 custom-scrollbar">
              {filteredActions.length > 0 ? (
                <div className="space-y-1">
                  <p className="px-4 py-2 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Available Actions</p>
                  {filteredActions.map((action, idx) => (
                    <div 
                      key={action.id}
                      onClick={() => { action.action(); setIsOpen(false); }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between px-4 py-3.5 rounded-2xl cursor-pointer transition-all ${
                        idx === selectedIndex ? 'bg-primary/10 border border-primary/20 text-white' : 'hover:bg-white/[0.02] text-zinc-400 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                         <div className={`${idx === selectedIndex ? 'text-primary' : 'text-zinc-600'}`}>
                           {action.icon}
                         </div>
                         <span className="text-sm font-bold uppercase tracking-wider">{action.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                         {idx === selectedIndex && <ArrowRight size={14} className="text-primary" />}
                         <span className="text-[10px] font-black text-zinc-700">↵</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                   <Calculator className="w-10 h-10 text-zinc-800 mx-auto mb-4" />
                   <p className="text-zinc-500 text-sm">No commands found for <span className="text-white">"{query}"</span></p>
                   <p className="text-[10px] text-zinc-700 mt-2 uppercase font-black tracking-widest">Try searching for symbols like 'TCS' or 'INFY'</p>
                </div>
              )}
            </div>

            <div className="bg-white/[0.02] px-6 py-3 border-t border-white/[0.08] flex items-center justify-between">
               <div className="flex items-center gap-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><Command size={12} /> Search Alpha</span>
                  <span className="flex items-center gap-1.5"><Zap size={12} /> AI Nexus</span>
               </div>
               <p className="text-[9px] font-bold text-zinc-700 italic">Nexus AI v2.4.0 • Enterprise Core</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
