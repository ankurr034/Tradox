import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Shield, Code2, Mail, ExternalLink } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-16 border-t border-white/[0.04] bg-[#06060a]">
      {/* Ambient top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-8 sm:mb-10">
          
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center mb-4">
              <svg viewBox="0 0 500 110" className="h-9 w-auto" xmlns="http://www.w3.org/2000/svg">
                <rect x="12" y="22" width="54" height="11" rx="2" fill="#E53E3E"/>
                <rect x="31" y="22" width="11" height="40" rx="2" fill="#E53E3E"/>
                <rect x="74" y="20" width="11" height="56" rx="2" fill="#E53E3E" transform="rotate(45 79 48)"/>
                <rect x="74" y="20" width="11" height="56" rx="2" fill="#E53E3E" transform="rotate(-45 79 48)"/>
                <polygon points="79,28 88,46 79,41 70,46" fill="#fff" opacity="0.9"/>
                <text x="108" y="60" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="38" fontWeight="900" fill="#FFFFFF" letterSpacing="3">TRADOX</text>
                <text x="109" y="80" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11" fontWeight="700" fill="#888888" letterSpacing="3">TRADE · GROW · DOMINATE</text>
              </svg>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed mb-4">
              Trade. Grow. Dominate. India's most intelligent stock trading and portfolio intelligence platform. Built with Deep Learning, real-time data, and institutional-grade analytics.
            </p>
            <div className="flex items-center gap-1 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
              <Shield className="w-3 h-3" /> SEBI Compliant Architecture
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Platform</h4>
            <div className="space-y-3">
              <Link to="/" className="block text-sm text-zinc-500 hover:text-primary transition-colors">Explore Markets</Link>
              <Link to="/portfolio" className="block text-sm text-zinc-500 hover:text-primary transition-colors">Portfolio Holdings</Link>
              <Link to="/mutual-funds" className="block text-sm text-zinc-500 hover:text-primary transition-colors">Mutual Funds</Link>
              <Link to="/fno" className="block text-sm text-zinc-500 hover:text-primary transition-colors">F&O Options Chain</Link>
              <Link to="/wallet" className="block text-sm text-zinc-500 hover:text-primary transition-colors">Virtual Wallet</Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Resources</h4>
            <div className="space-y-3">
              <Link to="/resources?tab=api" className="block text-sm text-zinc-500 hover:text-primary transition-colors">API Documentation</Link>
              <Link to="/resources?tab=lstm" className="block text-sm text-zinc-500 hover:text-primary transition-colors">LSTM Model Paper</Link>
              <Link to="/resources?tab=risk" className="block text-sm text-zinc-500 hover:text-primary transition-colors">Risk Disclaimer</Link>
              <Link to="/resources?tab=datasources" className="block text-sm text-zinc-500 hover:text-primary transition-colors">Data Sources</Link>
              <Link to="/resources?tab=privacy" className="block text-sm text-zinc-500 hover:text-primary transition-colors">Privacy Policy</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Connect</h4>
            <div className="space-y-3">
              <a href="#" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-primary transition-colors">
                <Code2 className="w-4 h-4" /> Source Code
              </a>
              <a href="#" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-primary transition-colors">
                <Mail className="w-4 h-4" /> Contact Developer
              </a>
              <a href="#" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-primary transition-colors">
                <ExternalLink className="w-4 h-4" /> Live Demo
              </a>
            </div>
            <div className="mt-6 p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
              <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-1">Tech Stack</p>
              <p className="text-xs text-zinc-400">React • FastAPI • TensorFlow • yfinance</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/[0.04] pt-4 sm:pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <p className="text-xs text-zinc-600 font-medium">
            © {currentYear} Tradox — Stock Trading & Intelligence System. Built by Ankur Rastogi.
          </p>
          <div className="flex items-center gap-6 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
            <span>Final Year Capstone Project</span>
            <span>•</span>
            <span>For Educational Use Only</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
