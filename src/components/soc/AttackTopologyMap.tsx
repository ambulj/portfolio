// src/components/soc/AttackTopologyMap.tsx
// Interactive 5-tier SVG cyber attack topology graph with live vector pulses and node isolation states (SOC-02)

'use client';

import React, { useState, useEffect } from 'react';
import { NodeId, TopologyNode, SocTelemetryEvent, NodeStatus } from '@/lib/soc/types';
import { INITIAL_TOPOLOGY_NODES } from '@/lib/soc/generator';

interface AttackTopologyMapProps {
  latestEvent: SocTelemetryEvent | null;
  isolatedNodes: Set<NodeId>;
  onSelectNode?: (nodeId: NodeId) => void;
  selectedNodeId?: NodeId | null;
}

interface LinkDefinition {
  source: NodeId;
  target: NodeId;
  pathData: string;
}

const TOPOLOGY_LINKS: LinkDefinition[] = [
  {
    source: 'ingress-gateway',
    target: 'dmz-bastion',
    pathData: 'M 400 65 L 400 105'
  },
  {
    source: 'dmz-bastion',
    target: 'microservices',
    pathData: 'M 350 145 C 310 160 250 180 230 200'
  },
  {
    source: 'dmz-bastion',
    target: 'auth-vault',
    pathData: 'M 450 145 C 490 160 550 180 570 200'
  },
  {
    source: 'microservices',
    target: 'db-cluster',
    pathData: 'M 250 240 C 280 270 340 300 370 310'
  },
  {
    source: 'auth-vault',
    target: 'db-cluster',
    pathData: 'M 550 240 C 520 270 460 300 430 310'
  },
  {
    source: 'microservices',
    target: 'ingress-gateway',
    pathData: 'M 210 210 C 180 140 320 60 370 45'
  }
];

