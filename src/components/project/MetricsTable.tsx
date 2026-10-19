import React from 'react';
import { Metric } from '@/lib/content/schemas';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface MetricsTableProps {
  metrics: Metric[];
}

export default function MetricsTable({ metrics }: MetricsTableProps) {
  if (!metrics || metrics.length === 0) {
    return (
      <div className="p-4 bg-deck border border-border-subtle rounded font-mono text-xs text-ink-secondary">
        No measured results yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono font-semibold text-ink-secondary uppercase tracking-wider">
          Audited Engineering Metrics
        </h3>
        <span className="text-[10px] font-mono text-ink-secondary">
          5-COLUMN REPRODUCIBILITY AUDIT
        </span>
      </div>

      <div className="overflow-x-auto border border-border-subtle rounded bg-deck">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="border-b border-border-subtle bg-black/40 text-ink-secondary text-[11px]">
              <th className="py-2.5 px-3 font-semibold">MEASURE</th>
              <th className="py-2.5 px-3 font-semibold">VALUE</th>
              <th className="py-2.5 px-3 font-semibold">DATA</th>
              <th className="py-2.5 px-3 font-semibold">HARDWARE</th>
              <th className="py-2.5 px-3 font-semibold">METHOD</th>
              <th className="py-2.5 px-3 font-semibold text-right">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {metrics.map((row, idx) => (
              <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-2.5 px-3 font-medium text-ink-primary">
                  {row.measure}
                </td>
                <td className="py-2.5 px-3 font-semibold text-accent-cyan">
                  {row.value}
                </td>
                <td className="py-2.5 px-3 text-ink-secondary">
                  {row.data}
                </td>
                <td className="py-2.5 px-3 text-ink-secondary text-[11px]">
                  {row.hardware}
                </td>
                <td className="py-2.5 px-3 text-ink-secondary text-[11px]">
                  {row.method}
                </td>
                <td className="py-2.5 px-3 text-right">
                  {row.verified ? (
                    <span className="inline-flex items-center space-x-1 text-[10px] text-accent-cyan bg-accent-cyan/10 px-1.5 py-0.5 rounded border border-accent-cyan/20">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>VERIFIED</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 text-[10px] text-accent-amber bg-accent-amber/10 px-1.5 py-0.5 rounded border border-accent-amber/20">
                      <AlertCircle className="w-3 h-3" />
                      <span>TARGET</span>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
