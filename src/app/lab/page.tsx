import { getProjectBySlug } from '@/lib/content/api';
import { Beaker, ExternalLink, Cpu, RefreshCw, Database } from 'lucide-react';
import MetricsTable from '@/components/project/MetricsTable';
import DataNoteCallout from '@/components/project/DataNoteCallout';
import RetrospectiveBlock from '@/components/project/RetrospectiveBlock';
import SocCommandDeck from '@/components/soc/SocCommandDeck';

export const metadata = {
  title: 'Lab & Experimental Prototypes',
  description: 'Unpublished experiments, local-first model architectures, and exploratory research prototypes.',
};

export default async function LabPage() {
  const phenom = await getProjectBySlug('phenom');

  return (
    <article className="space-y-10">
      {/* Page Header */}
      <header className="space-y-2 border-b border-border-subtle pb-6">
        <div className="text-xs font-mono text-accent-cyan uppercase tracking-wider">
          RESEARCH // SECTION 06
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold text-ink-primary font-sans">
          Experimental Lab &amp; Prototypes
        </h1>
        <p className="text-sm sm:text-base font-serif text-ink-secondary max-w-2xl leading-relaxed">
          Exploratory projects, proof-of-concept architectures, and ongoing research into local machine learning inference and offline privacy.
        </p>
      </header>

      {/* Flagship Interactive Prototype: SOC Cyber Warfare Telemetry Visualizer (SOC-01, SOC-02, SOC-03) */}
      <section className="space-y-3">
        <DataNoteCallout
          note="Data Provenance: 100% Client-Side Synthetic Stream. NetFlow v9 & Zeek format simulation with live in-browser ONNX Runtime WASM anomaly classification. Zero external network telemetry requests."
        />
        <SocCommandDeck />
      </section>

      {/* Featured Experiment: phenom */}
      {phenom && (
        <section className="space-y-6">
          <div className="p-6 bg-deck border border-border-subtle rounded space-y-4 corner-bracket">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <Beaker className="w-4 h-4 text-accent-cyan" aria-hidden="true" />
                  <h2 className="text-xl font-semibold text-ink-primary font-sans">
                    {phenom.title}
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">
                    EXPERIMENTAL PROTOTYPE
                  </span>
                </div>
                <p className="text-sm text-ink-secondary font-serif mt-2 leading-relaxed">
                  {phenom.summary}
                </p>
              </div>

              {phenom.repo_url && (
                <a
                  href={phenom.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-black/40 border border-border-subtle rounded hover:border-accent-cyan text-ink-primary text-xs font-mono transition-colors self-start"
                >
                  <span>GITHUB</span>
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              )}
            </div>

            {/* Data Note */}
            <DataNoteCallout note={phenom.data_note} />

            {/* Tech Stack */}
            {typeof phenom.stack === 'object' && !Array.isArray(phenom.stack) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 font-mono text-xs">
                {Object.entries(phenom.stack).map(([category, items]) => (
                  <div key={category} className="space-y-1">
                    <span className="text-[10px] text-accent-cyan font-semibold block uppercase">
                      {category}
                    </span>
                    <p className="text-ink-secondary text-[11px]">
                      {items.join(' · ')}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Metrics */}
            <div className="pt-2">
              <MetricsTable metrics={phenom.metrics} />
            </div>

            {/* Markdown Body */}
            <div 
              className="prose prose-invert max-w-none font-serif text-sm leading-relaxed text-ink-primary/90 pt-4 border-t border-border-subtle space-y-3 [&_h2]:font-sans [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-accent-cyan [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-1"
              dangerouslySetInnerHTML={{ __html: phenom.contentHtml }}
            />

            {/* Retrospective */}
            <RetrospectiveBlock changes={phenom.changes} />
          </div>
        </section>
      )}
    </article>
  );
}
