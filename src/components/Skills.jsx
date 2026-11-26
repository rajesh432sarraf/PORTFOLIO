import React, { useState, useEffect } from 'react';
import SkillRow from './SkillRow.jsx';
import FadeIn from './FadeIn.jsx';
import { skillGroups as initialSkillGroups } from '../data/skills.js';
import { fetchContentFromDatabase } from '../services/storageService.js';

export function Skills() {
  const [skillList, setSkillList] = useState(initialSkillGroups);

  useEffect(() => {
    let isMounted = true;
    const loadSkills = async () => {
      try {
        const data = await fetchContentFromDatabase('skills', initialSkillGroups);
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setSkillList(data);
        }
      } catch (e) {
        console.warn('Failed to load skills from database:', e);
      }
    };

    loadSkills();

    const handleUpdate = async () => {
      try {
        const data = await fetchContentFromDatabase('skills', initialSkillGroups);
        if (Array.isArray(data) && data.length > 0) {
          setSkillList(data);
        }
      } catch (e) {
        console.warn('Failed to refresh skills:', e);
      }
    };

    window.addEventListener('portfolio_data_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('portfolio_data_updated', handleUpdate);
    };
  }, []);

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
          {skillList.map((group, index) => (
            <SkillRow key={group.id || group.number || index} group={group} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Skills;
