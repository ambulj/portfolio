// src/components/soc/AlertTriageFeed.tsx
// Real-time telemetry feed table with analyst triage actions and ARIA live announcements (SOC-03)

'use client';

import React, { useState } from 'react';
import { SocTelemetryEvent, NodeId } from '@/lib/soc/types';
import { Shield, Eye, ShieldAlert, CheckCircle, Filter } from 'lucide-react';

interface AlertTriageFeedProps {
  events: SocTelemetryEvent[];
  onSelectEvent: (event: SocTelemetryEvent) => void;
  isolatedNodes: Set<NodeId>;
  onToggleIsolation: (nodeId: NodeId) => void;
  onMarkFalsePositive: (eventId: string) => void;
}

export default function AlertTriageFeed({
  events,
  onSelectEvent,
  isolatedNodes,
  onToggleIsolation,
  onMarkFalsePositive
}: AlertTriageFeedProps) {
  const [filterMode, setFilterMode] = useState<'ALL' | 'ANOMALIES' | 'CRITICAL'>('ALL');

  const filteredEvents = events.filter(e => {
    if (filterMode === 'CRITICAL') return e.severity === 'CRITICAL';
    if (filterMode === 'ANOMALIES') return e.severity === 'CRITICAL' || e.severity === 'HIGH';
    return true;
  });

  return (
    <div
      data-testid="alert-triage-feed"
      className="rounded-lg border border-cyber-border bg-cyber-black p-4 font-mono text-xs shadow-xl"
    >
      {/* Feed Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-cyber-border gap-2">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyber-cyan" />
          <h3 className="font-bold text-cyber-cyan tracking-wider uppercase">
            LIVE TELEMETRY &amp; ALERT TRIAGE FEED
          </h3>
          <span className="text-[10px] text-cyber-text-secondary px-2 py-0.5 rounded bg-cyber-dark border border-cyber-border">
            BUFFER: {events.length} / 60
          </span>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 text-[11px]">
          <Filter className="w-3.5 h-3.5 text-zinc-500 mr-1" />
          {(['ALL', 'ANOMALIES', 'CRITICAL'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              data-testid={`filter-${mode.toLowerCase()}`}
              className={`px-2.5 py-1 rounded border transition-colors uppercase ${
                filterMode === mode
                  ? 'border-cyber-cyan bg-cyber-cyan/20 text-cyber-cyan font-bold'
                  : 'border-cyber-border bg-cyber-dark text-cyber-text-secondary hover:text-cyber-cyan'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Screen Reader ARIA Live Region for Critical Alerts */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {events.length > 0 && events[0].severity === 'CRITICAL'
          ? `CRITICAL ALERT: ${events[0].signature} detected targeting ${events[0].targetNode}`
          : ''}
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-cyber-border text-[10px] text-cyber-text-secondary uppercase tracking-wider">
              <th className="py-2 px-2.5">TIME</th>
              <th className="py-2 px-2.5">SEVERITY</th>
              <th className="py-2 px-2.5">SOURCE &rarr; TARGET</th>
              <th className="py-2 px-2.5">SIGNATURE</th>
              <th className="py-2 px-2.5">PROTOCOL</th>
              <th className="py-2 px-2.5">ML SCORE</th>
              <th className="py-2 px-2.5 text-right">TRIAGE ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyber-border/40 text-[11px]">
            {filteredEvents.map(ev => {
              const isTargetIsolated = isolatedNodes.has(ev.targetNode);
              const isFp = ev.triaged?.action === 'FALSE_POSITIVE';
              const anomalyScore = ev.mlScore ? Math.round(ev.mlScore.anomalyScore * 100) : 0;

              let sevClass = 'border-cyber-cyan/40 text-cyber-cyan bg-cyber-cyan/10';
              if (ev.severity === 'CRITICAL') {
                sevClass = 'border-cyber-red text-cyber-red bg-cyber-red/15 animate-pulse';
              } else if (ev.severity === 'HIGH') {
                sevClass = 'border-cyber-red text-cyber-red bg-cyber-red/10';
              } else if (ev.severity === 'MEDIUM') {
                sevClass = 'border-cyber-amber text-cyber-amber bg-cyber-amber/10';
              }

              return (
                <tr
                  key={ev.id}
                  data-testid={`event-row-${ev.id}`}
                  className="hover:bg-cyber-dark/60 transition-colors group cursor-pointer"
                  onClick={() => onSelectEvent(ev)}
                >
                  {/* Timestamp */}
                  <td className="py-2 px-2.5 text-zinc-400 whitespace-nowrap">{ev.timestamp}</td>

                  {/* Severity */}
                  <td className="py-2 px-2.5 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${sevClass}`}>
                      {ev.severity}
                    </span>
                  </td>

                  {/* Vector Route */}
                  <td className="py-2 px-2.5 whitespace-nowrap text-zinc-300">
                    <span className="text-zinc-400">{ev.sourceNode}</span>
                    <span className="text-cyber-cyan mx-1">&rarr;</span>
                    <span className={isTargetIsolated ? 'line-through text-zinc-500' : 'text-zinc-200'}>
                      {ev.targetNode}
                    </span>
                    {isTargetIsolated && (
                      <span className="ml-1.5 text-[9px] text-zinc-500 px-1 py-0.2 border border-zinc-700 rounded">
                        QUARANTINED
                      </span>
                    )}
                  </td>

                  {/* Signature */}
                  <td className="py-2 px-2.5 max-w-[220px] truncate text-zinc-200" title={ev.signature}>
                    {ev.signature}
                  </td>

                  {/* Protocol */}
                  <td className="py-2 px-2.5 text-cyber-cyan whitespace-nowrap">{ev.headers.protocol}</td>

                  {/* ML Score */}
                  <td className="py-2 px-2.5 whitespace-nowrap">
                    {isFp ? (
                      <span className="text-emerald-400 text-[10px]">[FALSE POSITIVE]</span>
                    ) : (
                      <span
                        className={`font-bold ${
                          anomalyScore >= 70
                            ? 'text-cyber-red'
                            : anomalyScore >= 20
                            ? 'text-cyber-amber'
                            : 'text-cyber-cyan'
                        }`}
                      >
                        {anomalyScore}%
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-2 px-2.5 text-right whitespace-nowrap space-x-1.5">
                    {/* Inspect Button */}
                    <button
                      data-testid={`btn-inspect-${ev.id}`}
                      onClick={e => {
                        e.stopPropagation();
                        onSelectEvent(ev);
                      }}
                      className="px-2 py-0.5 rounded border border-cyber-border bg-cyber-dark text-cyber-cyan hover:border-cyber-cyan text-[10px] uppercase transition-colors"
                      title="Inspect full decoded packet"
                    >
                      INSPECT
                    </button>

                    {/* Quick Isolate */}
                    <button
                      data-testid={`btn-quick-isolate-${ev.id}`}
                      onClick={e => {
                        e.stopPropagation();
                        onToggleIsolation(ev.targetNode);
                      }}
                      className={`px-2 py-0.5 rounded border text-[10px] uppercase transition-colors ${
                        isTargetIsolated
                          ? 'border-emerald-600 bg-emerald-600/20 text-emerald-400'
                          : 'border-cyber-red/60 bg-cyber-red/10 text-cyber-red hover:bg-cyber-red/20'
                      }`}
                      title={isTargetIsolated ? 'Restore quarantined host' : 'Isolate target host'}
                    >
                      {isTargetIsolated ? 'RESTORE' : 'ISOLATE'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
