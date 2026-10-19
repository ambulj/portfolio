---
phase: "01"
phase_slug: "next-js-15-architecture-content-pipeline"
status: "planned"
date: "2026-10-19"
author: "gsd-planner"
requirements:
  - ARCH-01
  - ARCH-02
  - ARCH-03
  - ARCH-04
  - CONTENT-01
  - CONTENT-02
  - CONTENT-03
---

# Phase 1: Next.js 15 Architecture & Content Pipeline — Execution Plan

<phase_header>
Phase: 01 — Next.js 15 Architecture & Content Pipeline
Goal: Rebuild the static foundation into Next.js 15 (React 19) App Router with TypeScript, Tailwind CSS, Cyber-Command HUD theme, Split Command Deck layout shell, Zod-validated content pipeline, and static Cloudflare Pages export.
Outputs:
  - Next.js 15 + React 19 + TypeScript + Tailwind CSS production codebase.
  - Split Command Deck dual-pane layout shell with persistent 3D canvas viewport container, HUD Top Bar, and HUD Bottom Telemetry Bar.
  - Self-hosted IBM Plex local fonts with zero external CDN dependencies.
  - Zod content validation engine and markdown renderer with raw HTML disabled.
  - 15 fully prerendered static routes (`/`, `/work`, 5 case studies, `/lab`, `/about`, `/certifications`, `/resume`, `/contact`, `/security`, `/colophon`, `/404`).
  - SVG technical architecture diagrams with data part highlight linkages.
  - Edge hardening artifacts: `public/_headers`, `src/app/sitemap.ts`, `src/app/robots.ts`, `public/.well-known/security.txt`.
  - Automated Gate 1 verification suite (Zod validation, token scanning, email leak test, Playwright E2E + axe-core).
</phase_header>

---

## Architecture & Layout Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ HUD TOP BAR (Fixed 44px): [ AMBUL JAISWAL // SEC-ML ]  [UTC CLOCK]  [GRID/SCAN] │
├──────────────────────────────────────┬──────────────────────────────────────────┤
│ PERSISTENT 3D CANVAS DECK            │ MODULAR DATA DECK                        │
│ (Desktop >= 1024px: 45vw fixed)      │ (Desktop >= 1024px: 55vw scrollable)     │
│                                      │                                          │
│ - Prepared R3F / Canvas container    │ <main id="main-content">                 │
│ - aria-hidden="true"                 │ - Single <h1> per route                  │
│ - Tier 0 static SVG fallback         │ - High-density telemetry cards           │
│ - Responsive collapse on mobile      │ - 5-column metrics methodology tables    │
│                                      │ - "What I'd change" retrospectives       │
│                                      │ - Raw HTML disabled Markdown             │
├──────────────────────────────────────┴──────────────────────────────────────────┤
│ HUD BOTTOM TELEMETRY BAR (Fixed 36px): [SYS: NOMINAL] [SEC.TXT] [EMAIL REVEAL]  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Tasks

### <task 1: Tracer - Next.js 15 Setup, Cyber-Command HUD Shell & IBM Plex Local Fonts>
- **Type**: tracer
- **Files to create/modify**:
  - `package.json` (update dependencies to Next.js 15, React 19, TypeScript, Tailwind CSS, Lucide React, Zod, Gray-Matter, Marked)
  - `tsconfig.json` (configure path aliases `@/*` to `./src/*`, strict mode, React 19 JSX)
  - `next.config.ts` (configure `output: 'export'`, `distDir: 'out'`, `images: { unoptimized: true }`, strict mode)
  - `postcss.config.mjs` (configure Tailwind CSS and Autoprefixer)
  - `tailwind.config.ts` (configure Cyber-Command HUD tokens: OLED `#000000`, deck `#06090c`, cyan `#00f0ff`, amber `#f2c500`, fault `#ff3344`, IBM Plex font families)
  - `src/lib/fonts.ts` (configure `next/font/local` for IBM Plex Sans Condensed, IBM Plex Serif, IBM Plex Mono from `public/fonts/`)
  - `src/app/globals.css` (define HUD scanlines, engineering tactical dot grid, corner brackets, reduced-motion overrides, focus rings)
  - `src/components/layout/HudTopBar.tsx` (status badge with pulsing cyan indicator, UTC live chronometer with hydration-safe mount, edge node badge, grid/scanline toggles)
  - `src/components/layout/HudBottomBar.tsx` (system health status, security.txt link, colophon link, terminal trigger placeholder)
  - `src/components/scene/CanvasDeckContainer.tsx` (persistent 45vw canvas shell with `aria-hidden="true"`, Tier 0 SVG technical constellation baseline, prepared R3F mount point)
  - `src/components/layout/ModularDataDeck.tsx` (55vw scrollable container, corner brackets, skip-link anchor `#main-content`)
  - `src/app/layout.tsx` (root HTML shell with IBM Plex font variables, skip link, HUD bars, Split Command Deck structure)
  - `src/app/page.tsx` (home route featuring opening hero line, internship target banner, quick navigation telemetry, status feeds)
