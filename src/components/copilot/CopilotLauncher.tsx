'use client';

import React from 'react';
import { Terminal } from 'lucide-react';

interface CopilotLauncherProps {
  className?: string;
}

export default function CopilotLauncher({ className = '' }: CopilotLauncherProps) {
  const handleClick = () => {
    window.dispatchEvent(new CustomEvent('toggle-copilot'));
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Open Neural Research Copilot Terminal (Hotkey: `)"
      data-testid="copilot-launcher-btn"
      className={`inline-flex items-center space-x-1.5 px-2 py-1 rounded font-mono text-[11px] border border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 hover:border-accent-cyan transition-colors select-none ${className}`}
    >
      <Terminal className="w-3.5 h-3.5" aria-hidden="true" />
      <span className="font-bold">AI COPILOT</span>
      <kbd className="hidden sm:inline-block px-1 py-0.2 text-[9px] bg-oled border border-border-subtle rounded text-ink-muted">
        `
      </kbd>
    </button>
  );
}
