import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  ArrowUpRight,
  Eye,
  ExternalLink,
  Download,
  X,
  Award,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import FadeIn from './FadeIn.jsx';
import { certifications as initialCertifications } from '../data/certifications.js';
import { fetchContentFromDatabase } from '../services/storageService.js';

export function Certifications() {
  const [certList, setCertList] = useState(initialCertifications);
  const [activeCert, setActiveCert] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef(null);

  // Sync with MongoDB / IndexedDB
  useEffect(() => {
    let isMounted = true;
    const loadCerts = async () => {
      try {
        const data = await fetchContentFromDatabase('certificates', initialCertifications);
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const hasImages = data.some((item) => Boolean(item.image));
          if (!hasImages && initialCertifications.some((item) => Boolean(item.image))) {
            setCertList(initialCertifications);
          } else {
            setCertList(data);
          }
        }
      } catch (e) {
        if (isMounted) setCertList(initialCertifications);
      }
    };

    loadCerts();

    const handleUpdate = async () => {
      try {
        const data = await fetchContentFromDatabase('certificates', initialCertifications);
        if (Array.isArray(data) && data.length > 0) {
          setCertList(data);
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
    setCurrentIndex(Math.min(Math.max(newIdx, 0), certList.length - 1));
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

  // Mouse Drag-to-Scroll for desktop mouse users
  const dragInfoRef = useRef({ isDown: false, startX: 0, scrollLeft: 0, hasMoved: false });

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left click
    const container = scrollContainerRef.current;
    if (!container) return;

    dragInfoRef.current = {
      isDown: true,
      startX: e.pageX - container.offsetLeft,
      scrollLeft: container.scrollLeft,
      hasMoved: false,
    };
  };

  const handleMouseMove = (e) => {
    if (!dragInfoRef.current.isDown) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - dragInfoRef.current.startX) * 1.3;
    if (Math.abs(walk) > 4) {
      dragInfoRef.current.hasMoved = true;
      container.scrollLeft = dragInfoRef.current.scrollLeft - walk;
    }
  };

  const handleMouseUpOrLeave = () => {
    dragInfoRef.current.isDown = false;
    setTimeout(() => {
      dragInfoRef.current.hasMoved = false;
    }, 60);
  };

  // Lock body scroll when modal is open and handle Escape key
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

  if (!certList || certList.length === 0) {
    return null;
  }

  // Get badge styling based on certificate badge/title
  const getBadgeStyle = (badge = '', title = '') => {
    const text = `${badge} ${title}`.toLowerCase();
    if (text.includes('completion') || text.includes('rating') || text.includes('codechef')) {
      return {
        badge: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
        icon: <Award className="w-3.5 h-3.5 text-amber-400" />,
      };
    }
    if (text.includes('dialogue') || text.includes('young leaders') || text.includes('government')) {
      return {
        badge: 'bg-purple-400/10 text-purple-300 border-purple-400/30',
        icon: <Sparkles className="w-3.5 h-3.5 text-purple-400" />,
      };
    }
    if (text.includes('essentials') || text.includes('javascript') || text.includes('basics')) {
      return {
        badge: 'bg-cyan-400/10 text-cyan-300 border-cyan-400/30',
        icon: <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />,
      };
    }
    return {
      badge: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
    };
  };

  return (
    <section
      id="certifications"
      className="relative w-full bg-[#0C0C0C] text-[#D7E2EA] px-5 sm:px-8 lg:px-12 py-20 sm:py-24 overflow-hidden"
      aria-label="Certifications & Credentials"
    >
      {/* Background Ambient Glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/4 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-[#00D26A]/5 via-[#00B4D8]/5 to-transparent blur-[140px] -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto">
        {/* Section Header: Compact & Integrated */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-14">
          <FadeIn y={20}>
            <span className="text-xs sm:text-sm uppercase tracking-widest text-[#D7E2EA]/40 font-mono block mb-2">
              [ 09 / TECHNICAL CREDENTIALS ]
            </span>
            <h2
              className="hero-heading font-black tracking-tight uppercase leading-none select-none"
              style={{
                fontSize: 'clamp(2.5rem, 8vw, 100px)',
              }}
            >
              CERTIFICATIONS
            </h2>
          </FadeIn>

          {/* Slider Controls & Counter */}
          <FadeIn delay={0.1} y={20}>
            <div className="flex items-center gap-4 select-none">
              {/* Slide Counter */}
              <div className="text-xs font-mono uppercase tracking-widest text-[#D7E2EA]/50 bg-white/[0.03] border border-white/10 px-4 py-2 rounded-full">
                <span className="text-white font-bold">{String(currentIndex + 1).padStart(2, '0')}</span>
                <span className="mx-1.5 text-white/30">/</span>
                <span>{String(certList.length).padStart(2, '0')}</span>
              </div>

              {/* Navigation Arrow Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollTo('prev')}
                  className="p-2.5 rounded-full border border-white/15 bg-white/[0.02] text-white hover:bg-white/10 hover:border-white/30 active:scale-95 transition-all cursor-pointer focus:outline-none"
                  aria-label="Previous certificate"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollTo('next')}
                  className="p-2.5 rounded-full border border-white/15 bg-white/[0.02] text-white hover:bg-white/10 hover:border-white/30 active:scale-95 transition-all cursor-pointer focus:outline-none"
                  aria-label="Next certificate"
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
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className="flex gap-5 sm:gap-6 overflow-x-auto pb-6 pt-1 px-1 custom-scrollbar snap-x snap-mandatory scroll-smooth cursor-grab active:cursor-grabbing"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            overscrollBehaviorX: 'contain',
          }}
        >
          {certList.map((cert, idx) => {
            const hasImage = Boolean(cert.image);
            const hasWebUrl = Boolean(cert.credentialUrl && cert.credentialUrl.startsWith('http'));
            const tier = getBadgeStyle(cert.badge, cert.title);

            return (
              <motion.div
                key={cert.id || idx}
                onClick={() => {
                  if (dragInfoRef.current.hasMoved) return;
                  setActiveCert(cert);
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.6, delay: Math.min(idx * 0.08, 0.4) }}
                className="group relative flex-shrink-0 w-[290px] sm:w-[340px] md:w-[380px] rounded-3xl bg-[#0E0E0E] border border-white/10 hover:border-emerald-400/50 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(16,185,129,0.18)] snap-start cursor-pointer touch-manipulation"
                role="button"
                tabIndex={0}
                aria-label={`View certificate for ${cert.title}`}
              >
                {/* Certificate Preview Banner (Compact 16:9) */}
                {hasImage ? (
                  <div className="relative w-full h-40 sm:h-44 bg-neutral-900 overflow-hidden cursor-pointer">
                    <img
                      src={cert.image}
                      alt={cert.title}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E0E] via-transparent to-black/30" />

                    {/* Quick View Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-xs font-mono text-white">
                      <Maximize2 className="w-4 h-4 text-emerald-400" />
                      <span>View Certificate</span>
                    </div>

                    {/* Credential Badge on Image */}
                    <div className="absolute top-3 left-3 z-10 max-w-[70%]">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider backdrop-blur-md border ${tier.badge} truncate`}
                      >
                        {tier.icon}
                        <span className="truncate">{cert.badge || 'VERIFIED CREDENTIAL'}</span>
                      </span>
                    </div>

                    {/* Year Badge */}
                    {cert.year && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-white/70 bg-black/60 backdrop-blur-md border border-white/10">
                          {cert.year}
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
                      <span>{cert.badge || 'VERIFIED CREDENTIAL'}</span>
                    </span>
                    {cert.year && (
                      <span className="text-[11px] font-mono text-white/50">{cert.year}</span>
                    )}
                  </div>
                )}

                {/* Card Body */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Header: Number & Title */}
                    <div className="flex items-start gap-3 mb-2">
                      <span className="font-kanit font-black text-lg text-white/30 shrink-0">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-bold uppercase tracking-tight text-white leading-snug line-clamp-2">
                          {cert.title}
                        </h3>
                        <p className="text-xs font-mono uppercase tracking-wider text-emerald-400/80 line-clamp-1 mt-1">
                          {cert.issuer}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono">
                    <span className="text-white/60 group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                      <span>Click card to view</span>
                      <span>↗</span>
                    </span>

                    {hasWebUrl ? (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-[#D7E2EA]/50 hover:text-emerald-400 transition-colors"
                        title="Verify on official issuer portal"
                      >
                        <span>Verify</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[10px] uppercase text-white/30">Verified</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Swipe Hint on Mobile */}
        <div className="flex items-center justify-center gap-2 mt-4 text-[11px] font-mono text-white/40 md:hidden">
          <span>← Swipe to explore certificates →</span>
        </div>
      </div>

      {/* ── Certificate Preview Modal ── */}
      <AnimatePresence>
        {activeCert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setActiveCert(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
              aria-hidden="true"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-[#0E0E0E] border border-white/15 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10"
              role="dialog"
              aria-modal="true"
              aria-label={`${activeCert.title} Certificate Preview`}
            >
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between px-5 sm:px-8 py-4 border-b border-white/10 bg-[#0C0C0C]/90 backdrop-blur-md">
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex-shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-base font-bold text-white tracking-wide uppercase font-mono truncate">
                      {activeCert.title}
                    </h3>
                    <p className="text-xs text-[#D7E2EA]/50 truncate">
                      {activeCert.issuer} • {activeCert.year}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  {/* Official Verification URL (if web link) */}
                  {activeCert.credentialUrl && activeCert.credentialUrl.startsWith('http') && (
                    <a
                      href={activeCert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-mono uppercase tracking-wider hover:bg-emerald-500/20 transition-all"
                      title="Open official verification page"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Verify Online</span>
                      <span className="sm:hidden">Verify</span>
                    </a>
                  )}

                  {/* Download Image Button */}
                  {activeCert.image && (
                    <a
                      href={activeCert.image}
                      download={`${activeCert.title.replace(/[^a-zA-Z0-9]/g, '_')}_Certificate.png`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white text-black font-semibold text-xs tracking-wider uppercase hover:bg-neutral-200 transition-all shadow-md active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Download</span>
                    </a>
                  )}

                  {/* Close Button */}
                  <button
                    type="button"
                    onClick={() => setActiveCert(null)}
                    className="p-2 rounded-full border border-white/10 text-[#D7E2EA]/70 hover:text-white hover:bg-white/10 transition-colors ml-1 cursor-pointer"
                    aria-label="Close certificate modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Image Body */}
              <div className="relative flex-1 w-full bg-[#070707] p-4 sm:p-8 overflow-y-auto flex flex-col items-center justify-center">
                {activeCert.image ? (
                  <div className="relative max-w-full flex flex-col items-center">
                    <img
                      src={activeCert.image}
                      alt={activeCert.title}
                      className="max-w-full max-h-[62vh] object-contain rounded-xl shadow-2xl border border-white/10 bg-neutral-900"
                    />
                    <div className="mt-4 flex items-center justify-between w-full text-xs font-mono text-[#D7E2EA]/50 px-1">
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {activeCert.badge || 'VERIFIED CREDENTIAL'}
                      </span>
                      <span>{activeCert.issuer}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 px-4">
                    <Award className="w-12 h-12 text-emerald-400 mx-auto mb-4 opacity-80" />
                    <p className="text-base text-white font-bold mb-2">{activeCert.title}</p>
                    <p className="text-sm text-[#D7E2EA]/60 mb-6">
                      Issued by {activeCert.issuer} in {activeCert.year}
                    </p>
                    {activeCert.credentialUrl && activeCert.credentialUrl.startsWith('http') && (
                      <a
                        href={activeCert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 text-black font-semibold text-xs tracking-wider uppercase hover:bg-emerald-400 transition-all"
                      >
                        <span>Open Verification Page</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default Certifications;
