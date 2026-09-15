import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';
import FadeIn from './FadeIn.jsx';
import { experiences as initialExperiences } from '../data/experience.js';

export function Experience() {
  const [experienceList, setExperienceList] = useState(() => {
    try {
      const saved = localStorage.getItem('rajesh_portfolio_experience');
      return saved ? JSON.parse(saved) : initialExperiences;
    } catch (e) {
      return initialExperiences;
    }
  });

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem('rajesh_portfolio_experience');
        if (saved) {
          setExperienceList(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to sync experience', e);
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
      id="experience"
      className="relative w-full bg-[#0C0C0C] text-[#D7E2EA] px-5 sm:px-8 lg:px-12 py-24 sm:py-32 overflow-hidden"
      aria-label="Work & Internship Experience"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-16 sm:mb-24">
          <FadeIn y={30}>
            <span className="text-xs sm:text-sm uppercase tracking-widest text-[#D7E2EA]/40 font-mono block mb-3">
              [ 07 / PRACTICAL EXPERIENCE ]
            </span>
            <h2
              className="hero-heading font-black tracking-tight uppercase leading-none select-none"
              style={{
                fontSize: 'clamp(2.75rem, 11vw, 150px)',
              }}
            >
              EXPERIENCE
            </h2>
          </FadeIn>
        </div>

        {/* Vertical Editorial Timeline */}
        <div className="relative pl-6 sm:pl-10 lg:pl-12 border-l border-white/[0.12] ml-2 sm:ml-4">
          {experienceList.map((exp, idx) => (
            <motion.div
              key={`${exp.role}-${idx}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative group mb-12 sm:mb-16 last:mb-0"
            >
              {/* Timeline Marker Dot */}
              <div className="absolute -left-[31px] sm:-left-[47px] lg:-left-[55px] top-1.5 w-3.5 h-3.5 rounded-full bg-[#0C0C0C] border-2 border-[#BBCCD7] group-hover:scale-125 group-hover:bg-[#BBCCD7] transition-all duration-300 shadow-[0_0_12px_rgba(187,204,215,0.4)]" />

              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 sm:gap-6">
                <div className="max-w-2xl">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-white/[0.04] border border-white/10 text-[#D7E2EA]/70">
                      {exp.period} • {exp.location}
                    </span>
                    <span className="text-xs font-mono text-[#D7E2EA]/40 uppercase">
                      INTERNSHIP
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#D7E2EA] group-hover:text-white transition-colors mb-1">
                    {exp.role}
                  </h3>

                  <p className="text-sm sm:text-base font-semibold text-[#BBCCD7] uppercase tracking-wide mb-4">
                    {exp.organization}
                  </p>

                  <p className="text-sm sm:text-base text-[#D7E2EA]/75 font-light leading-relaxed mb-6">
                    {exp.description}
                  </p>

                  {Array.isArray(exp.technologies) && exp.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {exp.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 rounded-full text-xs font-mono text-[#D7E2EA]/60 bg-white/[0.02] border border-white/[0.08]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-[#D7E2EA]/40">
                  <Briefcase className="w-4 h-4 text-[#D7E2EA]/50" />
                  <span>VERIFIED RECORD</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Experience;
