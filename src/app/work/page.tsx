import React from 'react';
import Link from 'next/link';
import { getAllProjects } from '@/lib/content/api';
import { ArrowRight, Cpu, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Work & Case Studies',
  description: 'Verified engineering case studies in machine learning, cybersecurity, and data integrity.',
};

export default async function WorkIndexPage() {
  const allProjects = await getAllProjects();
  // Filter core case studies (order <= 5)
  const coreProjects = allProjects.filter((p) => p.slug !== 'phenom');

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2 border-b border-border-subtle pb-4">
        <div className="text-xs font-mono text-accent-cyan uppercase tracking-wider">
          PORTFOLIO // SECTION 01
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold text-ink-primary font-sans">
          Work &amp; Case Studies
        </h1>
        <p className="text-sm sm:text-base font-serif text-ink-secondary max-w-2xl leading-relaxed">
          Deep-dive architecture walkthroughs of production and prototype systems built for adversarial robustness, cryptographic verification, and honest error accounting.
        </p>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {coreProjects.map((project) => {
          // Normalize stack categories to a flat list of highlights
          const stackList = Array.isArray(project.stack)
            ? project.stack
            : Object.values(project.stack).flat();

          return (
            <Link
              key={project.slug}
              href={`/work/${project.slug}`}
              className="group block p-5 bg-deck border border-border-subtle rounded hover:border-accent-cyan/60 transition-all corner-bracket hover:shadow-hud-cyan"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono text-accent-cyan font-semibold">
                      0{project.order} //
                    </span>
                    <h2 className="text-lg font-semibold text-ink-primary font-sans group-hover:text-accent-cyan transition-colors">
                      {project.title}
                    </h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-ink-secondary border border-border-subtle">
                      {project.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-sm text-ink-secondary font-serif mt-2 max-w-2xl leading-relaxed">
                    {project.summary}
                  </p>
                </div>

                <div className="self-end sm:self-center flex items-center space-x-1 text-xs font-mono text-accent-cyan group-hover:translate-x-1 transition-transform">
                  <span className="hidden sm:inline">STUDY</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              {/* Stack and Metric Snippet */}
              <div className="mt-4 pt-3 border-t border-border-subtle/60 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {stackList.slice(0, 5).map((tech) => (
                    <span
                      key={tech}
                      className="text-[10px] font-mono px-2 py-0.5 bg-black/40 text-ink-secondary border border-border-subtle/80 rounded"
                    >
                      {tech}
                    </span>
                  ))}
                  {stackList.length > 5 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 text-ink-secondary/70">
                      +{stackList.length - 5}
                    </span>
                  )}
                </div>

                {project.metrics && project.metrics.length > 0 && (
                  <div className="text-[11px] font-mono text-ink-secondary flex items-center space-x-1.5">
                    <span className="text-ink-primary font-medium">
                      {project.metrics[0].measure}:
                    </span>
                    <span className="text-accent-cyan font-semibold">
                      {project.metrics[0].value}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
