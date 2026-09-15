import React from 'react';
import BuildRow from './BuildRow.jsx';
import FadeIn from './FadeIn.jsx';
import { buildAreas } from '../data/buildAreas.js';

export function BuildSection() {
  return (
    <section
      id="services"
      className="relative w-full bg-[#0C0C0C] text-[#D7E2EA] px-5 sm:px-8 lg:px-12 py-24 sm:py-32 overflow-hidden"
      aria-label="What I Build"
    >
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] lg:w-[800px] h-[400px] sm:h-[600px] lg:h-[800px] rounded-full bg-gradient-to-tr from-[#7621B0]/8 via-[#B600A8]/4 to-transparent blur-[160px] -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 sm:mb-24">
          <FadeIn y={30}>
            <span className="text-xs sm:text-sm uppercase tracking-widest text-[#D7E2EA]/40 font-mono block mb-3">
              [ 05 / SERVICES &amp; SOLUTIONS ]
            </span>
            <h2
              className="font-black tracking-tight uppercase leading-none hero-heading select-none font-kanit"
              style={{
                fontSize: 'clamp(2.75rem, 11vw, 150px)',
              }}
            >
              WHAT I BUILD
            </h2>
          </FadeIn>
        </div>

        {/* Build Categories Rows */}
        <div className="border-t border-white/10">
          {buildAreas.map((area, index) => (
            <BuildRow key={area.number} area={area} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default BuildSection;
