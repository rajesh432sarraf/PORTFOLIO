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
        <div className="max-w-[560px] sm:max-w-[640px] lg:max-w-[680px] mb-8">
          <AnimatedText
            text={ABOUT_TEXT}
            className="text-[#D7E2EA] font-medium leading-relaxed"
            style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.35rem)',
            }}
          />
        </div>

        {/* Authentic Interactive Developer Terminal */}
        <FadeIn delay={0.15} y={24}>
          <div className="w-full max-w-2xl my-8 rounded-2xl bg-[#090909] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden text-left font-mono">
            {/* Terminal Window Header Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.03] border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FF5F56]/90 inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#FFBD2E]/90 inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#27C93F]/90 inline-block" />
                <span className="ml-2 text-[11px] text-[#D7E2EA]/50 tracking-wide select-none">
                  rajesh@dev-station: ~
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-emerald-400/90 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>git:(main)</span>
              </div>
            </div>

            {/* Terminal Command & JSON Output */}
            <div className="p-4 sm:p-6 text-xs sm:text-[13px] leading-relaxed space-y-3 overflow-x-auto custom-scrollbar break-words">
              <div className="flex items-center gap-2 text-white/90">
                <span className="text-emerald-400 font-bold">❯</span>
                <span className="text-[#BBCCD7]">cat engineer_manifesto.json</span>
              </div>

              <div className="pl-4 border-l border-white/10 text-white/70 space-y-1 text-xs">
                <p>
                  <span className="text-purple-400">"engineer"</span>: <span className="text-amber-300">"Rajesh Kumar"</span>,
                </p>
                <p>
                  <span className="text-purple-400">"role"</span>: <span className="text-amber-300">"Full-Stack Web &amp; Systems Developer"</span>,
                </p>
                <p>
                  <span className="text-purple-400">"education"</span>: <span className="text-amber-300">"B.Tech Computer Science Core"</span>,
                </p>
                <p>
                  <span className="text-purple-400">"architecture"</span>: <span className="text-emerald-300">["Clean Code", "REST APIs", "Modern React", "MongoDB Database"]</span>,
                </p>
                <p>
                  <span className="text-purple-400">"mindset"</span>: <span className="text-amber-300">"Build production-grade digital products that solve real problems."</span>,
                </p>
                <p>
                  <span className="text-purple-400">"status"</span>: <span className="text-emerald-400 font-semibold">"Ready for software engineering internships &amp; high-impact roles"</span>
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <span className="text-emerald-400 font-bold">❯</span>
                <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse" />
              </div>
            </div>
          </div>
        </FadeIn>

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
