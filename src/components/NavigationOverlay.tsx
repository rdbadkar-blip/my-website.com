import React, { useEffect } from 'react';
import { X, ArrowUpRight } from 'lucide-react';

interface NavigationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (pageId: string) => void;
}

export const NavigationOverlay: React.FC<NavigationOverlayProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const links = [
    { id: 'home', num: '01', title: 'Home', subtitle: 'What Whub does' },
    { id: 'builder', num: '02', title: 'Build', subtitle: 'Fill in, watch it appear' },
    { id: 'how', num: '03', title: 'How it works', subtitle: 'Four simple steps' },
    { id: 'examples', num: '04', title: 'Examples', subtitle: 'Curated looks to start from' },
    { id: 'contact', num: '05', title: 'Contact', subtitle: 'Talk to the team' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-t from-[#594133]/90 via-[#251e19] to-[#100d0a] text-[#fffdf8] flex flex-col justify-between p-6 sm:p-10 md:p-16 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="Site Navigation"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between max-w-7xl w-full mx-auto">
        <span className="font-medium text-2xl md:text-3xl tracking-[0.18em] text-[#fffdf8]">
          WHUB
        </span>
        <button
          onClick={onClose}
          className="px-5 py-2 rounded-full border border-white/30 hover:border-white text-xs md:text-sm font-medium transition-colors flex items-center gap-2"
        >
          <span>Close</span>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 max-w-7xl w-full mx-auto my-auto py-8">
        {/* Left Column: Brand Statement */}
        <div className="flex flex-col justify-center">
          <div className="text-[11px] tracking-[0.2em] text-[#fffdf8]/60 mb-4">
            A WEBSITE WITHIN MINUTES.
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-normal leading-tight tracking-[-0.04em] text-[#fffdf8]">
            Come as you are.<br />
            <em className="font-serif-italic text-[#d6a486]">Leave with a website.</em>
          </h2>
          <p className="mt-6 text-sm md:text-base text-white/70 max-w-sm leading-relaxed">
            No code. No cost to try. Take your time making it completely yours.
          </p>
        </div>

        {/* Right Column: Nav Links */}
        <div className="flex flex-col justify-center divide-y divide-white/15">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onNavigate(link.id);
                onClose();
              }}
              className="group py-5 flex items-center justify-between text-left transition-colors hover:text-[#d6a486]"
            >
              <div className="flex items-baseline gap-5">
                <span className="text-xs text-white/40 group-hover:text-[#d6a486] font-mono">
                  {link.num}
                </span>
                <div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-normal tracking-tight">
                    {link.title}
                  </div>
                  <div className="text-xs text-white/50 group-hover:text-white/80 mt-0.5">
                    {link.subtitle}
                  </div>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-white/40 group-hover:text-[#d6a486] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Footer Note */}
      <div className="max-w-7xl w-full mx-auto pt-6 border-t border-white/10 text-[11px] tracking-[0.2em] text-[#fffdf8]/50">
        A WEBSITE FOR EVERY BUSINESS &middot; WHUB SITE MAKER
      </div>
    </div>
  );
};
