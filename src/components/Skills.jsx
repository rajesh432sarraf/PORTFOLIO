import React from 'react';
import SkillRow from './SkillRow.jsx';
import FadeIn from './FadeIn.jsx';
import { skillGroups } from '../data/skills.js';

export function Skills() {
  return (
    <section
      id="skills"
      className="relative w-full bg-[#0C0C0C] px-5 sm:px-8 lg:px-12 py-24 sm:py-32 overflow-hidden"
      aria-label="Skills & Capabilities"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-16 sm:mb-20">
          <FadeIn y={30}>
            <span className="text-xs sm:text-sm uppercase tracking-widest text-[#D7E2EA]/40 font-mono block mb-3">
              [ 04 / CAPABILITIES ]
            </span>
            <h2
              className="hero-heading font-black tracking-tight uppercase leading-none select-none"
              style={{
                fontSize: 'clamp(2.75rem, 11vw, 150px)',
              }}
            >
              SKILLS
            </h2>
          </FadeIn>
        </div>

        {/* Skill Groups Stack */}
        <div className="border-t border-white/[0.08]">
          {skillGroups.map((group, index) => (
            <SkillRow key={group.number} group={group} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Skills;
