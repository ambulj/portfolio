import React from 'react';
import { getProjectDiagramSvg } from '@/lib/content/diagrams';
import { Layers } from 'lucide-react';

interface ArchitectureDiagramProps {
  slug: string;
  verified?: boolean;
}

export default function ArchitectureDiagram({ slug, verified = false }: ArchitectureDiagramProps) {
  const svgHtml = getProjectDiagramSvg(slug, verified);

  if (!svgHtml) return null;

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono font-semibold text-ink-secondary uppercase tracking-wider flex items-center space-x-2">
          <Layers className="w-3.5 h-3.5 text-accent-cyan" aria-hidden="true" />
          <span>System Architecture &amp; Dataflow</span>
        </h3>
        <span className="text-[10px] font-mono text-ink-secondary">
          {verified ? 'AUDITED SPECIFICATION' : 'DRAFT DIAGRAM'}
        </span>
      </div>

      <div 
        className="w-full overflow-hidden border border-border-subtle rounded bg-deck p-2 sm:p-4 [&_svg]:w-full [&_svg]:h-auto [&_svg]:max-h-[500px]"
        dangerouslySetInnerHTML={{ __html: svgHtml }}
      />
    </div>
  );
}
