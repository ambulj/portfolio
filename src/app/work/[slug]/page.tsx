import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllProjects, getProjectBySlug } from '@/lib/content/api';
import MetricsTable from '@/components/project/MetricsTable';
import DataNoteCallout from '@/components/project/DataNoteCallout';
import RetrospectiveBlock from '@/components/project/RetrospectiveBlock';
import RoadSaarthiDisclaimer from '@/components/project/RoadSaarthiDisclaimer';
import ArchitectureDiagram from '@/components/project/ArchitectureDiagram';
import { ArrowLeft, ExternalLink, Lock, Cpu } from 'lucide-react';

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const projects = await getAllProjects();
  return projects
    .filter((p) => p.slug !== 'phenom')
    .map((p) => ({
      slug: p.slug,
    }));
}

export async function generateMetadata({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};

  return {
    title: `${project.title} — Case Study`,
    description: project.summary,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const isRoadSaarthi = slug === 'roadsaarthi';
  const isPrivateRepo = project.repo_private;

  return (
    <article className="space-y-8">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          href="/work"
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-ink-secondary hover:text-accent-cyan transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>RETURN TO WORK INDEX</span>
        </Link>
      </div>

      {/* Project Header */}
      <header className="space-y-4 border-b border-border-subtle pb-6">
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-accent-cyan font-semibold">
            CASE STUDY 0{project.order} //
          </span>
          <span className="px-2 py-0.5 rounded bg-white/5 text-ink-secondary border border-border-subtle uppercase">
            {project.status}
          </span>
          {project.hardening_status && (
            <span className="px-2 py-0.5 rounded bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">
              {project.hardening_status}
            </span>
          )}
        </div>

        {/* Primary h1 */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-ink-primary font-sans">
          {project.title}
        </h1>

        <p className="text-base sm:text-lg font-serif text-ink-primary/90 leading-relaxed max-w-3xl">
          {project.summary}
        </p>

        {/* Repository & Demo Action Links */}
        <div className="flex flex-wrap items-center gap-3 pt-2 font-mono text-xs">
          {project.repo_url ? (
            <a
              href={project.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-deck border border-border-subtle rounded text-ink-primary hover:border-accent-cyan hover:text-accent-cyan transition-colors"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>SOURCE REPO</span>
              <ExternalLink className="w-3 h-3 text-ink-secondary" aria-hidden="true" />
            </a>
          ) : isPrivateRepo ? (
            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-deck/60 border border-border-subtle rounded text-ink-secondary text-[11px]">
              <Lock className="w-3.5 h-3.5 text-accent-amber" aria-hidden="true" />
              <span>Source is private. Walkthrough on request.</span>
            </div>
          ) : null}

          {project.demo_url && (
            <a
              href={project.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-accent-cyan text-black font-semibold rounded hover:bg-accent-cyan/90 transition-colors shadow-hud-cyan"
            >
              <span>LIVE DEMO</span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          )}
        </div>

        {/* Mandatory Independent Prototype Notice for RoadSaarthi */}
        {isRoadSaarthi && <RoadSaarthiDisclaimer />}

        {/* Prominent Data Provenance Note */}
        <DataNoteCallout note={project.data_note} />
      </header>

      {/* Tech Stack Breakdown */}
      <section className="p-4 bg-deck border border-border-subtle rounded space-y-3 font-mono text-xs">
        <h2 className="text-xs font-semibold text-ink-secondary uppercase tracking-wider flex items-center space-x-2">
          <Cpu className="w-3.5 h-3.5 text-accent-cyan" aria-hidden="true" />
          <span>Technical Stack</span>
        </h2>
        {Array.isArray(project.stack) ? (
          <div className="flex flex-wrap gap-1.5">
            {project.stack.map((item) => (
              <span
                key={item}
                className="px-2.5 py-1 bg-black/40 text-ink-primary border border-border-subtle rounded text-xs"
              >
                {item}
              </span>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {Object.entries(project.stack).map(([category, items]) => (
              <div key={category} className="space-y-1">
                <span className="text-[11px] text-accent-cyan font-medium block">
                  {category}:
                </span>
                <p className="text-ink-secondary text-[11px]">
                  {items.join(' · ')}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* System Architecture Diagram */}
      <section>
        <ArchitectureDiagram
          slug={project.slug}
          verified={project.diagram_verified}
        />
      </section>

      {/* 5-Column Audited Metrics Table */}
      <section>
        <MetricsTable metrics={project.metrics} />
      </section>

      {/* Deep-Dive Narrative Prose */}
      <section className="pt-4 border-t border-border-subtle">
        <div 
          className="prose prose-invert max-w-none font-serif text-sm sm:text-base leading-relaxed text-ink-primary/90 space-y-4 [&_h2]:font-sans [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ink-primary [&_h2]:border-b [&_h2]:border-border-subtle [&_h2]:pb-2 [&_h2]:mt-8 [&_h3]:font-sans [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-accent-cyan [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-1 [&_code]:font-mono [&_code]:text-xs [&_code]:bg-deck [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:border [&_code]:border-border-subtle"
          dangerouslySetInnerHTML={{ __html: project.contentHtml }}
        />
      </section>

      {/* Honesty Retrospective ("What I'd change") */}
      <section>
        <RetrospectiveBlock changes={project.changes} />
      </section>
    </article>
  );
}
