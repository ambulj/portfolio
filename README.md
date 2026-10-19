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

## Build & Test Commands

| Command | Description |
| :--- | :--- |
| `npm run build` | Validates content against schemas, bundles assets with esbuild, prerenders all 16 routes to `dist/`, copies og.png, generates sitemap/robots/headers/security.txt, prints placeholder audit, and succeeds. |
| `npm run build:prod` | Runs the production build. **Strictly fails with exit code 1** if any `[[PLACEHOLDER: ...]]` or `[[VERIFY: ...]]` token remains in output. |
| `npm run preview` | Runs the zero-dependency local preview server on `http://localhost:8788`, serving `dist/` with exact production HTTP security headers and contact API simulation. |
| `npm run test:gate1` | Runs the Gate 1 Playwright + axe-core automated verification suite (routes, headers, a11y, JS-disabled, mobile, 3D switch). |
| `npm run test:gate2` | Runs the Gate 2 automated verification suite (client navigation, View Transitions, wipe line, cursor, Web Audio, GitHub feed snapshot fallback & XSS immunity, live header check). |
| `npm run test:gate3` | Runs the Gate 3 automated verification suite (all 8 hidden features, zero-cookies check, network request audit, secrets persistence). |
| `npm run check:contrast` | Verifies design token color pairs against WCAG AA / AAA contrast standards. |
| `npm run og:generate` | Generates `public/og.png` using Node SVG rendering. |

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

## Hidden Features & Discovery Engine (§10)

Eight discreet, privacy-respecting browser features are implemented strictly client-side. They make zero external network requests and set zero tracking cookies (`document.cookie === ''`):

1. **Interactive Terminal (`terminal.js`):** Press the backtick key (`` ` ``) or click `[>]` in the footer. Provides shell navigation (`help`, `projects`, `certs`, `contact`, `theme`, `hint`, `secrets`, `unlock`). Inputs are strictly escaped and rendered via `textContent` to prevent DOM XSS. Focus is trapped; Esc closes.
2. **CTF Passphrase Challenge:** An easter egg comment near the top of the HTML source encodes a base64 puzzle (`bW9kZWxzLWZhaWwtcXVpZXRseQ==`). Decoding it reveals `models-fail-quietly`. Entering `unlock models-fail-quietly` in the terminal verifies against a client-side SHA-256 hash and unlocks the recruiter note.
3. **Konami IDS Intrusion Mode (`konami.js`):** Key sequence `↑ ↑ ↓ ↓ ← → ← → B A` trips the simulated intrusion detection system, tinting the viewport with an anomaly log. Pulses at a safe 1.0 Hz (strictly $\le 3\text{ Hz}$), is completely suppressed under `prefers-reduced-motion: reduce`, and exits on Esc.
4. **Tamper-Detection Merkle Ledger (`tamper-chain.js`):** Located on `/work/aegisz`. A 5-block cryptographic hash chain using browser Web Crypto SHA-256. Editing block $i$ causes downstream hashes to fail and flags `chain invalid at block n`.
5. **Differential Privacy Blur (`dp-blur.js`):** Located in About. Clicking `Roorkee, India` opens a Laplace perturbation modal with an $\varepsilon \in [0.1, 5.0]$ slider and interactive 50-point SVG scatter plot around the public centroid coordinates (`29.8543° N, 77.8880° E`).
6. **Anomaly Hunt (`anomaly-hunt.js`):** Located on `/work/threat-detection`. An interactive 200-point deterministic network flow scatter plot with 6 outliers. Clicking outlier nodes inspects their Isolation Forest score.
7. **Drift Simulator (`drift-slider.js`):** Located on `/work/inferyx`. Slide feature distribution shift to compute live Population Stability Index (PSI) across 10 bins: Stable ($< 0.10$), Moderate Warning ($\ge 0.10$), and Critical Alert ($\ge 0.25$).
8. **Technical Colophon (`/colophon`):** An honest colophon listing all 9 pinned dependencies, exact versions, download sizes, licenses, commit hash link, "Why this isn't on a framework", and "What happens when JavaScript is off".

**Discovery Persistence:** Discovered secrets are tracked in `localStorage.secrets`. The footer counter ("Secrets found: $n$ of 8") stays hidden until the first secret is unlocked and persists across reloads.

---

## Verification Evidence

For complete execution logs, Lighthouse audits, contrast calculations, and test suite outputs, refer to [`STATUS.md`](./STATUS.md).
