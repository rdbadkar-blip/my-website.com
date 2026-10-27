/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { WebsiteData, TemplateStyle } from './types';
import { COLOR_PALETTE } from './data/presets';
import { generateWebsiteHtml } from './utils/siteGenerator';
import { Header } from './components/Header';
import { HeroScene } from './components/HeroScene';
import { Builder } from './components/Builder';
import { HowItWorks } from './components/HowItWorks';
import { ExamplesGallery } from './components/ExamplesGallery';
import { ContactSection } from './components/ContactSection';
import { LabReportModal } from './components/LabReportModal';
import { NavigationOverlay } from './components/NavigationOverlay';

const STORAGE_KEY = 'whub_site_maker_state';

const INITIAL_DATA: WebsiteData = {
  type: 'hotel',
  pages: 'single',
  template: 'modern',
  name: '',
  tag: '',
  about: '',
  color: COLOR_PALETTE[0],
  items: '',
  phone: '',
  wa: '',
  email: '',
  addr: '',
  map: '',
  ig: '',
  hero: '',
  gallery: [],
  show: {
    about: true,
    items: true,
    gallery: true,
    contact: true,
  },
};

export default function App() {
  const [data, setData] = useState<WebsiteData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...INITIAL_DATA, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Could not load saved state from localStorage:', e);
    }
    return INITIAL_DATA;
  });

  const [activePage, setActivePage] = useState<string>('home');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isLabOpen, setIsLabOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [data]);

  // Sync window hash for routing
  useEffect(() => {
    const handleHash = () => {
      const hash = (window.location.hash || '#home').replace('#', '');
      if (['home', 'builder', 'how', 'examples', 'contact'].includes(hash)) {
        setActivePage(hash);
      }
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleNavigate = (pageId: string) => {
    setActivePage(pageId);
    window.location.hash = pageId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDownload = () => {
    try {
      const html = generateWebsiteHtml(data);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const slug = (data.name || 'my-website').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'my-website';
      a.download = `${slug}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Website HTML file downloaded! Drag onto app.netlify.com/drop to go live.');
    } catch (err) {
      console.error(err);
      showToast('Download failed. Please try Copy Code instead.');
    }
  };

  const handleCopyCode = async () => {
    try {
      const html = generateWebsiteHtml(data);
      await navigator.clipboard.writeText(html);
      showToast('Complete website HTML copied to clipboard!');
    } catch {
      showToast('Could not copy automatically. Check browser permissions.');
    }
  };

  const handleSelectTemplate = (template: TemplateStyle) => {
    setData((prev) => ({ ...prev, template }));
    handleNavigate('builder');
    showToast(`Applied ${template} look to your builder.`);
  };

  return (
    <div className="min-h-screen bg-[#100d0a] text-[#fffdf8] selection:bg-[#d6a486] selection:text-[#1a140f] relative font-sans antialiased">
      {/* Fixed Header */}
      <Header
        activePage={activePage}
        onNavigate={handleNavigate}
        onOpenMenu={() => setIsMenuOpen(true)}
        onDownload={handleDownload}
        onCopyCode={handleCopyCode}
      />

      {/* Pages Container */}
      <main>
        {activePage === 'home' && (
          <HeroScene onStartBuilding={() => handleNavigate('builder')} />
        )}

        {activePage === 'builder' && (
          <Builder
            data={data}
            onChange={setData}
            onOpenLab={() => setIsLabOpen(true)}
            onDownload={handleDownload}
            onCopyCode={handleCopyCode}
          />
        )}

        {activePage === 'how' && (
          <HowItWorks onStartBuilding={() => handleNavigate('builder')} />
        )}

        {activePage === 'examples' && (
          <ExamplesGallery onSelectTemplate={handleSelectTemplate} />
        )}

        {activePage === 'contact' && (
          <ContactSection />
        )}
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full bg-[#251e19] border border-[#d6a486]/40 text-[#fffdf8] text-xs md:text-sm font-medium shadow-2xl flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#d6a486]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Fullscreen Navigation Modal */}
      <NavigationOverlay
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Scientific Accessibility & Carbon Lab Modal */}
      <LabReportModal
        isOpen={isLabOpen}
        onClose={() => setIsLabOpen(false)}
        data={data}
        onUpdateColor={(newColor) => setData((prev) => ({ ...prev, color: newColor }))}
      />
    </div>
  );
}
