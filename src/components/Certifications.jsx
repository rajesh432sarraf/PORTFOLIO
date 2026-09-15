import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowUpRight } from 'lucide-react';
import FadeIn from './FadeIn.jsx';
import { certifications as initialCertifications } from '../data/certifications.js';
import { fetchContentFromDatabase } from '../services/storageService.js';

export function Certifications() {
  const [certList, setCertList] = useState(initialCertifications);

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
          {certList.map((cert, idx) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              className="group relative rounded-[28px] sm:rounded-[36px] bg-white/[0.02] border border-white/[0.08] p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.04]"
            >
              <div>
                <div className="flex items-center justify-between gap-4 mb-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-white/[0.04] border border-white/10 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {cert.badge}
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

              {cert.credentialUrl && (
                <a
                  href={cert.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#BBCCD7] group-hover:text-white transition-colors pt-4 border-t border-white/[0.06]"
                  aria-label={`View ${cert.title} certificate credential`}
                >
                  <span>VIEW CERTIFICATE</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Certifications;
