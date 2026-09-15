import React, { useRef, useEffect } from 'react';
import MarqueeRow from './MarqueeRow.jsx';

const ROW_1_ITEMS = [
  'React',
  'JavaScript',
  'HTML5',
  'CSS3',
  'Tailwind CSS',
  'Vite',
  'Framer Motion',
  'GSAP',
  'Lenis',
  'Git',
  'GitHub',
];

const ROW_2_ITEMS = [
  'Node.js',
  'Express',
  'Python',
  'FastAPI',
  'Flask',
  'MongoDB',
  'MySQL',
  'Supabase',
  'AI',
  'RAG',
  'LLM',
  'REST API',
];

export function Marquee() {
  const containerRef = useRef(null);
  const row1Ref = useRef(null);
  const row2Ref = useRef(null);

  useEffect(() => {
    let animationFrameId;
    let lastScrollY = window.scrollY;
    let row1Pos = -1000; // start slightly offset so it flows right seamlessly
    let row2Pos = 0;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const animate = () => {
      if (!containerRef.current || !row1Ref.current || !row2Ref.current) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;

      if (inView) {
        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - lastScrollY;
        lastScrollY = currentScrollY;

        // Base continuous idle movement + dynamic scroll acceleration
        // Row 1 moves RIGHT (positive translation delta)
        row1Pos += 0.6 + scrollDelta * 1.2;

        // Row 2 moves LEFT (negative translation delta)
        row2Pos -= 0.6 + scrollDelta * 1.2;

        // Modulo boundaries based on half the row width for seamless infinite looping
        const row1Width = row1Ref.current.scrollWidth / 2 || 2000;
        const row2Width = row2Ref.current.scrollWidth / 2 || 2000;

        if (row1Pos > 0) row1Pos -= row1Width;
        if (row1Pos < -row1Width) row1Pos += row1Width;

        if (row2Pos < -row2Width) row2Pos += row2Width;
        if (row2Pos > 0) row2Pos -= row2Width;

        row1Ref.current.style.transform = `translate3d(${row1Pos}px, 0px, 0px)`;
        row2Ref.current.style.transform = `translate3d(${row2Pos}px, 0px, 0px)`;
      } else {
        lastScrollY = window.scrollY;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full py-20 sm:py-28 lg:py-36 overflow-hidden bg-[#0C0C0C]"
      aria-label="Technology Showcase"
    >
      {/* Subtle edge vignette fades so pills glide in from darkness */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28 md:w-40 bg-gradient-to-r from-[#0C0C0C] to-transparent z-10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28 md:w-40 bg-gradient-to-l from-[#0C0C0C] to-transparent z-10"
        aria-hidden="true"
      />

      <div className="flex flex-col gap-2 sm:gap-3">
        {/* Row 1 — Moves towards the RIGHT */}
        <MarqueeRow items={ROW_1_ITEMS} rowRef={row1Ref} />

        {/* Row 2 — Moves towards the LEFT */}
        <MarqueeRow items={ROW_2_ITEMS} rowRef={row2Ref} />
      </div>
    </section>
  );
}

export default Marquee;
