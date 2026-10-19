import React from 'react';
import { Code2, Cpu, Eye, Shield } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Colophon & Technical Build Notes',
  description: 'Technical architecture, design principles, typography licenses, and build performance notes.',
};

export default function ColophonPage() {
  return (
    <article className="space-y-10">
      {/* Page Header */}
      <header className="space-y-2 border-b border-border-subtle pb-6">
        <div className="text-xs font-mono text-accent-cyan uppercase tracking-wider">
          SYSTEM // SECTION 08
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold text-ink-primary font-sans">
          Colophon &amp; Build Specifications
        </h1>
        <p className="text-sm sm:text-base font-serif text-ink-secondary max-w-2xl leading-relaxed">
          The engineering decisions, architectural principles, and typography underlying this portfolio.
        </p>
      </header>

      {/* Engineering Stack Specifications */}
      <section className="space-y-4">
        <h2 className="text-xs font-mono font-semibold text-ink-secondary uppercase tracking-wider flex items-center space-x-2">
          <Cpu className="w-3.5 h-3.5 text-accent-cyan" aria-hidden="true" />
          <span>Core Infrastructure Stack</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
          <div className="p-4 bg-deck border border-border-subtle rounded space-y-2 corner-bracket">
            <span className="text-accent-cyan font-semibold block text-xs">
              FRAMEWORK &amp; RUNTIME
            </span>
            <ul className="text-ink-secondary space-y-1 text-[11px]">
              <li>· Next.js 15.2.1 App Router</li>
              <li>· React 19.0.0 Concurrent Mode</li>
              <li>· TypeScript 5.7.3 strict mode</li>
              <li>· Static HTML export (`output: export`)</li>
            </ul>
          </div>

          <div className="p-4 bg-deck border border-border-subtle rounded space-y-2 corner-bracket">
            <span className="text-accent-cyan font-semibold block text-xs">
              AESTHETICS &amp; SHADERS
            </span>
            <ul className="text-ink-secondary space-y-1 text-[11px]">
              <li>· Tailwind CSS Cyber-Command HUD theme</li>
              <li>· Pure OLED black (`#000000`) foundation</li>
              <li>· Persistent Split Command Deck dual-pane layout</li>
              <li>· Hardware-accelerated CRT scanline overlay</li>
            </ul>
          </div>

          <div className="p-4 bg-deck border border-border-subtle rounded space-y-2 corner-bracket">
            <span className="text-accent-cyan font-semibold block text-xs">
              CONTENT PIPELINE
            </span>
            <ul className="text-ink-secondary space-y-1 text-[11px]">
              <li>· Zod schema validation across all frontmatter</li>
              <li>· Custom marked parser with raw HTML disabled</li>
              <li>· 5-column reproducible metrics tables</li>
              <li>· Automated pre-deploy placeholder scanner</li>
            </ul>
          </div>

          <div className="p-4 bg-deck border border-border-subtle rounded space-y-2 corner-bracket">
            <span className="text-accent-cyan font-semibold block text-xs">
              HOSTING &amp; EDGE SECURITY
            </span>
            <ul className="text-ink-secondary space-y-1 text-[11px]">
              <li>· Deployed on Cloudflare Pages global edge</li>
              <li>· Custom apex domain `https://ambul.dev`</li>
              <li>· Strict Content Security Policy in `_headers`</li>
              <li>· Zero tracker cookies and zero third-party CDNs</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Typography Notes */}
      <section className="p-5 bg-deck border border-border-subtle rounded space-y-3 font-mono text-xs">
        <h2 className="text-xs font-semibold text-ink-primary uppercase tracking-wider flex items-center space-x-2">
          <Eye className="w-3.5 h-3.5 text-accent-cyan" aria-hidden="true" />
          <span>Self-Hosted Typography</span>
        </h2>
        <p className="text-ink-secondary text-[11px] font-sans leading-relaxed">
          All typography is rendered using IBM Plex fonts, self-hosted locally from `public/fonts/` under the SIL Open Font License (OFL).
        </p>
        <div className="flex flex-wrap gap-2 text-[10px] text-ink-secondary pt-1">
          <span className="px-2 py-0.5 bg-black/40 border border-border-subtle rounded">
            IBM Plex Sans Condensed (Display &amp; Headings)
          </span>
          <span className="px-2 py-0.5 bg-black/40 border border-border-subtle rounded">
            IBM Plex Serif (Body Prose &amp; Retrospectives)
          </span>
          <span className="px-2 py-0.5 bg-black/40 border border-border-subtle rounded">
            IBM Plex Mono (Telemetry, Code &amp; Navigation)
          </span>
        </div>
      </section>
    </article>
  );
}
