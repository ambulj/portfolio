'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ShieldAlert, Volume2, VolumeX, X } from 'lucide-react';

const KONAMI_SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a'
];

export default function KonamiIntrusionOverlay() {
  const [isActive, setIsActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const keyBuffer = useRef<string[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  // Key sequence detector
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in form inputs
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const key = e.key;
      keyBuffer.current.push(key);

      // Keep buffer length bounded to sequence length
      if (keyBuffer.current.length > KONAMI_SEQUENCE.length) {
        keyBuffer.current.shift();
      }

      // Check match
      const isMatch = KONAMI_SEQUENCE.every(
        (val, idx) => val.toLowerCase() === (keyBuffer.current[idx] || '').toLowerCase()
      );

      if (isMatch) {
        setIsActive(true);
        keyBuffer.current = [];
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Web Audio Synth for Intrusion Siren
  useEffect(() => {
    if (!isActive || !soundEnabled) {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
        } catch {
          // ignore already stopped
        }
        oscillatorRef.current = null;
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }

      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      // Siren frequency modulation
      const now = ctx.currentTime;
      osc.frequency.linearRampToValueAtTime(880, now + 0.3);
      osc.frequency.linearRampToValueAtTime(440, now + 0.6);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      oscillatorRef.current = osc;

      // Pulse siren loop
      const interval = setInterval(() => {
        if (!oscillatorRef.current || ctx.state === 'closed') return;
        const cur = ctx.currentTime;
        osc.frequency.setValueAtTime(440, cur);
        osc.frequency.linearRampToValueAtTime(880, cur + 0.3);
        osc.frequency.linearRampToValueAtTime(440, cur + 0.6);
      }, 600);

      return () => {
        clearInterval(interval);
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // ignore
        }
      };
    } catch {
      // AudioContext not allowed without user gesture or unsupported
    }
  }, [isActive, soundEnabled]);

  if (!isActive) return null;

  return (
    <div 
      role="alertdialog"
      aria-modal="true"
      aria-label="Cyber Intrusion Simulation Alert"
      data-testid="konami-overlay"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-red-950/90 backdrop-blur-lg border-4 border-accent-red animate-in fade-in select-none"
    >
      {/* Scanlines / strobe backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,51,102,0.15)_0,rgba(0,0,0,0.8)_100%)] pointer-events-none" />

      {/* Cyber Grid / Alarm Header */}
      <div className="relative z-10 max-w-xl w-full bg-black/90 border border-accent-red/80 p-6 rounded shadow-2xl text-center space-y-4 font-mono">
        <div className="flex items-center justify-between pb-3 border-b border-accent-red/40 text-accent-red text-xs">
          <div className="flex items-center space-x-2 animate-pulse">
            <ShieldAlert className="w-5 h-5 text-accent-red" />
            <span className="font-bold tracking-widest">DEFCON-1 // INTRUSION DETECTED</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              aria-label={soundEnabled ? 'Mute alert sound' : 'Unmute alert sound'}
              className="p-1 hover:text-white transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-ink-muted" />}
            </button>
            <button
              onClick={() => setIsActive(false)}
              aria-label="Dismiss intrusion overlay"
              className="p-1 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2 py-2">
          <h2 className="text-xl font-extrabold tracking-wider text-accent-red">
            UNAUTHORIZED ROOT VECTOR ACCESS
          </h2>
          <p className="text-xs text-ink-secondary leading-relaxed">
            Konami sequence recognized. Adversarial intrusion simulator triggered. All neural telemetry streams elevated to red-alert quarantine.
          </p>
        </div>

        {/* Telemetry Matrix Mock */}
        <div className="p-3 bg-red-950/40 border border-accent-red/30 rounded text-left text-[11px] space-y-1 text-ink-primary font-mono">
          <div><span className="text-accent-red font-bold">&gt; ORIGIN:</span> 192.168.1.137 [INTERNAL_BYPASS]</div>
          <div><span className="text-accent-red font-bold">&gt; VECTOR:</span> Up-Up-Down-Down-Left-Right-Left-Right-B-A</div>
          <div><span className="text-accent-red font-bold">&gt; CIPHER STATUS:</span> Post-Quantum Dilithium Intercept Active</div>
          <div><span className="text-accent-red font-bold">&gt; ANOMALY SCORE:</span> 0.9994 [CRITICAL]</div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center space-x-3 pt-3">
          <button
            onClick={() => setIsActive(false)}
            data-testid="dismiss-konami-btn"
            className="px-5 py-2 bg-accent-red text-black font-bold text-xs rounded hover:bg-accent-red/90 transition-colors uppercase tracking-wider shadow-lg"
          >
            Acknowledge & Neutralize
          </button>
        </div>
      </div>
    </div>
  );
}
