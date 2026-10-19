// src/lib/soc/useSocTelemetryStream.ts
// React state management hook coordinating the synthetic SOC event stream, ring buffer, and triage actions

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  SocTelemetryEvent,
  NodeId,
  StreamSpeed,
  StreamStatus,
  SocMetrics
} from './types';
import { generateSyntheticEvent, pushEventToRingBuffer } from './generator';
import { runInference } from '@/lib/ml/inference-engine';

const BASE_INTERVAL_MS = 1200;
const MAX_RING_BUFFER = 60;

export function useSocTelemetryStream() {
  const [events, setEvents] = useState<SocTelemetryEvent[]>(() => {
    // Seed initial 3 events for instant render
    const initial: SocTelemetryEvent[] = [];
    for (let i = 0; i < 3; i++) {
      initial.push(generateSyntheticEvent(i));
    }
    return initial;
  });

  const [selectedEvent, setSelectedEvent] = useState<SocTelemetryEvent | null>(null);
  const [isolatedNodes, setIsolatedNodes] = useState<Set<NodeId>>(new Set());
  const [streamStatus, setStreamStatus] = useState<StreamStatus>('PLAYING');
  const [streamSpeed, setStreamSpeed] = useState<StreamSpeed>(1);

  // False positive override tracking
  const [falsePositives, setFalsePositives] = useState<Set<string>>(new Set());

  // Metrics
  const totalEvaluatedRef = useRef<number>(3);
  const [metrics, setMetrics] = useState<SocMetrics>({
    totalPackets: 3,
    activeAnomalies: 2,
    isolatedHosts: 0,
    falsePositiveCount: 0,
    falsePositiveRate: 0
  });

  // Calculate dynamic metrics
  const recalculateMetrics = useCallback(
    (currentEvents: SocTelemetryEvent[], isolated: Set<NodeId>, fps: Set<string>) => {
      let activeAnomalies = 0;
      for (const ev of currentEvents) {
        const isFp = fps.has(ev.id) || ev.triaged?.action === 'FALSE_POSITIVE';
        const isTargetIsolated = isolated.has(ev.targetNode);
        if (!isFp && !isTargetIsolated && (ev.severity === 'HIGH' || ev.severity === 'CRITICAL')) {
          activeAnomalies++;
        }
      }

      const total = totalEvaluatedRef.current;
      const fpCount = fps.size;
      const fpRate = total > 0 ? Number(((fpCount / total) * 100).toFixed(1)) : 0;

      setMetrics({
        totalPackets: total,
        activeAnomalies,
        isolatedHosts: isolated.size,
        falsePositiveCount: fpCount,
        falsePositiveRate: fpRate
      });
    },
    []
  );

  // Clock tick timer
  useEffect(() => {
    if (streamStatus !== 'PLAYING') return;

    let timerId: NodeJS.Timeout;

    const tick = () => {
      const newEvt = generateSyntheticEvent();
      totalEvaluatedRef.current += 1;

      // If target node is isolated, modify event status
      if (isolatedNodes.has(newEvt.targetNode)) {
        newEvt.signature = `[QUARANTINE ENFORCED] ${newEvt.signature}`;
      }

      setEvents(prev => {
        const updated = pushEventToRingBuffer(prev, newEvt, MAX_RING_BUFFER);
        recalculateMetrics(updated, isolatedNodes, falsePositives);
        return updated;
      });

      const intervalMs = Math.round(BASE_INTERVAL_MS / streamSpeed);
      timerId = setTimeout(tick, intervalMs);
    };

    const intervalMs = Math.round(BASE_INTERVAL_MS / streamSpeed);
    timerId = setTimeout(tick, intervalMs);

    return () => {
      clearTimeout(timerId);
    };
  }, [streamStatus, streamSpeed, isolatedNodes, falsePositives, recalculateMetrics]);

  // Controls
  const togglePause = useCallback(() => {
    setStreamStatus(prev => (prev === 'PLAYING' ? 'PAUSED' : 'PLAYING'));
  }, []);

  const setSpeed = useCallback((speed: StreamSpeed) => {
    setStreamSpeed(speed);
  }, []);

  const isolateNode = useCallback(
    (nodeId: NodeId) => {
      setIsolatedNodes(prev => {
        const next = new Set(prev);
        next.add(nodeId);
        recalculateMetrics(events, next, falsePositives);
        return next;
      });
    },
    [events, falsePositives, recalculateMetrics]
  );

  const unisolateNode = useCallback(
    (nodeId: NodeId) => {
      setIsolatedNodes(prev => {
        const next = new Set(prev);
        next.delete(nodeId);
        recalculateMetrics(events, next, falsePositives);
        return next;
      });
    },
    [events, falsePositives, recalculateMetrics]
  );

  const markFalsePositive = useCallback(
    (eventId: string) => {
      setFalsePositives(prev => {
        const next = new Set(prev);
        next.add(eventId);

        setEvents(currentEvents => {
          const updated = currentEvents.map(e => {
            if (e.id === eventId) {
              return {
                ...e,
                triaged: {
                  action: 'FALSE_POSITIVE' as const,
                  timestamp: new Date().toISOString(),
                  analystNote: 'Analyst override: marked as benign traffic baseline.'
                }
              };
            }
            return e;
          });
          recalculateMetrics(updated, isolatedNodes, next);
          return updated;
        });

        if (selectedEvent && selectedEvent.id === eventId) {
          setSelectedEvent(prev =>
            prev
              ? {
                  ...prev,
                  triaged: {
                    action: 'FALSE_POSITIVE',
                    timestamp: new Date().toISOString(),
                    analystNote: 'Analyst override: marked as benign traffic baseline.'
                  }
                }
              : null
          );
        }

        return next;
      });
    },
    [isolatedNodes, selectedEvent, recalculateMetrics]
  );

  // Live ML re-scoring using Phase 3 in-browser ONNX Runtime WASM model
  const rescoreEventWithMl = useCallback(
    async (eventId: string) => {
      const targetEvent = events.find(e => e.id === eventId);
      if (!targetEvent) return;

      try {
        const result = await runInference(targetEvent.netflow);

        const updatedScore = {
          anomalyScore: result.anomalyScore,
          confidence: result.confidence,
          status: result.status,
          latencyMs: result.latencyMs
        };

        setEvents(prev =>
          prev.map(e => (e.id === eventId ? { ...e, mlScore: updatedScore } : e))
        );

        if (selectedEvent && selectedEvent.id === eventId) {
          setSelectedEvent(prev => (prev ? { ...prev, mlScore: updatedScore } : null));
        }
      } catch (err) {
        console.warn('[useSocTelemetryStream] ML re-scoring fallback:', err);
      }
    },
    [events, selectedEvent]
  );

  const selectEvent = useCallback((event: SocTelemetryEvent | null) => {
    setSelectedEvent(event);
  }, []);

  const resetStream = useCallback(() => {
    totalEvaluatedRef.current = 3;
    const initial: SocTelemetryEvent[] = [];
    for (let i = 0; i < 3; i++) {
      initial.push(generateSyntheticEvent(i));
    }
    setEvents(initial);
    setIsolatedNodes(new Set());
    setFalsePositives(new Set());
    setSelectedEvent(null);
    setMetrics({
      totalPackets: 3,
      activeAnomalies: 2,
      isolatedHosts: 0,
      falsePositiveCount: 0,
      falsePositiveRate: 0
    });
  }, []);

  const latestEvent = events.length > 0 ? events[0] : null;

  return {
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
  };
}
