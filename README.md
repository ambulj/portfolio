# Ambul Jaiswal — Portfolio Website

> Personal portfolio for Ambul Jaiswal (*Data science × cybersecurity · B.Tech CSE '28*).  
> Built as a static, hand-crafted site adhering strictly to [`DESIGN.md`](./DESIGN.md).

---

## Architecture & Principles

- **Zero Front-end Frameworks:** Pure static HTML, clean CSS tokens, minimal vanilla JavaScript, and a desktop-only Three.js axonometric constellation diagram.
- **Strict Content Security Policy:** Zero inline scripts, zero inline styles (`style=""`), zero external CDNs, self-hosted IBM Plex WOFF2 fonts with OFL licensing.
- **Honesty First:** Explicit data notes, metrics with "how measured" methodology, "What I'd change" retrospectives on every project, and draft indicators on unverified diagrams.
- **Accessible & Resilient:** Fully functional with JavaScript disabled, WCAG AA compliant, 0 axe-core violations, respects `prefers-reduced-motion` and `prefers-color-scheme`, and responsive down to mobile viewports.
- **Cloudflare Pages Native:** Uses static prerendered routes, standard `_headers` and `_redirects`, and a zero-retention Cloudflare Pages Function for contact form handling.

---

## Getting Started

### Prerequisites

- **Node.js**: `v20.0.0` or higher
- **npm**: `v9.0.0` or higher

### Installation

```bash
git clone <repo-url>
cd portfolio
npm install
```

All dependencies are pinned to exact versions older than two weeks:
- Runtime: `three` (0.186.1)
- Build & Prerender: `marked` (18.0.14), `gray-matter` (4.0.3), `ajv` (8.20.0), `esbuild` (0.28.2)
- Testing & Quality: `playwright` (1.63.0), `@axe-core/playwright` (4.13.0), `lighthouse` (13.5.0)

---

## Build Commands

| Command | Description |
| :--- | :--- |
| `npm run build` | Validates content, bundles assets, prerenders all 14 routes to `dist/`, outputs placeholder audit, and succeeds. |
| `npm run build:prod` | Runs the production build. **Fails with exit code 1** if any `[[PLACEHOLDER: ...]]` or `[[VERIFY: ...]]` token remains. |
| `npm run preview` | Runs the zero-dependency local preview server on `http://localhost:8788`, serving `dist/` with exact production HTTP security headers and contact API simulation. |
| `npm run test:gate1` | Runs the full Playwright + axe-core automated verification suite against the preview server. |
| `npm run check:contrast` | Verifies design token color pairs against WCAG AA / AAA contrast standards. |
| `npm run check:links` | Crawls all prerendered internal links and asserts 0 broken routes. |

---

## Content Structure

All site copy and metadata reside in `content/` and are validated against JSON Schemas in `schemas/` at build time. The site owner edits content, never build code:

```
content/
├── site.json               # Global metadata, links, social URLs, analytics, CSP config
├── status.json             # Availability status, internship timeline, location
├── lines.json              # Three narrative lines for the home page index
├── certs.json              # Academic and industry certifications
├── timeline.json           # Education and work history for resume
├── about.md                # Personal bio, reading list, current technical interests
├── graph.json              # Constellation graph nodes, links, and positions
└── projects/               # Case studies with YAML frontmatter + Markdown body
    ├── inferyx.md          # Drift detection engine (Flagship)
    ├── aegisz.md           # Transaction fraud detection
    ├── orgmind.md          # Multi-agent organizational intelligence
    ├── threat-detection.md # SOC alert clustering & anomaly detection
    ├── roadsaarthi.md      # Pothole detection on edge devices
    └── phenom.md           # Minimalist audio-reactive canvas experiment
```

### Placeholders & Verification Tokens

In accordance with strict portfolio integrity rules:
- Any unverified metric, missing link, or unconfirmed detail uses `[[PLACEHOLDER: ...]]` or `[[VERIFY: ...]]`.
- To deploy to production, replace these tokens with verified facts in the respective `content/*.json` or `content/projects/*.md` files until `npm run build:prod` exits cleanly.

---

## Deployment to Cloudflare Pages

### 1. Connect Git Repository

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select your repository.

### 2. Build & Output Settings

- **Framework preset:** `None`
- **Build command:** `npm run build` (or `npm run build:prod` once placeholders are resolved)
- **Build output directory:** `dist`
- **Root directory:** `/`

### 3. Environment Variables

Under **Settings** > **Environment variables**, set:
- `NODE_VERSION`: `20`
- `TURNSTILE_SECRET_KEY`: *Your Cloudflare Turnstile secret key* (generated in Turnstile dashboard)

### 4. Turnstile Configuration

1. In the Cloudflare Dashboard, navigate to **Turnstile** > **Add Site**.
2. Set domain to your Cloudflare Pages domain (e.g. `*.pages.dev` or custom domain).
3. Widget Mode: **Managed**.
4. Copy the **Site Key** and add it to `content/site.json` under `turnstile.siteKey` (or leave empty to use the standard honeypot fallback).
5. Copy the **Secret Key** into the `TURNSTILE_SECRET_KEY` environment variable in Pages.

### 5. HTTP Security Headers

Cloudflare Pages automatically reads and applies the production headers generated at `dist/_headers`. No manual header configuration in the Cloudflare dashboard is needed.

The deployed headers include:
- `Content-Security-Policy`: `default-src 'self'; script-src 'self' https://challenges.cloudflare.com; style-src 'self'; img-src 'self' data:; connect-src 'self' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;`
- `Strict-Transport-Security`: `max-age=31536000; includeSubDomains; preload`
- `X-Content-Type-Options`: `nosniff`
- `X-Frame-Options`: `DENY`
- `Referrer-Policy`: `strict-origin-when-cross-origin`
- `Permissions-Policy`: `camera=(), microphone=(), geolocation=(), interest-cohort=()`
- `Cross-Origin-Opener-Policy`: `same-origin`
- `Cross-Origin-Resource-Policy`: `same-origin`

---

## Verification Evidence

For complete execution logs, Lighthouse audits, contrast calculations, and test suite outputs, refer to [`STATUS.md`](./STATUS.md).
