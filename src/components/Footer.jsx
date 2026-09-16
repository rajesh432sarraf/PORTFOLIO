import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Lock } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [ownerEmail, setOwnerEmail] = useState(() => {
    return localStorage.getItem('rajesh_portfolio_owner_email') || 'sarrafrajesh432@gmail.com';
  });

  useEffect(() => {
    const handleUpdate = () => {
      const email = localStorage.getItem('rajesh_portfolio_owner_email') || 'sarrafrajesh432@gmail.com';
      setOwnerEmail(email);
    };
    window.addEventListener('portfolio_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('portfolio_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return (
    <footer className="w-full bg-[#080808] border-t border-white/[0.08] text-[#D7E2EA] px-6 sm:px-12 py-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-mono">
        {/* Left: Clean Identity, Copyright & Availability Status */}
        <div className="flex flex-col sm:flex-row items-center gap-3 text-[#D7E2EA]/50 text-center sm:text-left">
          <span className="font-kanit font-black tracking-widest text-base uppercase brand-gradient-flow">
            RAJESH KUMAR
          </span>
          <span className="hidden sm:inline text-white/20">•</span>
          <span>© {currentYear} All rights reserved.</span>
          <span className="hidden sm:inline text-white/20">•</span>
          <span className="flex items-center gap-1.5 text-emerald-400/90">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Vadlamudi, AP • Open to work
          </span>
        </div>

        {/* Right: Key Essentials & Outbound Profiles */}
        <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-6 text-[#D7E2EA]/60">
          <a
            href="https://github.com/rajeshsarraf"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors inline-flex items-center gap-1"
          >
            <span>GitHub</span>
            <ArrowUpRight className="w-3 h-3 opacity-60" />
          </a>
          <a
            href="https://linkedin.com/in/rajesh432kumar"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors inline-flex items-center gap-1"
          >
            <span>LinkedIn</span>
            <ArrowUpRight className="w-3 h-3 opacity-60" />
          </a>
          <a
            href="https://leetcode.com/u/codeBug432/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors inline-flex items-center gap-1"
          >
            <span>LeetCode</span>
            <ArrowUpRight className="w-3 h-3 opacity-60" />
          </a>
          <a
            href={`mailto:${ownerEmail}`}
            className="hover:text-white transition-colors inline-flex items-center gap-1"
          >
            <span>Email</span>
            <ArrowUpRight className="w-3 h-3 opacity-60" />
          </a>

          {/* Discreet Admin Lock for Rajesh */}
          <a
            href="/admin/login"
            className="text-white/20 hover:text-white/80 transition-colors p-1 ml-1"
            title="Admin Login"
            aria-label="Admin Login"
          >
            <Lock className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
