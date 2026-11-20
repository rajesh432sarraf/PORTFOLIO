import React from 'react';
import FadeIn from './FadeIn.jsx';
import MagneticButton from './MagneticButton.jsx';
import AnimatedText from './AnimatedText.jsx';
import { easeEditorial } from '../lib/animations.js';

const ABOUT_TEXT =
  "I am a Computer Science & Engineering student driven by turning ambitious ideas into functional, production-ready digital products. Rather than studying theoretical concepts in isolation, my real learning happens through building end-to-end applications, competing in fast-paced hackathons, experimenting with modern web technologies, and exploring practical AI workflows. I enjoy solving complex architectural challenges, creating responsive user interfaces with meaningful interactions, and developing clean, reliable backend systems that deliver genuine value.";

export function About() {
  return (
    <section
      id="about"
      className="relative min-h-[100svh] w-full flex flex-col justify-center items-center overflow-hidden bg-[#0C0C0C] px-5 sm:px-8 lg:px-12 py-24 sm:py-32"
      aria-label="About Me Section"
    >
      {/* Background Ambient Radial Glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] lg:w-[650px] h-[350px] sm:h-[500px] lg:h-[650px] rounded-full bg-gradient-to-tr from-[#7621B0]/10 via-[#B600A8]/5 to-transparent blur-[140px] -z-10"
        aria-hidden="true"
      />

      {/* CENTRAL ABOUT CONTAINER */}
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center z-10">
        {/* Giant Section Heading */}
        <FadeIn y={40} duration={0.9}>
          <h2
            className="hero-heading font-black tracking-tight uppercase leading-none select-none mb-10 sm:mb-14"
            style={{
              fontSize: 'clamp(2.75rem, 11vw, 150px)',
            }}
          >
            ABOUT ME
          </h2>
        </FadeIn>

        {/* Scroll-driven character reveal paragraph */}
        <div className="max-w-[560px] sm:max-w-[640px] lg:max-w-[680px] mb-12 sm:mb-16">
          <AnimatedText
            text={ABOUT_TEXT}
            className="text-[#D7E2EA] font-medium leading-relaxed"
            style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.35rem)',
            }}
          />
        </div>

        {/* Contact CTA with MagneticButton */}
        <FadeIn delay={0.25} y={20}>
          <MagneticButton strength={0.35}>
            <a
              href="#contact"
              className="contact-btn-gradient group relative inline-flex items-center justify-center px-9 sm:px-12 py-3.5 sm:py-4 rounded-full text-white text-xs sm:text-sm font-semibold uppercase tracking-widest border border-white/20 backdrop-blur-sm shadow-xl transition-all duration-300"
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
        </FadeIn>
      </div>
    </section>
  );
}

export default About;
