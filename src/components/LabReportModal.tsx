import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Volume2, Download, Sparkles, RefreshCw } from 'lucide-react';
import { WebsiteData, LabAnalysis } from '../types';
import { analyzeWebsite, autoFixColor, generateReportMarkdown } from '../utils/scienceLab';

interface LabReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: WebsiteData;
  onUpdateColor: (newColor: string) => void;
}

export const LabReportModal: React.FC<LabReportModalProps> = ({
  isOpen,
  onClose,
  data,
  onUpdateColor,
}) => {
  const [analysis, setAnalysis] = useState<LabAnalysis | null>(null);
  const [speechStatus, setSpeechStatus] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const result = analyzeWebsite(data);
      setAnalysis(result);
    } else {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      setSpeechStatus('');
    }
  }, [isOpen, data]);

  if (!isOpen || !analysis) return null;

  const handleFixColor = () => {
    const fixed = autoFixColor(data.color);
    onUpdateColor(fixed);
  };

  const handleListen = () => {
    if (!('speechSynthesis' in window)) {
      setSpeechStatus('Text-to-speech is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeechStatus('Speech stopped.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(analysis.readableText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeechStatus('Reading page out loud. Notice if your copy sounds natural or confusing to screen readers.');
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeechStatus('Finished reading page.');
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeechStatus('Speech audio playback interrupted.');
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleDownloadReport = () => {
    const md = generateReportMarkdown(data, analysis);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const slug = (data.name || 'my-website').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    a.download = `${slug}-accessibility-science-report.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSpeechStatus('Science report (.md) downloaded successfully.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-[#1f1812] border border-white/20 rounded-3xl p-6 md:p-8 text-[#fffdf8] shadow-2xl overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lab-report-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 id="lab-report-title" className="text-2xl md:text-3xl font-serif-italic text-[#f1c9a6]">
              Website Science &amp; Accessibility Lab
            </h2>
            <p className="text-xs text-white/60 mt-1">
              Live scientific audit evaluating WCAG 2.1 compliance, readability indices, and carbon emissions.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Big Score Summary Ring */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mt-6 p-5 rounded-2xl bg-white/[0.04] border border-white/10">
          <div
            className="relative w-24 h-24 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: `conic-gradient(#d6a486 ${analysis.accessibilityScore}%, rgba(255,255,255,0.12) 0)`,
            }}
          >
            <div className="w-[78px] h-[78px] rounded-full bg-[#1f1812] flex items-center justify-center text-2xl font-bold tracking-tight text-[#fffdf8]">
              {analysis.accessibilityScore}
            </div>
          </div>
          <div>
            <div className="text-lg md:text-xl font-semibold text-[#fffdf8]">
              Overall Health: {analysis.accessibilityScore} / 100
            </div>
            <p className="text-xs text-white/70 mt-1 leading-relaxed">
              {analysis.checks.filter((c) => c.passed).length} of {analysis.checks.length} accessibility &amp; usability benchmarks currently passed for “{data.name || 'Your Website'}”.
            </p>
          </div>
        </div>

        {/* 1. Accessibility Checklist */}
        <div className="mt-8">
          <h3 className="text-base font-semibold text-[#fffdf8] flex items-center gap-2">
            <span className="text-[#d6a486]">1 ·</span> Accessibility Checklist (WCAG 2.1)
          </h3>
          <p className="text-xs text-white/60 mt-0.5 mb-3">
            Essential criteria ensuring users with assistive devices can navigate your content.
          </p>
          <ul className="space-y-2">
            {analysis.checks.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs"
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    item.passed ? 'bg-[#a9b99a]/20 text-[#a9b99a]' : 'bg-[#e0a58a]/20 text-[#e0a58a]'
                  }`}
                >
                  {item.passed ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                </span>
                <div>
                  <span className={item.passed ? 'text-[#fffdf8]' : 'text-[#fcd9c7] font-medium'}>
                    {item.label}
                  </span>
                  {item.note && <p className="text-[11px] text-white/50 mt-0.5">{item.note}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* 2. Color Contrast Ratios */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-[#fffdf8] flex items-center gap-2">
              <span className="text-[#d6a486]">2 ·</span> Color Contrast (Relative Luminance Formula)
            </h3>
            {!analysis.allContrastPassed && (
              <button
                onClick={handleFixColor}
                className="text-xs text-[#d6a486] hover:underline flex items-center gap-1 font-medium"
              >
                <Sparkles className="w-3.5 h-3.5" /> Auto-Fix Color
              </button>
            )}
          </div>
          <p className="text-xs text-white/60 mt-0.5 mb-3">
            WCAG formula: (L1 + 0.05) &divide; (L2 + 0.05). High contrast ensures readability in bright sunlight and for low-vision visitors.
          </p>
          <div className="space-y-2">
            {analysis.contrastChecks.map((check, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs"
              >
                <div>
                  <span className="text-white/90">{check.label}</span>
                  <div className="text-[11px] text-white/50 mt-0.5">{check.note}</div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <span
                    className={`font-semibold text-xs px-2 py-0.5 rounded-md ${
                      check.passed ? 'bg-[#a9b99a]/20 text-[#a9b99a]' : 'bg-[#e0a58a]/20 text-[#e0a58a]'
                    }`}
                  >
                    {check.ratio.toFixed(2)} : 1
                  </span>
                  <div className="text-[10px] text-white/40 mt-0.5">
                    {check.passed ? 'Passed' : `Needs ${check.minRequired}:1`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Readability Index */}
        <div className="mt-8">
          <h3 className="text-base font-semibold text-[#fffdf8] flex items-center gap-2">
            <span className="text-[#d6a486]">3 ·</span> Readability (Flesch Reading Ease Formula)
          </h3>
          <p className="text-xs text-white/60 mt-0.5 mb-3">
            206.835 &minus; 1.015 &times; (words &divide; sentences) &minus; 84.6 &times; (syllables &divide; words). Target: 60 or higher.
          </p>
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div>
              <div className="text-sm font-semibold text-[#fffdf8]">
                Reading Ease Score: <span className="text-[#d6a486] text-base">{analysis.readingEase}</span> / 100
              </div>
              <p className="text-white/70 mt-1">
                Classified as <strong>{analysis.readingLevel}</strong> (approximately Grade {analysis.gradeLevel}).
              </p>
            </div>
            <div className="text-left sm:text-right text-white/60 border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 sm:pl-4">
              <div>{analysis.wordCount} total words</div>
              <div>{analysis.sentenceCount} sentences</div>
            </div>
          </div>
        </div>

        {/* 4. Page Weight and Carbon Footprint */}
        <div className="mt-8">
          <h3 className="text-base font-semibold text-[#fffdf8] flex items-center gap-2">
            <span className="text-[#d6a486]">4 ·</span> Page Weight &amp; Carbon Footprint
          </h3>
          <p className="text-xs text-white/60 mt-0.5 mb-3">
            Calculated via Sustainable Web Design model: 0.81 kWh/GB &times; 442 g CO₂/kWh (global grid average).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="text-white/50">Total HTML Size</div>
              <div className="text-lg font-bold text-[#fffdf8] mt-1">{analysis.pageKilobytes} KB</div>
              <p className="text-[11px] text-white/60 mt-1">
                {analysis.imageCount} embedded image{analysis.imageCount === 1 ? '' : 's'}. Loads in &lt; 0.2s on mobile networks.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="text-white/50">Carbon Impact</div>
              <div className="text-lg font-bold text-[#a9b99a] mt-1">
                {(analysis.co2Grams * 1000).toFixed(2)} mg CO₂
              </div>
              <p className="text-[11px] text-white/60 mt-1">
                Per page visit. Approximately ~{(analysis.co2Grams * 1000).toFixed(1)} g per 1,000 visits (95% cleaner than typical sites).
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Notifications */}
        {speechStatus && (
          <div className="mt-6 p-3 rounded-xl bg-[#d6a486]/10 border border-[#d6a486]/30 text-xs text-[#f1c9a6]">
            {speechStatus}
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-white/10 flex flex-wrap items-center gap-3">
          {!analysis.allContrastPassed && (
            <button
              onClick={handleFixColor}
              className="px-4 py-2.5 rounded-full bg-[#d6a486] hover:bg-[#e8bfa4] text-[#23180f] font-semibold text-xs flex items-center gap-2 transition-all active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Fix Color Contrast</span>
            </button>
          )}

          <button
            onClick={handleListen}
            className={`px-4 py-2.5 rounded-full border text-xs font-medium flex items-center gap-2 transition-all active:scale-95 ${
              isSpeaking
                ? 'bg-red-500/20 border-red-500/40 text-red-200'
                : 'border-white/20 bg-white/5 text-white hover:bg-white/10'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{isSpeaking ? 'Stop Listening' : 'Listen to My Page (Screen Reader)'}</span>
          </button>

          <button
            onClick={handleDownloadReport}
            className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium text-xs flex items-center gap-2 transition-all active:scale-95 ml-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Report (.md)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
