import React, { useState } from 'react';
import { Download, Copy, Check, Menu } from 'lucide-react';

interface HeaderProps {
  activePage: string;
  onNavigate: (page: string) => void;
  onOpenMenu: () => void;
  onDownload: () => void;
  onCopyCode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePage,
  onNavigate,
  onOpenMenu,
  onDownload,
  onCopyCode,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopyCode();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'builder', label: 'Build' },
    { id: 'how', label: 'How it works' },
    { id: 'examples', label: 'Examples' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <header className="fixed top-4 left-4 right-4 md:left-7 md:right-7 z-50 flex items-center gap-2 max-w-[1400px] mx-auto pointer-events-auto">
      <button
        onClick={() => onNavigate('home')}
        className="font-medium text-2xl md:text-3xl tracking-[0.18em] text-[#fffdf8] hover:text-[#d6a486] transition-colors mr-auto focus:outline-none"
        aria-label="Whub home"
      >
        WHUB
      </button>

      {/* Center Nav Capsule */}
      <nav
        className="hidden lg:flex items-center gap-1 p-1 rounded-full border border-white/20 bg-white/[0.06] backdrop-blur-xl shadow-lg"
        aria-label="Main sections"
      >
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`text-xs md:text-sm px-4 py-2 rounded-full font-medium transition-all ${
              activePage === item.id
                ? 'bg-[#fffdf8] text-[#1a140f] shadow-sm'
                : 'text-[#fffdf8]/80 hover:text-[#fffdf8] hover:bg-white/10'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleCopy}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs md:text-sm font-medium text-white/70 hover:text-white bg-transparent hover:bg-white/[0.08] border border-white/15 rounded-full transition-all active:scale-95"
          title="Copy full website HTML code"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#a9b99a]" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied code!' : 'Copy code'}</span>
        </button>

        <button
          onClick={onDownload}
          className="inline-flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-semibold text-[#1a140f] bg-[#fffdf8] hover:bg-[#d6a486] rounded-full transition-all shadow-md active:scale-95"
          title="Download standalone HTML website"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Download website</span>
          <span className="xs:hidden">Download</span>
        </button>

        <button
          onClick={onOpenMenu}
          className="w-10 h-10 rounded-full border border-white/20 bg-white/[0.08] hover:bg-white/15 flex items-center justify-center text-white transition-all active:scale-95 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
