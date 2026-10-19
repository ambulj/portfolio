# Phase 1: Next.js 15 Architecture & Content Pipeline — Technical Research Report

**Phase:** 01 — Next.js 15 Architecture & Content Pipeline  
**Target Domain:** `https://ambul.dev`  
**Host Target:** Cloudflare Pages (Edge Static Export + Pages Functions)  
**Status:** Complete  

---

## Executive Summary

Phase 1 establishes the core structural, stylistic, and content ingestion foundation for Ambul Jaiswal's next-generation cybersecurity & machine learning portfolio. The objective is to migrate from a legacy custom build script to a production-grade **Next.js 15 (React 19)** App Router architecture utilizing static export (`output: 'export'`), self-hosted IBM Plex typography, a **Cyber-Command HUD** aesthetic on pure OLED black (`#000000`), a responsive **Split Command Deck** layout, and a Zod-validated content pipeline that preserves 100% of the project's strict honesty invariants (data notes, metrics tables with measurement methodology, "What I'd change" retrospectives, and the RoadSaarthi independent prototype disclaimer).

---

## 1. Architecture & Stack

### 1.1 Next.js 15 + React 19 Setup for Static Export to Cloudflare Pages

Next.js 15 with React 19 offers native React Server Component (RSC) prerendering while supporting complete static generation via `output: 'export'` in `next.config.ts`.

#### Static Export Mechanics
When configured with `output: 'export'`, running `next build` emits a self-contained static site into the `out/` directory:
- Every App Router page is pre-rendered at build time to pure HTML, CSS, and client-side JavaScript hydration chunks.
- No Node.js runtime or server daemon is required in production.
- Cloudflare Pages natively deploys this `out/` folder at the global edge.

#### Edge Function Integration on Cloudflare Pages
- Dynamic capabilities (e.g. Turnstile-verified contact form delivery specified in DESIGN.md §8.1) do not require Node.js server runtimes. Cloudflare Pages automatically detects the top-level `/functions` directory in the repository (e.g., `functions/api/contact.js`).
- During Cloudflare Pages deployment, the static assets in `out/` and edge functions in `/functions` are bound together seamlessly at the Cloudflare edge.

#### `next.config.ts` Configuration
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'out',
  trailingSlash: false,
  images: {
    // Static HTML export cannot run server-side Next.js Image Optimization
    unoptimized: true,
  },
  // Strict React 19 concurrent mode verification
  reactStrictMode: true,
  // Enforce zero build warnings/errors escaping to production
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
```

### 1.2 Recommended Dependencies and Pinned Versions

To guarantee deterministic, reproducible builds without dependency drift or React 19 peer-dependency conflicts:

```json
{
  "dependencies": {
    "next": "15.2.1",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "zod": "3.24.2",
    "gray-matter": "4.0.3",
    "marked": "15.0.7",
    "lucide-react": "1.16.0",
    "clsx": "2.1.1",
    "tailwind-merge": "3.0.2"
  },
  "devDependencies": {
    "typescript": "5.7.3",
    "@types/node": "22.13.4",
    "@types/react": "19.0.10",
    "@types/react-dom": "19.0.4",
    "tailwindcss": "3.4.17",
    "postcss": "8.5.2",
    "autoprefixer": "10.4.20",
    "@tailwindcss/typography": "0.5.16",
    "playwright": "1.50.1",
    "@axe-core/playwright": "4.10.1"
  }
}
```

#### Selection Rationales:
- **`tailwindcss` v3.4.17 vs v4.0**: While Tailwind v4 is recently released, v3.4.17 provides fully tested stability with custom PostCSS pipelines, `@layer utilities`, arbitrary values for bespoke HUD borders, and clean CSS custom property bridging. It is recommended for the Phase 1 build.
- **`lucide-react` (v1.16.0+)**: Fully compatible with React 19, tree-shakeable SVG icons (Shield, Terminal, Cpu, Activity, Lock, Radar, Compass, ExternalLink, ArrowRight, AlertTriangle) to augment high-density HUD telemetry.
- **`zod` (v3.24.2)**: Lightweight, zero-dependency schema validation for markdown frontmatter and JSON content pipelines.
- **`marked` (v15.0.7)**: Configured with custom renderers and `html: false` to guarantee raw HTML injection is disabled.

### 1.3 React 19 and Next.js 15 Compatibility Notes for Cloudflare Pages

1. **Static Export Headers Limitation**: Next.js `headers()` in `next.config.ts` are ignored during `output: 'export'`. All security headers (CSP, HSTS, XFO, Permissions-Policy) must be statically emitted into `public/_headers` so Cloudflare Pages serves them directly at the edge.
2. **React 19 Ref Handling**: In React 19, `ref` is a standard prop (`function MyComponent({ ref, ...props })`) and `forwardRef` is deprecated. Custom HUD components should adopt direct `ref` passing.
3. **Hydration of Dynamic Timestamps**: The HUD status bar includes a UTC chronometer. To prevent hydration mismatch warnings between static HTML prerendering and client-side clock ticks, use `suppressHydrationWarning` on the time display element or initialize the live interval only after client mount (`useEffect`).

---

## 2. Styling & HUD Aesthetics

The design direction approved in `01-CONTEXT.md` is the **Cyber-Command HUD**: pure OLED black, high-contrast monospace telemetry, subtle scanlines and grid overlay, accented with cyan and amber status indicators.

### 2.1 Color Tokens & Palette Definition

The palette bridges DESIGN.md's strict contrast requirements with the Cyber-Command aesthetic:

| Token Name | Hex Value | Semantic Role in HUD |
|---|---|---|
| `--hud-bg` | `#000000` | Pure OLED black page & viewport background |
| `--hud-surface` | `#060908` | Semi-transparent panel background (`rgba(6,9,8,0.85)`) |
| `--hud-surface-elevated` | `#0b1210` | Interactive card & drawer surface |
| `--hud-border` | `#1a2624` | Structural 1px hairline rules and inactive borders |
| `--hud-border-active` | `#2f4541` | Focused / active panel boundaries |
| `--hud-ink` | `#e8ece9` | Primary phosphor readout & body text (high contrast) |
| `--hud-quiet` | `#728480` | Telemetry labels, metadata, secondary captions |
| `--hud-cyan` | `#00f0ff` | Telemetry ping, active network stream, SOC radar arcs |
| `--hud-amber` | `#ffb000` / `#f2c500` | Warning, survey mark, active selected node, highlights |
| `--hud-fault` | `#ff3344` | Security alerts, intrusion mode, tamper invalidation |

