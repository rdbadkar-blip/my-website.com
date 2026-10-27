import React, { useEffect, useState, useRef } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';

interface HeroSceneProps {
  onStartBuilding: () => void;
}

export const HeroScene: React.FC<HeroSceneProps> = ({ onStartBuilding }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalHeight = containerRef.current.offsetHeight - window.innerHeight;
      if (totalHeight <= 0) return;
      const progress = Math.max(0, Math.min(1, -rect.top / totalHeight));
      setScrollProgress(progress);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const p = scrollProgress;
  const isFinished = p > 0.72;

  // 3D transforms based on scroll progress and mouse position
  const leftWallTransform = `translate3d(${p * -34}%, 0, ${p * 420}px) rotateY(${p * 22 + mousePos.x * 1.5}deg)`;
  const rightWallTransform = `translate3d(${p * 34}%, 0, ${p * 420}px) rotateY(${p * -22 + mousePos.x * 1.5}deg)`;
  const floorTransform = `translate3d(0, 0, ${p * 260}px) scale(${1 + p * 0.9})`;
  const portalTransform = `scale(${1 + p * 13})`;
  const skyTransform = `scale(${1 + p * 5})`;

  const wordsLine1 = ['Websites', 'that', 'carry'];
  const wordsLine2 = ['your', 'whole', 'business.'];

  return (
    <section ref={containerRef} className="relative h-[240vh] md:h-[280vh] overflow-clip isolate">
      <div className="sticky top-0 h-[100vh] w-full overflow-hidden flex flex-col justify-between">
        {/* 3D Canyon Scene */}
        <div className="scene-container absolute inset-0 -z-20 overflow-hidden bg-gradient-to-b from-[#1a1109] via-[#2b1e14] to-[#100d0a]">
          {/* Sky Center Aperture */}
          <div
            className="absolute left-[48%] w-[4%] top-0 h-[49%] bg-[#cdc6b9]/65 transition-transform duration-75 origin-bottom"
            style={{ transform: skyTransform }}
          />

          {/* Canyon Floor */}
          <div
            className="absolute left-[28%] right-[28%] bottom-0 h-[51%] bg-gradient-to-b from-[#cdbba0] to-[#6d5a47] transition-transform duration-75 origin-top"
            style={{
              clipPath: 'polygon(40% 0, 60% 0, 100% 100%, 0 100%)',
              transform: floorTransform,
            }}
          />

          {/* Portal Horizon Glow Line */}
          <div
            className="absolute left-[44%] right-[44%] top-[49.5%] h-[3%] bg-gradient-to-r from-[#38c0b6] to-[#12726f] transition-transform duration-75 origin-center"
            style={{ transform: portalTransform }}
          />
          <div
            className="absolute left-[42%] right-[42%] top-[49%] h-[2px] bg-[#e7a24a] transition-transform duration-75 origin-center"
            style={{ transform: portalTransform }}
          />

          {/* Left Canyon Wall */}
          <div
            className="absolute left-0 top-0 bottom-0 w-[48%] bg-gradient-to-r from-[#150e09] to-[#3a281c] origin-left transition-transform duration-75"
            style={{
              clipPath: 'polygon(0 0, 72% 0, 100% 50%, 38% 100%, 0 100%)',
              transform: leftWallTransform,
            }}
          />

          {/* Right Canyon Wall */}
          <div
            className="absolute right-0 top-0 bottom-0 w-[48%] bg-gradient-to-l from-[#8a6a50] to-[#4e3a2b] origin-right transition-transform duration-75"
            style={{
              clipPath: 'polygon(28% 0, 100% 0, 100% 100%, 62% 100%, 0 50%)',
              transform: rightWallTransform,
            }}
          />

          {/* Radial Sunrise Glow as Canyon opens */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(255,226,170,0.95), rgba(214,164,134,0.45) 40%, transparent 72%)',
              opacity: Math.max(0, Math.min(0.9, (p - 0.5) * 2.2)),
            }}
          />
        </div>

        {/* Ambient Top Vignette */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0a0705]/60 via-transparent to-[#0c0805]/80 pointer-events-none" />

        {/* Small Top Kicker */}
        <div
          className="absolute left-6 md:left-10 top-24 md:top-28 text-[11px] tracking-[0.2em] text-[#fffdf8]/70 flex items-center gap-2 transition-opacity duration-300"
          style={{ opacity: Math.max(0, 1 - p * 5) }}
        >
          <span className="text-[#d6a486]">✳</span> A COMPLETE WEBSITE WITHIN MINUTES
        </div>

        {/* Main Headline Block (Bottom-Left) */}
        <div
          className="absolute left-6 md:left-10 bottom-8 md:bottom-12 max-w-[850px] transition-all duration-300 origin-bottom-left"
          style={{
            transform: `translate3d(0, ${p * -70}px, ${p * -260}px)`,
            opacity: Math.max(0, 1 - p * 2.4),
          }}
        >
          <div className="flex items-center gap-3 text-[11px] tracking-[0.22em] text-[#fffdf8]/80 mb-5">
            <span className="font-semibold text-[#d6a486]">01</span>
            <span className="w-8 h-[1px] bg-current opacity-60 inline-block" />
            <span>THE SITE MAKER</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[84px] font-normal leading-[0.98] tracking-[-0.05em] text-[#fffdf8] drop-shadow-lg">
            <span className="block whitespace-nowrap">
              {wordsLine1.map((w, i) => (
                <span
                  key={w}
                  className="inline-block mr-[0.25em] transition-all duration-700"
                  style={{ transitionDelay: `${i * 90}ms` }}
                >
                  {w}
                </span>
              ))}
            </span>
            <span className="block font-serif-italic font-normal text-[1.12em] tracking-[-0.04em] text-[#f1c9a6] mt-1.5 whitespace-nowrap">
              {wordsLine2.map((w, i) => (
                <span
                  key={w}
                  className="inline-block mr-[0.25em] transition-all duration-700"
                  style={{ transitionDelay: `${(i + 3) * 90}ms` }}
                >
                  {w}
                </span>
              ))}
            </span>
          </h1>
        </div>

        {/* Intro Copy & Action Button (Bottom-Right) */}
        <div
          className="absolute right-6 md:right-10 bottom-8 md:bottom-12 w-[310px] md:w-[340px] text-sm text-[#fffdf8]/90 transition-all duration-300"
          style={{
            opacity: Math.max(0, 1 - p * 2.4),
            transform: `translate3d(0, ${p * -40}px, ${p * -200}px)`,
          }}
        >
          <p className="leading-relaxed">
            Fill in a few details and get a finished website for your hotel, restaurant, boutique or studio. Preview it live as you type, test it, then download the file.
          </p>
          <button
            onClick={onStartBuilding}
            className="mt-6 inline-flex items-center gap-6 px-6 py-3.5 bg-[#d6a486] hover:bg-[#e8bfa4] text-[#23180f] font-semibold text-sm rounded-full transition-all shadow-lg active:scale-95 group"
          >
            <span>Start building</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Scroll Cue Indicator */}
        <div
          className="absolute left-1/2 top-[58%] -translate-x-1/2 flex flex-col items-center gap-2 text-[10px] tracking-[0.2em] text-[#fffdf8]/60 transition-opacity duration-300 pointer-events-none"
          style={{ opacity: Math.max(0, 1 - p * 5) }}
        >
          <span>SCROLL TO DISCOVER</span>
          <div className="w-6 h-9 rounded-full border border-white/30 flex items-center justify-center pt-1 animate-bounce">
            <ChevronDown className="w-3.5 h-3.5 text-[#d6a486]" />
          </div>
        </div>

        {/* Reveal Finish State inside Hero */}
        <div
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-[min(700px,90%)] transition-all duration-500 ${
            isFinished ? 'pointer-events-auto opacity-100 scale-100' : 'pointer-events-none opacity-0 scale-90'
          }`}
        >
          <div className="flex items-center justify-center gap-3 text-xs tracking-[0.25em] text-[#23180f] font-semibold mb-3">
            <span>READY WHEN YOU ARE</span>
          </div>
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-normal tracking-[-0.05em] text-[#23180f] leading-[0.98]">
            Your turn.<br />
            <em className="font-serif-italic">Build your site.</em>
          </h2>
          <p className="mt-4 text-[#23180f]/80 text-sm md:text-base max-w-md mx-auto">
            Everything updates instantly. No code required.
          </p>
          <button
            onClick={onStartBuilding}
            className="mt-6 inline-flex items-center gap-4 px-8 py-4 bg-[#23180f] hover:bg-[#3a281c] text-[#fffdf8] font-semibold text-sm rounded-full transition-all shadow-xl active:scale-95 group"
          >
            <span>Open Builder</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-[#d6a486]" />
          </button>
        </div>
      </div>
    </section>
  );
};