- **Action Steps**:
  1. Upgrade `package.json` with pinned versions (`next@15.2.1`, `react@19.0.0`, `react-dom@19.0.0`, `tailwindcss@3.4.17`, `zod@3.24.2`, `gray-matter@4.0.3`, `marked@15.0.7`, `lucide-react@1.16.0`, `playwright@1.50.1`, `@axe-core/playwright@4.10.1`).
  2. Implement `next.config.ts` ensuring clean static export to `out/` with unoptimized images for edge deployment.
  3. Set up `tailwind.config.ts` and `src/app/globals.css` encoding the Cyber-Command HUD theme tokens (`#000000` OLED background, `#06090c` glass deck, `#00f0ff` telemetry cyan, `#f2c500` survey amber, `#161e24` hairline rules).
  4. Implement `src/lib/fonts.ts` connecting local WOFF2 files in `public/fonts/` with `display: swap` and CSS variables `--font-plex-sans`, `--font-plex-serif`, `--font-plex-mono`.
  5. Build `src/components/layout/HudTopBar.tsx` using `useEffect` for the UTC clock to guarantee zero SSR hydration mismatch warnings (T-01-04 mitigation).
  6. Build `src/components/scene/CanvasDeckContainer.tsx` rendering the static 2D vector graph SVG generated from `content/graph.json` as the resilient Tier 0 baseline with `aria-hidden="true"`.
  7. Construct `src/app/layout.tsx` and `src/app/page.tsx`, verifying the skip link `.sr-only focus:not-sr-only` targets `<main id="main-content">`.
- **Verification Commands**:
  - `npm run dev` boots Next.js without errors.
  - `npm run build` succeeds and produces static HTML in `out/`.
  - Check `out/index.html` contains exactly one `<h1>`, `<a href="#main-content">`, and zero hydration errors.
</task>

---

### <task 2: Content Pipeline & Schema Validation Engine with Zod>
- **Type**: expansion
- **Files to create/modify**:
  - `src/lib/content/schemas.ts` (Zod schemas for Projects, Metrics, Certifications, Site Config, Status, Timeline, Lines)
  - `src/lib/content/markdown.ts` (custom `marked` renderer with `html: false` to eliminate unsafe raw HTML injection, custom link and table renderers)
  - `src/lib/content/api.ts` (synchronous, typed file-system queries for all content under `content/` with caching)
  - `scripts/validate-content.mjs` (CLI script running Zod schema validation across all markdown frontmatter and JSON files)
  - `scripts/check-placeholders.mjs` (CLI script scanning for `[[PLACEHOLDER:` and `[[VERIFY:` tokens; aborts on `--strict`)
