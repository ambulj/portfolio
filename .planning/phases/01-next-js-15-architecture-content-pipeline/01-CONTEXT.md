# Phase 1: Next.js 15 Architecture & Content Pipeline — Context

**Phase:** 01 — Next.js 15 Architecture & Content Pipeline  
**Date:** 2026-10-19  
**Status:** Ready for Planning  

---

## 1. User Design & Architecture Decisions

In the recent architectural review, the user confirmed the following foundational decisions:

- **Theme & Aesthetic**: **Cyber-Command HUD**
  - Pure OLED black (`#000000`) background.
  - High-density telemetry styling with subtle scanlines and grid overlay toggle.
  - Monochrome foundation accented with cyan (`#00f0ff`) and amber (`#ffb000`) status indicators.
  - Typography: Self-hosted IBM Plex (Mono, Sans Condensed, Serif) preserving typography rules from DESIGN.md.
- **Layout & Navigation**: **Split Command Deck**
  - Persistent 3D canvas / threat topology on one side.
  - Modular glass data panels on the other side.
  - Instant keyboard navigation overlay (`Cmd+K` / Terminal CLI launcher).
- **3D Visual Centerpiece**: **React Three Fiber (R3F) 3D Globe & Threat Topology** (Prepared in Phase 1 layout shell; implemented in Phase 2).
- **AI Inference Engine**: **Hybrid Client + Edge Architecture** (Prepared in Phase 1; local ONNX WASM in Phase 3, Cloudflare Workers AI Copilot in Phase 5).
- **Deployment & Hosting**: Cloudflare Pages with custom domain `https://ambul.dev` and strict Content Security Policy.

---

## 2. Phase 1 Scope & Boundary

### In Scope for Phase 1:
1. **Next.js 15 & React 19 Setup**:
   - Modern Next.js 15 App Router configuration with TypeScript and Tailwind CSS v3/v4.
   - Configured for static export (`output: 'export'`) outputting to Cloudflare Pages compatible distribution directory (`out/` or `dist/`).
2. **Cyber-Command HUD Shell**:
   - Split Command Deck root layout (`app/layout.tsx`).
   - Persistent 3D canvas viewport container (accessible, aria-hidden, responsive).
   - High-density HUD status bar (internship search badge, UTC clock, simulated threat radar ping, audio toggle placeholder).
   - Accessible keyboard skip-link, visible focus states, and `prefers-reduced-motion` compliance.
3. **Content Pipeline & Ingestion**:
   - Automated ingestion of all existing project Markdown and JSON content:
     - Case studies: `Inferyx`, `AegisZ`, `OrgMind`, `Threat Detection`, `RoadSaarthi`.
     - Static pages: About, Certifications, Resume, Contact, Lab, Security, Colophon, 404.
   - Strict preservation of honesty metrics: data notes, metrics tables with "how measured" column, "What I'd change" blocks, and RoadSaarthi independent-prototype disclaimer.
   - JSON Schema / Zod validation for all content.
4. **Build & Route Verification**:
   - Prerender 100% of routes to static HTML.
   - Generation of `_headers`, `robots.txt`, `sitemap.xml`, and `.well-known/security.txt`.
   - Automated verification check: zero 404s, zero console errors, zero missing images/fonts, valid metadata.

### Out of Scope for Phase 1:
- Active WebGPU WGSL compute shaders and R3F globe (Phase 2).
- ONNX Runtime Web model execution (Phase 3).
- Live SOC attack stream simulation (Phase 4).
- Cloudflare Workers AI Copilot (Phase 5).

---

## 3. Success Criteria & Verification

- `npm run build` succeeds cleanly with static HTML output.
- All 5 case study routes render with full metrics, architecture diagrams, and honesty blocks.
- Split Command Deck renders cleanly in desktop and collapses gracefully for mobile/tablet.
- Security headers and CSP comply with DESIGN.md specifications.
