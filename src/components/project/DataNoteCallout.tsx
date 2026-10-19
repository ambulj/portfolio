import React from 'react';
import { Database } from 'lucide-react';

interface DataNoteCalloutProps {
  note?: string;
}

export default function DataNoteCallout({ note }: DataNoteCalloutProps) {
  if (!note) return null;

  return (
    <div className="p-3.5 bg-accent-amber/5 border border-accent-amber/30 rounded font-mono text-xs text-ink-primary flex items-start space-x-2.5">
      <Database className="w-4 h-4 text-accent-amber flex-shrink-0 mt-0.5" aria-hidden="true" />
      <div>
        <span className="font-semibold text-accent-amber uppercase tracking-wider text-[11px] block mb-0.5">
          Data Provenance Note
        </span>
        <p className="text-xs text-ink-primary/90 leading-relaxed font-sans">
          {note}
        </p>
      </div>
    </div>
  );
}