- **Action Steps**:
  1. Define exhaustive Zod schemas in `src/lib/content/schemas.ts`:
     - `MetricSchema`: `measure`, `value`, `data`, `hardware`, `method`, `verified` (boolean).
     - `ProjectFrontmatterSchema`: `title`, `slug`, `order`, `summary`, `status`, `data_note`, `repo_url`, `repo_private`, `demo_url`, `demo_status`, `demo_note`, `diagram_verified`, `stack`, `metrics`, `changes`, `hardening_status`, `authorship_note`.
     - `CertSchema`: `title`, `issuer`, `date`, `url`, `credential_id`, `featured`, `attach_to`, `verified`.
     - `SiteSchema`: `name`, `short_name`, `tag`, `location`, `work_mode`, `email_parts` (tuple `[user, domain]`), `calendar_url`, `domain`, `linkedin`, `github`.
     - `StatusSchema`: `open_to_internships`, `available_from`.
  2. Implement `src/lib/content/markdown.ts` wrapping `marked.parse`:
     - Enforce `html: false` (or sanitize tokens) to mitigate T-01-02 (unsafe HTML injection).
     - Add table renderer applying HUD monospace styling and 1px hairline rules.
  3. Implement `src/lib/content/api.ts` with helper functions:
     - `getAllProjects()`, `getProjectBySlug(slug)`, `getSiteConfig()`, `getStatusConfig()`, `getCertifications()`, `getTimeline()`, `getLines()`.
  4. Write `scripts/validate-content.mjs` and `scripts/check-placeholders.mjs` to execute pre-build checks.
- **Verification Commands**:
  - `node scripts/validate-content.mjs` reports 0 schema validation errors.
  - `node scripts/check-placeholders.mjs --warn` scans all markdown/JSON files and reports status.
</task>

---

### <task 3: Case Studies & Project Architecture Pages>
- **Type**: expansion
- **Files to create/modify**:
  - `src/app/work/page.tsx` (case study index listing Inferyx, AegisZ, OrgMind, Threat Detection, RoadSaarthi with metrics pills and status tags)
  - `src/app/work/[slug]/page.tsx` (`generateStaticParams` for all 5 projects, dynamic SSG route)
  - `src/components/project/MetricsTable.tsx` (5-column audit table: Measure, Value, Data, Hardware, Method, Verified Badge)
  - `src/components/project/DataNoteCallout.tsx` (prominent amber callout for data provenance)
  - `src/components/project/RetrospectiveBlock.tsx` ("What I'd change" body section in IBM Plex Serif italic with 2px hairline border)
  - `src/components/project/ArchitectureDiagram.tsx` (interactive SVG architecture diagram with component parts, draft badges, and click-to-highlight state)
  - `src/components/project/RoadSaarthiDisclaimer.tsx` (mandatory independent prototype disclaimer callout)
  - `src/lib/content/diagrams.ts` (typed SVG diagram definitions ported from `scripts/diagrams.mjs` for Inferyx, AegisZ, OrgMind, Threat Detection, RoadSaarthi)
- **Action Steps**:
  1. Port vector architecture diagrams from `scripts/diagrams.mjs` to `src/lib/content/diagrams.ts`, ensuring 100% SVG compliance, 1.5px ink strokes, zero filters/gradients, and responsive viewboxes.
  2. Implement `src/components/project/MetricsTable.tsx` rendering the full 5-column audit table:
     - Columns: Measure, Value, Data, Hardware, Method.
     - Verified status pill: `[VERIFIED]` in cyan or `[LAB TARGET / UNCONFIRMED]` in amber.
  3. Build `src/components/project/DataNoteCallout.tsx` rendering the honesty data note beneath the project header.
  4. Build `src/components/project/RetrospectiveBlock.tsx` rendering "What I'd change" in IBM Plex Serif italic with 2px left border.
  5. Build `src/components/project/RoadSaarthiDisclaimer.tsx` explicitly stating:
     > *"An independent prototype. It is not an official product of any government body, and its data is synthetic."*
  6. Build `src/app/work/[slug]/page.tsx` with `generateStaticParams()` returning `inferyx`, `aegisz`, `orgmind`, `threat-detection`, `roadsaarthi`:
     - Exactly one `<h1>` per case study.
     - Private repo handling for Inferyx: *"Source is private. Walkthrough on request."* (no broken GitHub link).
     - Full markdown body rendering via safe markdown parser.
