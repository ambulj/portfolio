import React from 'react';
import { Shield, Lock, FileCode, CheckCircle2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Security Architecture & Edge Posture',
  description: 'Cryptographic posture, strict Content Security Policy specification, and vulnerability disclosure protocol.',
};

export default function SecurityPage() {
  const securityHeaders = [
    {
      header: 'Content-Security-Policy',
      value: "default-src 'self'; script-src 'self' https://challenges.cloudflare.com https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self' https://api.github.com https://cloudflareinsights.com; frame-src https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
      purpose: 'Eliminates XSS vectors, disallows untrusted remote CDNs, and restricts framing.',
    },
    {
      header: 'Strict-Transport-Security (HSTS)',
      value: 'max-age=63072000; includeSubDomains; preload',
      purpose: 'Enforces HTTPS encryption with 2-year caching and browser preload registry.',
    },
    {
      header: 'X-Content-Type-Options',
      value: 'nosniff',
      purpose: 'Prevents MIME-type sniffing and malicious executable interpretation.',
    },
    {
      header: 'X-Frame-Options',
      value: 'DENY',
      purpose: 'Blocks embedding in iframes across all domains to prevent clickjacking attacks.',
    },
    {
      header: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin',
      purpose: 'Prevents internal route and query string leakage across origins.',
    },
    {
      header: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
      purpose: 'Disables all hardware sensors and privileged device capabilities.',
    },
  ];

  return (
    <article className="space-y-10">
      {/* Page Header */}
      <header className="space-y-2 border-b border-border-subtle pb-6">
        <div className="text-xs font-mono text-accent-cyan uppercase tracking-wider">
          POSTURE // SECTION 07
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold text-ink-primary font-sans">
          Security Posture &amp; Edge Headers
        </h1>
        <p className="text-sm sm:text-base font-serif text-ink-secondary max-w-2xl leading-relaxed">
          Because this is a cybersecurity engineering portfolio, its infrastructure is built as an audited target: zero tracker cookies, zero external font/script CDNs, and edge-enforced security headers.
        </p>
      </header>

      {/* Security Principles */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
        <div className="p-4 bg-deck border border-border-subtle rounded space-y-1.5">
          <div className="flex items-center space-x-1.5 text-accent-cyan">
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="font-semibold">ZERO COOKIES</span>
          </div>
          <p className="text-ink-secondary text-[11px] font-sans">
            `document.cookie === &apos;&apos;` verified across every route. No analytics sessions, no trackers.
          </p>
        </div>

        <div className="p-4 bg-deck border border-border-subtle rounded space-y-1.5">
          <div className="flex items-center space-x-1.5 text-accent-cyan">
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="font-semibold">SELF-HOSTED ASSETS</span>
          </div>
          <p className="text-ink-secondary text-[11px] font-sans">
            IBM Plex fonts and assets are hosted locally on `ambul.dev` with zero remote CDN dependencies.
          </p>
        </div>

        <div className="p-4 bg-deck border border-border-subtle rounded space-y-1.5">
          <div className="flex items-center space-x-1.5 text-accent-cyan">
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="font-semibold">LEAK-PROOF EMAIL</span>
          </div>
          <p className="text-ink-secondary text-[11px] font-sans">
            Email addresses are assembled dynamically in client memory to block automated scraping.
          </p>
        </div>
      </section>

      {/* Edge Headers Audit Table */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-semibold text-ink-secondary uppercase tracking-wider flex items-center space-x-2">
            <Shield className="w-3.5 h-3.5 text-accent-cyan" aria-hidden="true" />
            <span>Cloudflare Pages Edge Headers Specification</span>
          </h2>
          <span className="text-[10px] font-mono text-ink-secondary">
            MAPPED TO public/_headers
          </span>
        </div>

        <div className="space-y-3 font-mono text-xs">
          {securityHeaders.map((item, idx) => (
            <div
              key={idx}
              className="p-4 bg-deck border border-border-subtle rounded space-y-2 hover:border-accent-cyan/40 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-border-subtle/60 pb-1.5">
                <span className="font-semibold text-accent-cyan text-xs">
                  {item.header}
                </span>
                <span className="text-[10px] text-ink-secondary">
                  {item.purpose}
                </span>
              </div>
              <p className="text-[11px] text-ink-secondary break-all bg-black/40 p-2 rounded border border-border-subtle/80">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Vulnerability Reporting Protocol */}
      <section className="p-4 bg-deck/60 border border-border-subtle rounded font-mono text-xs space-y-2">
        <div className="flex items-center space-x-2 text-accent-amber">
          <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="font-semibold text-ink-primary">VULNERABILITY DISCLOSURE PROTOCOL</span>
        </div>
        <p className="text-ink-secondary text-[11px] leading-relaxed font-sans">
          If you discover a security flaw or header misconfiguration, please follow the coordinated disclosure policy defined in{' '}
          <Link href="/.well-known/security.txt" className="text-accent-cyan underline hover:text-white">
            security.txt
          </Link>.
        </p>
      </section>
    </article>
  );
}
