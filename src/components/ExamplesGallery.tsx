import React from 'react';
import { TemplateStyle } from '../types';
import { ArrowRight } from 'lucide-react';

interface ExamplesGalleryProps {
  onSelectTemplate: (template: TemplateStyle) => void;
}

export const ExamplesGallery: React.FC<ExamplesGalleryProps> = ({ onSelectTemplate }) => {
  const templates: Array<{
    id: TemplateStyle;
    title: string;
    description: string;
    previewBg: string;
    cardBg: string;
    headingFont: string;
    fontStyle: string;
    tag: string;
  }> = [
    {
      id: 'modern',
      title: 'Modern Clean',
      description: 'Airy, friendly and accessible. Excellent for coffee houses, studios, modern clinics, and tech teams.',
      previewBg: 'linear-gradient(135deg, #d98b3a, #5a3a14)',
      cardBg: '#f8fafc',
      headingFont: 'sans-serif',
      fontStyle: 'font-bold',
      tag: 'Versatile & Crisp',
    },
    {
      id: 'classic',
      title: 'Classic Editorial',
      description: 'Warm, timeless and dignified with Georgia serif headings. Ideal for boutique hotels, wine bars, and fine dining.',
      previewBg: 'linear-gradient(135deg, #7a5a3a, #2b2118)',
      cardBg: '#faf6ee',
      headingFont: 'Georgia, serif',
      fontStyle: 'font-normal italic',
      tag: 'Warm & Literary',
    },
    {
      id: 'bold',
      title: 'Bold Swiss Minimalist',
      description: 'High-contrast dark canvas with impactful uppercase typography. Built for agencies, streetwear, and architects.',
      previewBg: '#0d0d0f',
      cardBg: '#18181b',
      headingFont: 'Impact, sans-serif',
      fontStyle: 'uppercase tracking-wider',
      tag: 'Confident & Edgy',
    },
    {
      id: 'artisan',
      title: 'Warm Artisan',
      description: 'Tactile oatmeal textures with Cormorant Garamond display. Designed for ceramists, botanists, and craft workshops.',
      previewBg: 'linear-gradient(135deg, #8c684d, #3c2a1c)',
      cardBg: '#f5f0e8',
      headingFont: '"Cormorant Garamond", serif',
      fontStyle: 'font-semibold',
      tag: 'Earthy & Handcrafted',
    },
  ];

  return (
    <div id="examples" className="pt-24 pb-20 px-4 md:px-7 max-w-[1240px] mx-auto min-h-screen">
      <div className="mb-12">
        <div className="text-[11px] tracking-[0.2em] text-[#fffdf8]/60 mb-2">EXAMPLES / 04</div>
        <h2 className="text-3xl md:text-5xl font-normal tracking-[-0.04em] text-[#fffdf8]">
          Curated visual styles.<br />
          <em className="font-serif-italic text-[#d6a486]">Make any of them yours.</em>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {templates.map((tpl) => (
          <article
            key={tpl.id}
            className="glass-panel p-5 rounded-3xl flex flex-col justify-between hover:border-white/30 transition-all hover:-translate-y-1 group"
          >
            <div>
              {/* Mini Preview Box */}
              <div
                className="h-32 rounded-2xl p-4 flex flex-col justify-between mb-4 border border-white/10 overflow-hidden shadow-inner"
                style={{ background: tpl.previewBg }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm text-white ${tpl.fontStyle}`}
                    style={{ fontFamily: tpl.headingFont }}
                  >
                    Maple House
                  </span>
                  <span className="w-10 h-3 rounded-full bg-white/30" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/40 text-white/90 backdrop-blur-sm">
                    {tpl.tag}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-medium text-[#fffdf8] mb-1.5">{tpl.title}</h3>
              <p className="text-xs text-white/70 leading-relaxed mb-6">{tpl.description}</p>
            </div>

            <button
              onClick={() => onSelectTemplate(tpl.id)}
              className="w-full py-2.5 px-4 rounded-full bg-[#d6a486] hover:bg-[#e8bfa4] text-[#23180f] font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
            >
              <span>Build with this look</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
};
