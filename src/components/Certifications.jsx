import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowUpRight, Eye, ExternalLink, Download, X, Award } from 'lucide-react';
import FadeIn from './FadeIn.jsx';
import { certifications as initialCertifications } from '../data/certifications.js';
import { fetchContentFromDatabase } from '../services/storageService.js';

export function Certifications() {
  const [certList, setCertList] = useState(initialCertifications);
  const [activeCert, setActiveCert] = useState(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (activeCert) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveCert(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeCert]);

  useEffect(() => {
    let isMounted = true;
    const loadCerts = async () => {
      try {
        const data = await fetchContentFromDatabase('certificates', initialCertifications);
        if (isMounted && Array.isArray(data)) {
          setCertList(data);
        }
      } catch (e) {}
    };

    loadCerts();

    const handleUpdate = async () => {
      try {
        const data = await fetchContentFromDatabase('certificates', initialCertifications);
        if (Array.isArray(data)) {
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

  if (!certList || certList.length === 0) {
    return null;
  }

  return (
    <section
      id="certifications"
      className="relative w-full bg-[#0C0C0C] text-[#D7E2EA] px-5 sm:px-8 lg:px-12 py-24 sm:py-32 overflow-hidden"
      aria-label="Certifications & Credentials"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-16 sm:mb-24">
          <FadeIn y={30}>
            <span className="text-xs sm:text-sm uppercase tracking-widest text-[#D7E2EA]/40 font-mono block mb-3">
              [ 09 / TECHNICAL CREDENTIALS ]
            </span>
            <h2
              className="hero-heading font-black tracking-tight uppercase leading-none select-none"
              style={{
                fontSize: 'clamp(2.75rem, 11vw, 150px)',
              }}
            >
              CERTIFICATIONS
            </h2>
          </FadeIn>
        </div>

        {/* Certifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {certList.map((cert, idx) => {
            const hasImage = Boolean(cert.image);
            const hasUrl = Boolean(cert.credentialUrl);

            return (
              <motion.div
                key={cert.id || idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                className="group relative rounded-[28px] sm:rounded-[36px] bg-white/[0.02] border border-white/[0.08] p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.04]"
              >
                <div>
                  {/* Optional Image Preview Thumbnail */}
                  {hasImage && (
                    <div
                      onClick={() => setActiveCert(cert)}
                      className="relative w-full h-40 sm:h-44 rounded-2xl overflow-hidden mb-6 bg-black/40 border border-white/[0.08] cursor-pointer group/thumb"
                    >
                      <img
                        src={cert.image}
                        alt={cert.title}
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover/thumb:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-200 bg-black/40 backdrop-blur-[2px]">
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-black font-semibold text-xs tracking-wider uppercase shadow-lg">
                          <Eye className="w-3.5 h-3.5" /> View Photo
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-4 mb-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-white/[0.04] border border-white/10 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {cert.badge || 'VERIFIED CREDENTIAL'}
                    </span>
                    <span className="text-xs font-mono text-[#D7E2EA]/40">{cert.year}</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#D7E2EA] group-hover:text-white transition-colors mb-2">
                    {cert.title}
                  </h3>

                  <p className="text-xs sm:text-sm font-mono uppercase tracking-wider text-[#D7E2EA]/50 mb-6">
                    {cert.issuer}
                  </p>
                </div>

                {/* Bottom Action Row */}
                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
                  {hasImage ? (
                    <button
                      type="button"
                      onClick={() => setActiveCert(cert)}
                      className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#BBCCD7] group-hover:text-white hover:text-white transition-colors cursor-pointer"
                    >
                      <span>VIEW CERTIFICATE</span>
                      <Eye className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110" />
                    </button>
                  ) : hasUrl ? (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#BBCCD7] group-hover:text-white transition-colors"
                      aria-label={`View ${cert.title} certificate credential`}
                    >
                      <span>VIEW CERTIFICATE</span>
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  ) : (
                    <span className="text-xs font-mono text-[#D7E2EA]/30 uppercase tracking-widest">
                      Credential Archived
                    </span>
                  )}

                  {/* Secondary direct verification link if both exist */}
                  {hasImage && hasUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-[#D7E2EA]/50 hover:text-emerald-400 transition-colors"
                      title="Verify on official issuer portal"
                    >
                      <span>Verify</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
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
                  {/* Official Verification URL */}
                  {activeCert.credentialUrl && (
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
                    className="p-2 rounded-full border border-white/10 text-[#D7E2EA]/70 hover:text-white hover:bg-white/10 transition-colors ml-1"
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
                    {activeCert.credentialUrl && (
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
