'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Terminal, Radio, Eye, Layers } from 'lucide-react';
import {
  getReduce3DPreference,
  setReduce3DPreference,
  subscribeToReduce3D,
} from '@/scene/negotiator';

export default function HudTopBar() {
  const pathname = usePathname();
  const [utcTime, setUtcTime] = useState<string>('00:00:00 UTC');
  const [mounted, setMounted] = useState<boolean>(false);
  const [reduce3d, setReduce3d] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    setReduce3d(getReduce3DPreference());

    const unsubscribe = subscribeToReduce3D((enabled) => {
      setReduce3d(enabled);
    });

    const updateTime = () => {
      const now = new Date();
      setUtcTime(
        now.toISOString().substring(11, 19) + ' UTC'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  const navItems = [
    { href: '/', label: 'HOME' },
    { href: '/work', label: 'WORK' },
    { href: '/about', label: 'ABOUT' },
    { href: '/certifications', label: 'CERTS' },
    { href: '/lab', label: 'LAB' },
    { href: '/contact', label: 'CONTACT' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-11 bg-oled/95 backdrop-blur-md border-b border-border-subtle z-50 flex items-center justify-between px-4 font-mono text-xs select-none">
      {/* Brand Identity & Status */}
      <div className="flex items-center space-x-3">
        <Link 
          href="/" 
          className="flex items-center space-x-2 text-ink-primary hover:text-accent-cyan transition-colors"
          aria-label="Ambul Jaiswal Home"
        >
          <Shield className="w-3.5 h-3.5 text-accent-cyan" aria-hidden="true" />
          <span className="font-semibold tracking-wider">AMBUL JAISWAL</span>
          <span className="text-ink-secondary hidden sm:inline">// SEC-ML</span>
        </Link>

        <div className="h-3 w-px bg-border-subtle hidden md:block" />

        {/* Live Status Indicator */}
        <div className="hidden lg:flex items-center space-x-2 text-[10px] text-accent-cyan bg-accent-cyan/5 px-2 py-0.5 rounded border border-accent-cyan/20">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
          <span className="tracking-wide">OPEN TO INTERNSHIPS</span>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav aria-label="Main Navigation" className="hidden md:flex items-center space-x-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                isActive
                  ? 'text-accent-cyan bg-accent-cyan/10 font-medium'
                  : 'text-ink-secondary hover:text-ink-primary hover:bg-white/5'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Telemetry & Controls */}
      <div className="flex items-center space-x-3">
        {/* UTC Chronometer */}
        <div 
          className="hidden sm:flex items-center space-x-1.5 text-ink-secondary text-[11px]"
          suppressHydrationWarning
        >
          <Radio className="w-3 h-3 text-accent-cyan" aria-hidden="true" />
          <span>{mounted ? utcTime : '00:00:00 UTC'}</span>
        </div>

        {/* Reduce 3D Toggle */}
        <button
          type="button"
          onClick={() => setReduce3DPreference(!reduce3d)}
          aria-pressed={reduce3d}
          title={reduce3d ? '3D graphics reduced to 2D vector' : 'Full 3D WebGPU graphics active'}
          className={`flex items-center space-x-1 px-2 py-0.5 rounded border text-[11px] transition-colors ${
            reduce3d
              ? 'border-accent-amber/50 bg-accent-amber/10 text-accent-amber'
              : 'border-border-subtle hover:border-accent-cyan text-ink-secondary hover:text-ink-primary'
          }`}
        >
          <Layers className="w-3 h-3" aria-hidden="true" />
          <span className="hidden md:inline">{reduce3d ? '3D: OFF' : '3D: ON'}</span>
        </button>

        {/* Tactical Terminal Launcher */}
        <Link
          href="/security"
          className="flex items-center space-x-1 px-2 py-0.5 rounded border border-border-subtle hover:border-accent-cyan text-ink-secondary hover:text-accent-cyan text-[11px] transition-colors"
          title="Security posture & headers"
        >
          <Terminal className="w-3 h-3" aria-hidden="true" />
          <span className="hidden sm:inline">SECURITY</span>
        </Link>
      </div>
    </header>
  );
}
