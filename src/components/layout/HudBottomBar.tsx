import React from 'react';
import Link from 'next/link';
import { Activity, Lock, FileText, Code2 } from 'lucide-react';
import CopilotLauncher from '@/components/copilot/CopilotLauncher';

export default function HudBottomBar() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 h-9 bg-oled/95 backdrop-blur-md border-t border-border-subtle z-50 flex items-center justify-between px-4 font-mono text-[11px] text-ink-secondary select-none">
      {/* Telemetry Status */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 text-accent-cyan">
          <Activity className="w-3 h-3 text-accent-cyan" aria-hidden="true" />
          <span className="font-semibold tracking-wider">SYS: NOMINAL</span>
        </div>

        <div className="h-3 w-px bg-border-subtle hidden sm:block" />

        <CopilotLauncher />

        <div className="h-3 w-px bg-border-subtle hidden sm:block" />

        <span className="hidden sm:inline text-ink-secondary">
          HOST: ambul.dev
        </span>
      </div>

      {/* Quick Access Utility Links */}
      <div className="flex items-center space-x-4">
        <Link 
          href="/resume" 
          className="flex items-center space-x-1 hover:text-ink-primary transition-colors"
        >
          <FileText className="w-3 h-3" aria-hidden="true" />
          <span>RESUME</span>
        </Link>

        <a 
          href="/.well-known/security.txt" 
          className="hidden sm:flex items-center space-x-1 hover:text-ink-primary transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Lock className="w-3 h-3 text-accent-amber" aria-hidden="true" />
          <span>SECURITY.TXT</span>
        </a>

        <Link 
          href="/colophon" 
          className="flex items-center space-x-1 hover:text-ink-primary transition-colors"
        >
          <Code2 className="w-3 h-3" aria-hidden="true" />
          <span>COLOPHON</span>
        </Link>
      </div>
    </footer>
  );
}
