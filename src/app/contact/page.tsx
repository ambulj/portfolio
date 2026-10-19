import React from 'react';
import { getSiteConfig } from '@/lib/content/api';
import EmailRevealButton from '@/components/contact/EmailRevealButton';
import { Mail, MapPin, Send } from 'lucide-react';
import DifferentialPrivacyDemo from '@/components/privacy/DifferentialPrivacyDemo';

export const metadata = {
  title: 'Direct Contact & Inquiries',
  description: 'Reach Ambul Jaiswal for security research collaboration, internship inquiries, and technical discussions.',
};

export default function ContactPage() {
  const site = getSiteConfig();

  return (
    <article className="space-y-10">
      {/* Page Header */}
      <header className="space-y-2 border-b border-border-subtle pb-6">
        <div className="text-xs font-mono text-accent-cyan uppercase tracking-wider">
          DISPATCH // SECTION 05
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold text-ink-primary font-sans">
          Contact &amp; Inquiries
        </h1>
        <p className="text-sm sm:text-base font-serif text-ink-secondary max-w-2xl leading-relaxed">
          Direct communication channel for internship opportunities, research collaborations, and vulnerability reports.
        </p>
      </header>

      {/* Communications Matrix */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
        {/* Email Reveal Card */}
        <div className="p-4 bg-deck border border-border-subtle rounded space-y-3 corner-bracket">
          <div className="flex items-center space-x-2 text-accent-cyan">
            <Mail className="w-4 h-4" aria-hidden="true" />
            <h2 className="text-xs font-semibold uppercase tracking-wider">
              Cryptographic Email Channel
            </h2>
          </div>
          <p className="text-[11px] text-ink-secondary font-sans leading-relaxed">
            Assembled client-side on user interaction to defeat automated scrapers and preserve inbox hygiene.
          </p>
          <div className="pt-1">
            <EmailRevealButton emailParts={site.email_parts} />
          </div>
        </div>

        {/* Location & Links Card */}
        <div className="p-4 bg-deck border border-border-subtle rounded space-y-3 corner-bracket">
          <div className="flex items-center space-x-2 text-accent-cyan">
            <MapPin className="w-4 h-4" aria-hidden="true" />
            <h2 className="text-xs font-semibold uppercase tracking-wider">
              Location &amp; Networking
            </h2>
          </div>
          <p className="text-[11px] text-ink-secondary font-sans leading-relaxed">
            Based in {site.location}. {site.work_mode}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {site.linkedin && (
              <a
                href={site.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-black/40 border border-border-subtle rounded hover:border-accent-cyan text-ink-primary hover:text-accent-cyan transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.77v8.37H6.46v-8.37M7.85 6.25a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z"/>
                </svg>
                <span>LINKEDIN</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Contact Form Shell with Turnstile */}
      <section className="p-6 bg-deck border border-border-subtle rounded space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center space-x-2 text-ink-primary font-mono text-xs font-semibold">
            <Send className="w-3.5 h-3.5 text-accent-cyan" aria-hidden="true" />
            <span>ENCRYPTED MESSAGE DISPATCH</span>
          </div>
          <span className="text-[10px] font-mono text-accent-cyan bg-accent-cyan/10 px-2 py-0.5 rounded border border-accent-cyan/20">
            TURNSTILE PROTECTED
          </span>
        </div>

        <form 
          action="/api/contact" 
          method="POST" 
          className="space-y-4 font-mono text-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="contact-name" className="text-ink-secondary text-[11px] block">
                NAME / CALLSIGN *
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                required
                placeholder="Jane Doe"
                className="w-full px-3 py-2 bg-oled border border-border-subtle rounded text-ink-primary focus:border-accent-cyan focus:outline-none transition-colors text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="contact-email" className="text-ink-secondary text-[11px] block">
                REPLY-TO EMAIL *
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                required
                placeholder="name@domain.com"
                className="w-full px-3 py-2 bg-oled border border-border-subtle rounded text-ink-primary focus:border-accent-cyan focus:outline-none transition-colors text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="contact-message" className="text-ink-secondary text-[11px] block">
              MESSAGE TRANSMISSION *
            </label>
            <textarea
              id="contact-message"
              name="message"
              required
              rows={4}
              placeholder="State message or research inquiry..."
              className="w-full px-3 py-2 bg-oled border border-border-subtle rounded text-ink-primary focus:border-accent-cyan focus:outline-none transition-colors text-xs font-mono resize-none"
            />
          </div>

          {/* Turnstile Container */}
          <div className="cf-turnstile" data-sitekey="0x4AAAAAAAx..." />

          <button
            type="submit"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-accent-cyan text-black font-semibold rounded hover:bg-accent-cyan/90 transition-colors shadow-hud-cyan text-xs font-mono"
          >
            <Send className="w-3.5 h-3.5" aria-hidden="true" />
            <span>TRANSMIT DISPATCH</span>
          </button>
        </form>
      </section>

      {/* Differential Privacy Mechanism Demo */}
      <section className="space-y-3">
        <DifferentialPrivacyDemo />
      </section>
    </article>
  );
}
