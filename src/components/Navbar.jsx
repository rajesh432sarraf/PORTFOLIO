import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowUpRight, Eye } from 'lucide-react';
import MagneticButton from './MagneticButton.jsx';
import ResumeModal from './ResumeModal.jsx';
import { easeEditorial } from '../lib/animations.js';

// Clean SVG for GitHub
function GitHubIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

const NAV_ITEMS = [
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Build', href: '#services' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Achievements', href: '#achievements' },
  { label: 'Contact', href: '#contact' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const sections = NAV_ITEMS.map((item) => item.href.replace('#', '')).filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(`#${entry.target.id}`);
          }
        });
      },
      {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0,
      }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'py-3 backdrop-blur-xl bg-[#090D0F]/85 border-b border-white/10 shadow-2xl'
            : 'py-5 sm:py-6 bg-transparent'
        } px-5 sm:px-8 lg:px-10`}
      >
        <nav
          className="w-full flex items-center justify-between gap-6"
          aria-label="Main Navigation"
        >
          {/* Brand Logo / Identity - Extreme Left */}
          <motion.a
            href="#"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="group flex items-center gap-2.5 sm:gap-3 text-lg sm:text-xl lg:text-2xl font-black tracking-widest uppercase flex-shrink-0 select-none cursor-pointer"
            aria-label="Rajesh Kumar Home"
          >
            <span className="relative flex h-2.5 w-2.5 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="font-kanit font-black tracking-wider text-white group-hover:text-[#D7E2EA] transition-colors">
              RAJESH KUMAR
            </span>
            <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400 font-medium lowercase tracking-normal">
              open for roles
            </span>
          </motion.a>

          {/* Right Aligned Navigation Group (Links + Action Buttons) */}
          <div className="flex items-center gap-6 lg:gap-10 ml-auto">
            {/* Desktop Navigation Links - Aligned Towards Right Side */}
            <ul className="hidden md:flex items-center gap-6 lg:gap-8 text-sm lg:text-base uppercase tracking-widest font-medium text-[#D7E2EA]">
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.href;
                return (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className={`relative py-1 transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#D7E2EA] ${
                        isActive
                          ? 'text-white font-semibold'
                          : 'text-[#D7E2EA]/75 hover:text-white'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isActive && (
                        <motion.span
                          layoutId="activeNavIndicator"
                          className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#BBCCD7] rounded-full"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>

            {/* Right Action: Resume & GitHub Profile Buttons */}
            <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
              <MagneticButton strength={0.25} className="hidden sm:block">
                <button
                  type="button"
                  onClick={() => setIsResumeModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs sm:text-sm uppercase tracking-widest font-medium rounded-full border border-white/20 text-[#D7E2EA] hover:bg-white/10 hover:border-white/40 transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-white cursor-pointer"
                  aria-label="View Resume"
                >
                  <Eye className="w-3.5 h-3.5 text-purple-400" />
                  <span>Resume</span>
                </button>
              </MagneticButton>

              {/* GitHub Developer Link */}
              <a
                href="https://github.com/rajeshsarraf"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs uppercase tracking-wider font-mono text-white/70 hover:text-white border border-white/15 hover:border-white/40 rounded-full hover:bg-white/[0.06] transition-all"
                title="GitHub Profile (rajeshsarraf)"
                aria-label="GitHub Profile"
              >
                <GitHubIcon className="w-3.5 h-3.5 text-white/80" />
                <span>GitHub</span>
              </a>

              {/* Mobile Hamburger Toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-[#D7E2EA] hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-1 focus-visible:ring-[#D7E2EA]"
                aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: easeEditorial }}
            className="fixed inset-0 z-30 bg-[#0C0C0C]/98 backdrop-blur-xl md:hidden flex flex-col justify-between pt-28 pb-10 px-8"
          >
            <ul className="flex flex-col gap-6 text-xl uppercase tracking-widest font-medium text-[#D7E2EA]">
              {NAV_ITEMS.map((item, idx) => (
                <motion.li
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * idx, duration: 0.3 }}
                >
                  <a
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-[#D7E2EA] hover:opacity-75 transition-opacity"
                  >
                    {item.label}
                  </a>
                </motion.li>
              ))}
            </ul>

            <div className="pt-6 border-t border-white/10 flex flex-col gap-4">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsResumeModalOpen(true);
                }}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-full border border-white/20 text-[#D7E2EA] uppercase tracking-widest text-sm font-medium hover:bg-white/10 transition-colors"
              >
                <Eye className="w-4 h-4 text-purple-400" />
                <span>View Resume</span>
              </button>

              <a
                href="https://github.com/rajeshsarraf"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full border border-white/10 bg-white/[0.02] text-white/80 uppercase tracking-widest text-xs font-mono hover:text-white hover:bg-white/10 transition-colors"
              >
                <GitHubIcon className="w-4 h-4 text-white/80" />
                <span>GitHub Profile</span>
              </a>

              <p className="text-xs uppercase tracking-widest text-white/40 text-center">
                Rajesh Kumar • VFSTR • 3rd Year
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Resume PDF Viewer Modal */}
      <ResumeModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
      />
    </>
  );
}

export default Navbar;

