'use client';

import React, { useState } from 'react';
import { Mail, Check, Copy } from 'lucide-react';

interface EmailRevealButtonProps {
  emailParts: [string, string];
}

export default function EmailRevealButton({ emailParts }: EmailRevealButtonProps) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleReveal = () => {
    setRevealed(true);
  };

  const emailAddress = revealed ? `${emailParts[0]}@${emailParts[1]}` : '';

  const handleCopy = async () => {
    if (!revealed) return;
    try {
      await navigator.clipboard.writeText(emailAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback
    }
  };

  return (
    <div className="inline-flex items-center space-x-2 font-mono text-xs">
      {!revealed ? (
        <button
          type="button"
          onClick={handleReveal}
          className="inline-flex items-center space-x-2 px-3.5 py-2 bg-deck border border-border-subtle rounded hover:border-accent-cyan text-ink-primary hover:text-accent-cyan transition-colors"
        >
          <Mail className="w-3.5 h-3.5 text-accent-cyan" aria-hidden="true" />
          <span>REVEAL EMAIL ADDRESS</span>
        </button>
      ) : (
        <div className="flex items-center space-x-2 p-1.5 bg-deck border border-accent-cyan/40 rounded">
          <a
            href={`mailto:${emailAddress}`}
            className="text-accent-cyan hover:underline font-semibold px-2 py-0.5"
          >
            {emailAddress}
          </a>
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 text-ink-secondary hover:text-ink-primary rounded bg-black/40 hover:bg-black/60 transition-colors"
            title="Copy email to clipboard"
            aria-label="Copy email"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-accent-cyan" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
