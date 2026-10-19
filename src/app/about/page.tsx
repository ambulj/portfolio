import React from 'react';
import { getAboutContent, getTimeline, getStatusConfig, getSiteConfig } from '@/lib/content/api';
import { User, Calendar, CheckCircle2, Shield, MapPin, Briefcase } from 'lucide-react';

export const metadata = {
  title: 'About & Timeline',
  description: 'Background, research interests, career timeline, and operational principles.',
};

export default async function AboutPage() {
  const { contentHtml } = await getAboutContent();
  const timeline = getTimeline();
  const status = getStatusConfig();
  const site = getSiteConfig();

  return (
    <article className="space-y-10">
      {/* Page Header */}
      <header className="space-y-3 border-b border-border-subtle pb-6">
        <div className="text-xs font-mono text-accent-cyan uppercase tracking-wider">
          PERSONNEL // SECTION 02
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold text-ink-primary font-sans">
          About &amp; Operational Timeline
        </h1>
        <p className="text-sm sm:text-base font-serif text-ink-secondary max-w-2xl leading-relaxed">
          {site.tag} · {site.location}
        </p>

        {/* Operational Status Card */}
        <div className="p-4 bg-deck border border-border-subtle rounded font-mono text-xs space-y-2 mt-4 corner-bracket">
          <div className="flex items-center justify-between">
            <span className="text-accent-cyan font-semibold flex items-center space-x-1.5">
              <Briefcase className="w-3.5 h-3.5" aria-hidden="true" />
              <span>INTERNSHIP AVAILABILITY</span>
            </span>
            <span className="text-[10px] text-accent-cyan bg-accent-cyan/10 px-2 py-0.5 rounded border border-accent-cyan/20">
              AVAILABLE {status.available_from.toUpperCase()}
            </span>
          </div>

          <p className="text-ink-secondary text-[11px] leading-relaxed font-sans">
            {site.work_mode} Focusing on security-critical ML pipelines, vulnerability research, and verifiable architectures.
          </p>

          {status.role_targets && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {status.role_targets.map((role) => (
                <span
                  key={role}
                  className="px-2 py-0.5 bg-black/40 text-ink-secondary border border-border-subtle rounded text-[10px]"
                >
                  {role}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Biography & Principles Prose */}
      <section className="space-y-4">
        <h2 className="text-xs font-mono font-semibold text-ink-secondary uppercase tracking-wider flex items-center space-x-2">
          <User className="w-3.5 h-3.5 text-accent-cyan" aria-hidden="true" />
          <span>Background &amp; Philosophy</span>
        </h2>
        <div 
          className="prose prose-invert max-w-none font-serif text-sm sm:text-base leading-relaxed text-ink-primary/90 space-y-4 [&_h2]:font-sans [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink-primary [&_h2]:border-b [&_h2]:border-border-subtle [&_h2]:pb-1.5 [&_h2]:mt-6 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-1"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </section>

      {/* Chronological Timeline */}
      <section className="space-y-4 pt-4 border-t border-border-subtle">
        <h2 className="text-xs font-mono font-semibold text-ink-secondary uppercase tracking-wider flex items-center space-x-2">
          <Calendar className="w-3.5 h-3.5 text-accent-cyan" aria-hidden="true" />
          <span>Chronological Timeline</span>
        </h2>

        <div className="space-y-3 font-mono text-xs">
          {timeline.map((event, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-deck border border-border-subtle rounded hover:border-accent-cyan/50 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] mb-1">
                <span className="font-semibold text-ink-primary">
                  {event.title}
                </span>
                <span className="text-accent-cyan font-medium">
                  {event.date}
                </span>
              </div>
              <p className="text-ink-secondary text-[11px] font-sans leading-relaxed">
                {event.summary || event.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
