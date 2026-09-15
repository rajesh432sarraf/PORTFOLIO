import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export function BuildRow({ area, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.8, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
      className="group relative border-b border-white/[0.08] py-8 sm:py-10 md:py-12 transition-all duration-300"
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 md:gap-12 transition-transform duration-300 group-hover:translate-x-1 sm:group-hover:translate-x-2">
        {/* Left: Oversized Number */}
        <div className="min-w-[120px] lg:min-w-[160px]">
          <span
            className="font-black text-white/20 group-hover:text-white transition-all duration-300 leading-none select-none font-kanit inline-block group-hover:scale-105 origin-left"
            style={{
              fontSize: 'clamp(2.5rem, 8vw, 100px)',
            }}
          >
            {area.number}
          </span>
        </div>

        {/* Right: Title, Description & Tags */}
        <div className="flex-1 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold uppercase tracking-tight text-[#D7E2EA] group-hover:text-white transition-colors">
                {area.title}
              </h3>
              <ArrowUpRight className="w-5 h-5 text-[#D7E2EA]/40 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </div>
            <p className="text-sm sm:text-base text-[#D7E2EA]/60 font-normal leading-relaxed">
              {area.description}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 sm:gap-2.5 max-w-sm">
            {area.tags.map((tag) => (
              <span
                key={tag}
                className="px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-xs text-[#D7E2EA]/70 font-medium tracking-wide transition-colors group-hover:bg-white/[0.09] group-hover:text-white"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default BuildRow;