### 2.2 Tailwind CSS Configuration (`tailwind.config.ts`)

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        hud: {
          bg: '#000000',
          surface: 'rgba(6, 9, 8, 0.85)',
          surfaceElevated: '#0b1210',
          border: '#1a2624',
          borderActive: '#2f4541',
          ink: '#e8ece9',
          quiet: '#728480',
          cyan: '#00f0ff',
          amber: '#ffb000',
          survey: '#f2c500',
          fault: '#ff3344',
        },
      },
      fontFamily: {
        sans: ['var(--font-plex-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-plex-serif)', 'Georgia', 'serif'],
        mono: ['var(--font-plex-mono)', 'monospace'],
      },
      boxShadow: {
        'hud-cyan': '0 0 15px rgba(0, 240, 255, 0.15)',
        'hud-amber': '0 0 15px rgba(255, 176, 0, 0.15)',
        'hud-fault': '0 0 15px rgba(255, 51, 68, 0.25)',
      },
    },
  },
  plugins: [],
};

export default config;
```

### 2.3 CRT Scanline & Engineering Grid Implementation

Subtle HUD scanlines and grid patterns are implemented purely in CSS to avoid blocking GPU resources:

```css
/* Scanline overlay: hardware accelerated, low-opacity, pointer-events none */
.hud-scanlines {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 999;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent 2px,
    rgba(0, 240, 255, 0.012) 3px,
    rgba(0, 0, 0, 0.3) 4px
  );
  transform: translateZ(0);
}

/* Engineering tactical dot grid */
.hud-grid-bg {
  background-image: radial-gradient(rgba(47, 69, 65, 0.4) 1px, transparent 1px);
  background-size: 24px 24px;
}

/* Corner bracket HUD ornament for data panels */
.hud-corner-bracket {
  position: relative;
}
.hud-corner-bracket::before {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  width: 6px;
  height: 6px;
  border-top: 2px solid var(--hud-border-active);
  border-left: 2px solid var(--hud-border-active);
}
.hud-corner-bracket::after {
  content: '';
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 6px;
  height: 6px;
  border-bottom: 2px solid var(--hud-border-active);
  border-right: 2px solid var(--hud-border-active);
}
```

### 2.4 Self-Hosted IBM Plex Font Loading via `next/font/local`

DESIGN.md §3.2 strictly forbids external font requests (zero Google Fonts, zero CDNs). All fonts are committed locally as WOFF2 in `public/fonts/`.

In Next.js 15, `next/font/local` handles zero-layout-shift font optimization:

```typescript
// src/lib/fonts.ts
import localFont from 'next/font/local';

