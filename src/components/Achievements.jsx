import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award } from 'lucide-react';
import FadeIn from './FadeIn.jsx';
import { achievements as initialAchievements } from '../data/achievements.js';
import { fetchContentFromDatabase } from '../services/storageService.js';

export function Achievements() {
  const [achievementList, setAchievementList] = useState(initialAchievements);

  useEffect(() => {
    let isMounted = true;
    const loadAch = async () => {
      try {
        const data = await fetchContentFromDatabase('achievements', initialAchievements);
        if (isMounted && Array.isArray(data)) {
          setAchievementList(data);
        }
      } catch (e) {}
    };

    loadAch();

    const handleUpdate = async () => {
      try {
        const data = await fetchContentFromDatabase('achievements', initialAchievements);
        if (Array.isArray(data)) {
          setAchievementList(data);
        }
      } catch (e) {}
    };

    window.addEventListener('portfolio_data_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('portfolio_data_updated', handleUpdate);
    };
  }, []);

  if (!achievementList || achievementList.length === 0) {
    return null;
  }

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
              className="group relative rounded-[32px] sm:rounded-[44px] bg-white/[0.02] border border-white/[0.1] flex flex-col justify-between transition-all duration-300 hover:border-white/25 hover:bg-white/[0.04] overflow-hidden"
            >
              {/* Achievement Image Banner */}
              {item.image ? (
                <div className="relative w-full h-48 sm:h-56 overflow-hidden">
                  <img
                    src={item.image}
                    alt={`${item.title} — ${item.event}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-[#0C0C0C]"/>
                </div>
              ) : null}
              <div className="p-6 sm:p-8 lg:p-10">
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
              <div className="mx-6 sm:mx-8 lg:mx-10 mb-6 sm:mb-8 lg:mb-10 mt-2 pt-4 border-t border-white/[0.06] flex justify-between items-center text-xs font-mono text-[#D7E2EA]/40">
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
