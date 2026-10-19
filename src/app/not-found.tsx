import React from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, Home, Cpu, User, Award, Mail } from 'lucide-react';

export const metadata = {
  title: '404 // Route Not Located',
  description: 'The requested route does not exist in this sector.',
};

export default function NotFound() {
  const routes = [
    { href: '/', label: 'HOME // RADAR', icon: Home },
    { href: '/work', label: 'WORK // CASE STUDIES', icon: Cpu },
    { href: '/about', label: 'ABOUT // TIMELINE', icon: User },
    { href: '/certifications', label: 'CERTS // BADGES', icon: Award },
    { href: '/contact', label: 'CONTACT // DISPATCH', icon: Mail },
  ];

  return (
    <article className="space-y-8">
      {/* 404 Status Header */}
      <header className="space-y-3 border-b border-border-subtle pb-6">
        <div className="inline-flex items-center space-x-2 text-xs font-mono text-accent-alert bg-accent-alert/10 px-2.5 py-1 rounded border border-accent-alert/30">
          <AlertCircle className="w-3.5 h-3.5 text-accent-alert" aria-hidden="true" />
          <span>FAULT: HTTP 404 NOT FOUND</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-semibold text-ink-primary font-sans">
          Route Not Located in Sector
        </h1>

        <p className="text-sm font-serif text-ink-secondary max-w-xl leading-relaxed">
          The requested path does not match any compiled route on `ambul.dev`. Check the route index below to return to known coordinates.
        </p>
      </header>

      {/* Navigation Index */}
      <section className="space-y-4 font-mono text-xs">
        <h2 className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">
          Valid Sector Coordinates
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {routes.map((r) => {
            const Icon = r.icon;
            return (
              <Link
                key={r.href}
                href={r.href}
                className="p-3.5 bg-deck border border-border-subtle rounded hover:border-accent-cyan text-ink-primary hover:text-accent-cyan flex items-center space-x-3 transition-colors"
              >
                <Icon className="w-4 h-4 text-accent-cyan" aria-hidden="true" />
                <span>{r.label}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </article>
  );
}
