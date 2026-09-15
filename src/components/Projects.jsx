import React, { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import ProjectCard from './ProjectCard.jsx';
import FadeIn from './FadeIn.jsx';
import { projects as initialProjects, archiveProjects } from '../data/projects.js';
import { fetchProjectsFromDatabase } from '../services/storageService.js';

export function Projects() {
  const [projectList, setProjectList] = useState(initialProjects);

  useEffect(() => {
    let isMounted = true;

    async function loadAll() {
      try {
        const data = await fetchProjectsFromDatabase(initialProjects);
        if (isMounted && data && Array.isArray(data) && data.length > 0) {
          setProjectList(data);
        }
      } catch (e) {}
    }

    loadAll();

    const handleUpdate = async () => {
      try {
        const data = await fetchProjectsFromDatabase(initialProjects);
        if (data && Array.isArray(data) && data.length > 0) {
          setProjectList(data);
        }
      } catch (e) {}
    };

    window.addEventListener('portfolio_data_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('portfolio_data_updated', handleUpdate);
    };
  }, []);
  return (
    <section
      id="projects"
      className="relative w-full bg-[#0C0C0C] text-[#D7E2EA] px-5 sm:px-8 lg:px-12 py-24 sm:py-32"
      aria-label="Selected Projects"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 sm:mb-24">
          <FadeIn y={30}>
            <span className="text-xs sm:text-sm uppercase tracking-widest text-[#D7E2EA]/40 font-mono block mb-3">
              [ 06 / SELECTED WORKS ]
            </span>
            <h2
              className="hero-heading font-black tracking-tight uppercase leading-none select-none"
              style={{
                fontSize: 'clamp(2.75rem, 11vw, 150px)',
              }}
            >
              PROJECTS
            </h2>
          </FadeIn>
        </div>

        {/* Featured Sticky Cards Showcase */}
        {projectList && projectList.length > 0 ? (
          <div className="relative w-full pb-12 sm:pb-20">
            {projectList.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                totalCards={projectList.length}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border border-white/10 rounded-3xl bg-white/[0.02] p-8 max-w-xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-widest text-white/40 block mb-2">
              [ COMING SOON ]
            </span>
            <p className="text-sm text-white/70 font-light">
              Selected projects are currently being updated. New works will be published soon.
            </p>
          </div>
        )}

        {/* Archive Section: Additional Projects */}
        {archiveProjects && archiveProjects.length > 0 && (
          <div className="mt-28 sm:mt-36 pt-16 border-t border-white/[0.08]">
            <FadeIn y={20}>
              <div className="flex items-center justify-between mb-10">
                <span className="text-xs uppercase tracking-widest text-[#D7E2EA]/40 font-mono">
                  [ ARCHIVE / EXPLORATIONS ]
                </span>
                <span className="text-xs text-[#D7E2EA]/50">MORE EXPERIMENTS</span>
              </div>
            </FadeIn>

            <div className="divide-y divide-white/[0.08]">
              {archiveProjects.map((item, idx) => (
                <FadeIn key={item.title} delay={idx * 0.08} y={15}>
                  <div className="group py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 hover:translate-x-1">
                    <div className="flex items-baseline gap-4">
                      <span className="text-xs font-mono text-[#D7E2EA]/40">
                        0{projectList.length + idx + 1}
                      </span>
                      <h4 className="text-lg sm:text-xl font-bold uppercase text-[#D7E2EA] group-hover:text-white transition-colors">
                        {item.title}
                      </h4>
                      <span className="text-xs text-[#D7E2EA]/50 hidden sm:inline">
                        — {item.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex gap-2">
                        {item.technologies.map((t) => (
                          <span
                            key={t}
                            className="text-xs font-mono text-[#D7E2EA]/50 bg-white/[0.02] px-2.5 py-1 rounded-full border border-white/[0.06]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs font-mono text-[#D7E2EA]/40">{item.year}</span>
                      {item.github && (
                        <a
                          href={item.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full border border-white/10 text-[#D7E2EA]/60 hover:text-white hover:border-white/30 transition-all"
                          aria-label={`View ${item.title} repository`}
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default Projects;
