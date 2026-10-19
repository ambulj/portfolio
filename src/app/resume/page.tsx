import React from 'react';
import { FileText, Download, ExternalLink, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Resume & Curriculum Vitae',
  description: 'Academic background, machine learning research projects, security competencies, and curriculum vitae download.',
};

export default function ResumePage() {
  return (
    <article className="space-y-8">
      {/* Page Header */}
      <header className="space-y-2 border-b border-border-subtle pb-6">
        <div className="text-xs font-mono text-accent-cyan uppercase tracking-wider">
          DOCUMENTATION // SECTION 04
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold text-ink-primary font-sans">
              Resume &amp; Vitae
            </h1>
            <p className="text-sm font-serif text-ink-secondary mt-1">
              Ambul Jaiswal · Data Science &amp; Cybersecurity · B.Tech CSE &apos;28
            </p>
          </div>

          <a
            href="/resume.pdf"
            download="Ambul_Jaiswal_Resume.pdf"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-accent-cyan text-black font-semibold font-mono text-xs rounded hover:bg-accent-cyan/90 transition-colors shadow-hud-cyan self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>DOWNLOAD PDF</span>
          </a>
        </div>
      </header>

      {/* Embedded Document Viewer */}
      <section className="space-y-3">
        <div className="flex items-center justify-between font-mono text-xs text-ink-secondary">
          <div className="flex items-center space-x-2">
            <FileText className="w-3.5 h-3.5 text-accent-cyan" aria-hidden="true" />
            <span>INLINE PDF VIEWER</span>
          </div>
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-cyan hover:underline inline-flex items-center space-x-1"
          >
            <span>OPEN IN TAB</span>
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>
        </div>

        <div className="w-full h-[650px] border border-border-subtle rounded bg-deck overflow-hidden corner-bracket">
          <iframe
            src="/resume.pdf"
            title="Ambul Jaiswal Resume"
            className="w-full h-full border-none"
          />
        </div>
      </section>

      {/* Core Competencies Quick Readout */}
      <section className="p-4 bg-deck border border-border-subtle rounded font-mono text-xs space-y-3">
        <h2 className="text-xs font-semibold text-ink-secondary uppercase tracking-wider flex items-center space-x-2">
          <ShieldCheck className="w-3.5 h-3.5 text-accent-cyan" aria-hidden="true" />
          <span>Core Technical Competencies</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
          <div>
            <span className="text-accent-cyan font-semibold block mb-1">
              Machine Learning:
            </span>
            <p className="text-ink-secondary">
              PyTorch, ONNX, scikit-learn, LightGBM, XGBoost, Optuna, Polars, PyArrow
            </p>
          </div>

          <div>
            <span className="text-accent-cyan font-semibold block mb-1">
              Security &amp; Systems:
            </span>
            <p className="text-ink-secondary">
              Threat modeling, ZK audit proofs, RBAC, network anomaly detection, Isolation Forest
            </p>
          </div>

          <div>
            <span className="text-accent-cyan font-semibold block mb-1">
              Backend &amp; Infra:
            </span>
            <p className="text-ink-secondary">
              FastAPI, Redis, Celery, Neo4j, Docker Compose, Cloudflare Pages, Next.js 15
            </p>
          </div>
        </div>
      </section>
    </article>
  );
}
