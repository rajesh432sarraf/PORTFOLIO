import React from 'react';
import {
  Atom,
  Code,
  Palette,
  Wind,
  Zap,
  Layers,
  Sparkles,
  MousePointer,
  GitBranch,
  Server,
  Cpu,
  Terminal,
  FlaskConical,
  Database,
  Flame,
  Bot,
  Search,
  Brain,
  Network,
} from 'lucide-react';

// Custom inline SVG for GitHub
function GitHubIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

const ICON_MAP = {
  React: Atom,
  HTML5: Code,
  CSS3: Palette,
  'Tailwind CSS': Wind,
  Vite: Zap,
  'Framer Motion': Layers,
  GSAP: Sparkles,
  Lenis: MousePointer,
  Git: GitBranch,
  GitHub: GitHubIcon,
  'Node.js': Server,
  Express: Cpu,
  Python: Terminal,
  FastAPI: Zap,
  Flask: FlaskConical,
  MongoDB: Database,
  MySQL: Database,
  Supabase: Flame,
  AI: Bot,
  RAG: Search,
  LLM: Brain,
  'REST API': Network,
};

export function MarqueeRow({ items, rowRef }) {
  // Multiply items to guarantee seamless looping without visual gaps
  const repeatedItems = [...items, ...items, ...items, ...items];

  return (
    <div className="w-full overflow-hidden py-2 sm:py-3 select-none">
      <div
        ref={rowRef}
        className="flex items-center gap-3 sm:gap-4 md:gap-5 will-change-transform"
        style={{ width: 'max-content' }}
      >
        {repeatedItems.map((item, idx) => {
          const IconComponent = ICON_MAP[item];

          return (
            <div
              key={`${item}-${idx}`}
              className="group relative flex items-center gap-2 sm:gap-2.5 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full bg-[#0C0C0C] border border-[#D7E2EA]/[0.18] text-[#D7E2EA] transition-all duration-300 hover:scale-105 hover:border-[#D7E2EA]/50 hover:bg-[#D7E2EA]/[0.04] hover:shadow-[0_0_20px_rgba(215,226,234,0.15)] cursor-default"
            >
              {IconComponent ? (
                <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D7E2EA]/70 group-hover:text-[#D7E2EA] transition-colors" />
              ) : (
                <span className="text-[10px] sm:text-xs font-bold font-mono text-[#D7E2EA]/70 group-hover:text-[#D7E2EA]">
                  {item.substring(0, 2).toUpperCase()}
                </span>
              )}
              <span className="text-xs sm:text-sm md:text-base font-medium tracking-wider uppercase whitespace-nowrap text-[#D7E2EA]/85 group-hover:text-[#D7E2EA] transition-colors">
                {item}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MarqueeRow;
