# Phase 1: Cyber-Command HUD & Split Command Deck — UI Design Contract (UI-SPEC)

**Phase:** 01 — Next.js 15 Architecture & Content Pipeline  
**Design System:** Cyber-Command HUD  
**Status:** Approved Design Contract  

---

## 1. Visual Theme & Color Palette

The interface adheres to an ultra-clean **Cyber-Command HUD** aesthetic built on pure OLED black:

| Token Name | Hex Value | Purpose / Usage |
|------------|-----------|-----------------|
| `color-bg-oled` | `#000000` | Core root background, body background |
| `color-bg-deck` | `#06090c` | Card & panel background, frosted glass tint |
| `color-border-subtle` | `#161e24` | 1px technical divider, frame borders |
| `color-border-active` | `#283845` | Hover/focus state borders |
| `color-ink-primary` | `#e6edf3` | Headings, primary body text, active state |
| `color-ink-secondary`| `#8b949e` | Metadata, labels, timestamps, captions |
| `color-accent-cyan` | `#00f0ff` | Telemetry highlights, active links, radar pulses |
| `color-accent-amber`| `#f2c500` | Warning badges, internship banner, verified pins |
| `color-accent-alert`| `#ff3344` | Anomaly pings, error states |

---

## 2. Layout Specification: Split Command Deck

```
┌────────────────────────────────────────────────────────────────────────┐
│ HUD TOP BAR (Fixed 44px): [ AMBUL JAISWAL // SEC-ML ]  [UTC CLOCK]  [⌘K]│
├───────────────────────────────────┬────────────────────────────────────┤
│ PERSISTENT 3D DECK (Desktop 45%) │ MODULAR DATA DECK (Desktop 55%)    │
│                                   │                                    │
│ [Canvas / Static SVG Fallback]    │ [Page Routes Prerendered]          │
│ • Live threat topology            │ • Case Studies & Metrics Tables    │
│ • Interactive WebGPU nodes        │ • Bio, Timeline, Certifications    │
│ • aria-hidden="true"              │ • Honesty Callouts & Data Notes    │
│ • Collapses on mobile (<1024px)   │ • <main id="main-content">         │
│                                   │                                    │
├───────────────────────────────────┴────────────────────────────────────┤
│ HUD BOTTOM BAR (Fixed 36px): [SYS: NOMINAL] [SCANLINES: ON] [VOL: OFF] │
└────────────────────────────────────────────────────────────────────────┘
```

### Responsive Breakpoints:
- **Desktop (`>= 1024px`)**: Dual-pane Split Command Deck layout side-by-side.
- **Tablet & Mobile (`< 1024px`)**: Single-column vertical stack. The 3D canvas collapses into an optional compact banner or static diagram; the modular data deck expands to 100% width with touch-friendly navigation.

---

## 3. Typography Rules

1. **Monospace (`IBM Plex Mono`)**:
   - Navigation links, breadcrumbs, tags, timestamps, metrics cells, code snippets, status badges.
2. **Display (`IBM Plex Sans Condensed`)**:
   - Page `<h1>` headings, section titles, project titles, modal headers.
3. **Body (`IBM Plex Serif`)**:
   - Case study prose, long-form project summaries, about page bio.

All fonts loaded locally from `public/fonts/` with zero layout shift.

---

## 4. Accessibility & Navigation Contracts

- **Skip Link**: Top-level hidden link `.sr-only focus:not-sr-only` targeting `#main-content`.
- **Single Heading Rule**: Exactly one `<h1>` per route.
- **Focus Rings**: High-visibility cyan focus outlines (`focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none`).
- **Contrast**: Text contrast $\ge 4.5:1$ against `#000000` / `#06090c` for standard text and $\ge 3:1$ for large headings.
- **Reduced Motion**: Under `@media (prefers-reduced-motion: reduce)`, disable all pulse animations, CRT scanlines, and camera transitions.