- **Verification Commands**:
  - `npm run build` succeeds and emits `out/work/inferyx.html`, `out/work/aegisz.html`, `out/work/orgmind.html`, `out/work/threat-detection.html`, `out/work/roadsaarthi.html`.
  - Verify `out/work/roadsaarthi.html` contains the text *"An independent prototype. It is not an official product of any government body"*.
  - Verify `out/work/inferyx.html` contains *"Source is private. Walkthrough on request."*.
</task>

---

### <task 4: Secondary Pages & Interactive Prerendered Routes>
- **Type**: expansion
- **Files to create/modify**:
  - `src/app/about/page.tsx` (Bio in IBM Plex Serif, how I work, chronological timeline, verified skills matrix)
  - `src/app/certifications/page.tsx` (4 featured credentials with verification links + 6 categorized credentials)
  - `src/app/resume/page.tsx` (experience summary, skills breakdown, embedded PDF viewer, direct download link to `/resume.pdf`)
  - `src/app/contact/page.tsx` (Turnstile-ready contact form shell, calendar link, click-to-reveal email trigger)
  - `src/components/contact/EmailRevealButton.tsx` (client component assembling email from split parts on interaction to mitigate T-01-01)
  - `src/app/lab/page.tsx` (Phenom experiment showcase and research notes)
  - `src/app/security/page.tsx` (security posture, CSP header explanation, vulnerability reporting guidelines)
  - `src/app/colophon/page.tsx` (typography, tech stack details, design constraints, performance philosophy)
  - `src/app/not-found.tsx` / `src/app/404/page.tsx` (tactical left-aligned missing route screen with full navigation index)
- **Action Steps**:
  1. Implement `src/app/about/page.tsx` migrating `content/about.md` and `content/timeline.json` with accessible semantic markup.
  2. Implement `src/app/certifications/page.tsx` parsing `content/certs.json` with issuer badges and verified credential IDs.
  3. Implement `src/app/resume/page.tsx` with PDF download action and embedded viewer fallback.
  4. Implement `src/components/contact/EmailRevealButton.tsx`:
     - Reads `email_parts` (`["ambuljaiswal5", "gmail.com"]`) from site config.
     - On user click, combines into mailto link and copies to clipboard with status message.
     - Guaranteed zero raw email strings in SSR output (T-01-01 mitigation).
  5. Implement `src/app/contact/page.tsx` with Turnstile container `div` and contact form fallback.
  6. Implement `src/app/lab/page.tsx` importing `content/projects/phenom.md`.
  7. Implement `src/app/security/page.tsx` displaying the exact production CSP and edge headers.
  8. Implement `src/app/colophon/page.tsx` describing Next.js 15, React 19, IBM Plex typography, and zero-tracking pledge.
  9. Implement `src/app/not-found.tsx` (and `src/app/404/page.tsx` for static export) with tactical HUD layout.
- **Verification Commands**:
  - `npm run build` succeeds and produces static HTML for all routes: `about.html`, `certifications.html`, `resume.html`, `contact.html`, `lab.html`, `security.html`, `colophon.html`, `404.html`.
  - Verify every route has exactly one `<h1>`.
</task>

---

### <task 5: Edge Hardening, Static Assets, Email Leak Test & Gate 1 Playwright Suite>
- **Type**: expansion
- **Files to create/modify**:
  - `public/_headers` (Cloudflare Pages edge headers: strict CSP matching DESIGN.md §8.2, HSTS, XFO, Permissions-Policy, cache rules)
  - `src/app/sitemap.ts` (App Router static sitemap generation listing all 15 routes under `https://ambul.dev`)
  - `src/app/robots.ts` (App Router static robots.txt generation pointing to `https://ambul.dev/sitemap.xml`)
  - `public/.well-known/security.txt` (security disclosure specification)
  - `scripts/check-email-leak.mjs` (test script asserting 0 occurrences of `ambuljaiswal5@gmail.com` across all files in `out/`)
  - `tests/gate1.spec.ts` (Playwright E2E and axe-core test suite verifying all 15 routes, single `<h1>`, zero console errors, zero broken links, zero CSP violations, WCAG AA compliance)
