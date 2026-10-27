import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HowItWorksProps {
  onStartBuilding: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onStartBuilding }) => {
  const steps = [
    {
      num: '01',
      title: 'Tell your story',
      desc: 'Pick your business type (hospitality, bistro, studio, boutique, or practice), then add your name, photos, offerings, and direct contact links.',
    },
    {
      num: '02',
      title: 'Watch it take shape',
      desc: 'Every keystroke renders live in the built-in simulator. Switch seamlessly between responsive desktop and mobile smartphone views.',
    },
    {
      num: '03',
      title: 'Audit & download',
      desc: 'Run the science lab to check WCAG 2.1 contrast ratios and carbon footprint. Click once to export your pristine, zero-dependency HTML file.',
    },
    {
      num: '04',
      title: 'Publish in minutes',
      desc: 'Drag your downloaded file directly onto free hosting services like Netlify Drop (app.netlify.com/drop) or GitHub Pages to launch your live URL.',
    },
  ];

  const faqs = [
    {
      q: 'Is it completely free to build and download?',
      a: 'Yes. Generating, auditing, and exporting standalone websites in Whub Site Maker is 100% free with no watermark. When you are ready to publish, free hosting options like Netlify Drop require zero subscription fees.',
    },
    {
      q: 'Do I need any coding knowledge or web development experience?',
      a: 'None at all. You enter simple details in intuitive inputs, and the engine writes valid, accessible semantic HTML5, modern CSS, and lightweight interactions for you.',
    },
    {
      q: 'Can I customize and update my site later?',
      a: 'Yes! Your draft is continuously saved in your browser storage. You can reopen the builder, adjust your pricing or gallery photos, and re-download your updated site anytime.',
    },
    {
      q: 'Who owns the website and images?',
      a: 'You do. The downloaded HTML file and all embedded assets are entirely your property. There are no proprietary lock-ins, hosted database dependencies, or recurring vendor fees.',
    },
    {
      q: 'Can I connect my own custom domain name (e.g. mybusiness.com)?',
      a: 'Yes. When you host your site on Netlify, Vercel, or GitHub Pages, you can connect any custom domain purchased from registrars like Google Domains, Namecheap, or Cloudflare with one simple DNS record.',
    },
    {
      q: 'What does the "Test it like a scientist" lab check?',
      a: 'It computes real WCAG 2.1 contrast ratios using mathematical relative luminance equations, assesses linguistic readability via the Flesch Reading Ease formula, and calculates estimated carbon emissions via the Sustainable Web Design model.',
    },
  ];

  return (
    <div id="how" className="pt-24 pb-20 px-4 md:px-7 max-w-[1200px] mx-auto min-h-screen">
      <div className="mb-12">
        <div className="text-[11px] tracking-[0.2em] text-[#fffdf8]/60 mb-2">HOW IT WORKS / 03</div>
        <h2 className="text-3xl md:text-5xl font-normal tracking-[-0.04em] text-[#fffdf8]">
          Four simple steps.<br />
          <em className="font-serif-italic text-[#d6a486]">No code, no stress.</em>
        </h2>
      </div>

      {/* 4 Step Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {steps.map((s) => (
          <article
            key={s.num}
            className="glass-panel p-6 rounded-3xl flex flex-col justify-between hover:border-white/30 transition-all hover:-translate-y-1"
          >
            <div>
              <span className="text-xs font-semibold tracking-wider text-[#d6a486]">{s.num}</span>
              <h3 className="text-xl font-normal text-[#fffdf8] mt-4 mb-2 tracking-tight">
                {s.title}
              </h3>
              <p className="text-xs md:text-sm text-white/70 leading-relaxed">{s.desc}</p>
            </div>
          </article>
        ))}
      </div>

      {/* CTA Box */}
      <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-[#251e19] to-[#1a140f] border border-white/15 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl md:text-2xl font-serif-italic text-[#f1c9a6]">
            Ready to craft your website?
          </h3>
          <p className="text-xs md:text-sm text-white/70 mt-1">
            Build something authentic for your business today in under five minutes.
          </p>
        </div>
        <button
          onClick={onStartBuilding}
          className="inline-flex items-center gap-3 px-6 py-3.5 bg-[#d6a486] hover:bg-[#e8bfa4] text-[#23180f] font-semibold text-xs md:text-sm rounded-full transition-all active:scale-95 shadow-md flex-shrink-0"
        >
          <span>Open Builder</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* FAQ Accordion */}
      <div className="mt-16 max-w-3xl">
        <h3 className="text-xl md:text-2xl font-normal tracking-tight text-[#fffdf8] mb-6">
          Frequently asked questions
        </h3>
        <div className="divide-y divide-white/10">
          {faqs.map((faq, index) => (
            <details key={index} className="py-4 group cursor-pointer">
              <summary className="text-base md:text-lg text-[#fffdf8] font-normal list-none flex items-center justify-between gap-4 focus:outline-none">
                <span>{faq.q}</span>
                <span className="text-xl text-[#d6a486] group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="text-xs md:text-sm text-white/70 mt-2.5 leading-relaxed pr-8">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
};
