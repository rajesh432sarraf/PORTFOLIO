import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export function SkillRow({ group, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.8, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
      className="group relative border-b border-white/[0.08] py-8 sm:py-10 lg:py-12 transition-all duration-300 hover:border-white/20"
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 md:gap-12 transition-transform duration-300 group-hover:translate-x-1 sm:group-hover:translate-x-2">
        {/* Left: Oversized Number */}
        <div className="flex items-baseline gap-4 min-w-[120px] lg:min-w-[160px]">
          <span
            className="font-black text-[#646973]/60 group-hover:text-[#BBCCD7] transition-colors duration-300 leading-none select-none font-kanit"
            style={{
              fontSize: 'clamp(2.5rem, 8vw, 100px)',
            }}
          >
            {group.number}
          </span>
        </div>

        {/* Middle & Right: Category Title, Description & Skill Pills */}
        <div className="flex-1 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold uppercase tracking-wider text-[#D7E2EA] group-hover:text-white transition-colors">
                {group.title}
              </h3>
              <ArrowUpRight className="w-5 h-5 text-[#D7E2EA]/30 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </div>
            <p className="text-xs sm:text-sm text-[#D7E2EA]/50 font-light leading-relaxed">
              {group.description}
            </p>
          </div>

          {/* Skill Pills */}
          <div className="flex flex-wrap gap-2 sm:gap-2.5 max-w-xl">
            {group.skills.map((skill) => (
              <span
                key={skill}
                className="px-3.5 sm:px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs sm:text-sm text-[#D7E2EA]/85 font-medium tracking-wide transition-all duration-200 group-hover:border-white/20 group-hover:bg-white/[0.06]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default SkillRow;
