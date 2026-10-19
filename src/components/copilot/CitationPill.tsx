'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

interface CitationPillProps {
  refTarget: string;
  className?: string;
}

export default function CitationPill({ refTarget, className = '' }: CitationPillProps) {
  // Parse target: formats can be "inferyx#benchmarks", "/work/inferyx#architecture", "certs#security", etc.
  let path = refTarget.trim();
  let label = path;

  // Normalize path if leading slash is missing
  if (!path.startsWith('/') && !path.startsWith('http')) {
    if (path.includes('#')) {
      const [base, anchor] = path.split('#');
      if (base === 'about' || base === 'resume' || base === 'certifications' || base === 'lab' || base === 'security') {
        path = `/${base}#${anchor}`;
      } else {
        path = `/work/${base}#${anchor}`;
      }
    } else {
      if (path === 'about' || path === 'resume' || path === 'certifications' || path === 'lab' || path === 'security') {
        path = `/${path}`;
      } else {
        path = `/work/${path}`;
      }
    }
  }

  return (
    <Link
      href={path}
      data-testid="citation-pill"
      className={`inline-flex items-center space-x-1 px-1.5 py-0.5 my-0.5 rounded text-[10px] font-mono border border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 hover:border-accent-cyan transition-colors align-baseline ${className}`}
      title={`Verified Source: ${refTarget}`}
    >
      <span className="font-bold">REF:</span>
      <span className="truncate max-w-[120px]">{label}</span>
      <ExternalLink className="w-2.5 h-2.5 opacity-70" aria-hidden="true" />
    </Link>
  );
}