- **Action Steps**:
  1. Configure `public/_headers` with the full CSP:
     `default-src 'self'; script-src 'self' https://challenges.cloudflare.com https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://api.github.com https://cloudflareinsights.com; frame-src https://challenges.cloudflare.com; object-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests`
  2. Implement `src/app/sitemap.ts` and `src/app/robots.ts` exporting canonical paths.
  3. Write `scripts/check-email-leak.mjs` recursively checking `out/` for plaintext email.
  4. Write `tests/gate1.spec.ts` using Playwright and `@axe-core/playwright`:
     - Test all 15 routes return HTTP 200.
     - Test each route contains exactly 1 `<h1>`.
     - Test zero console errors or uncaught exceptions.
     - Test keyboard skip link successfully shifts focus to `#main-content`.
     - Test axe-core returns 0 critical or serious accessibility violations.
     - Test zero `securitypolicyviolation` events.
  5. Add test scripts to `package.json`:
     `"check:content": "node scripts/validate-content.mjs"`,
     `"check:placeholders": "node scripts/check-placeholders.mjs"`,
     `"check:email-leak": "node scripts/check-email-leak.mjs"`,
     `"test:gate1": "playwright test tests/gate1.spec.ts"`.
- **Verification Commands**:
  - `npm run check:email-leak` returns 0 leaks.
  - `npm run build` cleanly finishes.
  - `npx playwright test tests/gate1.spec.ts` passes 100%.
</task>

---

## Threat Model & Risk Mitigations

| Threat ID | Threat Description | Severity | Mitigation Strategy |
|-----------|--------------------|----------|---------------------|
| **T-01-01** | **Automated Email Harvesting**: Plaintext email `ambuljaiswal5@gmail.com` scraped by web crawlers from static HTML files. | High | Ingest email as split tuple `["ambuljaiswal5", "gmail.com"]` in `content/site.json`. Assemble only on client-side button click (`EmailRevealButton.tsx`). Enforce pre-deployment assertion via `scripts/check-email-leak.mjs` which fails the build if plaintext appears in `out/`. |
| **T-01-02** | **Unsafe HTML Injection (XSS)**: Malicious or unescaped HTML inside markdown project files rendered as active DOM elements. | High | Configure `marked` with `html: false` and strict custom renderers. Disallow `dangerouslySetInnerHTML` on untrusted inputs. All markdown converted to sanitized HTML nodes. |
| **T-01-03** | **Content Security Policy Mismatch**: Cloudflare Pages ignoring Next.js server headers or blocking legitimate styles/scripts. | Medium | Static export ignores `next.config.ts` headers; place explicit headers in `public/_headers` so Cloudflare Pages edge serves them natively. Restrict `font-src 'self'`, `script-src 'self'` + Cloudflare Turnstile, and `frame-ancestors 'none'`. |
| **T-01-04** | **Hydration Mismatch on Chronometer**: Real-time UTC clock in HUD status bar causing React 19 hydration mismatch between build time and client load time. | Low | Initialize chronometer state inside `useEffect` post-mount or apply `suppressHydrationWarning` on the timestamp display node. |

---

## Verification & Nyquist Gates

Run the automated verification pipeline to certify Phase 1 completion:

```bash
# 1. Validate content frontmatter and JSON against Zod schemas
npm run check:content

# 2. Verify honesty tokens (no unresolved placeholders in production build)
npm run check:placeholders

# 3. Static Next.js 15 build export
npm run build

# 4. Assert zero raw email leakage into static HTML output
npm run check:email-leak

# 5. Execute Playwright E2E and axe-core accessibility audit across all 15 routes
npx playwright test tests/gate1.spec.ts
```

**Pass Criteria:**
- 100% of 15 routes return HTTP 200.
- Exactly one `<h1>` per route.
- 0 TypeScript compilation errors (`tsc --noEmit`).
- 0 ESLint warnings.
- 0 axe-core critical or serious accessibility violations.
- 0 raw email instances in `out/`.
- 0 broken internal links or missing static assets.
- `public/_headers`, `out/sitemap.xml`, and `out/robots.txt` present and valid.
