export type BusinessType = 'hotel' | 'food' | 'company' | 'shop' | 'clinic' | 'portfolio';

export type TemplateStyle = 'modern' | 'classic' | 'bold' | 'artisan';

export type PageLayout = 'single' | 'multi';

export interface WebsiteData {
  type: BusinessType;
  pages: PageLayout;
  template: TemplateStyle;
  name: string;
  tag: string;
  about: string;
  color: string;
  items: string;
  phone: string;
  wa: string;
  email: string;
  addr: string;
  map: string;
  ig: string;
  hero: string;
  gallery: string[];
  show: {
    about: boolean;
    items: boolean;
    gallery: boolean;
    contact: boolean;
  };
}

export interface ParsedItem {
  name: string;
  desc: string;
  price: string;
}

export interface BusinessPreset {
  name: string;
  label: string;
  cta: string;
  tag: string;
  about: string;
  items: string;
}

export interface ContrastCheck {
  label: string;
  ratio: number;
  minRequired: number;
  note: string;
  passed: boolean;
}

export interface LabAnalysis {
  accessibilityScore: number;
  checks: Array<{ label: string; passed: boolean; note?: string }>;
  contrastChecks: ContrastCheck[];
  allContrastPassed: boolean;
  readingEase: number;
  readingLevel: string;
  gradeLevel: number;
  wordCount: number;
  sentenceCount: number;
  pageBytes: number;
  pageKilobytes: string;
  co2Grams: number;
  imageCount: number;
  readableText: string;
}
