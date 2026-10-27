import React, { useState } from 'react';
import { Send, CheckCircle, Mail, MapPin } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<{ text: string; isError?: boolean } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus({ text: 'Please fill in your name, email and a short message.', isError: true });
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email)) {
      setStatus({ text: 'Please enter a valid email address.', isError: true });
      return;
    }

    setStatus({
      text: 'Opening your default mail client with your prefilled message...',
      isError: false,
    });

    const subject = encodeURIComponent(`Inquiry from ${formData.name} - Whub Site Maker`);
    const body = encodeURIComponent(
      `Hi Whub Team,\n\n${formData.message}\n\nFrom: ${formData.name} (${formData.email})`
    );

    window.location.href = `mailto:hello@whub.co?subject=${subject}&body=${body}`;
  };

  return (
    <div id="contact" className="pt-24 pb-20 px-4 md:px-7 max-w-[1100px] mx-auto min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
        {/* Left Column */}
        <div>
          <div className="text-[11px] tracking-[0.2em] text-[#fffdf8]/60 mb-2">CONTACT / 05</div>
          <h2 className="text-3xl md:text-5xl font-normal tracking-[-0.04em] text-[#fffdf8]">
            Let’s talk.<br />
            <em className="font-serif-italic text-[#d6a486]">We reply to every note.</em>
          </h2>
          <p className="mt-5 text-sm md:text-base text-white/70 leading-relaxed max-w-md">
            Questions about creating your website, or want bespoke assistance setting up a custom domain? Send a note and our team will get right back to you.
          </p>

          <div className="mt-8 space-y-4 text-xs md:text-sm text-white/80">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-[#d6a486]" />
              <a href="mailto:hello@whub.co" className="hover:text-[#d6a486] transition-colors">
                hello@whub.co
              </a>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-[#d6a486]" />
              <span>San Francisco &amp; Global Remote</span>
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <form
          onSubmit={handleSubmit}
          className="glass-panel p-6 md:p-8 rounded-3xl space-y-4 shadow-xl border border-white/15"
          noValidate
        >
          <div>
            <label className="block text-xs text-white/60 mb-1">Your name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Maya Lin"
              className="w-full bg-white/[0.06] border border-white/20 rounded-xl px-3.5 py-2.5 text-xs md:text-sm text-white focus:outline-none focus:border-[#d6a486]"
            />
          </div>

          <div>
            <label className="block text-xs text-white/60 mb-1">Your email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="maya@example.com"
              className="w-full bg-white/[0.06] border border-white/20 rounded-xl px-3.5 py-2.5 text-xs md:text-sm text-white focus:outline-none focus:border-[#d6a486]"
            />
          </div>

          <div>
            <label className="block text-xs text-white/60 mb-1">A few lines about your project</label>
            <textarea
              rows={4}
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Tell us what you are building or ask any question..."
              className="w-full bg-white/[0.06] border border-white/20 rounded-xl px-3.5 py-2.5 text-xs md:text-sm text-white focus:outline-none focus:border-[#d6a486] resize-y"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-6 rounded-full bg-[#d6a486] hover:bg-[#e8bfa4] text-[#23180f] font-semibold text-xs md:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
          >
            <Send className="w-4 h-4" />
            <span>Prepare my message</span>
          </button>

          {status && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                status.isError
                  ? 'bg-red-500/10 border border-red-500/20 text-red-200'
                  : 'bg-[#a9b99a]/15 border border-[#a9b99a]/30 text-[#a9b99a]'
              }`}
            >
              {!status.isError && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
              <span>{status.text}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
