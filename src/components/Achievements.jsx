import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award } from 'lucide-react';
import FadeIn from './FadeIn.jsx';
import { achievements as initialAchievements } from '../data/achievements.js';

export function Achievements() {
  const [achievementList, setAchievementList] = useState(() => {
    try {
      const saved = localStorage.getItem('rajesh_portfolio_achievements');
      return saved ? JSON.parse(saved) : initialAchievements;
    } catch (e) {
      return initialAchievements;
    }
  });

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem('rajesh_portfolio_achievements');
        if (saved) {
          setAchievementList(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to sync achievements', e);
      }
    };

    window.addEventListener('portfolio_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('portfolio_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return (
    <section
      id="achievements"
      className="relative w-full bg-[#0C0C0C] text-[#D7E2EA] px-5 sm:px-8 lg:px-12 py-24 sm:py-32 overflow-hidden"
      aria-label="Hackathons & Technical Achievements"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-16 sm:mb-24">
          <FadeIn y={30}>
            <span className="text-xs sm:text-sm uppercase tracking-widest text-[#D7E2EA]/40 font-mono block mb-3">
              [ 08 / RECOGNITION &amp; HACKATHONS ]
            </span>
            <h2
              className="hero-heading font-black tracking-tight uppercase leading-none select-none"
              style={{
                fontSize: 'clamp(2.75rem, 11vw, 150px)',
              }}
            >
              ACHIEVEMENTS
            </h2>
          </FadeIn>
        </div>

        {/* Editorial Achievement Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
          {achievementList.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.8, delay: idx * 0.12, ease: [0.25, 0.1, 0.25, 1] }}
              className="group relative rounded-[32px] sm:rounded-[44px] bg-white/[0.02] border border-white/[0.1] p-6 sm:p-8 lg:p-10 flex flex-col justify-between transition-all duration-300 hover:border-white/25 hover:bg-white/[0.04]"
            >
              <div>
                {/* Header Tag + Year */}
                <div className="flex items-center justify-between gap-4 mb-8">
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider bg-white/[0.04] border border-white/10 text-[#BBCCD7]">
                    {idx === 0 ? <Trophy className="w-3.5 h-3.5 text-amber-400" /> : <Award className="w-3.5 h-3.5 text-cyan-400" />}
                    {item.highlight}
                  </span>
                  <span className="text-xs font-mono text-[#D7E2EA]/40">{item.year}</span>
                </div>

                {/* Oversized Number & Title */}
                <div className="flex items-baseline gap-4 sm:gap-6 mb-4">
                  <span
                    className="font-kanit font-black text-[#BBCCD7] leading-none select-none"
                    style={{
                      fontSize: 'clamp(3.5rem, 8vw, 90px)',
                    }}
                  >
                    {item.number}
                  </span>
                  <div>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold uppercase tracking-tight text-[#D7E2EA]">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm font-mono uppercase tracking-widest text-[#D7E2EA]/50">
                      {item.event}
                    </p>
                  </div>
                </div>

                {/* Project Badge */}
                <div className="mb-4">
                  <span className="text-xs font-mono tracking-wider uppercase text-emerald-400/90 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
                    Project: {item.project}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm sm:text-base text-[#D7E2EA]/70 font-light leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Bottom Subtle Accent Line */}
              <div className="mt-8 pt-4 border-t border-white/[0.06] flex justify-between items-center text-xs font-mono text-[#D7E2EA]/40">
                <span>VERIFIED COMPETITIVE MILESTONE</span>
                <span className="text-[#BBCCD7]/60 group-hover:text-white transition-colors">↗</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Achievements;