export const plexSansCondensed = localFont({
  src: [
    {
      path: '../../public/fonts/IBMPlexSansCondensed-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/IBMPlexSansCondensed-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
  ],
  variable: '--font-plex-sans',
  display: 'swap',
});

export const plexSerif = localFont({
  src: [
    {
      path: '../../public/fonts/IBMPlexSerif-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/IBMPlexSerif-Italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../../public/fonts/IBMPlexSerif-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
  ],
  variable: '--font-plex-serif',
  display: 'swap',
});

export const plexMono = localFont({
  src: [
    {
      path: '../../public/fonts/IBMPlexMono-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-plex-mono',
  display: 'swap',
});
```

---

## 3. Layout Structure: Split Command Deck

The architectural model requested by the user is the **Split Command Deck** (`app/layout.tsx` + components).

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ [TOP HUD STRIP: STATUS: ACTIVE · INTERNSHIP TARGET · UTC 15:42:01 · BOM-01 24ms]│
├──────────────────────────────────────┬──────────────────────────────────────────┤
│ PERSISTENT 3D CANVAS DECK            │ MODULAR GLASS DATA DECK                  │
│ (Desktop >= 1024px: 45% - 50% width) │ (Desktop >= 1024px: 50% - 55% width)     │
│                                      │                                          │
│ - WebGPU/R3F Threat Globe (Phase 2)  │ <main id="main-content">                 │
│ - Prepared canvas container          │ - Single <h1> per route                  │
│ - aria-hidden="true"                 │ - High-density telemetry cards           │
│ - Accessible index list companion    │ - Results & metrics tables               │
│ - Static SVG fallback on tier 0      │ - "What I'd change" retrospectives       │
│                                      │ - Architecture diagrams                  │
├──────────────────────────────────────┴──────────────────────────────────────────┤
│ [BOTTOM COMMAND DECK: NAV INDEX · CMD+K TERMINAL TRIGGER · SEC.TXT · FOOTER]    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Component Hierarchy

1. **`RootLayout` (`src/app/layout.tsx`)**:
   - Injects IBM Plex font variables onto `<html>`.
   - Embeds skip navigation link (`<a href="#main-content" className="sr-only focus:not-sr-only">Skip to telemetry</a>`).
   - Renders the `HudTopBar` status strip.
   - Houses the persistent `CanvasDeckContainer` (so route changes do not unmount canvas state).
   - Wraps route content in scrollable `ModularDataDeck`.
   - Renders `HudBottomNav` and scanline/grid toggles.
2. **`HudTopBar` (`src/components/layout/HudTopBar.tsx`)**:
   - Status badge: pulsing cyan LED for `open_to_internships` (from `content/status.json`).
   - UTC Chronometer: live updating clock with milliseconds or seconds in `font-mono`.
   - Edge Node: simulated edge connection (`"BOM-01 // CF-EDGE // 24MS"`).
   - HUD Controls: Reduce 3D toggle (`reduce3d`), Grid toggle, Scanlines toggle.
3. **`CanvasDeckContainer` (`src/components/scene/CanvasDeckContainer.tsx`)**:
   - Positioned fixed or sticky on the left side on desktop (`lg:w-[45vw]`).
   - Marked `aria-hidden="true"` to ensure screen readers navigate content cleanly.
   - For Phase 1: renders the static 2D vector graph SVG generated from `content/graph.json` (Tier 0 baseline).
   - Pre-configured with R3F canvas mounting hook for seamless Phase 2 integration.
4. **`ModularDataDeck` (`src/components/layout/ModularDataDeck.tsx`)**:
   - Scrollable container on desktop (`lg:w-[55vw] lg:ml-[45vw]`).
   - Applies tactical HUD corner brackets (`hud-corner-bracket`), border dividers, and glass background.
5. **Responsive Breakpoints**:
   - **Desktop (`>= 1024px`, `lg`)**: True split-screen command deck. Canvas on left, scrollable content on right.
   - **Tablet (`768px - 1023px`, `md`)**: Stacked command deck. Top canvas telemetry preview (300px height), content underneath.
   - **Mobile (`< 768px`, `sm`)**: Single-column stream. Canvas collapsed to compact hero diagram; full focus on reading and data verification.

---

## 4. Content Pipeline & Honesty Features

### 4.1 Schema Validation with Zod (`src/lib/content/schemas.ts`)

All content must be strictly validated at build time. The build will fail immediately with line-specific errors if any required field is missing or invalid.

```typescript
import { z } from 'zod';

// Metric entry schema
export const MetricSchema = z.object({
  measure: z.string().min(1),
  value: z.string().min(1),
  data: z.string().min(1),
  hardware: z.string().min(1),
  method: z.string().min(1),
  verified: z.boolean(),
});

// Project frontmatter schema
export const ProjectFrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  order: z.number().int().positive(),
  summary: z.string().min(1),
  status: z.enum(['prototype', 'live', 'archived']),
  data_note: z.string().min(1),
  repo_url: z.string().url().nullable(),
  repo_private: z.boolean(),
  demo_url: z.string().nullable(),
  demo_status: z.enum(['live', 'slow-start', 'down', 'none']),
  demo_note: z.string().nullable(),
  diagram_verified: z.boolean(),
  stack: z.record(z.string(), z.array(z.string())),
  metrics: z.array(MetricSchema),
  changes: z.array(z.string()),
  hardening_status: z.string().optional(),
  authorship_note: z.string().optional(),
});

export type ProjectFrontmatter = z.infer<typeof ProjectFrontmatterSchema>;

// Certification schema
export const CertSchema = z.object({
  title: z.string().min(1),
  issuer: z.string().min(1),
  date: z.string().min(1),
  url: z.string().url().optional().nullable(),
  credential_id: z.string().optional(),
  featured: z.boolean(),
  attach_to: z.string().optional(),
  verified: z.boolean(),
});

// Site facts schema
export const SiteSchema = z.object({
  name: z.string().min(1),
  short_name: z.string().min(1),
  tag: z.string().min(1),
  location: z.string().min(1),
  work_mode: z.string().min(1),
  email_parts: z.tuple([z.string(), z.string()]),
  calendar_url: z.string(),
  domain: z.string(),
  linkedin: z.string().url(),
  github: z.array(z.string().url()),
});

// Status schema
export const StatusSchema = z.object({
  open_to_internships: z.boolean(),
  available_from: z.string(),
});
```

### 4.2 Content Ingestion Layer (`src/lib/content/api.ts`)

A centralized server-side data layer provides synchronous, cached access during Next.js static prerendering:

```typescript
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { ProjectFrontmatterSchema, CertSchema, SiteSchema, StatusSchema } from './schemas';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export function getProjectBySlug(slug: string) {
  const filePath = path.join(CONTENT_DIR, 'projects', `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  const validatedFrontmatter = ProjectFrontmatterSchema.parse(data);

  return {
    frontmatter: validatedFrontmatter,
    content,
  };
}

export function getAllProjects() {
  const projectsDir = path.join(CONTENT_DIR, 'projects');
  const files = fs.readdirSync(projectsDir).filter((f) => f.endsWith('.md'));

  const projects = files
    .map((file) => {
      const slug = file.replace(/\.md$/, '');
      return getProjectBySlug(slug);
    })
    .filter(Boolean)
    .sort((a, b) => a!.frontmatter.order - b!.frontmatter.order);

  return projects;
}

export function getSiteConfig() {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, 'site.json'), 'utf-8');
  return SiteSchema.parse(JSON.parse(raw));
}

export function getStatusConfig() {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, 'status.json'), 'utf-8');
  return StatusSchema.parse(JSON.parse(raw));
}

export function getCertifications() {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, 'certs.json'), 'utf-8');
  return z.array(CertSchema).parse(JSON.parse(raw));
}
```

### 4.3 Rendering Markdown with Raw HTML Disabled

To eliminate XSS risks and comply with DESIGN.md §6 and strict CSP rules:
1. `marked` is invoked with `html: false` (or a sanitizing tokenizer) so raw HTML embedded in markdown cannot render as live DOM elements.
2. Code blocks are formatted with pure CSS classes, preserving monospace typography without requiring external script injections.
3. Headings automatically generate kebab-case `id` anchors for direct deep-linking.

### 4.4 Preservation of Honesty Invariants

The design rules from DESIGN.md §1 & §7 must be strictly encoded into the Next.js components:

1. **Prominent Data Note**: Every project page features a dedicated data provenance callout directly beneath the title:
   ```tsx
   <div className="border-l-2 border-hud-amber bg-hud-surface p-4 font-mono text-sm text-hud-ink">
     <span className="text-hud-amber font-semibold">DATA NOTE //</span> {project.data_note}
   </div>
   ```
2. **Metrics Methodology Table**: Metrics are never displayed as simple unverified numbers. Each number is backed by the required 5-column audit table:
   - *Measure*
   - *Value*
   - *Data*
   - *Hardware*
   - *Method*
   - Verified badge (`[VERIFIED]` in cyan, or `[LAB TARGET / UNCONFIRMED]` in amber).
3. **"What I'd change" Retrospective Feature**: Rendered as a first-person design review:
   - Font: IBM Plex Serif italic at body size.
   - Left rule: 2px solid `--hud-border-active`.
   - Explicitly framed as an intentional senior engineering reflection, not an apology.
4. **RoadSaarthi Independent Prototype Disclaimer**:
   - The RoadSaarthi page must render the mandatory statement:
     > *"An independent prototype. It is not an official product of any government body, and its data is synthetic."*
5. **Private Repository Transparency**:
   - For Inferyx, source is private. Instead of broken GitHub links, the UI renders: `"Source is private. Walkthrough on request."`
6. **Token Verification Pre-Build Gate**:
   - A dedicated verification script (`scripts/check-placeholders.mjs`) scans all content files. If running `npm run build:prod` and any `[[PLACEHOLDER:` or `[[VERIFY:` token remains, the build aborts immediately.

---

## 5. Static Assets & Security

### 5.1 Cloudflare Edge Headers (`public/_headers`)

Cloudflare Pages reads the `_headers` file directly from the deployment root (`out/_headers`). The configuration adheres to DESIGN.md §8.2 with Next.js static asset tuning:

```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' https://challenges.cloudflare.com https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://api.github.com https://cloudflareinsights.com; frame-src https://challenges.cloudflare.com; object-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Resource-Policy: same-origin

/_next/static/*
  Cache-Control: public, max-age=31536000, immutable

/fonts/*
  Cache-Control: public, max-age=31536000, immutable

/*.html
  Cache-Control: public, max-age=0, must-revalidate
```

> **Note on `style-src 'unsafe-inline'`**: Next.js App Router and React inject style tags for font definitions (`next/font/local` CSS variables) and inline hydration state. While scripts remain strictly `'self'`, style attributes require `'unsafe-inline'` or a hash policy. Third-party font CDNs remain completely blocked (`font-src 'self'`).

### 5.2 Next.js App Router Static Sitemap & Robots

Next.js App Router supports statically exported metadata routes:

1. **`src/app/sitemap.ts`**:
   Prerenders `sitemap.xml` listing `/`, `/work`, all 5 case studies, `/about`, `/certifications`, `/resume`, `/contact`, `/security`, and `/colophon`.
2. **`src/app/robots.ts`**:
   Emits `robots.txt` referencing `https://ambul.dev/sitemap.xml`.
3. **`public/.well-known/security.txt`**:
   Static security vulnerability disclosure file specifying contact email/form and expiration date.

### 5.3 Plaintext Email Obfuscation Guarantee

To prevent scraper harvesting:
- `content/site.json` stores email as two separate parts: `["ambuljaiswal5", "gmail.com"]`.
- The full string `ambuljaiswal5@gmail.com` **must never exist in any compiled static HTML file in `out/`**.
- The UI exposes a "Show email" interactive trigger button that combines the strings in client memory on user interaction, or routes directly to the `/contact` form.
- An automated test in the build pipeline checks `grep -r "ambuljaiswal5@gmail.com" out/` and fails if any match is detected.

---

## 6. Validation Architecture (Nyquist Framework)

To fulfill the rigorous engineering standards set in the project roadmap and DESIGN.md Gate 1, the following automated validation matrix is established:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PHASE 1 NYQUIST GATES                           │
├────────────────────┬───────────────────────────────────────────────────┤
│ Verification Level │ Concrete Command & Criteria                       │
├────────────────────┼───────────────────────────────────────────────────┤
│ 1. Schema Check    │ npm run check:content                             │
│                    │ -> Zod parses all markdown frontmatter & JSON     │
├────────────────────┼───────────────────────────────────────────────────┤
│ 2. Honesty Gate    │ npm run check:placeholders                        │
│                    │ -> Scans for [[PLACEHOLDER]] & [[VERIFY]] tokens │
├────────────────────┼───────────────────────────────────────────────────┤
│ 3. Type & Lint     │ npm run lint && tsc --noEmit                      │
│                    │ -> 0 TypeScript errors, 0 ESLint warnings         │
├────────────────────┼───────────────────────────────────────────────────┤
│ 4. Static Export   │ npm run build                                     │
│                    │ -> Next.js 15 emits static HTML to out/           │
├────────────────────┼───────────────────────────────────────────────────┤
│ 5. Leak Check      │ npm run check:email-leak                          │
│                    │ -> Asserts 0 occurrences of raw email in out/     │
├────────────────────┼───────────────────────────────────────────────────┤
│ 6. Route & A11y    │ npx playwright test tests/gate1.spec.ts           │
│                    │ -> All 10 routes return 200                       │
│                    │ -> Exactly 1 <h1> per route                       │
│                    │ -> 0 console errors & 0 broken links              │
│                    │ -> 0 CSP violations (securitypolicyviolation)     │
│                    │ -> axe-core: 0 critical/serious a11y violations   │
└────────────────────┴───────────────────────────────────────────────────┘
```

### 6.1 Concrete Test Commands

Add these automated scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "build:dev": "node scripts/check-placeholders.mjs --warn && next build",
    "build:prod": "node scripts/check-placeholders.mjs --strict && next build && npm run check:email-leak",
    "check:content": "node scripts/validate-content.mjs",
    "check:placeholders": "node scripts/check-placeholders.mjs",
    "check:email-leak": "node scripts/check-email-leak.mjs",
    "check:contrast": "node scripts/check-contrast.mjs",
    "test:gate1": "playwright test tests/gate1.spec.ts"
  }
}
```

### 6.2 Route Coverage Checklist for Phase 1

Every one of the following routes must prerender as a standalone static HTML file in `out/`:
- [x] `/` (Home: Split Command Deck, constellation baseline, opening line)
- [x] `/work` (Work index: Inferyx, AegisZ, OrgMind, Threat Detection, RoadSaarthi)
- [x] `/work/inferyx` (Case study with architecture diagram & signed model note)
- [x] `/work/aegisz` (Case study with zero-knowledge gateway & audit ledger)
- [x] `/work/orgmind` (Case study with knowledge graph agent & citation verification)
- [x] `/work/threat-detection` (Case study with Isolation Forest flow scoring)
- [x] `/work/roadsaarthi` (Case study with independent prototype disclaimer)
- [x] `/lab` (phenom experiment showcase)
- [x] `/about` (Bio, how I work, chronological timeline, verified skills)
- [x] `/certifications` (4 featured + 6 listed verified credentials)
- [x] `/resume` (Summary + embedded PDF viewer + download link)
- [x] `/contact` (Turnstile-ready contact form + email reveal button)
- [x] `/security` (Static header verification table + CSP explanation)
- [x] `/colophon` (Technical build notes, fonts, design system explanation)
- [x] `/404` (Tactical left-aligned missing route screen with navigation index)

---

## 7. Next Steps for Implementation Planning

1. **Step 1: Next.js 15 Foundation**:
   - Initialize `package.json` with Next.js 15, React 19, Tailwind CSS, TypeScript, and local IBM Plex font files.
   - Set up `next.config.ts`, `tailwind.config.ts`, `postcss.config.js`, and `tsconfig.json`.
2. **Step 2: Content Validation & Ingestion Engine**:
   - Implement `src/lib/content/schemas.ts` and `src/lib/content/api.ts`.
   - Create build scripts for placeholder scanning and email leak detection.
3. **Step 3: Cyber-Command HUD Layout & Components**:
   - Build `HudTopBar`, `CanvasDeckContainer` (static SVG fallback), `ModularDataDeck`, and `HudBottomNav`.
   - Configure global scanline and engineering dot-grid overlays.
4. **Step 4: Route Prerendering**:
   - Prerender all 15 routes with strict typography, metrics tables, and honesty callouts.
5. **Step 5: Edge Hardening & Gate 1 Verification**:
   - Generate `public/_headers`, `app/sitemap.ts`, `app/robots.ts`, `public/.well-known/security.txt`.
   - Run full Playwright and axe-core validation suite to verify Gate 1 compliance.

---
## RESEARCH COMPLETE
