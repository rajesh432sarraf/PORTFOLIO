import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowUpRight, Lock, Eye } from 'lucide-react';
import MagneticButton from './MagneticButton.jsx';
import ResumeModal from './ResumeModal.jsx';
import { easeEditorial } from '../lib/animations.js';

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
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver for active section tracking
  useEffect(() => {
    const sectionIds = ['about', 'skills', 'services', 'projects', 'experience', 'achievements', 'contact'];
    const observers = [];

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(`#${entry.target.id}`);
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -50% 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sectionIds.forEach((id) => {
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
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: easeEditorial, delay: 0 }}
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0C0C0C]/80 backdrop-blur-md py-4 border-b border-white/[0.04]'
            : 'bg-transparent py-5 sm:py-6 lg:py-8'
        } px-5 sm:px-8 lg:px-10`}
      >
        <nav
          className="w-full flex items-center justify-between gap-6"
          aria-label="Main Navigation"
        >
          {/* Brand Logo / Identity - Extreme Left */}
          <a
            href="#"
            className="group flex items-center gap-2 text-sm sm:text-base font-medium tracking-widest uppercase text-[#D7E2EA] hover:opacity-80 transition-opacity duration-200 flex-shrink-0"
            aria-label="Rajesh Kumar Home"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold tracking-wide">RAJESH KUMAR</span>
          </a>

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

            {/* Right Action: Resume & Login Buttons */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <MagneticButton strength={0.25} className="hidden sm:block">
                <button
                  type="button"
                  onClick={() => setIsResumeModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs sm:text-sm uppercase tracking-widest font-medium rounded-full border border-white/20 text-[#D7E2EA] hover:bg-white/10 hover:border-white/40 transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
                  aria-label="View Resume"
                >
                  <Eye className="w-3.5 h-3.5 text-purple-400" />
                  <span>Resume</span>
                </button>
              </MagneticButton>

              {/* Admin Login Button */}
              <a
                href="/admin/login"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-widest font-mono text-white/50 hover:text-white border border-white/10 hover:border-white/30 rounded-full hover:bg-white/[0.05] transition-all"
                title="Admin CMS Portal"
                aria-label="Admin CMS Portal"
              >
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Login</span>
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
      </motion.header>

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
                href="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full border border-white/10 bg-white/[0.02] text-white/60 uppercase tracking-widest text-xs font-mono hover:text-white hover:bg-white/10 transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Admin Login</span>
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

