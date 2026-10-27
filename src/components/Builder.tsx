import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Smartphone,
  Monitor,
  Eye,
  Upload,
  Trash2,
  Download,
  Copy,
  Check,
  FlaskConical,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { WebsiteData, BusinessType, TemplateStyle, PageLayout } from '../types';
import { BUSINESS_PRESETS, COLOR_PALETTE } from '../data/presets';
import { generateWebsiteHtml } from '../utils/siteGenerator';

interface BuilderProps {
  data: WebsiteData;
  onChange: (updated: WebsiteData) => void;
  onOpenLab: () => void;
  onDownload: () => void;
  onCopyCode: () => void;
}

export const Builder: React.FC<BuilderProps> = ({
  data,
  onChange,
  onOpenLab,
  onDownload,
  onCopyCode,
}) => {
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [deviceView, setDeviceView] = useState<'desktop' | 'phone'>('desktop');
  const [visionFilter, setVisionFilter] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiMessage, setAiMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const heroInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const currentPreset = BUSINESS_PRESETS[data.type] || BUSINESS_PRESETS.hotel;

  // Generate current HTML for the live preview iframe
  const generatedHtml = generateWebsiteHtml(data);

  // Update iframe whenever HTML changes
  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = generatedHtml;
    }
  }, [generatedHtml]);

  // Handle business type change: preset defaults update placeholders
  const handleTypeChange = (newType: BusinessType) => {
    const preset = BUSINESS_PRESETS[newType];
    onChange({
      ...data,
      type: newType,
      // If fields were empty, keep them empty to inherit the new preset placeholders
    });
  };

  // Canvas image compressor to keep memory light and avoid browser lag
  const processImage = (file: File, maxDim: number, callback: (dataUrl: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          callback(canvas.toDataURL('image/jpeg', 0.82));
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Hero photo upload
  const handleHeroUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file, 1600, (dataUrl) => {
        onChange({ ...data, hero: dataUrl });
      });
    }
  };

  // Remove hero photo
  const handleRemoveHero = () => {
    onChange({ ...data, hero: '' });
    if (heroInputRef.current) heroInputRef.current.value = '';
  };

  // Gallery multi-upload (max 6)
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 6 - data.gallery.length);
    if (files.length === 0) return;

    let processedCount = 0;
    const newImgs: string[] = [];

    files.forEach((file) => {
      processImage(file, 900, (dataUrl) => {
        newImgs.push(dataUrl);
        processedCount++;
        if (processedCount === files.length) {
          onChange({
            ...data,
            gallery: [...data.gallery, ...newImgs].slice(0, 6),
          });
        }
      });
    });

    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const handleRemoveGalleryItem = (index: number) => {
    const next = [...data.gallery];
    next.splice(index, 1);
    onChange({ ...data, gallery: next });
  };

  // AI Copywriter trigger
  const handleGenerateAiCopy = async () => {
    setIsGeneratingAi(true);
    setAiMessage(null);
    try {
      const response = await fetch('/api/ai-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessType: data.type,
          businessName: data.name || currentPreset.name,
        }),
      });

      const resData = await response.json();
      if (resData.success) {
        let itemsString = data.items;
        if (Array.isArray(resData.items) && resData.items.length > 0) {
          itemsString = resData.items
            .map((i: { name: string; desc: string; price: string }) => `${i.name} | ${i.desc} | ${i.price || ''}`)
            .join('\n');
        }

        onChange({
          ...data,
          tag: resData.tagline || data.tag,
          about: resData.about || data.about,
          items: itemsString,
        });

        setAiMessage({
          text: `✦ Generated tailored website copy for "${data.name || currentPreset.name}"!`,
        });
      } else {
        throw new Error(resData.error || 'Failed to generate');
      }
    } catch {
      // Fallback in-client if server call fails
      onChange({
        ...data,
        tag: currentPreset.tag,
        about: currentPreset.about,
        items: currentPreset.items,
      });
      setAiMessage({
        text: 'Filled with curated artisanal copy for this business category.',
      });
    } finally {
      setIsGeneratingAi(false);
      setTimeout(() => setAiMessage(null), 5000);
    }
  };

  const handleLocalCopyCode = () => {
    onCopyCode();
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div id="builder" className="pt-24 pb-16 px-4 md:px-7 max-w-[1440px] mx-auto min-h-screen">
      {/* Title Header */}
      <div className="mb-6">
        <div className="text-[11px] tracking-[0.2em] text-[#fffdf8]/60 mb-2">THE BUILDER / 02</div>
        <h2 className="text-3xl md:text-5xl font-normal tracking-[-0.04em] text-[#fffdf8]">
          Make it yours.<br />
          <em className="font-serif-italic text-[#d6a486]">See it as you type.</em>
        </h2>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden mb-4 p-1 rounded-full border border-white/20 bg-[#251e19]/90 backdrop-blur-md">
        <button
          onClick={() => setMobileTab('edit')}
          className={`flex-1 py-2 text-xs font-semibold rounded-full transition-colors ${
            mobileTab === 'edit' ? 'bg-[#fffdf8] text-[#1a140f]' : 'text-white/70'
          }`}
        >
          1 · Edit Details
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-2 text-xs font-semibold rounded-full transition-colors ${
            mobileTab === 'preview' ? 'bg-[#fffdf8] text-[#1a140f]' : 'text-white/70'
          }`}
        >
          2 · Live Preview
        </button>
      </div>

      {/* Main Grid: Form on Left, Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-[440px_1fr] gap-6 items-start h-auto">
        {/* LEFT COLUMN: EDITOR FORM */}
        <div
          className={`glass-panel p-5 md:p-6 rounded-3xl max-h-[85vh] overflow-y-auto space-y-6 ${
            mobileTab === 'preview' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* AI Assist button */}
          <div>
            <button
              onClick={handleGenerateAiCopy}
              disabled={isGeneratingAi}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#d6a486]/15 hover:bg-[#d6a486]/25 border border-[#d6a486]/35 text-[#f1c9a6] text-xs font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isGeneratingAi ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#d6a486]" />
                  <span>Writing copy with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#d6a486]" />
                  <span>✦ Write website copy with Gemini AI</span>
                </>
              )}
            </button>
            {aiMessage && (
              <div
                className={`mt-2 text-xs px-3 py-1.5 rounded-xl border ${
                  aiMessage.isError
                    ? 'bg-red-500/10 border-red-500/20 text-red-200'
                    : 'bg-[#a9b99a]/15 border-[#a9b99a]/30 text-[#a9b99a]'
                }`}
              >
                {aiMessage.text}
              </div>
            )}
          </div>

          {/* 1. YOUR BUSINESS */}
          <fieldset className="border-0 p-0 m-0 space-y-3.5">
            <legend className="text-xl font-serif-italic text-[#f1c9a6] flex items-center gap-2.5 mb-1">
              <span className="w-5 h-5 rounded-full bg-[#d6a486] text-[#1a140f] text-[11px] font-sans font-bold flex items-center justify-center">
                1
              </span>
              Your business
            </legend>

            <div>
              <label className="block text-xs text-white/60 mb-1">Business category</label>
              <select
                value={data.type}
                onChange={(e) => handleTypeChange(e.target.value as BusinessType)}
                className="w-full bg-white/[0.06] border border-white/20 rounded-xl px-3 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-[#d6a486]"
              >
                <option value="hotel" className="bg-[#251e19]">Hotel / Homestay / Guesthouse</option>
                <option value="food" className="bg-[#251e19]">Restaurant / Café / Bakery</option>
                <option value="company" className="bg-[#251e19]">Company / Agency / Consultancy</option>
                <option value="shop" className="bg-[#251e19]">Shop / Store / Artisan Boutique</option>
                <option value="clinic" className="bg-[#251e19]">Clinic / Therapy / Care Practice</option>
                <option value="portfolio" className="bg-[#251e19]">Creative Studio / Portfolio</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-white/60 mb-1">Business name</label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => onChange({ ...data, name: e.target.value })}
                placeholder={currentPreset.name}
                className="w-full bg-white/[0.06] border border-white/20 rounded-xl px-3 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-[#d6a486]"
              />
            </div>

            <div>
              <label className="block text-xs text-white/60 mb-1">One-line tagline</label>
              <input
                type="text"
                value={data.tag}
                onChange={(e) => onChange({ ...data, tag: e.target.value })}
                placeholder={currentPreset.tag}
                className="w-full bg-white/[0.06] border border-white/20 rounded-xl px-3 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-[#d6a486]"
              />
            </div>

            <div>
              <label className="block text-xs text-white/60 mb-1">About your business</label>
              <textarea
                rows={3}
                value={data.about}
                onChange={(e) => onChange({ ...data, about: e.target.value })}
                placeholder={currentPreset.about}
                className="w-full bg-white/[0.06] border border-white/20 rounded-xl px-3 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-[#d6a486] resize-y"
              />
            </div>
          </fieldset>

          {/* 2. LOOK AND FEEL */}
          <fieldset className="border-0 p-0 m-0 space-y-3.5 pt-4 border-t border-white/10">
            <legend className="text-xl font-serif-italic text-[#f1c9a6] flex items-center gap-2.5 mb-1">
              <span className="w-5 h-5 rounded-full bg-[#d6a486] text-[#1a140f] text-[11px] font-sans font-bold flex items-center justify-center">
                2
              </span>
              Look &amp; feel
            </legend>

            <div>
              <label className="block text-xs text-white/60 mb-1.5">Design template</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['modern', 'classic', 'bold', 'artisan'] as TemplateStyle[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onChange({ ...data, template: t })}
                    className={`py-2 px-2 text-xs font-medium rounded-xl border capitalize transition-all ${
                      data.template === t
                        ? 'bg-[#d6a486]/20 border-[#d6a486] text-[#f1c9a6] shadow-sm'
                        : 'bg-white/[0.04] border-white/15 text-white/70 hover:bg-white/[0.08]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/60 mb-1.5">Page structure</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onChange({ ...data, pages: 'single' })}
                  className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all ${
                    data.pages === 'single'
                      ? 'bg-[#d6a486]/20 border-[#d6a486] text-[#f1c9a6]'
                      : 'bg-white/[0.04] border-white/15 text-white/70 hover:bg-white/[0.08]'
                  }`}
                >
                  Single long-scroll page
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ ...data, pages: 'multi' })}
                  className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all ${
                    data.pages === 'multi'
                      ? 'bg-[#d6a486]/20 border-[#d6a486] text-[#f1c9a6]'
                      : 'bg-white/[0.04] border-white/15 text-white/70 hover:bg-white/[0.08]'
                  }`}
                >
                  Multi-page tabs
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/60 mb-1.5">Primary brand color</label>
              <div className="flex items-center gap-2 flex-wrap">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onChange({ ...data, color: c })}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      data.color.toLowerCase() === c.toLowerCase()
                        ? 'border-white scale-110 shadow-md ring-2 ring-[#d6a486]'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Select color ${c}`}
                  />
                ))}
                <div className="relative flex items-center ml-1">
                  <input
                    type="color"
                    value={data.color}
                    onChange={(e) => onChange({ ...data, color: e.target.value })}
                    className="w-8 h-8 rounded-full border-0 bg-transparent cursor-pointer p-0"
                    title="Custom hex color"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/60 mb-1">Top hero cover photo (optional)</label>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/20 bg-white/[0.05] hover:bg-white/10 text-xs font-medium cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{data.hero ? 'Replace photo' : 'Choose a photo'}</span>
                  <input
                    ref={heroInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleHeroUpload}
                    className="hidden"
                  />
                </label>
                {data.hero && (
                  <button
                    type="button"
                    onClick={handleRemoveHero}
                    className="px-3 py-2 rounded-xl border border-red-500/30 text-red-300 hover:bg-red-500/10 text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
            </div>
          </fieldset>

          {/* 3. WHAT YOU OFFER */}
          <fieldset className="border-0 p-0 m-0 space-y-3.5 pt-4 border-t border-white/10">
            <legend className="text-xl font-serif-italic text-[#f1c9a6] flex items-center gap-2.5 mb-1">
              <span className="w-5 h-5 rounded-full bg-[#d6a486] text-[#1a140f] text-[11px] font-sans font-bold flex items-center justify-center">
                3
              </span>
              What you offer
            </legend>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-white/60">
                  <span className="font-semibold text-white/80">{currentPreset.label}</span> (one per line)
                </label>
                <span className="text-[10px] text-white/40">Format: Name | Description | Price</span>
              </div>
              <textarea
                rows={5}
                value={data.items}
                onChange={(e) => onChange({ ...data, items: e.target.value })}
                placeholder={currentPreset.items}
                className="w-full bg-white/[0.06] border border-white/20 rounded-xl px-3 py-2 text-xs md:text-sm text-white font-mono focus:outline-none focus:border-[#d6a486] resize-y"
              />
              <p className="text-[11px] text-white/50 mt-1">
                Leave empty to display default sample items. Supports up to 12 items.
              </p>
            </div>

            <div>
              <label className="block text-xs text-white/60 mb-1.5">Photo gallery (up to 6 photos)</label>
              <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/20 bg-white/[0.05] hover:bg-white/10 text-xs font-medium cursor-pointer transition-colors mb-2">
                <Upload className="w-3.5 h-3.5" />
                <span>Add photos ({data.gallery.length}/6)</span>
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={data.gallery.length >= 6}
                  onChange={handleGalleryUpload}
                  className="hidden"
                />
              </label>

              {data.gallery.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {data.gallery.map((img, i) => (
                    <div
                      key={i}
                      className="relative w-16 h-12 rounded-lg overflow-hidden border border-white/20 group"
                    >
                      <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryItem(i)}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove image"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-300" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs text-white/60 mb-1.5">Visible sections</label>
              <div className="flex flex-wrap gap-3 text-xs">
                {(['about', 'items', 'gallery', 'contact'] as const).map((sec) => (
                  <label key={sec} className="inline-flex items-center gap-1.5 cursor-pointer text-white/80">
                    <input
                      type="checkbox"
                      checked={data.show[sec]}
                      onChange={(e) =>
                        onChange({
                          ...data,
                          show: { ...data.show, [sec]: e.target.checked },
                        })
                      }
                      className="rounded accent-[#d6a486]"
                    />
                    <span className="capitalize">{sec === 'items' ? 'Offerings' : sec}</span>
                  </label>
                ))}
              </div>
            </div>
          </fieldset>

          {/* 4. HOW PEOPLE REACH YOU */}
          <fieldset className="border-0 p-0 m-0 space-y-3.5 pt-4 border-t border-white/10">
            <legend className="text-xl font-serif-italic text-[#f1c9a6] flex items-center gap-2.5 mb-1">
              <span className="w-5 h-5 rounded-full bg-[#d6a486] text-[#1a140f] text-[11px] font-sans font-bold flex items-center justify-center">
                4
              </span>
              How people reach you
            </legend>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-white/60 mb-1">Phone</label>
                <input
                  type="tel"
                  value={data.phone}
                  onChange={(e) => onChange({ ...data, phone: e.target.value })}
                  placeholder="+1 (555) 019-2831"
                  className="w-full bg-white/[0.06] border border-white/20 rounded-xl px-3 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-[#d6a486]"
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">WhatsApp number</label>
                <input
                  type="tel"
                  value={data.wa}
                  onChange={(e) => onChange({ ...data, wa: e.target.value })}
                  placeholder="with country code (e.g. 15550192831)"
                  className="w-full bg-white/[0.06] border border-white/20 rounded-xl px-3 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-[#d6a486]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/60 mb-1">Email address</label>
              <input
                type="email"
                value={data.email}
                onChange={(e) => onChange({ ...data, email: e.target.value })}
                placeholder="hello@yourbusiness.com"
                className="w-full bg-white/[0.06] border border-white/20 rounded-xl px-3 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-[#d6a486]"
              />
            </div>

            <div>
              <label className="block text-xs text-white/60 mb-1">Street address / location</label>
              <input
                type="text"
                value={data.addr}
                onChange={(e) => onChange({ ...data, addr: e.target.value })}
                placeholder="142 Riverside Way, Old Town"
                className="w-full bg-white/[0.06] border border-white/20 rounded-xl px-3 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-[#d6a486]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-white/60 mb-1">Google Maps link (optional)</label>
                <input
                  type="text"
                  value={data.map}
                  onChange={(e) => onChange({ ...data, map: e.target.value })}
                  placeholder="https://maps.google.com/..."
                  className="w-full bg-white/[0.06] border border-white/20 rounded-xl px-3 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-[#d6a486]"
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Instagram username</label>
                <input
                  type="text"
                  value={data.ig}
                  onChange={(e) => onChange({ ...data, ig: e.target.value })}
                  placeholder="@yourbusiness"
                  className="w-full bg-white/[0.06] border border-white/20 rounded-xl px-3 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-[#d6a486]"
                />
              </div>
            </div>
          </fieldset>

          {/* 5. TEST IT LIKE A SCIENTIST */}
          <fieldset className="border-0 p-0 m-0 space-y-3 pt-4 border-t border-white/10">
            <legend className="text-xl font-serif-italic text-[#f1c9a6] flex items-center gap-2.5 mb-1">
              <span className="w-5 h-5 rounded-full bg-[#d6a486] text-[#1a140f] text-[11px] font-sans font-bold flex items-center justify-center">
                5
              </span>
              Test it like a scientist
            </legend>
            <p className="text-xs text-white/60 leading-relaxed">
              Verify how accessible, readable and carbon-neutral your website is under WCAG AA specifications.
            </p>
            <button
              type="button"
              onClick={onOpenLab}
              className="w-full py-2.5 px-4 rounded-full bg-[#d6a486] hover:bg-[#e8bfa4] text-[#23180f] font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <FlaskConical className="w-4 h-4" />
              <span>Run lab tests &amp; generate report</span>
            </button>
          </fieldset>

          {/* 6. GET YOUR WEBSITE */}
          <fieldset className="border-0 p-0 m-0 space-y-3 pt-4 border-t border-white/10">
            <legend className="text-xl font-serif-italic text-[#f1c9a6] flex items-center gap-2.5 mb-1">
              <span className="w-5 h-5 rounded-full bg-[#d6a486] text-[#1a140f] text-[11px] font-sans font-bold flex items-center justify-center">
                6
              </span>
              Get your website
            </legend>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={onDownload}
                className="flex-1 py-3 px-4 rounded-full bg-[#fffdf8] hover:bg-[#d6a486] text-[#23180f] font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Download website (.html)</span>
              </button>
              <button
                type="button"
                onClick={handleLocalCopyCode}
                className="py-3 px-4 rounded-full border border-white/20 hover:bg-white/10 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {copiedCode ? <Check className="w-4 h-4 text-[#a9b99a]" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'Copied code!' : 'Copy code'}</span>
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-white/70 space-y-1.5">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-[#d6a486]" />
                <span>How to put it online for free:</span>
              </div>
              <p>
                Download the single HTML file, then drag and drop it onto <strong>app.netlify.com/drop</strong> or upload to GitHub Pages / Vercel. Your website receives a live global link in seconds!
              </p>
            </div>
          </fieldset>
        </div>

        {/* RIGHT COLUMN: LIVE INTERACTIVE PREVIEW */}
        <div
          className={`glass-panel rounded-3xl overflow-hidden flex flex-col h-[75vh] lg:h-[85vh] sticky top-24 ${
            mobileTab === 'edit' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Preview Toolbar */}
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/15 bg-white/[0.02] flex-wrap text-xs text-white/70">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#a9b99a] animate-pulse" />
              <span>Live preview &mdash; updates as you type</span>
            </div>

            <div className="flex items-center gap-3 ml-auto">
              {/* Vision simulator */}
              <div className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-white/50" />
                <select
                  value={visionFilter}
                  onChange={(e) => setVisionFilter(e.target.value)}
                  className="bg-white/[0.08] border border-white/15 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                  aria-label="Vision simulator"
                >
                  <option value="" className="bg-[#251e19]">Normal vision</option>
                  <option value="prot" className="bg-[#251e19]">Protanopia (no red)</option>
                  <option value="deut" className="bg-[#251e19]">Deuteranopia (no green)</option>
                  <option value="trit" className="bg-[#251e19]">Tritanopia (no blue)</option>
                  <option value="achr" className="bg-[#251e19]">Achromatopsia (monochrome)</option>
                </select>
              </div>

              {/* Viewport switch */}
              <div className="flex items-center p-0.5 rounded-full border border-white/15 bg-white/[0.05]">
                <button
                  type="button"
                  onClick={() => setDeviceView('desktop')}
                  className={`p-1.5 rounded-full transition-colors ${
                    deviceView === 'desktop' ? 'bg-[#fffdf8] text-[#1a140f]' : 'text-white/60 hover:text-white'
                  }`}
                  title="Desktop View"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceView('phone')}
                  className={`p-1.5 rounded-full transition-colors ${
                    deviceView === 'phone' ? 'bg-[#fffdf8] text-[#1a140f]' : 'text-white/60 hover:text-white'
                  }`}
                  title="Mobile Phone View"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Iframe Viewport Container */}
          <div className="flex-1 p-3 md:p-4 bg-[#100d0a]/60 flex items-center justify-center overflow-auto">
            <div
              className={`h-full transition-all duration-300 rounded-2xl overflow-hidden shadow-2xl border border-white/10 ${
                deviceView === 'phone' ? 'w-[390px] max-w-full' : 'w-full'
              }`}
              style={{
                filter: visionFilter ? `url(#cb-${visionFilter})` : 'none',
              }}
            >
              <iframe
                ref={iframeRef}
                title="Whub Website Preview"
                className="w-full h-full bg-white border-0"
                sandbox="allow-scripts allow-same-origin allow-popups"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SVG Color Blindness Matrix Filters */}
      <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="cb-prot" colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values="0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0" />
          </filter>
          <filter id="cb-deut" colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0" />
          </filter>
          <filter id="cb-trit" colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values="0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0" />
          </filter>
          <filter id="cb-achr" colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values="0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0 0 0 1 0" />
          </filter>
        </defs>
      </svg>
    </div>
  );
};
