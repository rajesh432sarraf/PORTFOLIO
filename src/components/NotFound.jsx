import React from 'react';
import { ArrowLeft, Compass } from 'lucide-react';
import MagneticButton from './MagneticButton.jsx';

export function NotFound() {
  return (
    <div className="min-h-screen w-full bg-[#0C0C0C] text-[#D7E2EA] flex flex-col justify-center items-center px-6 py-20 selection:bg-[#7621B0]/40 selection:text-white">
      {/* Subtle background glow */}
      <div
        className="pointer-events-none absolute w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-[#7621B0]/15 blur-[160px] -z-10"
        aria-hidden="true"
      />

      <div className="max-w-xl mx-auto text-center flex flex-col items-center">
        <div className="p-4 rounded-3xl bg-white/[0.04] border border-white/10 text-[#BBCCD7] mb-8 shadow-2xl">
          <Compass className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
        </div>

        <span className="text-xs font-mono uppercase tracking-widest text-[#D7E2EA]/40 mb-3 block">
          [ ERROR 404 / NOT FOUND ]
        </span>

        <h1
          className="hero-heading font-black tracking-tight uppercase leading-none select-none mb-6 font-kanit"
          style={{
            fontSize: 'clamp(3rem, 12vw, 120px)',
          }}
        >
          LOST IN ORBIT.
        </h1>

        <p className="text-sm sm:text-base text-[#D7E2EA]/70 font-light leading-relaxed mb-10 max-w-md">
          The requested coordinates do not exist or have been relocated. Return to the main developer portfolio.
        </p>

        <MagneticButton strength={0.25}>
          <a
            href="/"
            className="contact-btn-gradient group inline-flex items-center gap-2 px-8 sm:px-10 py-3.5 sm:py-4 rounded-full text-white text-xs sm:text-sm font-semibold uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 border border-white/20"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>RETURN TO PORTFOLIO</span>
          </a>
        </MagneticButton>
      </div>
    </div>
  );
}

export default NotFound;