export default function AttackTopologyMap({
  latestEvent,
  isolatedNodes,
  onSelectNode,
  selectedNodeId
}: AttackTopologyMapProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Determine active link
  const activeLink = TOPOLOGY_LINKS.find(
    link =>
      latestEvent &&
      ((link.source === latestEvent.sourceNode && link.target === latestEvent.targetNode) ||
        (link.source === latestEvent.targetNode && link.target === latestEvent.sourceNode))
  );

  const getLinkColor = () => {
    if (!latestEvent) return '#1F2937';
    if (latestEvent.severity === 'CRITICAL' || latestEvent.severity === 'HIGH') return '#FF7A6B';
    if (latestEvent.severity === 'MEDIUM') return '#F2C500';
    return '#00FFFF';
  };

  const getNodeStatus = (node: TopologyNode): NodeStatus => {
    if (isolatedNodes.has(node.id)) return 'ISOLATED';
    if (latestEvent && latestEvent.targetNode === node.id) {
      if (latestEvent.severity === 'CRITICAL' || latestEvent.severity === 'HIGH') return 'UNDER_ATTACK';
      if (latestEvent.severity === 'MEDIUM') return 'DEGRADED';
    }
    return 'HEALTHY';
  };

  return (
    <div
      data-testid="attack-topology-map"
      className="relative rounded-lg border border-cyber-cyan/30 bg-cyber-black p-4 font-mono shadow-2xl overflow-hidden"
    >
      {/* Corner HUD Accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyber-cyan pointer-events-none" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyber-cyan pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyber-cyan pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyber-cyan pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between pb-3 mb-2 border-b border-cyber-border text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse" />
          <span className="font-bold text-cyber-cyan uppercase tracking-wider">
            INFRASTRUCTURE ATTACK TOPOLOGY // 5-TIER
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-cyber-text-secondary">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyber-cyan" /> HEALTHY
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyber-red animate-ping" /> ATTACK
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-zinc-600" /> ISOLATED
          </span>
        </div>
      </div>

      {/* SVG Attack Graph */}
      <svg
        viewBox="0 0 800 370"
        className="w-full h-auto max-h-[380px] select-none"
        aria-label="Interactive 5-tier infrastructure cyber topology graph"
      >
        <defs>
          <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Static Inactive Links */}
        {TOPOLOGY_LINKS.map((link, idx) => {
          const isActive = activeLink === link;
          return (
            <path
              key={`link-${idx}`}
              d={link.pathData}
              fill="none"
              stroke={isActive ? getLinkColor() : '#2A3441'}
              strokeWidth={isActive ? 2.5 : 1.5}
              strokeDasharray={isActive ? (prefersReducedMotion ? 'none' : '4 4') : '2 2'}
              className={isActive && !prefersReducedMotion ? 'animate-pulse' : ''}
              opacity={isActive ? 1 : 0.6}
            />
          );
        })}

        {/* Dynamic Traveling Attack Pulse if Not Reduced Motion */}
        {activeLink && !prefersReducedMotion && (
          <g>
            <circle r="4.5" fill={getLinkColor()} filter="url(#glow-red)">
              <animateMotion
                path={activeLink.pathData}
                dur="1.2s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        )}

        {/* Topology Nodes */}
        {INITIAL_TOPOLOGY_NODES.map(node => {
          const status = getNodeStatus(node);
          const isSelected = selectedNodeId === node.id;
          const isUnderAttack = status === 'UNDER_ATTACK';
          const isIsolated = status === 'ISOLATED';

          let strokeColor = '#00FFFF';
          let fillColor = '#0D1117';
          let badgeText = 'HEALTHY';
          let badgeBg = 'rgba(0, 255, 255, 0.1)';
          let badgeColor = '#00FFFF';

          if (isIsolated) {
            strokeColor = '#5B6A6E';
            fillColor = '#161B22';
            badgeText = 'ISOLATED';
            badgeBg = 'rgba(91, 106, 110, 0.2)';
            badgeColor = '#9CA3AF';
          } else if (isUnderAttack) {
            strokeColor = '#FF7A6B';
            fillColor = 'rgba(255, 122, 107, 0.15)';
            badgeText = 'UNDER ATTACK';
            badgeBg = 'rgba(255, 122, 107, 0.25)';
            badgeColor = '#FF7A6B';
          } else if (status === 'DEGRADED') {
            strokeColor = '#F2C500';
            fillColor = 'rgba(242, 197, 0, 0.1)';
            badgeText = 'DEGRADED';
            badgeBg = 'rgba(242, 197, 0, 0.2)';
            badgeColor = '#F2C500';
          }

          const cardWidth = 160;
          const cardHeight = 56;
          const cardX = node.x - cardWidth / 2;
          const cardY = node.y - cardHeight / 2;

          return (
            <g
              key={node.id}
              data-testid={`node-${node.id}`}
              role="button"
              tabIndex={0}
              aria-label={`${node.name}, Status: ${badgeText}, IP: ${node.ip}`}
              onClick={() => onSelectNode?.(node.id)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectNode?.(node.id);
                }
              }}
              className="cursor-pointer focus:outline-none group"
            >
              {/* Outer Glow / Halo if Attack or Selected */}
              {(isUnderAttack || isSelected) && (
                <rect
                  x={cardX - 4}
                  y={cardY - 4}
                  width={cardWidth + 8}
                  height={cardHeight + 8}
                  rx="6"
                  fill="none"
                  stroke={isSelected ? '#F2C500' : strokeColor}
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                  className={isUnderAttack && !prefersReducedMotion ? 'animate-pulse' : ''}
                />
              )}

              {/* Main Node Card */}
              <rect
                x={cardX}
                y={cardY}
                width={cardWidth}
                height={cardHeight}
                rx="4"
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={isSelected ? 2 : 1}
                className="transition-colors duration-200 group-hover:stroke-cyber-cyan"
              />

              {/* Node Title */}
              <text
                x={cardX + 10}
                y={cardY + 18}
                fill="#E6EDF3"
                fontSize="11"
                fontWeight="bold"
                className="font-mono tracking-wide"
              >
                {node.name}
              </text>

              {/* Node Role & IP */}
              <text
                x={cardX + 10}
                y={cardY + 32}
                fill="#8B949E"
                fontSize="9"
                className="font-mono"
              >
                {node.ip} · Tier 0{node.tier}
              </text>

              {/* Status Badge */}
              <rect
                x={cardX + 10}
                y={cardY + 38}
                width={badgeText.length * 5.8 + 8}
                height="13"
                rx="2"
                fill={badgeBg}
                stroke={strokeColor}
                strokeWidth="0.5"
              />
              <text
                x={cardX + 14}
                y={cardY + 48}
                fill={badgeColor}
                fontSize="8"
                fontWeight="bold"
                className="font-mono tracking-wider uppercase"
              >
                {badgeText}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
