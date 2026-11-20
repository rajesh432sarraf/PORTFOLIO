import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Award,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Calendar,
  Sparkles,
  Medal,
  Download,
} from 'lucide-react';
import FadeIn from './FadeIn.jsx';
import { achievements as initialAchievements } from '../data/achievements.js';
import { fetchContentFromDatabase } from '../services/storageService.js';

export function Achievements() {
  const [achievementList, setAchievementList] = useState(initialAchievements);
  const [activeCert, setActiveCert] = useState(null); // Lightbox modal for certificate
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef(null);

  // Sync with database / IndexedDB
  useEffect(() => {
    let isMounted = true;
    const loadAch = async () => {
      try {
        const data = await fetchContentFromDatabase('achievements', initialAchievements);
        if (isMounted && Array.isArray(data) && data.length > 0) {
          // If cached items lack images but initial fallback has them, prefer items with rich images
          const hasImages = data.some((item) => Boolean(item.image));
          if (!hasImages && initialAchievements.some((item) => Boolean(item.image))) {
            setAchievementList(initialAchievements);
          } else {
            setAchievementList(data);
          }
        }
      } catch (e) {
        if (isMounted) setAchievementList(initialAchievements);
      }
    };

    loadAch();

    const handleUpdate = async () => {
      try {
        const data = await fetchContentFromDatabase('achievements', initialAchievements);
        if (Array.isArray(data) && data.length > 0) {
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

  // Update current slide index on scroll
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.firstElementChild?.clientWidth || 360;
    const gap = 24;
    const newIdx = Math.round(scrollLeft / (cardWidth + gap));
    setCurrentIndex(Math.min(Math.max(newIdx, 0), achievementList.length - 1));
  };

  // Scroll controls
  const scrollTo = (direction) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cardWidth = container.firstElementChild?.clientWidth || 360;
    const gap = 24;
    const scrollAmount = (cardWidth + gap) * (direction === 'next' ? 1 : -1);

    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth',
    });
  };

  // Prevent vertical mouse wheel from being trapped/converted into horizontal movement.
  // When cursor is on this section and user scrolls up/down, scroll the page vertically!
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      // If user is scrolling vertically with the mouse wheel (without holding Shift)
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && !e.shiftKey) {
        // Prevent the container from trapping the wheel and scrolling horizontally
        e.preventDefault();

        // Scroll the window vertically using Lenis natural inertia
        if (window.__lenis) {
          const currentTarget = window.__lenis.targetScroll ?? window.scrollY;
          window.__lenis.scrollTo(currentTarget + e.deltaY, {
            programmatic: false,
          });
        } else {
          window.scrollBy({ top: e.deltaY, behavior: 'auto' });
        }
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Mouse Drag-to-Scroll for DESKTOP mouse users only
  const dragInfoRef = useRef({ isDown: false, startX: 0, scrollLeft: 0, hasMoved: false });

  const handlePointerDown = (e) => {
    // If it's a touch gesture on mobile/tablet, NEVER intercept! Let native mobile touch scroll freely!
    if (e.pointerType === 'touch') return;
    if (e.button !== 0) return; // Only left mouse click

    const container = scrollContainerRef.current;
    if (!container) return;

    dragInfoRef.current = {
      isDown: true,
      startX: e.pageX - container.offsetLeft,
      scrollLeft: container.scrollLeft,
      hasMoved: false,
    };
  };

  const handlePointerMove = (e) => {
    if (e.pointerType === 'touch') return;
    if (!dragInfoRef.current.isDown) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const x = e.pageX - container.offsetLeft;
    const walk = (x - dragInfoRef.current.startX) * 1.3;
    if (Math.abs(walk) > 4) {
      dragInfoRef.current.hasMoved = true;
      container.scrollLeft = dragInfoRef.current.scrollLeft - walk;
    }
  };

  const handlePointerUpOrLeave = (e) => {
    if (e.pointerType === 'touch') return;
    dragInfoRef.current.isDown = false;
    setTimeout(() => {
      dragInfoRef.current.hasMoved = false;
    }, 60);
  };

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveCert(null);
    };
    if (activeCert) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeCert]);

  if (!achievementList || achievementList.length === 0) {
    return null;
  }

  // Get award tier styling
  const getBadgeStyle = (highlight = '', title = '') => {
    const text = `${highlight} ${title}`.toLowerCase();
    if (text.includes('1st') || text.includes('winner') || text.includes('top place')) {
      return {
        badge: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
        icon: <Trophy className="w-3.5 h-3.5 text-amber-400" />,
        glow: 'from-amber-400/15 via-transparent to-transparent',
      };
    }
    if (text.includes('3rd') || text.includes('2nd') || text.includes('lead')) {
      return {
        badge: 'bg-orange-400/10 text-orange-300 border-orange-400/30',
        icon: <Medal className="w-3.5 h-3.5 text-orange-400" />,
        glow: 'from-orange-400/15 via-transparent to-transparent',
      };
    }
    if (text.includes('top 50') || text.includes('top 1,000') || text.includes('rank')) {
      return {
        badge: 'bg-cyan-400/10 text-cyan-300 border-cyan-400/30',
        icon: <Sparkles className="w-3.5 h-3.5 text-cyan-400" />,
        glow: 'from-cyan-400/15 via-transparent to-transparent',
      };
    }
    return {
      badge: 'bg-purple-400/10 text-purple-300 border-purple-400/30',
      icon: <Award className="w-3.5 h-3.5 text-purple-400" />,
      glow: 'from-purple-400/15 via-transparent to-transparent',
    };
  };

  return (
    <section
      id="achievements"
      className="relative w-full bg-[#0C0C0C] text-[#D7E2EA] px-5 sm:px-8 lg:px-12 py-20 sm:py-24 overflow-hidden"
      aria-label="Hackathons & Technical Achievements"
    >
      {/* Background Ambient Glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/3 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-[#7621B0]/10 via-[#B600A8]/5 to-transparent blur-[140px] -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto">
        {/* Section Header: Compact & Integrated */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-14">
          <FadeIn y={20}>
            <span className="text-xs sm:text-sm uppercase tracking-widest text-[#D7E2EA]/40 font-mono block mb-2">
              [ 08 / RECOGNITION &amp; HACKATHONS ]
            </span>
            <h2
              className="hero-heading font-black tracking-tight uppercase leading-none select-none"
              style={{
                fontSize: 'clamp(2.5rem, 8vw, 100px)',
              }}
            >
              ACHIEVEMENTS
            </h2>
          </FadeIn>

          {/* Slider Controls & Counter */}
          <FadeIn delay={0.1} y={20}>
            <div className="flex items-center gap-4 select-none">
              {/* Slide Counter */}
              <div className="text-xs font-mono uppercase tracking-widest text-[#D7E2EA]/50 bg-white/[0.03] border border-white/10 px-4 py-2 rounded-full">
                <span className="text-white font-bold">{String(currentIndex + 1).padStart(2, '0')}</span>
                <span className="mx-1.5 text-white/30">/</span>
                <span>{String(achievementList.length).padStart(2, '0')}</span>
              </div>

              {/* Navigation Arrow Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollTo('prev')}
                  className="p-2.5 rounded-full border border-white/15 bg-white/[0.02] text-white hover:bg-white/10 hover:border-white/30 active:scale-95 transition-all cursor-pointer focus:outline-none"
                  aria-label="Previous achievement"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollTo('next')}
                  className="p-2.5 rounded-full border border-white/15 bg-white/[0.02] text-white hover:bg-white/10 hover:border-white/30 active:scale-95 transition-all cursor-pointer focus:outline-none"
                  aria-label="Next achievement"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Space-Efficient Horizontal Carousel with Mouse Drag & Free Vertical Page Scroll */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUpOrLeave}
          onPointerLeave={handlePointerUpOrLeave}
          className="flex gap-5 sm:gap-6 overflow-x-auto pb-6 pt-1 px-1 custom-scrollbar snap-x snap-proximity cursor-grab active:cursor-grabbing"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-x pan-y',
            overscrollBehaviorX: 'auto',
          }}
        >
          {achievementList.map((item, idx) => {
            const tier = getBadgeStyle(item.highlight, item.title);

            return (
              <motion.div
                key={item.id || item.title || idx}
                onClick={() => {
                  if (dragInfoRef.current.hasMoved) return;
                  setActiveCert(item);
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.6, delay: Math.min(idx * 0.08, 0.4) }}
                className="group relative flex-shrink-0 w-[290px] sm:w-[340px] md:w-[380px] rounded-3xl bg-[#0E0E0E] border border-white/10 hover:border-purple-400/50 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(118,33,176,0.25)] snap-start cursor-pointer"
                style={{ touchAction: 'pan-x pan-y' }}
                role="button"
                tabIndex={0}
                aria-label={`View details for ${item.title}`}
              >
                {/* Certificate Preview Banner (Compact 16:9) */}
                {item.image ? (
                  <div
                    onClick={() => setActiveCert(item)}
                    className="relative w-full h-40 sm:h-44 bg-neutral-900 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={item.image}
                      alt={`${item.title} — ${item.event}`}
                      draggable={false}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none select-none"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E0E] via-transparent to-black/30" />

                    {/* Quick View Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-xs font-mono text-white">
                      <Maximize2 className="w-4 h-4 text-purple-400" />
                      <span>View Certificate</span>
                    </div>

                    {/* Rank Badge on Image */}
                    <div className="absolute top-3 left-3 z-10">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider backdrop-blur-md border ${tier.badge}`}
                      >
                        {tier.icon}
                        <span>{item.highlight || item.title}</span>
                      </span>
                    </div>

                    {/* Year Badge */}
                    {item.year && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-white/70 bg-black/60 backdrop-blur-md border border-white/10">
                          {item.year}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-5 pb-0 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider border ${tier.badge}`}
                    >
                      {tier.icon}
                      <span>{item.highlight || item.title}</span>
                    </span>
                    {item.year && (
                      <span className="text-[11px] font-mono text-white/50">{item.year}</span>
                    )}
                  </div>
                )}

                {/* Card Body */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Header: Number & Title */}
                    <div className="flex items-start gap-3 mb-2">
                      <span className="font-kanit font-black text-lg text-white/30 shrink-0">
                        {String(item.number || idx + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold uppercase tracking-tight text-white leading-snug line-clamp-1">
                          {item.title}
                        </h3>
                        <p className="text-xs font-mono uppercase tracking-wider text-purple-300/80 line-clamp-1 mt-0.5">
                          {item.event}
                        </p>
                      </div>
                    </div>

                    {/* Project Tag */}
                    {item.project && (
                      <div className="mt-2.5 mb-3">
                        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 line-clamp-1 inline-block">
                          Project: {item.project}
                        </span>
                      </div>
                    )}

                    {/* Description: Compact 2 lines */}
                    <p className="text-xs sm:text-[13px] text-[#D7E2EA]/65 font-light leading-relaxed line-clamp-2 mt-2">
                      {item.description?.replace(/\*\*/g, '')}
                    </p>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono">
                    <span className="text-white/60 group-hover:text-purple-300 transition-colors flex items-center gap-1.5">
                      <span>Click card for details &amp; certificate</span>
                      <span>↗</span>
                    </span>
                    <span className="text-[10px] uppercase text-white/30">Verified</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Swipe Hint on Mobile */}
        <div className="flex items-center justify-center gap-2 mt-4 text-[11px] font-mono text-white/40 md:hidden">
          <span>← Swipe to explore hackathons →</span>
        </div>
      </div>

      {/* Certificate & Milestone Lightbox Modal */}
      <AnimatePresence>
        {activeCert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveCert(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
              aria-hidden="true"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-3xl max-h-[90vh] bg-[#0E0E0E] border border-white/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10"
              role="dialog"
              aria-modal="true"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#0C0C0C]">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-purple-400">
                    {activeCert.highlight || 'Competitive Milestone'}
                  </span>
                  <h3 className="text-base sm:text-xl font-bold uppercase tracking-tight text-white font-kanit">
                    {activeCert.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {activeCert.image && (
                    <a
                      href={activeCert.image}
                      download={`${(activeCert.title || 'Certificate').toLowerCase().replace(/[^a-z0-9]/gi, '_')}.jpg`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/15 border border-white/10 text-xs font-mono text-white transition-colors"
                      title="Download Certificate"
                    >
                      <Download className="w-3.5 h-3.5 text-purple-400" />
                      <span className="hidden sm:inline">Save Image</span>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveCert(null)}
                    className="p-2 rounded-full border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-5 custom-scrollbar">
                {/* Full Certificate Image */}
                {activeCert.image && (
                  <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 bg-neutral-900 shadow-xl">
                    <img
                      src={activeCert.image}
                      alt={activeCert.title}
                      className="w-full h-auto max-h-[50vh] object-contain mx-auto"
                    />
                  </div>
                )}

                {/* Meta Tags */}
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                  {activeCert.event && (
                    <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-white/80">
                      🏆 {activeCert.event}
                    </span>
                  )}
                  {activeCert.project && (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                      💻 Project: {activeCert.project}
                    </span>
                  )}
                  {activeCert.year && (
                    <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-white/60 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {activeCert.year}
                    </span>
                  )}
                </div>

                {/* Full Description */}
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-white/40 mb-2">
                    About this achievement
                  </h4>
                  <div className="text-xs sm:text-sm text-white/80 font-light leading-relaxed whitespace-pre-line bg-white/[0.02] p-4 rounded-xl border border-white/5">
                    {activeCert.description?.replace(/\*\*/g, '')}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default Achievements;
