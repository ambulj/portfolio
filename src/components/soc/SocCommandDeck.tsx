// src/components/soc/SocCommandDeck.tsx
// Top-level Security Operations Center (SOC) Master Command Deck (SOC-01, SOC-02, SOC-03)

'use client';

import React, { useState } from 'react';
import { useSocTelemetryStream } from '@/lib/soc/useSocTelemetryStream';
import AttackTopologyMap from './AttackTopologyMap';
import AlertTriageFeed from './AlertTriageFeed';
import PacketInspectionDrawer from './PacketInspectionDrawer';
import { NodeId, StreamSpeed } from '@/lib/soc/types';
import { Activity, Play, Pause, RotateCcw, ShieldCheck, Zap } from 'lucide-react';

export default function SocCommandDeck() {
  const {
    events,
    latestEvent,
    selectedEvent,
    isolatedNodes,
    streamStatus,
    streamSpeed,
    metrics,
    togglePause,
    setSpeed,
    isolateNode,
    unisolateNode,
    markFalsePositive,
    rescoreEventWithMl,
    selectEvent,
    resetStream
  } = useSocTelemetryStream();

  const [selectedNodeId, setSelectedNodeId] = useState<NodeId | null>(null);

  const handleToggleIsolation = (nodeId: NodeId) => {
    if (isolatedNodes.has(nodeId)) {
      unisolateNode(nodeId);
    } else {
      isolateNode(nodeId);
    }
  };

  const handleSelectNode = (nodeId: NodeId) => {
    setSelectedNodeId(nodeId);
    // Find the latest event associated with this node
    const matching = events.find(e => e.targetNode === nodeId || e.sourceNode === nodeId);
    if (matching) {
      selectEvent(matching);
    }
  };

  const isCurrentTargetIsolated = selectedEvent ? isolatedNodes.has(selectedEvent.targetNode) : false;

  return (
    <div
      data-testid="soc-command-deck"
      className="my-8 rounded-lg border border-cyber-cyan/40 bg-cyber-black p-4 sm:p-6 font-mono text-xs shadow-2xl space-y-5 relative overflow-hidden"
    >
      {/* HUD Telemetry Top Ribbon */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-cyber-border gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                streamStatus === 'PLAYING' ? 'bg-cyber-cyan animate-ping' : 'bg-zinc-600'
              }`}
            />
            <h2 className="text-base font-bold text-cyber-cyan tracking-wider">
              MISSION HUD // SIMULATED CYBER WARFARE COMMAND DECK
            </h2>
          </div>
          <p className="text-[11px] text-cyber-text-secondary mt-1">
            Real-time client-side NetFlow v9 &amp; Zeek telemetry synthesis with in-browser ONNX WASM triage.
          </p>
        </div>

        {/* Stream Play/Pause & Speed Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Pause / Play Toggle */}
          <button
            data-testid={streamStatus === 'PLAYING' ? 'btn-stream-pause' : 'btn-stream-play'}
            onClick={togglePause}
            className={`px-3 py-1.5 rounded border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
              streamStatus === 'PLAYING'
                ? 'border-cyber-amber bg-cyber-amber/15 text-cyber-amber hover:bg-cyber-amber/25'
                : 'border-cyber-cyan bg-cyber-cyan/15 text-cyber-cyan hover:bg-cyber-cyan/25'
            }`}
          >
            {streamStatus === 'PLAYING' ? (
              <>
                <Pause className="w-3.5 h-3.5" /> PAUSE STREAM
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> RESUME STREAM
              </>
            )}
          </button>

          {/* Speed Selector */}
          <div className="flex items-center rounded border border-cyber-border bg-cyber-dark p-0.5 text-[11px]">
            {([0.5, 1, 2] as StreamSpeed[]).map(spd => (
              <button
                key={spd}
                data-testid={`speed-btn-${spd}x`}
                onClick={() => setSpeed(spd)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  streamSpeed === spd
                    ? 'bg-cyber-cyan text-black font-bold'
                    : 'text-cyber-text-secondary hover:text-cyber-cyan'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Flush / Reset */}
          <button
            data-testid="btn-reset-stream"
            onClick={resetStream}
            className="p-1.5 rounded border border-cyber-border bg-cyber-dark text-cyber-text-secondary hover:text-cyber-cyan transition-colors"
            title="Reset telemetry buffer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Metrics HUD Ticker */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Packets */}
        <div className="p-3 rounded border border-cyber-border bg-cyber-dark/40">
          <span className="text-[10px] text-cyber-text-secondary block uppercase tracking-wider">
            PACKETS EVALUATED
          </span>
          <span
            data-testid="stat-total-packets"
            className="text-lg font-bold text-cyber-cyan block mt-1"
          >
            {metrics.totalPackets.toLocaleString()}
          </span>
          <span className="text-[9px] text-emerald-400">● Zero Network Calls</span>
        </div>

        {/* Active Anomalies */}
        <div className="p-3 rounded border border-cyber-border bg-cyber-dark/40">
          <span className="text-[10px] text-cyber-text-secondary block uppercase tracking-wider">
            ACTIVE ANOMALIES
          </span>
          <span
            data-testid="stat-active-anomalies"
            className={`text-lg font-bold block mt-1 ${
              metrics.activeAnomalies > 0 ? 'text-cyber-red animate-pulse' : 'text-zinc-400'
            }`}
          >
            {metrics.activeAnomalies}
          </span>
          <span className="text-[9px] text-zinc-500">Threshold: &gt; 70% Anomaly</span>
        </div>

        {/* Isolated Hosts */}
        <div className="p-3 rounded border border-cyber-border bg-cyber-dark/40">
          <span className="text-[10px] text-cyber-text-secondary block uppercase tracking-wider">
            ISOLATED HOSTS
          </span>
          <span
            data-testid="stat-isolated-hosts"
            className={`text-lg font-bold block mt-1 ${
              metrics.isolatedHosts > 0 ? 'text-cyber-amber' : 'text-zinc-400'
            }`}
          >
            {metrics.isolatedHosts}
          </span>
          <span className="text-[9px] text-zinc-500">Quarantine Enforced</span>
        </div>

        {/* False Positive Rate */}
        <div className="p-3 rounded border border-cyber-border bg-cyber-dark/40">
          <span className="text-[10px] text-cyber-text-secondary block uppercase tracking-wider">
            FALSE POSITIVE RATE
          </span>
          <span
            data-testid="stat-fp-rate"
            className="text-lg font-bold text-cyber-text-primary block mt-1"
          >
            {metrics.falsePositiveRate}%
          </span>
          <span className="text-[9px] text-zinc-500">{metrics.falsePositiveCount} Overrides Logged</span>
        </div>
      </div>

      {/* Attack Topology Map */}
      <div>
        <AttackTopologyMap
          latestEvent={latestEvent}
          isolatedNodes={isolatedNodes}
          onSelectNode={handleSelectNode}
          selectedNodeId={selectedNodeId}
        />
      </div>

      {/* Alert Triage Feed */}
      <div>
        <AlertTriageFeed
          events={events}
          onSelectEvent={selectEvent}
          isolatedNodes={isolatedNodes}
          onToggleIsolation={handleToggleIsolation}
          onMarkFalsePositive={markFalsePositive}
        />
      </div>

      {/* Slide-out DPI Packet Inspection Drawer */}
      <PacketInspectionDrawer
        event={selectedEvent}
        onClose={() => selectEvent(null)}
        isIsolated={isCurrentTargetIsolated}
        onToggleIsolation={handleToggleIsolation}
        onMarkFalsePositive={markFalsePositive}
        onRescoreMl={rescoreEventWithMl}
      />
    </div>
  );
}
