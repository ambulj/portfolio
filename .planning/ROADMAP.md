# Roadmap: Ambul Jaiswal Portfolio (Swiss Research Edition)

## Overview

A phased overhaul transforming Ambul Jaiswal's portfolio from generic cyberpunk/sci-fi tropes into an International Typographic / Swiss Style research monograph. Case studies are clean, peer-grade, and distraction-free, while interactive technical systems (ONNX inference, SOC visualizer, 3D topology, copilot) live purposefully in dedicated lab interfaces.

---

## Phase Breakdown

### Phase 1: International Typographic Dual-Mode Design System & Core Shell
- **Goal:** Establish the clean Swiss visual design system, auto dual-mode CSS tokens, self-hosted typography, and calm editorial layout shell.
- **Scope:**
  - Strip all scanline overlays, CRT effects, and cyberpunk HUD banners (`DSGN-02`).
  - Configure dual-mode color tokens (`DSGN-01`): Light `#F9F9FB` / `#111113`, Dark `#0D0E11` / `#ECECED`, electric blue accent.
  - Implement calm editorial navigation bar, footer with colophon and security.txt, and reading width measures (`DSGN-03`, `DSGN-04`).
- **Exit Criteria:** Zero scanlines, verified contrast in light and dark modes, responsive layout with clean typography.

### Phase 2: Peer-Grade Case Studies & Technical Writing
- **Goal:** Redesign all 5 project case study pages into clean, highly readable technical papers.
- **Scope:**
  - Restructure Inferyx, AegisZ, OrgMind, Threat Detection, and RoadSaarthi (`CASE-01`).
  - Render architectural diagrams with precise 1px technical lines and no neon glow (`CASE-02`).
  - Format 5-column audited metrics tables with datasets, hardware, and measurement methods (`CASE-03`).
  - Preserve all mandatory honesty features and retrospectives (`CASE-04`).
- **Exit Criteria:** Distraction-free reading experience, all honesty notices verified, 0 email leaks.

### Phase 3: Research Lab (`/lab`) & Interactive Systems Suite
- **Goal:** Unify all interactive technical artifacts into a dedicated, tool-like research lab.
- **Scope:**
  - Dedicated `/lab` route presenting tools with clean engineering control cards (`LAB-01`).
  - Restrained 3D Constellation / Network diagram with calm rendering and optional toggle (`LAB-02`).
  - In-browser ONNX WASM anomaly detection playground with live latency timers (`LAB-03`).
  - Simulated NetFlow/Zeek cyber telemetry stream with 5-tier topology map and packet inspection drawer (`LAB-04`).
  - Differential Privacy Laplace noise injection demo with interactive $\epsilon$ slider (`LAB-05`).
- **Exit Criteria:** All interactive demos operational locally with zero CDN requests, sub-50ms inference, 60fps frame rate.

### Phase 4: Restrained Neural Research Copilot & Utilities
- **Goal:** Replace the full-screen terminal modal with a clean, unobtrusive slide-over research assistant.
- **Scope:**
  - Redesign Copilot into an accessible side drawer (`COPILOT-01`).
  - Grounded RAG answers with clickable verified citation pills (`COPILOT-02`).
  - Clean secondary routes: `/about`, `/certifications`, `/resume`, `/contact`, `/security`, `/colophon` (`COPILOT-03`).
- **Exit Criteria:** Drawer opens smoothly via keyboard/button, streaming RAG citations work accurately, zero external tracking.

### Phase 5: Verification, Accessibility Audit & Cloudflare Pages Edge Hardening
- **Goal:** Comprehensive end-to-end testing, WCAG AA compliance audit, performance validation, and deployment readiness.
- **Scope:**
  - Playwright test suites covering all routes and interactive widgets (`PERF-01`).
  - Automated contrast checks across light and dark modes (`A11Y-01`).
  - Skip links and reduced-motion verification (`A11Y-02`).
  - Static export verification with strict CSP headers (`SEC-01`).
- **Exit Criteria:** 100% test pass rate across all gates, 0 email leaks, ready for production deployment on `ambul.dev`.

---
*Roadmap defined: 2026-10-20*
