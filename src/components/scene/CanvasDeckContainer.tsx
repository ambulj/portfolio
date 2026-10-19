'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Compass, Cpu, Layers } from 'lucide-react';

interface Node {
  id: string;
  label: string;
  slug: string | null;
  kind: string;
  x: number;
  y: number;
}

export default function CanvasDeckContainer() {
  const [activeNode, setActiveNode] = useState<string | null>(null);

  // Projected 2D coordinates scaled for 600x600 viewBox
  const nodes: Node[] = [
    { id: 'inferyx', label: 'Inferyx', slug: '/work/inferyx', kind: 'lead', x: 300, y: 280 },
    { id: 'aegisz', label: 'AegisZ', slug: '/work/aegisz', kind: 'project', x: 160, y: 190 },
    { id: 'orgmind', label: 'OrgMind', slug: '/work/orgmind', kind: 'project', x: 440, y: 220 },
    { id: 'threat-detection', label: 'Threat Detection', slug: '/work/threat-detection', kind: 'project', x: 210, y: 400 },
    { id: 'roadsaarthi', label: 'RoadSaarthi', slug: '/work/roadsaarthi', kind: 'project', x: 420, y: 390 },
    { id: 'phenom', label: 'phenom', slug: '/lab', kind: 'lab', x: 500, y: 130 },
  ];

  const edges = [
    { from: 'inferyx', to: 'aegisz' },
    { from: 'inferyx', to: 'orgmind' },
    { from: 'inferyx', to: 'threat-detection' },
    { from: 'aegisz', to: 'orgmind' },
    { from: 'aegisz', to: 'threat-detection' },
    { from: 'threat-detection', to: 'roadsaarthi' },
    { from: 'orgmind', to: 'roadsaarthi' },
    { from: 'threat-detection', to: 'phenom' },
  ];

  return (
    <aside 
      aria-hidden="true"
      className="hidden lg:flex fixed left-0 top-11 bottom-9 w-[45vw] bg-oled border-r border-border-subtle flex-col overflow-hidden select-none z-10"
    >
      {/* Deck Header */}
      <div className="h-9 px-4 border-b border-border-subtle flex items-center justify-between text-xs font-mono text-ink-secondary bg-deck/50">
        <div className="flex items-center space-x-2">
          <Compass className="w-3.5 h-3.5 text-accent-cyan" />
          <span className="font-semibold text-ink-primary">RADAR TOPOLOGY</span>
          <span className="text-[10px] text-accent-cyan bg-accent-cyan/10 px-1.5 py-0.2 rounded border border-accent-cyan/30">
            TIER 0 SVG
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[10px]">
          <span>6 NODES</span>
          <span>8 EDGES</span>
        </div>
      </div>

      {/* Vector Graph Viewport */}
      <div className="flex-1 relative flex items-center justify-center p-4">
        {/* Engineering Background Grid */}
        <div className="absolute inset-0 hud-grid opacity-30 pointer-events-none" />

        {/* Concentric Telemetry Radar Rings */}
        <div className="absolute w-[460px] h-[460px] rounded-full border border-border-subtle/40 pointer-events-none" />
        <div className="absolute w-[320px] h-[320px] rounded-full border border-border-subtle/30 pointer-events-none" />
        <div className="absolute w-[180px] h-[180px] rounded-full border border-accent-cyan/10 pointer-events-none" />

        {/* Dynamic Topology SVG */}
        <svg
          viewBox="0 0 600 600"
          className="w-full h-full max-w-[540px] max-h-[540px] z-10"
        >
          {/* Connecting Edges */}
          {edges.map((edge, idx) => {
            const source = nodes.find((n) => n.id === edge.from);
            const target = nodes.find((n) => n.id === edge.to);
            if (!source || !target) return null;
            const isHighlighted = activeNode === source.id || activeNode === target.id;
            return (
              <line
                key={`edge-${idx}`}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={isHighlighted ? '#00f0ff' : '#1b262f'}
                strokeWidth={isHighlighted ? 1.5 : 1}
                strokeDasharray={isHighlighted ? 'none' : '3 3'}
                className="transition-colors duration-300"
              />
            );
          })}

          {/* Topology Nodes */}
          {nodes.map((node) => {
            const isLead = node.kind === 'lead';
            const isActive = activeNode === node.id;
            return (
              <g
                key={node.id}
                className="cursor-pointer group"
                onMouseEnter={() => setActiveNode(node.id)}
                onMouseLeave={() => setActiveNode(null)}
              >
                {/* Node Glow Circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isLead ? 14 : 9}
                  fill={isLead ? '#00f0ff' : '#080b0e'}
                  fillOpacity={isLead ? (isActive ? 0.25 : 0.15) : 0.8}
                  stroke={isActive ? '#00f0ff' : isLead ? '#00f0ff' : '#283845'}
                  strokeWidth={isActive ? 2 : 1.5}
                  className="transition-all duration-200"
                />

                {/* Node Center Pip */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isLead ? 4 : 2.5}
                  fill={isActive || isLead ? '#00f0ff' : '#8b949e'}
                />

                {/* Node Monospace Label */}
                <text
                  x={node.x}
                  y={node.y + (isLead ? 24 : 19)}
                  textAnchor="middle"
                  fill={isActive ? '#00f0ff' : '#8b949e'}
                  fontSize={isLead ? 12 : 10}
                  fontFamily="var(--font-plex-mono)"
                  letterSpacing="0.05em"
                  className="font-medium select-none pointer-events-none transition-colors"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Corner HUD Telemetry Overlay */}
        <div className="absolute bottom-3 left-3 text-[10px] font-mono text-ink-secondary/70 flex flex-col space-y-0.5">
          <span>PROJECTION: ORTHOGRAPHIC</span>
          <span>COORDINATES: SEC_GRID_ALPHA</span>
          <span>GPU COMPUTE ENGINE: PHASE 2 PREPARED</span>
        </div>
      </div>
    </aside>
  );
}
