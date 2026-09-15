import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export function ProjectCard({ project, index, totalCards }) {
  const hasLive = Boolean(project.live && project.live.trim().length > 0);
  const hasGithub = Boolean(project.github && project.github.trim().length > 0);

  // Offset each card so the top header bar of the previous card stays visible
  const topOffset = 85 + index * 60;
  const isLast = index === totalCards - 1;

  return (
    <div
      style={{
        top: `${topOffset}px`,
        zIndex: index + 10,
        marginBottom: isLast ? '60px' : '400px',
      }}
      className="sticky w-full max-w-7xl mx-auto rounded-[28px] sm:rounded-[36px] md:rounded-[44px] bg-[#0E0E0E] border border-white/20 p-6 sm:p-8 md:p-10 shadow-[0_-25px_50px_rgba(0,0,0,0.95),0_30px_70px_rgba(0,0,0,0.9)] transition-all duration-300"
    >
      {/* TOP HEADER ROW: 01 + CATEGORY/TITLE + LIVE PROJECT BUTTON */}
      <div className="flex items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Big Number (01, 02, etc.) */}
          <span className="font-kanit font-black text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-none select-none">
            {project.number}
          </span>

          {/* Stacked Category / Type & Project Title */}
          <div className="flex flex-col justify-center">
            <span className="text-[11px] sm:text-xs font-mono font-semibold uppercase tracking-widest text-white/50">
              {project.category}
            </span>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold uppercase tracking-tight text-white font-kanit mt-0.5">
              {project.title}
            </h3>
          </div>
        </div>

        {/* Action Button: Live Project */}
        <div className="flex items-center gap-3">
          <a
            href={hasLive ? project.live : hasGithub ? project.github : '#contact'}
            target={hasLive || hasGithub ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 px-5 sm:px-6 py-2 sm:py-2.5 rounded-full border border-white/40 hover:border-white bg-white/[0.04] hover:bg-white/10 text-xs sm:text-sm font-semibold tracking-widest text-white uppercase transition-all duration-200"
            aria-label={`View ${project.title}`}
          >
            <span>LIVE PROJECT</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>

      {/* ASYMMETRIC 3-IMAGE EDITORIAL GALLERY */}
      {(() => {
        const galleryList = Array.isArray(project.gallery) ? project.gallery : [];
        const mainCover = project.image || galleryList[0] || '/images/projects/cutzen-main.jpg';
        const img1 = galleryList[0] || mainCover;
        const img2 = galleryList[1] || mainCover;

        return (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            {/* Left Column: 2 Stacked Rounded Images (40% desktop) */}
            <div className="hidden lg:flex lg:col-span-5 flex-col gap-4 sm:gap-6">
              <div
                className="group relative w-full overflow-hidden rounded-[20px] sm:rounded-[26px] border border-white/10 bg-neutral-900"
                style={{ height: 'clamp(150px, 16vw, 210px)' }}
              >
                <img
                  src={img1}
                  alt={`${project.title} detail 1`}
                  className="w-full h-full object-cover filter brightness-95 transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/projects/cutzen-main.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 pointer-events-none" />
              </div>

              <div
                className="group relative w-full overflow-hidden rounded-[20px] sm:rounded-[26px] border border-white/10 bg-neutral-900"
                style={{ height: 'clamp(170px, 18vw, 230px)' }}
              >
                <img
                  src={img2}
                  alt={`${project.title} detail 2`}
                  className="w-full h-full object-cover filter brightness-95 transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/projects/cutzen-main.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 pointer-events-none" />
              </div>
            </div>

            {/* Right Column: 1 Large Main Preview Image (60% desktop) */}
            <div className="col-span-1 lg:col-span-7">
              <div
                className="group relative w-full overflow-hidden rounded-[20px] sm:rounded-[28px] md:rounded-[32px] border border-white/10 bg-neutral-900"
                style={{ height: 'clamp(240px, 35vw, 456px)' }}
              >
                <img
                  src={mainCover}
                  alt={`${project.title} main interface view`}
                  className="w-full h-full object-cover filter brightness-95 transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/projects/cutzen-main.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        );
      })()}

      {/* FOOTER ROW: DESCRIPTION & TECHNOLOGIES */}
      <div className="mt-5 flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-white/[0.06]">
        <p className="text-xs sm:text-sm text-[#D7E2EA]/70 max-w-2xl font-light leading-relaxed">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-1 text-[11px] uppercase tracking-wider font-mono text-[#D7E2EA]/60 rounded-full border border-white/[0.08] bg-white/[0.02]"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;
