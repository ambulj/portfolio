// src/components/soc/PacketInspectionDrawer.tsx
// Slide-out Deep Packet Inspection (DPI) HUD drawer meeting WCAG 2.2 AA modal standards (SOC-02, SOC-03)

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { SocTelemetryEvent, NodeId } from '@/lib/soc/types';
import { X, ShieldAlert, Cpu, Lock, CheckCircle, AlertTriangle } from 'lucide-react';

interface PacketInspectionDrawerProps {
  event: SocTelemetryEvent | null;
  onClose: () => void;
  isIsolated: boolean;
  onToggleIsolation: (nodeId: NodeId) => void;
  onMarkFalsePositive: (eventId: string) => void;
  onRescoreMl: (eventId: string) => Promise<void>;
}

export default function PacketInspectionDrawer({
  event,
  onClose,
  isIsolated,
  onToggleIsolation,
  onMarkFalsePositive,
  onRescoreMl
}: PacketInspectionDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [isRescoring, setIsRescoring] = useState(false);

  // Focus trap and Escape key listener
  useEffect(() => {
    if (!event) return;

    // Trap focus and listen for Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Auto-focus close button
    const prevFocused = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();

    // Lock body scroll
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = origOverflow;
      prevFocused?.focus();
    };
  }, [event, onClose]);

  if (!event) return null;

  const handleRescore = async () => {
    try {
      setIsRescoring(true);
      await onRescoreMl(event.id);
    } finally {
      setIsRescoring(false);
    }
  };

  const isFp = event.triaged?.action === 'FALSE_POSITIVE';
  const anomalyScore = event.mlScore ? event.mlScore.anomalyScore : 0;
  const confidence = event.mlScore ? event.mlScore.confidence : 0;

  // Format payload into 16-byte hex + ascii lines
  const hexBytes = event.payload.rawHex.split(' ');
  const lines: { offset: string; hex: string[]; ascii: string; isAnomalyLine: boolean }[] = [];

  for (let i = 0; i < hexBytes.length; i += 16) {
    const chunk = hexBytes.slice(i, i + 16);
    const asciiChunk = event.payload.rawAscii.slice(i, i + 16);
    const offsetHex = i.toString(16).padStart(8, '0');

    // Check if within anomalous offsets
    let isAnomalyLine = false;
    if (event.payload.anomalousOffsets) {
      const [start, end] = event.payload.anomalousOffsets;
      if (i <= end && i + 16 >= start) {
        isAnomalyLine = true;
      }
    }

    lines.push({
      offset: offsetHex,
      hex: chunk,
      ascii: asciiChunk,
      isAnomalyLine
    });
  }

  // Severity styles
  let badgeClass = 'border-cyber-cyan text-cyber-cyan bg-cyber-cyan/10';
  if (event.severity === 'CRITICAL') {
    badgeClass = 'border-cyber-red text-cyber-red bg-cyber-red/10 animate-pulse';
  } else if (event.severity === 'HIGH') {
    badgeClass = 'border-cyber-red text-cyber-red bg-cyber-red/10';
  } else if (event.severity === 'MEDIUM') {
    badgeClass = 'border-cyber-amber text-cyber-amber bg-cyber-amber/10';
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
      aria-describedby="drawer-subtitle"
      data-testid="packet-drawer"
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm transition-opacity"
    >
      {/* Backdrop click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Drawer Container */}
      <div
        ref={drawerRef}
        className="relative w-full max-w-2xl bg-cyber-black border-l border-cyber-cyan/40 h-full overflow-y-auto p-5 sm:p-6 shadow-2xl flex flex-col font-mono text-xs z-10"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-cyber-border">
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeClass}`}>
                {event.severity}
              </span>
              <h2 id="drawer-title" className="text-sm font-bold text-cyber-cyan tracking-wider">
                PACKET INSPECTION // {event.id}
              </h2>
            </div>
            <p id="drawer-subtitle" className="text-[11px] text-cyber-text-secondary mt-1">
              Time: {event.timestamp} · Target Host: {event.targetNode}
            </p>
          </div>

          <button
            ref={closeBtnRef}
            data-testid="btn-drawer-close"
            onClick={onClose}
            aria-label="Close packet inspection drawer"
            className="p-1.5 rounded border border-cyber-border bg-cyber-dark text-cyber-text-secondary hover:text-cyber-cyan hover:border-cyber-cyan transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Threat Intelligence & ML Scoring */}
        <div className="mt-4 p-3.5 rounded border border-cyber-border bg-cyber-dark/40 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] text-cyber-text-secondary uppercase tracking-widest block">
                SURICATA SIGNATURE:
              </span>
              <span className="text-xs font-bold text-cyber-text-primary">
                {event.signature}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-black/60 border border-cyber-border text-accent-cyan text-[10px] whitespace-nowrap">
              {event.mitreTechnique}
            </span>
          </div>

          {/* ONNX WASM Score Bar */}
          <div className="pt-2 border-t border-cyber-border/60">
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-cyber-text-secondary flex items-center gap-1">
                <Cpu className="w-3 h-3 text-cyber-cyan" />
                ONNX RUNTIME WASM SCORE:
              </span>
              <span
                className={`font-bold ${
                  anomalyScore >= 0.7
                    ? 'text-cyber-red'
                    : anomalyScore >= 0.2
                    ? 'text-cyber-amber'
                    : 'text-cyber-cyan'
                }`}
              >
                {isFp ? 'OVERRIDDEN (BENIGN)' : `${Math.round(anomalyScore * 100)}% ANOMALY`}
              </span>
            </div>
            <div className="w-full h-2 rounded bg-black border border-cyber-border overflow-hidden">
              <div
                className={`h-full ${
                  isFp
                    ? 'bg-cyber-cyan w-1'
                    : anomalyScore >= 0.7
                    ? 'bg-cyber-red'
                    : anomalyScore >= 0.2
                    ? 'bg-cyber-amber'
                    : 'bg-cyber-cyan'
                }`}
                style={{ width: isFp ? '5%' : `${Math.max(5, anomalyScore * 100)}%` }}
              />
            </div>
            {event.mlScore?.latencyMs !== undefined && (
              <span className="text-[10px] text-emerald-400 mt-1 block">
                Client WASM Latency: {event.mlScore.latencyMs} ms (&lt; 50ms SLA)
              </span>
            )}
          </div>
        </div>

        {/* Layer 3 / Layer 4 Decoded Headers */}
        <div className="mt-4 p-3.5 rounded border border-cyber-border bg-cyber-dark/30 space-y-3">
          <span className="text-[10px] font-bold text-cyber-cyan uppercase tracking-widest block">
            DECODED PROTOCOL HEADERS (L3 / L4):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div>
              <span className="text-cyber-text-secondary block">SRC IP:PORT</span>
              <span className="text-cyber-text-primary">
                {event.headers.srcIp}:{event.headers.srcPort}
              </span>
            </div>
            <div>
              <span className="text-cyber-text-secondary block">DST IP:PORT</span>
              <span className="text-cyber-text-primary">
                {event.headers.dstIp}:{event.headers.dstPort}
              </span>
            </div>
            <div>
              <span className="text-cyber-text-secondary block">PROTOCOL</span>
              <span className="text-cyber-cyan font-bold">{event.headers.protocol}</span>
            </div>
            <div>
              <span className="text-cyber-text-secondary block">TTL / SIZE</span>
              <span className="text-cyber-text-primary">
                {event.headers.ttl} / {event.headers.packetSize}B
              </span>
            </div>
          </div>

          {/* TCP Flags */}
          {event.headers.tcpFlags && (
            <div className="pt-2 border-t border-cyber-border/40">
              <span className="text-[10px] text-cyber-text-secondary block mb-1.5">
                TCP FLAGS:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(event.headers.tcpFlags).map(([flag, active]) => (
                  <span
                    key={flag}
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                      active
                        ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan'
                        : 'bg-black/40 border-cyber-border text-zinc-600'
                    }`}
                  >
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Layer 7 Metadata */}
          {event.headers.layer7 && (
            <div className="pt-2 border-t border-cyber-border/40 text-[11px] space-y-1">
              {event.headers.layer7.tlsSni && (
                <div>
                  <span className="text-cyber-text-secondary">TLS SNI: </span>
                  <span className="text-cyber-cyan">{event.headers.layer7.tlsSni}</span>
                </div>
              )}
              {event.headers.layer7.tlsCipher && (
                <div>
                  <span className="text-cyber-text-secondary">CIPHER: </span>
                  <span className="text-zinc-400">{event.headers.layer7.tlsCipher}</span>
                </div>
              )}
              {event.headers.layer7.dnsQuery && (
                <div>
                  <span className="text-cyber-text-secondary">DNS QUERY: </span>
                  <span className="text-cyber-amber">{event.headers.layer7.dnsQuery}</span>
                </div>
              )}
              {event.headers.layer7.httpPath && (
                <div>
                  <span className="text-cyber-text-secondary">HTTP URI: </span>
                  <span className="text-cyber-cyan">
                    {event.headers.layer7.httpMethod} {event.headers.layer7.httpPath}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dual-Pane Hex / ASCII Payload Viewer */}
        <div className="mt-4 flex-1">
          <span className="text-[10px] font-bold text-cyber-cyan uppercase tracking-widest block mb-2">
            RAW FRAME PAYLOAD (HEX + ASCII DUMP):
          </span>
          <div
            data-testid="hex-payload-viewer"
            className="rounded border border-cyber-border bg-black p-3 overflow-x-auto text-[11px] font-mono leading-tight space-y-1 select-text"
          >
            {lines.map((ln, idx) => (
              <div
                key={`line-${idx}`}
                className={`flex gap-3 px-1 py-0.5 rounded ${
                  ln.isAnomalyLine ? 'bg-cyber-red/15 text-cyber-red border border-cyber-red/30' : ''
                }`}
              >
                <span className="text-zinc-500">{ln.offset}</span>
                <span className="text-cyber-cyan flex-1 tracking-wider">
                  {ln.hex.slice(0, 8).join(' ')}  {ln.hex.slice(8, 16).join(' ')}
                </span>
                <span className="text-zinc-400 border-l border-cyber-border pl-3 tracking-widest">
                  |{ln.ascii}|
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Analyst Action Dock */}
        <div className="mt-5 pt-4 border-t border-cyber-border flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {/* Isolate Node */}
            <button
              data-testid="btn-isolate-node"
              onClick={() => onToggleIsolation(event.targetNode)}
              className={`px-3 py-1.5 rounded border text-xs uppercase tracking-wider font-bold transition-colors flex items-center gap-1.5 ${
                isIsolated
                  ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                  : 'border-cyber-red bg-cyber-red/20 text-cyber-red hover:bg-cyber-red/30'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              {isIsolated ? `RESTORE NODE (${event.targetNode})` : `ISOLATE HOST (${event.targetNode})`}
            </button>

            {/* Mark False Positive */}
            <button
              data-testid="btn-mark-false-positive"
              onClick={() => onMarkFalsePositive(event.id)}
              disabled={isFp}
              className={`px-3 py-1.5 rounded border text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                isFp
                  ? 'border-zinc-700 bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'border-cyber-border bg-cyber-dark text-cyber-text-secondary hover:text-cyber-cyan hover:border-cyber-cyan'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              {isFp ? 'MARKED AS FALSE POSITIVE' : 'MARK FALSE POSITIVE'}
            </button>
          </div>

          {/* Re-run In-Browser ML Classifier */}
          <button
            data-testid="btn-rescore-ml"
            onClick={handleRescore}
            disabled={isRescoring}
            className="px-3 py-1.5 rounded border border-cyber-cyan bg-cyber-cyan/15 text-cyber-cyan hover:bg-cyber-cyan/25 transition-colors flex items-center gap-1.5 uppercase tracking-wider"
          >
            <Cpu className="w-3.5 h-3.5" />
            {isRescoring ? 'EVALUATING...' : 'RE-RUN ML INFERENCE'}
          </button>
        </div>
      </div>
    </div>
  );
}
