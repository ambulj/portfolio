import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function RoadSaarthiDisclaimer() {
  return (
    <div className="p-4 bg-accent-amber/10 border border-accent-amber/40 rounded font-mono text-xs text-ink-primary flex items-start space-x-3 my-4">
      <AlertTriangle className="w-4 h-4 text-accent-amber flex-shrink-0 mt-0.5" aria-hidden="true" />
      <div>
        <span className="font-semibold text-accent-amber uppercase tracking-wider text-[11px] block mb-1">
          Independent Prototype Notice
        </span>
        <p className="text-xs text-ink-primary font-sans leading-relaxed">
          An independent prototype. It is not an official product of any government body, and its data is synthetic.
        </p>
      </div>
    </div>
  );
}
