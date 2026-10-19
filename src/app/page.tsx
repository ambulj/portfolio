import React from 'react';
import Link from 'next/link';
import { ArrowRight, Shield, Database, Cpu, Lock, Terminal, Activity } from 'lucide-react';

export default function HomePage() {
  const featuredProjects = [
    {
      slug: 'inferyx',
      title: 'Inferyx',
      tagline: 'Signed inference pipeline with verifiable model weights and tamper-evident logging.',
      stack: ['Python', 'FastAPI', 'Redis', 'Docker'],
      highlight: 'Tamper-Evident ML',
    },
    {
      slug: 'aegisz',
      title: 'AegisZ',
      tagline: 'Zero-knowledge audit gateway and fine-grained role-based policy enforcement.',
      stack: ['FastAPI', 'React', 'Tailwind', 'Docker Compose'],
      highlight: 'ZK Audit Gateway',
    },
    {
      slug: 'orgmind',
      title: 'OrgMind',
      tagline: 'Graph-augmented enterprise intelligence with verified citation provenance.',
      stack: ['Neo4j', 'FastAPI', 'LangChain', 'Docker'],
      highlight: 'Provenance Graph',
    },
    {
      slug: 'threat-detection',
      title: 'AI Threat Detection',
      tagline: 'Unsupervised streaming network anomaly classifier evaluated on benchmark flows.',
      stack: ['scikit-learn', 'Flask', 'Isolation Forest'],
      highlight: 'Streaming Anomaly Detection',
    },
    {
      slug: 'roadsaarthi',
      title: 'RoadSaarthi',
      tagline: 'Edge telemetry and road incident dispatch engine (independent synthetic prototype).',
      stack: ['React', 'FastAPI', 'WebSockets', 'Tailwind'],
      highlight: 'Synthetic Edge Prototype',
    },
  ];

  return (
    <div className="space-y-10">
      {/* Hero Header */}
      <section className="space-y-4">
        {/* Status Callout */}
        <div className="inline-flex items-center space-x-2 text-xs font-mono text-accent-cyan bg-accent-cyan/5 px-2.5 py-1 rounded border border-accent-cyan/20">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
          <span>B.Tech Computer Science &apos;28 · Security &amp; ML Systems</span>
        </div>

        {/* Primary Page Heading - Single h1 per route */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-ink-primary font-sans leading-tight">
          Machine-learning systems engineered for{' '}
          <span className="text-accent-cyan underline decoration-accent-cyan/30 underline-offset-4">
            adversarial pressure
          </span>.
        </h1>

        {/* Lead Narrative */}
        <p className="text-base sm:text-lg text-ink-primary/90 font-serif leading-relaxed max-w-2xl">
          I build machine-learning systems that operate under adversarial pressure. My focus is the seam between security and statistical methods: making models defend their outputs, making systems verify their data, and making architectures honest about what they don&apos;t know.
        </p>

        {/* Quick Action Navigation */}
        <div className="pt-2 flex flex-wrap gap-3 font-mono text-xs">
          <Link
            href="/work"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-accent-cyan text-black font-semibold rounded hover:bg-accent-cyan/90 transition-colors shadow-hud-cyan"
          >
            <span>EXPLORE WORK</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>

          <Link
            href="/about"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-deck border border-border-subtle text-ink-primary rounded hover:border-accent-cyan hover:text-accent-cyan transition-colors"
          >
            <span>ABOUT &amp; TIMELINE</span>
          </Link>

          <Link
            href="/certifications"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-deck border border-border-subtle text-ink-primary rounded hover:border-accent-cyan hover:text-accent-cyan transition-colors"
          >
            <span>VERIFIED CREDENTIALS</span>
          </Link>
        </div>
      </section>

      {/* Featured Case Studies */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-2">
          <h2 className="text-xs font-mono font-semibold text-ink-secondary uppercase tracking-wider flex items-center space-x-2">
            <Cpu className="w-3.5 h-3.5 text-accent-cyan" aria-hidden="true" />
            <span>Core Case Studies</span>
          </h2>
          <Link 
            href="/work" 
            className="text-xs font-mono text-accent-cyan hover:underline flex items-center space-x-1"
          >
            <span>VIEW ALL</span>
            <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {featuredProjects.map((project) => (
            <Link
              key={project.slug}
              href={`/work/${project.slug}`}
              className="group block p-4 bg-deck border border-border-subtle rounded hover:border-accent-cyan/60 transition-all corner-bracket hover:shadow-hud-cyan"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-semibold text-ink-primary font-sans group-hover:text-accent-cyan transition-colors">
                      {project.title}
                    </h3>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">
                      {project.highlight}
                    </span>
                  </div>
                  <p className="text-xs text-ink-secondary font-serif mt-1 max-w-xl">
                    {project.tagline}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-ink-secondary group-hover:text-accent-cyan group-hover:translate-x-0.5 transition-all mt-1" aria-hidden="true" />
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.stack.map((item) => (
                  <span
                    key={item}
                    className="text-[10px] font-mono px-2 py-0.5 bg-black/40 text-ink-secondary border border-border-subtle/80 rounded"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Engineering Honesty Notice */}
      <section className="p-4 bg-deck/60 border border-border-subtle rounded font-mono text-xs text-ink-secondary space-y-1">
        <div className="flex items-center space-x-2 text-accent-amber">
          <Activity className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="font-semibold text-ink-primary">HONESTY &amp; METHODOLOGY INVARIANT</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Every project documented on this site carries an explicit data note, a 5-column audit table with hardware and measurement method, and an unedited retrospective of architectural trade-offs.
        </p>
      </section>
    </div>
  );
}
