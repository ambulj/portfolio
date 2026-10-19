---
phase: "01"
phase_slug: "next-js-15-architecture-content-pipeline"
date: "2026-10-19"
status: "draft"
---

# Phase 01: Validation Strategy — Next.js 15 Architecture & Content Pipeline

This document defines the Nyquist validation strategy and automated gates for Phase 1. Every gate must be executable via automated commands before Phase 1 is marked complete.

---

## 1. Automated Verification Matrix

| Gate | Check | Command | Pass Criteria |
|------|-------|---------|---------------|
| **V1: Content Schema** | Zod / Schema Validation | `npm run check:content` | 0 schema validation errors across all markdown frontmatter and JSON files |
| **V2: Honesty & Token Gate** | Placeholder Scanner | `npm run check:placeholders` | 0 unverified placeholders; all honesty blocks present |
| **V3: Type & Lint** | TypeScript & ESLint | `npm run lint && tsc --noEmit` | 0 TypeScript compilation errors, 0 ESLint warnings |
| **V4: Static Prerendering** | Next.js 15 Static Export | `npm run build` | 100% of routes emitted to `out/` as static HTML |
| **V5: Privacy Leak Gate** | Raw Email Scraper Check | `npm run check:email-leak` | 0 instances of `ambuljaiswal5@gmail.com` in `out/` HTML |
| **V6: Route Health & A11y** | Playwright E2E & Axe-core | `npx playwright test tests/gate1.spec.ts` | 100% of 15 routes return HTTP 200, exactly 1 `<h1>` per route, 0 console errors, 0 broken internal links, 0 axe-core critical/serious violations, 0 CSP violations |

---

## 2. Route Coverage Manifest

Every one of the following routes must be pre-rendered and verified:

1. `/` (Home: Split Command Deck layout, static SVG constellation, opening line, status strip)
2. `/work` (Case study index: 5 core projects)
3. `/work/inferyx` (Case study with architecture diagram, honesty data note, metrics table, "What I'd change")
4. `/work/aegisz` (Case study with architecture diagram, honesty data note, metrics table, "What I'd change")
5. `/work/orgmind` (Case study with architecture diagram, honesty data note, metrics table, "What I'd change")
6. `/work/threat-detection` (Case study with architecture diagram, honesty data note, metrics table, "What I'd change")
7. `/work/roadsaarthi` (Case study with independent prototype disclaimer, metrics table, "What I'd change")
8. `/lab` (Phenom experiment showcase)
9. `/about` (Biography, how I work, chronological timeline, verified skill matrix)
10. `/certifications` (4 featured + 6 listed verified credentials)
11. `/resume` (Summary + embedded PDF viewer + direct download link)
12. `/contact` (Turnstile-ready contact form + click-to-reveal email trigger)
13. `/security` (Static CSP and security headers audit table)
14. `/colophon` (Tech stack, fonts, design system explanation)
15. `/404` (Tactical left-aligned missing route screen with navigation index)

---

## 3. Security & Edge Configuration Verification

1. `out/_headers` exists with strict Content Security Policy matching DESIGN.md §8.2.
2. `out/robots.txt` disallows aggressive scrapers and references `https://ambul.dev/sitemap.xml`.
3. `out/sitemap.xml` lists all 15 canonical routes under `https://ambul.dev`.
4. `out/.well-known/security.txt` carries valid contact and canonical URL.
