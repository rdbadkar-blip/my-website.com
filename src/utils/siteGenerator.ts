import { WebsiteData, ParsedItem, TemplateStyle } from '../types';
import { BUSINESS_PRESETS } from '../data/presets';

export function parseItems(text: string): ParsedItem[] {
  if (!text) return [];
  return text
    .split('\n')
    .map((line) => {
      const parts = line.split('|').map((s) => s.trim());
      return {
        name: parts[0] || '',
        desc: parts[1] || '',
        price: parts[2] || '',
      };
    })
    .filter((item) => item.name.length > 0)
    .slice(0, 12);
}

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function getRelativeLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;

  const a = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

export function getInkColor(bgHex: string): string {
  const lum = getRelativeLuminance(bgHex);
  return lum > 0.4 ? '#111827' : '#ffffff';
}

function mixColor(hex: string, factor: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgb(${Math.round(r * factor)}, ${Math.round(g * factor)}, ${Math.round(b * factor)})`;
}

interface TemplateConfig {
  bg: string;
  ink: string;
  card: string;
  muted: string;
  radius: string;
  fontHeading: string;
  fontBody: string;
  headingWeight: string;
  uppercase: boolean;
  centered: boolean;
  heroPadding: string;
}

const TEMPLATE_CONFIGS: Record<TemplateStyle, TemplateConfig> = {
  modern: {
    bg: '#ffffff',
    ink: '#14202b',
    card: '#f8fafc',
    muted: '#64748b',
    radius: '16px',
    fontHeading: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontBody: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    headingWeight: '700',
    uppercase: false,
    centered: false,
    heroPadding: '120px 24px 96px',
  },
  classic: {
    bg: '#faf6ee',
    ink: '#2b2118',
    card: '#ffffff',
    muted: '#786857',
    radius: '6px',
    fontHeading: 'Georgia, "Times New Roman", Garamond, serif',
    fontBody: 'system-ui, -apple-system, sans-serif',
    headingWeight: '400',
    uppercase: false,
    centered: true,
    heroPadding: '130px 24px 100px',
  },
  bold: {
    bg: '#0d0d0f',
    ink: '#f5f5f5',
    card: '#18181b',
    muted: '#a1a1aa',
    radius: '2px',
    fontHeading: 'Impact, "Arial Black", system-ui, sans-serif',
    fontBody: 'system-ui, -apple-system, sans-serif',
    headingWeight: '400',
    uppercase: true,
    centered: false,
    heroPadding: '140px 24px 110px',
  },
  artisan: {
    bg: '#f5f0e8',
    ink: '#30261f',
    card: '#fdfbf7',
    muted: '#766657',
    radius: '12px',
    fontHeading: '"Cormorant Garamond", Georgia, serif',
    fontBody: 'system-ui, -apple-system, sans-serif',
    headingWeight: '600',
    uppercase: false,
    centered: true,
    heroPadding: '125px 24px 95px',
  },
};

export function generateWebsiteHtml(data: WebsiteData): string {
  const preset = BUSINESS_PRESETS[data.type] || BUSINESS_PRESETS.hotel;
  const cfg = TEMPLATE_CONFIGS[data.template] || TEMPLATE_CONFIGS.modern;
  const brandColor = data.color || '#d6a486';
  const brandInk = getInkColor(brandColor);

  const businessName = (data.name || preset.name).trim();
  const tagline = (data.tag || preset.tag).trim();
  const aboutText = (data.about || preset.about).trim();
  const items = parseItems(data.items || preset.items);
  const cleanWhatsApp = (data.wa || '').replace(/\D/g, '');
  const isMulti = data.pages === 'multi';

  const heroBg = data.hero
    ? `linear-gradient(rgba(0,0,0,0.52), rgba(0,0,0,0.65)), url('${data.hero}') center/cover no-repeat`
    : `linear-gradient(135deg, ${brandColor}, ${mixColor(brandColor, 0.42)})`;

  const navLinks: Array<[string, string]> = [];
  if (isMulti) navLinks.push(['home', 'Home']);
  if (data.show.about) navLinks.push(['about', 'About']);
  if (data.show.items && items.length > 0) navLinks.push(['offer', preset.label]);
  if (data.show.gallery && data.gallery.length > 0) navLinks.push(['gallery', 'Gallery']);
  if (data.show.contact) navLinks.push(['contact', 'Contact']);

  const css = `
    *, *::before, *::after { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      background-color: ${cfg.bg};
      color: ${cfg.ink};
      font-family: ${cfg.fontBody};
      line-height: 1.65;
      -webkit-font-smoothing: antialiased;
    }
    a { color: inherit; }
    .container {
      max-width: 1080px;
      margin: 0 auto;
      padding: 0 24px;
    }
    
    /* Navigation */
    nav {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 50;
      background: ${data.template === 'bold' ? 'rgba(13,13,15,0.92)' : isMulti ? cfg.bg : 'rgba(0,0,0,0.2)'};
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid ${isMulti ? 'rgba(128,128,128,0.18)' : 'rgba(255,255,255,0.15)'};
      transition: background 0.2s ease;
    }
    nav .nav-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 68px;
    }
    .brand {
      font-family: ${cfg.fontHeading};
      font-weight: ${cfg.headingWeight};
      font-size: 1.25rem;
      letter-spacing: ${cfg.uppercase ? '0.06em' : '-0.02em'};
      text-transform: ${cfg.uppercase ? 'uppercase' : 'none'};
      color: ${isMulti && cfg.bg !== '#0d0d0f' ? cfg.ink : '#ffffff'};
      text-decoration: none;
    }
    .nav-links {
      display: flex;
      gap: 20px;
    }
    .nav-link {
      font-size: 0.925rem;
      font-weight: 500;
      color: ${isMulti && cfg.bg !== '#0d0d0f' ? cfg.ink : '#ffffff'};
      text-decoration: none;
      opacity: 0.88;
      transition: opacity 0.2s ease, text-decoration 0.2s ease;
    }
    .nav-link:hover, .nav-link.active {
      opacity: 1;
      text-decoration: underline;
      text-underline-offset: 4px;
    }
    
    /* Hero Header */
    .hero-header {
      background: ${heroBg};
      color: #ffffff;
      padding: ${cfg.heroPadding};
      ${cfg.centered ? 'text-align: center;' : ''}
      position: relative;
    }
    .hero-title {
      font-family: ${cfg.fontHeading};
      font-weight: ${cfg.headingWeight};
      font-size: clamp(2.4rem, 6.2vw, 4.4rem);
      line-height: 1.08;
      margin: 0;
      text-transform: ${cfg.uppercase ? 'uppercase' : 'none'};
      max-width: 840px;
      ${cfg.centered ? 'margin: 0 auto;' : ''}
      text-shadow: 0 2px 14px rgba(0,0,0,0.35);
    }
    .hero-subtitle {
      font-size: 1.2rem;
      line-height: 1.5;
      opacity: 0.94;
      max-width: 600px;
      margin: 20px 0 32px;
      ${cfg.centered ? 'margin: 20px auto 32px;' : ''}
      text-shadow: 0 1px 6px rgba(0,0,0,0.3);
    }
    .btn-cta {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background-color: ${brandColor};
      color: ${brandInk};
      padding: 14px 28px;
      border-radius: ${cfg.radius === '2px' ? '2px' : '999px'};
      font-weight: 600;
      font-size: 1rem;
      text-decoration: none;
      box-shadow: 0 4px 18px rgba(0,0,0,0.22);
      transition: transform 0.2s ease, opacity 0.2s ease;
    }
    .btn-cta:hover {
      transform: translateY(-2px);
      opacity: 0.95;
    }

    /* Sections */
    section {
      padding: 72px 0;
    }
    .section-title {
      font-family: ${cfg.fontHeading};
      font-weight: ${cfg.headingWeight};
      font-size: 2.1rem;
      letter-spacing: ${cfg.uppercase ? '0.04em' : '-0.02em'};
      text-transform: ${cfg.uppercase ? 'uppercase' : 'none'};
      margin: 0 0 16px;
      position: relative;
    }
    .section-title::after {
      content: "";
      display: block;
      width: 44px;
      height: 3px;
      background-color: ${brandColor};
      margin-top: 10px;
    }
    .prose-text {
      color: ${cfg.muted};
      font-size: 1.05rem;
      line-height: 1.8;
      max-width: 720px;
    }

    /* Cards Grid */
    .catalog-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      margin-top: 32px;
    }
    .catalog-card {
      background: ${cfg.card};
      border-radius: ${cfg.radius};
      padding: 26px;
      border: 1px solid rgba(128,128,128,0.14);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .catalog-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.06);
    }
    .catalog-card h3 {
      font-family: ${cfg.fontHeading};
      font-size: 1.25rem;
      margin: 0 0 10px;
      color: ${cfg.ink};
    }
    .catalog-card p {
      margin: 0 0 18px;
      color: ${cfg.muted};
      font-size: 0.95rem;
      line-height: 1.6;
      flex: 1;
    }
    .price-tag {
      display: inline-block;
      font-weight: 700;
      color: ${brandColor};
      font-size: 1rem;
      margin-top: auto;
    }

    /* Gallery */
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 16px;
      margin-top: 28px;
    }
    .gallery-thumb {
      width: 100%;
      aspect-ratio: 4/3;
      object-fit: cover;
      border-radius: ${cfg.radius};
      border: 1px solid rgba(128,128,128,0.18);
      transition: transform 0.25s ease;
    }
    .gallery-thumb:hover {
      transform: scale(1.02);
    }

    /* Contact Details */
    .contact-card {
      background: ${cfg.card};
      border-radius: ${cfg.radius};
      padding: 36px;
      border: 1px solid rgba(128,128,128,0.16);
      margin-top: 28px;
    }
    .contact-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 20px;
    }
    .contact-item {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 1rem;
    }
    .contact-icon {
      font-size: 1.3rem;
      opacity: 0.85;
    }
    .contact-link {
      color: ${cfg.ink};
      text-decoration: none;
      font-weight: 600;
    }
    .contact-link:hover {
      color: ${brandColor};
      text-decoration: underline;
    }

    /* WhatsApp floating button */
    .whatsapp-float {
      position: fixed;
      right: 24px;
      bottom: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #25D366;
      color: #ffffff;
      display: grid;
      place-items: center;
      font-size: 28px;
      text-decoration: none;
      box-shadow: 0 6px 22px rgba(0,0,0,0.32);
      z-index: 99;
      transition: transform 0.2s ease;
    }
    .whatsapp-float:hover {
      transform: scale(1.08);
    }

    /* Footer */
    footer {
      border-top: 1px solid rgba(128,128,128,0.18);
      padding: 36px 0;
      text-align: center;
      font-size: 0.88rem;
      color: ${cfg.muted};
    }

    /* Multi-page styling */
    ${
      isMulti
        ? `
      .page-view {
        padding-top: 72px;
      }
      .page-view[hidden] {
        display: none !important;
      }
      #home.page-view {
        padding-top: 0;
      }
    `
        : ''
    }

    @media (max-width: 640px) {
      .nav-links {
        gap: 12px;
      }
      .nav-link {
        font-size: 0.825rem;
      }
      section {
        padding: 56px 0;
      }
    }
  `;

  const heroSection = `
    <header class="hero-header" id="home">
      <div class="container">
        <h1 class="hero-title">${escapeHtml(tagline)}</h1>
        <p class="hero-subtitle">${escapeHtml(businessName)}</p>
        <a class="btn-cta" href="#${data.show.contact ? 'contact' : 'offer'}">${escapeHtml(preset.cta)} &rarr;</a>
      </div>
    </header>
  `;

  const aboutSection = data.show.about
    ? `
    <section id="about" class="about-section">
      <div class="container">
        <h2 class="section-title">About Us</h2>
        <p class="prose-text">${escapeHtml(aboutText)}</p>
      </div>
    </section>
  `
    : '';

  const offerSection =
    data.show.items && items.length > 0
      ? `
    <section id="offer" class="offer-section" style="background: ${data.template === 'bold' ? '#141417' : 'rgba(128,128,128,0.04)'}">
      <div class="container">
        <h2 class="section-title">${escapeHtml(preset.label)}</h2>
        <div class="catalog-grid">
          ${items
            .map(
              (item) => `
            <article class="catalog-card">
              <div>
                <h3>${escapeHtml(item.name)}</h3>
                <p>${escapeHtml(item.desc)}</p>
              </div>
              ${item.price ? `<span class="price-tag">${escapeHtml(item.price)}</span>` : ''}
            </article>
          `,
            )
            .join('')}
        </div>
      </div>
    </section>
  `
      : '';

  const gallerySection =
    data.show.gallery && data.gallery.length > 0
      ? `
    <section id="gallery" class="gallery-section">
      <div class="container">
        <h2 class="section-title">Photo Gallery</h2>
        <div class="gallery-grid">
          ${data.gallery
            .map(
              (img, i) => `
            <img class="gallery-thumb" src="${img}" alt="${escapeHtml(businessName)} photo ${i + 1}" loading="lazy">
          `,
            )
            .join('')}
        </div>
      </div>
    </section>
  `
      : '';

  const contactListItems: string[] = [];
  if (data.phone) {
    contactListItems.push(`
      <li class="contact-item">
        <span class="contact-icon" aria-hidden="true">&#9742;</span>
        <div>
          <span style="display:block;font-size:0.8rem;color:${cfg.muted};">Phone</span>
          <a class="contact-link" href="tel:${escapeHtml(data.phone.replace(/[^\d+]/g, ''))}">${escapeHtml(data.phone)}</a>
        </div>
      </li>
    `);
  }
  if (cleanWhatsApp) {
    contactListItems.push(`
      <li class="contact-item">
        <span class="contact-icon" aria-hidden="true">&#128172;</span>
        <div>
          <span style="display:block;font-size:0.8rem;color:${cfg.muted};">WhatsApp</span>
          <a class="contact-link" href="https://wa.me/${cleanWhatsApp}" target="_blank" rel="noopener">Chat on WhatsApp</a>
        </div>
      </li>
    `);
  }
  if (data.email) {
    contactListItems.push(`
      <li class="contact-item">
        <span class="contact-icon" aria-hidden="true">&#9993;</span>
        <div>
          <span style="display:block;font-size:0.8rem;color:${cfg.muted};">Email</span>
          <a class="contact-link" href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a>
        </div>
      </li>
    `);
  }
  if (data.addr) {
    contactListItems.push(`
      <li class="contact-item">
        <span class="contact-icon" aria-hidden="true">&#128205;</span>
        <div>
          <span style="display:block;font-size:0.8rem;color:${cfg.muted};">Address</span>
          ${
            data.map
              ? `<a class="contact-link" href="${escapeHtml(data.map)}" target="_blank" rel="noopener">${escapeHtml(data.addr)} &rarr;</a>`
              : `<span class="contact-link">${escapeHtml(data.addr)}</span>`
          }
        </div>
      </li>
    `);
  }
  if (data.ig) {
    const handle = data.ig.replace(/^@/, '');
    contactListItems.push(`
      <li class="contact-item">
        <span class="contact-icon" aria-hidden="true">&#128247;</span>
        <div>
          <span style="display:block;font-size:0.8rem;color:${cfg.muted};">Instagram</span>
          <a class="contact-link" href="https://instagram.com/${escapeHtml(handle)}" target="_blank" rel="noopener">@${escapeHtml(handle)}</a>
        </div>
      </li>
    `);
  }

  const contactSection = data.show.contact
    ? `
    <section id="contact" class="contact-section">
      <div class="container">
        <h2 class="section-title">Get in Touch</h2>
        <div class="contact-card">
          <ul class="contact-list">
            ${
              contactListItems.length > 0
                ? contactListItems.join('')
                : `<li class="contact-item" style="color: ${cfg.muted};">Direct contact channels (phone, WhatsApp, email) will appear here.</li>`
            }
          </ul>
        </div>
      </div>
    </section>
  `
    : '';

  const navHtml = `
    <nav>
      <div class="container nav-inner">
        <a class="brand" href="#home">${escapeHtml(businessName)}</a>
        <div class="nav-links">
          ${navLinks
            .map(
              ([id, title]) => `
            <a class="nav-link" href="#${id}">${escapeHtml(title)}</a>
          `,
            )
            .join('')}
        </div>
      </div>
    </nav>
  `;

  let mainContent = '';
  if (!isMulti) {
    mainContent = `
      ${heroSection}
      ${aboutSection}
      ${offerSection}
      ${gallerySection}
      ${contactSection}
    `;
  } else {
    mainContent = `
      <div id="home" class="page-view">
        ${heroSection}
        ${offerSection}
        ${aboutSection}
      </div>
      ${data.show.about ? `<div id="about" class="page-view" hidden>${aboutSection}</div>` : ''}
      ${data.show.items && items.length > 0 ? `<div id="offer" class="page-view" hidden>${offerSection}</div>` : ''}
      ${data.show.gallery && data.gallery.length > 0 ? `<div id="gallery" class="page-view" hidden>${gallerySection}</div>` : ''}
      ${data.show.contact ? `<div id="contact" class="page-view" hidden>${contactSection}</div>` : ''}
    `;
  }

  const multiPageScript = isMulti
    ? `
    <script>
      (function() {
        var pages = Array.from(document.querySelectorAll('.page-view'));
        var links = Array.from(document.querySelectorAll('.nav-link'));
        function syncRoute() {
          var hash = (location.hash || '#home').replace('#', '');
          var found = false;
          pages.forEach(function(p) {
            var match = p.id === hash;
            p.hidden = !match;
            if (match) found = true;
          });
          if (!found && pages[0]) {
            pages[0].hidden = false;
            hash = 'home';
          }
          links.forEach(function(a) {
            var target = (a.getAttribute('href') || '').replace('#', '');
            if (target === hash) {
              a.classList.add('active');
            } else {
              a.classList.remove('active');
            }
          });
          window.scrollTo(0, 0);
        }
        window.addEventListener('hashchange', syncRoute);
        syncRoute();
      })();
    </script>
  `
    : '';

  const whatsAppWidget = cleanWhatsApp
    ? `
    <a class="whatsapp-float" href="https://wa.me/${cleanWhatsApp}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">
      &#128172;
    </a>
  `
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(businessName)} — ${escapeHtml(tagline)}</title>
  <meta name="description" content="${escapeHtml(tagline)} - ${escapeHtml(aboutText.slice(0, 150))}">
  <style>
    ${css}
  </style>
</head>
<body>
  ${navHtml}
  <main>
    ${mainContent}
  </main>
  <footer>
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} ${escapeHtml(businessName)}. Created with Whub Site Maker.</p>
    </div>
  </footer>
  ${whatsAppWidget}
  ${multiPageScript}
</body>
</html>`;
}
