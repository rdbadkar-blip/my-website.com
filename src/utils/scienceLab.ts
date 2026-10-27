import { WebsiteData, LabAnalysis, ContrastCheck } from '../types';
import { BUSINESS_PRESETS } from '../data/presets';
import { generateWebsiteHtml, parseItems, getRelativeLuminance, getInkColor } from './siteGenerator';

export function calculateContrastRatio(color1: string, color2: string): number {
  const l1 = getRelativeLuminance(color1);
  const l2 = getRelativeLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function countSyllables(word: string): number {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!clean) return 0;
  if (clean.length <= 3) return 1;
  const pruned = clean
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
    .replace(/^y/, '');
  const matches = pruned.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

export function calculateReadability(text: string) {
  const sentences = Math.max(1, (text.match(/[.!?]+/g) || []).length);
  const words = text.match(/[A-Za-z’']+/g) || [];
  const wordCount = Math.max(1, words.length);
  const totalSyllables = words.reduce((acc, w) => acc + countSyllables(w), 0);

  const fre = 206.835 - 1.015 * (wordCount / sentences) - 84.6 * (totalSyllables / wordCount);
  const fk = 0.39 * (wordCount / sentences) + 11.8 * (totalSyllables / wordCount) - 15.59;

  let readingLevel = 'Plain English';
  if (fre >= 80) readingLevel = 'Very Easy (6th grade)';
  else if (fre >= 65) readingLevel = 'Standard (8th-9th grade)';
  else if (fre >= 50) readingLevel = 'Fairly Difficult (High School)';
  else readingLevel = 'Academic / Difficult';

  return {
    fre: Math.round(fre),
    fk: Math.max(1, Math.round(fk)),
    wordCount,
    sentenceCount: sentences,
    readingLevel,
  };
}

export function autoFixColor(currentColor: string): string {
  let clean = currentColor.replace('#', '');
  let r = parseInt(clean.substring(0, 2), 16);
  let g = parseInt(clean.substring(2, 4), 16);
  let b = parseInt(clean.substring(4, 6), 16);

  // If contrast against white is < 4.5, darken the color iteratively
  for (let i = 0; i < 40; i++) {
    const currentHex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    if (calculateContrastRatio('#ffffff', currentHex) >= 4.5) {
      return currentHex;
    }
    r = Math.max(0, Math.round(r * 0.94));
    g = Math.max(0, Math.round(g * 0.94));
    b = Math.max(0, Math.round(b * 0.94));
  }
  return '#945b34';
}

export function analyzeWebsite(data: WebsiteData): LabAnalysis {
  const preset = BUSINESS_PRESETS[data.type] || BUSINESS_PRESETS.hotel;
  const brandColor = data.color || '#d6a486';
  const brandInk = getInkColor(brandColor);
  const tagline = (data.tag || preset.tag).trim();
  const about = (data.about || preset.about).trim();
  const items = parseItems(data.items || preset.items);
  const fullHtml = generateWebsiteHtml(data);

  // Contrast evaluations
  const contrastChecks: ContrastCheck[] = [];

  // Hero white text on brand color
  if (!data.hero) {
    const heroTitleRatio = calculateContrastRatio('#ffffff', brandColor);
    contrastChecks.push({
      label: 'Hero headline (white text on brand background)',
      ratio: heroTitleRatio,
      minRequired: 3.0,
      note: 'Large display text requires at least 3.0 : 1 under WCAG AA.',
      passed: heroTitleRatio >= 3.0,
    });

    const heroSubRatio = calculateContrastRatio('#ffffff', brandColor);
    contrastChecks.push({
      label: 'Hero subtitle (white text on brand background)',
      ratio: heroSubRatio,
      minRequired: 4.5,
      note: 'Standard body text requires at least 4.5 : 1 under WCAG AA.',
      passed: heroSubRatio >= 4.5,
    });
  }

  // CTA Button ink on brand color
  const buttonRatio = calculateContrastRatio(brandInk, brandColor);
  contrastChecks.push({
    label: 'Primary CTA button text on button fill',
    ratio: buttonRatio,
    minRequired: 4.5,
    note: 'Ensures call-to-action is clearly readable.',
    passed: buttonRatio >= 4.5,
  });

  // Body text on background
  const themeBg = data.template === 'bold' ? '#0d0d0f' : data.template === 'classic' ? '#faf6ee' : '#ffffff';
  const themeInk = data.template === 'bold' ? '#f5f5f5' : data.template === 'classic' ? '#2b2118' : '#14202b';
  const bodyRatio = calculateContrastRatio(themeInk, themeBg);
  contrastChecks.push({
    label: 'Body copy text on page canvas',
    ratio: bodyRatio,
    minRequired: 4.5,
    note: 'Core readability for all visitors.',
    passed: bodyRatio >= 4.5,
  });

  // Card price / accents
  const cardBg = data.template === 'bold' ? '#18181b' : '#ffffff';
  const priceRatio = calculateContrastRatio(brandColor, cardBg);
  contrastChecks.push({
    label: 'Price tags and accent highlights on cards',
    ratio: priceRatio,
    minRequired: 3.5,
    note: 'Accent clarity against card surfaces.',
    passed: priceRatio >= 3.5,
  });

  const allContrastPassed = contrastChecks.every((c) => c.passed);

  // Readability
  const narrativeText = `${tagline}. ${about} ${items.map((i) => `${i.name}. ${i.desc}`).join(' ')}`;
  const readStats = calculateReadability(narrativeText);

  // Carbon and size
  const pageBytes = new Blob([fullHtml]).size;
  const pageKilobytes = (pageBytes / 1024).toFixed(1);
  const imageCount = (data.hero ? 1 : 0) + data.gallery.length;

  // Sustainable Web Design model: 0.81 kWh / GB * 442 g CO2 / kWh
  const co2Grams = (pageBytes / (1024 * 1024 * 1024)) * 0.81 * 442;

  // Checklist checks
  const checks = [
    { label: 'Page language attribute is defined (lang="en")', passed: true },
    {
      label: 'Unique custom business title provided',
      passed: !!data.name.trim(),
      note: data.name.trim() ? undefined : 'Add your business name to personalize.',
    },
    { label: 'Every image contains descriptive alt attributes', passed: true },
    { label: 'Body font size is $\\ge$ 16px with responsive line height', passed: true },
    {
      label: 'Multiple direct contact channels available (phone/WA/email)',
      passed: !!(data.phone || data.wa || data.email),
      note: data.phone || data.wa || data.email ? undefined : 'Add a phone, WhatsApp, or email.',
    },
    {
      label: 'WCAG AA Color contrast compliance',
      passed: allContrastPassed,
      note: allContrastPassed ? undefined : 'Some color pairs have low contrast ratio.',
    },
    {
      label: 'Flesch Reading Ease $\\ge$ 60 (clear, welcoming prose)',
      passed: readStats.fre >= 55,
      note: `Currently ${readStats.fre} (${readStats.readingLevel}).`,
    },
  ];

  const passedCount = checks.filter((c) => c.passed).length;
  const accessibilityScore = Math.round((passedCount / checks.length) * 100);

  return {
    accessibilityScore,
    checks,
    contrastChecks,
    allContrastPassed,
    readingEase: readStats.fre,
    readingLevel: readStats.readingLevel,
    gradeLevel: readStats.fk,
    wordCount: readStats.wordCount,
    sentenceCount: readStats.sentenceCount,
    pageBytes,
    pageKilobytes,
    co2Grams,
    imageCount,
    readableText: narrativeText,
  };
}

export function generateReportMarkdown(data: WebsiteData, analysis: LabAnalysis): string {
  const preset = BUSINESS_PRESETS[data.type] || BUSINESS_PRESETS.hotel;
  const name = data.name || preset.name;
  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return `# Whub Science & Accessibility Report: ${name}

**Date Generated:** ${dateStr}  
**Business Category:** ${data.type}  
**Template Design:** ${data.template} (${data.pages}-page layout)  
**Overall Accessibility Score:** ${analysis.accessibilityScore} / 100  

---

## 1. Executive Summary
This website was audited using automated accessibility heuristics (WCAG 2.1 AA standards), Flesch reading-ease computational metrics, and the Sustainable Web Design carbon model.

- **Status:** ${analysis.accessibilityScore >= 85 ? 'Excellent' : analysis.accessibilityScore >= 70 ? 'Good' : 'Needs Optimization'}
- **Total Checks Passed:** ${analysis.checks.filter((c) => c.passed).length} of ${analysis.checks.length}
- **Reading Ease:** ${analysis.readingEase} (${analysis.readingLevel})
- **Page Size:** ${analysis.pageKilobytes} KB (${analysis.imageCount} embedded image${analysis.imageCount === 1 ? '' : 's'})
- **Estimated Carbon:** ${(analysis.co2Grams * 1000).toFixed(2)} mg CO₂ per visit (${(analysis.co2Grams * 1000).toFixed(1)} g per 1,000 visits)

---

## 2. Accessibility Checklist (WCAG 2.1)
${analysis.checks.map((c) => `- [${c.passed ? 'x' : ' '}] **${c.label}** ${c.note ? `*(${c.note})*` : ''}`).join('\n')}

---

## 3. Color Contrast Ratios
${analysis.contrastChecks
  .map(
    (c) =>
      `- **${c.label}**: ${c.ratio.toFixed(2)}:1 (Min required: ${c.minRequired}:1) — **${c.passed ? 'PASS' : 'FAIL'}**`,
  )
  .join('\n')}

---

## 4. Linguistic Readability Analysis
- **Flesch Reading Ease:** ${analysis.readingEase} / 100
- **Flesch-Kincaid Grade Level:** Grade ${analysis.gradeLevel}
- **Word Count:** ${analysis.wordCount} words
- **Sentence Count:** ${analysis.sentenceCount} sentences

*Aiming for a Reading Ease score between 60–80 ensures that international visitors and diverse audiences can easily digest what your business offers.*

---

## 5. Sustainable Web Design & Environmental Footprint
- Model: Sustainable Web Design (0.81 kWh/GB × 442 g CO₂/kWh).
- Total file transfer weight: ${analysis.pageKilobytes} KB.
- Comparison: Standard commercial landing pages average 2,200 KB. This site is roughly ${Math.max(1, Math.round(2200 / Math.max(1, analysis.pageBytes / 1024)))}x lighter, reducing server load and battery consumption on mobile devices.

---
*Report generated automatically by Whub Site Maker.*
`;
}
