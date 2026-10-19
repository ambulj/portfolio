import React from 'react';
import { RefreshCw } from 'lucide-react';

interface RetrospectiveBlockProps {
  changes?: string[];
}

export default function RetrospectiveBlock({ changes }: RetrospectiveBlockProps) {
  if (!changes || changes.length === 0) return null;

  return (
    <div className="space-y-3 pt-4 border-t border-border-subtle">
      <div className="flex items-center space-x-2 text-ink-secondary">
        <RefreshCw className="w-3.5 h-3.5 text-accent-cyan" aria-hidden="true" />
        <h3 className="text-xs font-mono font-semibold uppercase tracking-wider">
          What I&apos;d Change (Architectural Retrospective)
        </h3>
      </div>

      <div className="p-4 bg-deck border-l-2 border-l-accent-cyan border border-border-subtle rounded-r space-y-2">
        {changes.map((item, idx) => (
          <p 
            key={idx} 
            className="text-sm font-serif italic text-ink-primary/90 leading-relaxed"
          >
            &ldquo;{item}&rdquo;
          </p>
        ))}
      </div>
    </div>
  );
}
