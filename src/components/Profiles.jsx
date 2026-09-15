import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Code } from 'lucide-react';
import FadeIn from './FadeIn.jsx';
import { profiles } from '../data/profiles.js';

// Clean SVG for GitHub
function GitHubIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

// Clean SVG for LinkedIn
function LinkedInIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

const PLATFORM_ICONS = {
  GITHUB: GitHubIcon,
  LINKEDIN: LinkedInIcon,
  LEETCODE: Code,
};

export function Profiles() {
  return (
    <section
      id="profiles"
      className="relative w-full bg-[#0C0C0C] text-[#D7E2EA] px-5 sm:px-8 lg:px-12 py-24 sm:py-32 overflow-hidden"
      aria-label="Coding and Professional Profiles"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-16 sm:mb-24">
          <FadeIn y={30}>
            <span className="text-xs sm:text-sm uppercase tracking-widest text-[#D7E2EA]/40 font-mono block mb-3">
              [ 10 / PROFILES &amp; COMMUNITY ]
            </span>
            <h2
              className="hero-heading font-black tracking-tight uppercase leading-none select-none"
              style={{
                fontSize: 'clamp(2.75rem, 11vw, 150px)',
              }}
            >
              LET'S CONNECT
            </h2>
          </FadeIn>
        </div>

        {/* Profiles Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {profiles.map((item, idx) => {
            const IconComp = PLATFORM_ICONS[item.platform] || ArrowUpRight;

            return (
              <motion.a
                key={item.platform}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                className="group relative rounded-[32px] sm:rounded-[40px] bg-white/[0.02] border border-white/[0.08] p-7 sm:p-9 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:border-white/30 hover:bg-white/[0.05] focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
                aria-label={`Visit Rajesh Kumar on ${item.platform}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-[#BBCCD7] group-hover:text-white group-hover:scale-110 transition-all duration-300">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-[#D7E2EA]/40 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-white" />
                  </div>

                  <h3 className="text-2xl font-bold uppercase tracking-tight text-[#D7E2EA] group-hover:text-white transition-colors mb-1">
                    {item.platform}
                  </h3>

                  <span className="text-xs font-mono uppercase tracking-wider text-[#BBCCD7]/70 block mb-4">
                    {item.handle}
                  </span>

                  <p className="text-sm text-[#D7E2EA]/65 font-light leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-[#D7E2EA]/40">
                  <span>{item.badge}</span>
                  <span className="group-hover:text-white transition-colors">VISIT PROFILE ↗</span>
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Profiles;
