import React from 'react';
import { getCertifications } from '@/lib/content/api';
import { Award, ExternalLink, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Verified Certifications & Credentials',
  description: 'Cryptographically verified industry credentials, professional specializations, and benchmark achievements.',
};

export default function CertificationsPage() {
  const allCerts = getCertifications();
  const featured = allCerts.filter((c) => c.featured);
  const remaining = allCerts.filter((c) => !c.featured);

  return (
    <article className="space-y-10">
      {/* Page Header */}
      <header className="space-y-2 border-b border-border-subtle pb-6">
        <div className="text-xs font-mono text-accent-cyan uppercase tracking-wider">
          CREDENTIALS // SECTION 03
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold text-ink-primary font-sans">
          Certifications &amp; Badges
        </h1>
        <p className="text-sm sm:text-base font-serif text-ink-secondary max-w-2xl leading-relaxed">
          Verifiable technical certifications and benchmark completions across graph databases, cloud security, network forensics, and machine learning.
        </p>
      </header>

      {/* Featured Certifications */}
      <section className="space-y-4">
        <h2 className="text-xs font-mono font-semibold text-ink-secondary uppercase tracking-wider flex items-center space-x-2">
          <ShieldCheck className="w-3.5 h-3.5 text-accent-cyan" aria-hidden="true" />
          <span>Featured Verified Credentials</span>
        </h2>

        <div className="grid grid-cols-1 gap-3.5 font-mono text-xs">
          {featured.map((cert, idx) => (
            <div
              key={idx}
              className="p-4 bg-deck border border-border-subtle rounded hover:border-accent-cyan/60 transition-all corner-bracket"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-semibold text-ink-primary font-sans">
                      {cert.title}
                    </h3>
                    {cert.verified ? (
                      <span className="inline-flex items-center space-x-1 text-[10px] text-accent-cyan bg-accent-cyan/10 px-1.5 py-0.5 rounded border border-accent-cyan/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>VERIFIED</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-[10px] text-accent-amber bg-accent-amber/10 px-1.5 py-0.5 rounded border border-accent-amber/20">
                        <AlertCircle className="w-3 h-3" />
                        <span>UNCONFIRMED</span>
                      </span>
                    )}
                  </div>

                  <div className="text-ink-secondary text-[11px] mt-1 space-x-2">
                    <span>{cert.issuer}</span>
                    <span>·</span>
                    <span className="text-ink-primary/80">{cert.date}</span>
                    {cert.attach_to && (
                      <>
                        <span>·</span>
                        <span className="text-accent-cyan">
                          Linked to {Array.isArray(cert.attach_to) ? cert.attach_to.join(', ') : cert.attach_to}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {cert.url && (
                  <a
                    href={cert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1 bg-black/40 border border-border-subtle rounded hover:border-accent-cyan hover:text-accent-cyan text-ink-primary text-xs self-start transition-colors"
                  >
                    <span>VERIFY</span>
                    <ExternalLink className="w-3 h-3" aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Additional Credentials List */}
      {remaining.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-border-subtle">
          <h2 className="text-xs font-mono font-semibold text-ink-secondary uppercase tracking-wider flex items-center space-x-2">
            <Award className="w-3.5 h-3.5 text-accent-cyan" aria-hidden="true" />
            <span>Additional Credentials</span>
          </h2>

          <div className="space-y-2.5 font-mono text-xs">
            {remaining.map((cert, idx) => (
              <div
                key={idx}
                className="p-3 bg-deck/60 border border-border-subtle rounded flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:border-border-active transition-colors text-[11px]"
              >
                <div>
                  <span className="font-semibold text-ink-primary">
                    {cert.title}
                  </span>
                  <span className="text-ink-secondary ml-2">
                    ({cert.issuer} · {cert.date})
                  </span>
                </div>

                {cert.url && (
                  <a
                    href={cert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-cyan hover:underline inline-flex items-center space-x-1 self-start sm:self-center"
                  >
                    <span>CERTIFICATE</span>
                    <ExternalLink className="w-2.5 h-2.5" aria-hidden="true" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
