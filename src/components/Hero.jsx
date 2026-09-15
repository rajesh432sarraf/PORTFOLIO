import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import MagneticButton from './MagneticButton.jsx';
import { easeEditorial } from '../lib/animations.js';

export function Hero() {
  const containerRef = useRef(null);
  const [canParallax, setCanParallax] = useState(false);

  // Parallax motion values for portrait
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 120, mass: 0.2 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const portraitTiltX = useTransform(smoothY, [-0.5, 0.5], [6, -6]);
  const portraitTiltY = useTransform(smoothX, [-0.5, 0.5], [-8, 8]);
  const portraitTranslateX = useTransform(smoothX, [-0.5, 0.5], [-12, 12]);
  const portraitTranslateY = useTransform(smoothY, [-0.5, 0.5], [-8, 8]);

  useEffect(() => {
    const isFine = window.matchMedia('(pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setCanParallax(isFine && !reducedMotion);
  }, []);

  const handleMouseMove = (e) => {
    if (!canParallax || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const normalizedX = (e.clientX - rect.left) / rect.width - 0.5;
    const normalizedY = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(normalizedX);
    mouseY.set(normalizedY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[100svh] w-full flex flex-col justify-between overflow-hidden px-5 sm:px-8 lg:px-12 pt-24 sm:pt-28 lg:pt-32 pb-8 sm:pb-10 selection:bg-[#7621B0]/40"
      aria-label="Hero Section"
    >
      {/* Subtle Ambient Radial Lighting behind right-side portrait */}
      <div
        className="pointer-events-none absolute top-1/2 right-[5%] -translate-y-1/2 w-[350px] sm:w-[500px] lg:w-[650px] h-[350px] sm:h-[500px] lg:h-[650px] rounded-full bg-gradient-to-tr from-[#7621B0]/20 via-[#B600A8]/10 to-transparent blur-[120px] -z-10"
        aria-hidden="true"
      />

      {/* MAIN HERO ROW: Centered side-by-side alignment with tighter middle gap */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto flex-1 flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-6 lg:gap-6 xl:gap-10 my-auto pt-4 lg:pt-0">
        {/* LEFT COLUMN: Headings, intro statement & CTA button */}
        <div className="w-full lg:w-[54%] xl:w-[55%] flex flex-col items-center lg:items-start text-center lg:text-left">
          {/* Heading: HI, I'M RAJESH enlarged and impactful */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.85,
              ease: easeEditorial,
              delay: 0.2,
            }}
            className="w-full"
          >
            <h1
              className="hero-heading font-black tracking-tighter uppercase whitespace-normal leading-[0.88] drop-shadow-2xl select-none"
              style={{
                fontSize: 'clamp(3rem, 6.8vw, 7.8rem)',
              }}
            >
              HI, I'M RAJESH
            </h1>
          </motion.div>

          {/* Intro Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.75,
              ease: easeEditorial,
              delay: 0.35,
            }}
            className="max-w-[500px] mt-4 sm:mt-5"
          >
            <p
              className="text-[#D7E2EA]/75 font-light tracking-wide leading-relaxed uppercase"
              style={{
                fontSize: 'clamp(0.82rem, 1.2vw, 1.02rem)',
              }}
            >
              B.Tech CSE Core Student & Creative Developer driven by building practical, high-performance digital products and intelligent systems.
            </p>
          </motion.div>

          {/* CTA Action: Contact Me button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.75,
              ease: easeEditorial,
              delay: 0.45,
            }}
            className="mt-6 sm:mt-7"
          >
            <MagneticButton strength={0.35}>
              <a
                href="#contact"
                className="contact-btn-gradient group relative inline-flex items-center justify-center px-8 sm:px-10 py-3.5 sm:py-4 rounded-full text-white text-xs sm:text-sm font-semibold uppercase tracking-widest border border-white/20 backdrop-blur-sm shadow-xl transition-all duration-300"
                aria-label="Contact Rajesh Kumar"
              >
                <span className="relative z-10 flex items-center gap-2 font-semibold">
                  CONTACT ME
                </span>
                <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none" aria-hidden="true">
                  <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/35 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out" />
                </div>
              </a>
            </MagneticButton>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Transparent Background Cutout Portrait (Bigger & closer to center) */}
        <div className="w-full lg:w-[46%] xl:w-[45%] flex justify-center lg:justify-center xl:justify-end items-end relative mt-6 lg:mt-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.85,
              ease: easeEditorial,
              delay: 0.3,
            }}
            style={
              canParallax
                ? {
                    x: portraitTranslateX,
                    y: portraitTranslateY,
                    rotateX: portraitTiltX,
                    rotateY: portraitTiltY,
                    perspective: 1000,
                  }
                : {}
            }
            className="relative flex justify-center items-end w-full max-w-[520px]"
          >
            {/* Cutout Image with zero box, zero border, and soft waist fade */}
            <div
              className="relative w-[300px] sm:w-[380px] lg:w-[460px] xl:w-[500px] max-w-full pointer-events-none"
              style={{
                maskImage: 'linear-gradient(to top, transparent 0%, black 10%, black 100%)',
                WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 10%, black 100%)',
              }}
            >
              <img
                src="/images/rajesh-cutout.png"
                alt="Portrait of Rajesh Kumar, Creative Developer and CSE Student"
                className="w-full h-auto object-contain drop-shadow-[0_15px_45px_rgba(118,33,176,0.28)]"
                loading="eager"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* BOTTOM TICKER / SUBTLE INFO BAR */}
      <div className="relative z-20 w-full flex justify-between items-center text-xs font-mono uppercase text-[#D7E2EA]/40 pt-4 border-t border-white/5 mt-auto">
        <span>Vadlamudi, Guntur, AP, India</span>
        <span>Scroll Down ↓</span>
      </div>
    </section>
  );
}

export default Hero;
