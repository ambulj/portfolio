# DESIGN.md — Ambul Jaiswal's portfolio

This file is the single source of truth for the build. Read it fully before writing code. Where this file and the prompt disagree, this file wins.

## 0. Conventions

| Token | Meaning |
|---|---|
| `[[PLACEHOLDER: …]]` | A fact only the owner can supply. Never invent it. Render a visible but quiet "to be added" state in dev builds. |
| `[[VERIFY: …]]` | A claim drafted from a README or LinkedIn export that the owner must confirm. Ship it only after confirmation. |
| `draft` | Content written by the designer from public READMEs. Mark it as draft in the content file. |

`npm run build:prod` must **fail** if any `[[PLACEHOLDER` or `[[VERIFY` token remains in content. `npm run build:dev` only warns and prints a report.

Do not invent metrics, dates, certifications, links, quotes, employers or results. If a fact is missing, leave the token.

---

## 1. Brief

- **Subject:** a third-year B.Tech CSE student (UTU, Roorkee, India; 2024–2028) who builds machine-learning systems and then tries to break them.
- **Audience:** recruiters and engineers hiring for internships and entry-level roles in security-focused data science. They give a first visit seconds, then open one or two project pages and check claims.
- **Primary job:** make five projects legible and believable. Everything else supports that.
- **The one memorable thing:** a persistent 3D "constellation" drawn like a technical diagram. Everything around it stays quiet.
- **Positioning:** *Data science × cybersecurity · B.Tech CSE '28*
- **Goal:** internship or full-time role. The site says so, plainly.

### Honesty rules (these shape the design)

1. Most projects are prototypes on synthetic data. Every project page says so in its own words.
2. Every number carries a "how measured" cell: dataset, hardware, method.
3. Every project has a "What I'd change" block. It is a feature, not a confession.
4. Inferyx's source is private. Say so; do not link a repo.
5. RoadSaarthi must never imply an official government product. Its page states it is an independent prototype.

---

## 2. Voice and copy

Understated, precise, first person, sentence case. Short sentences. State what worked and what did not.

**Never use:** passionate, cutting-edge, leverage, seamless, robust, delve, journey, unlock, empower, revolutionize, game-changer, "I'm excited to", "Hi, I'm", emoji, exclamation marks.

**Rules:**
- No eyebrow labels above headings. No all-caps labels anywhere.
- No numbered markers (01 / 02 / 03) unless the content really is a sequence (timeline, process steps).
- No "→" appended to links or buttons. Buttons say what happens: "Send message", "Download resume", "Open demo".
- Errors say what happened and how to fix it. They do not apologise.
- Empty states say what to do next.
- Name things in the reader's words: "Check the data for leaks", not "leakage scan module".

---

## 3. Visual system

> **Palette note.** Warm cream with a terracotta/vermilion accent, and near-black with one neon accent, are the two most common generated-site looks. This system avoids both: cool drafting-film paper, graphite ink, and a survey-marker yellow used as a highlighter, not as text.

### 3.1 Colour tokens (CSS custom properties on `:root`)

| Token | Light | Dark | Role |
|---|---|---|---|
| `--paper` | `#E8ECE9` | `#1D2A28` | page background (drafting film / dark slate-green; not near-black) |
| `--ink` | `#1E2528` | `#E8ECE9` | text, lines, node outlines |
| `--rule` | `#C3CCC7` | `#3A4B48` | hairlines, inactive edges, dividers |
| `--quiet` | `#5B6A6E` | `#A3B3AF` | secondary text (must pass 4.5:1 on `--paper`) |
| `--mark` | `#F2C500` | `#F2C500` | survey yellow: highlighter fill, active node, wipe line. Text on it is always `--ink`/graphite. |
| `--fault` | `#B3261E` | `#FF7A6B` | rare: errors, tamper, intrusion mode only |

Rules:
- `--mark` is **never** used as text colour or thin-line colour on `--paper` in light mode (contrast). It is a fill, with `#1E2528` text on top.
- Links: ink colour, underlined, with `--mark` highlighter fill on hover/focus.
- Define dark tokens under `@media (prefers-color-scheme: dark)`. No manual toggle.
- No gradients, glass, glow, bloom, blur, or drop shadows. Depth comes from line weight and spacing.
- Verify contrast for every token pair in both themes and record the ratios in `STATUS.md`.

### 3.2 Typography (self-hosted; no external font requests)

| Role | Family | Notes |
|---|---|---|
| Headings, nav, UI | **IBM Plex Sans Condensed** (500, 600) | Chosen for the IBM Z / SkillsBuild thread running through the work. OFL licence. |
| Body | **IBM Plex Serif** (400, 400 italic, 600) | Serif body text gets line-height 1.6. |
| Terminal, hashes, code only | **IBM Plex Mono** (400) | Never for small decorative labels. |

- Download the woff2 files from the official IBM Plex release, subset to Latin, and commit them under `/public/fonts`. Include the OFL licence file. Preload the two critical files. `font-display: swap`. `size-adjust` fallbacks to prevent layout shift.
- Scale (clamp-based): body `clamp(1.0625rem, 1rem + 0.3vw, 1.1875rem)`; h3 1.35rem; h2 1.9rem; h1/hero opening line `clamp(2.4rem, 5vw, 4.5rem)`, weight 600, letter-spacing −0.01em.
- Measure: body ≤ 68ch. Headings ≤ 22ch. Left-aligned everywhere. Nothing is centred except the 404 mark.
- Headline treatment: the hero opening line **is** the typographic moment. No single-word accenting, no italic emphasis words, no gradient text.

### 3.3 Spacing, shape, motion

- Spacing scale (rem): 0.25, 0.5, 0.75, 1, 1.5, 2.5, 4, 6.
- Radius: **0** on the diagram, scene overlay, tables and rules; **3px** on form controls and buttons only. There are no cards.
- Lines: 1px `--rule` for structure, 1.5px `--ink` for diagram strokes, 2px `--mark` for the active element.
- Non-user-triggered motion: exactly **one** orchestrated moment, the scene's first camera settle on load (≈1.2s). Nothing else animates by itself. No fade-up on sections, no hover lifts, no counters ticking up.
- Motion that answers an action (route change, node click, panel open) is allowed and specified in §9.

### 3.4 Layout concepts

**Home (desktop).** The scene fills the viewport. Text sits bottom-left; nothing is centred.

```
┌──────────────────────────────────────────────────────────────┐
│ [status strip: Open to internships · from <date>]            │
│ A  Work  Lab  About  Certifications  Resume  Contact  [Get in touch]   [reduce 3D] [sound] │
│                                                              │
│                    (3D constellation, drawn in ink)          │
│                                                              │
│                                                              │
│ Models fail quietly.        ← opening line, changes per node │
│ Ambul Jaiswal                                                │
│ Data science × cybersecurity · B.Tech CSE '28                │
│ Index: Inferyx · AegisZ · OrgMind · Threat detection · …     │
└──────────────────────────────────────────────────────────────┘
```

**Case study (desktop ≥ 1024px).** Split screen; the diagram is pinned.

```
┌─────────────────────────────┬────────────────────────────────┐
│ nav                                                          │
├─────────────────────────────┬────────────────────────────────┤
│  PINNED architecture        │  Title, one-line summary       │
│  diagram (inline SVG,       │                                │
│  ink strokes; the part      │  Problem                       │
│  being discussed is         │  How it works   ◀ scrolls; the │
│  outlined in --mark)        │  Results table    matching     │
│                             │  What I'd change  diagram part │
│  legend + "draft diagram"   │  Links, stack     highlights   │
│  tag when unverified        │                                │
└─────────────────────────────┴────────────────────────────────┘
```

Margin notes (small, `--quiet`) sit in a narrow column beside the text, like annotations on a printed paper. They are short asides, not decoration. No section numbers.

- Below 1024px: single column; the diagram appears inline at the start of each section it illustrates.
- The "What I'd change" block uses Plex Serif italic at body size inside a 2px `--ink` left rule. It reads as a note from Ambul.
- Results is a plain table with the columns: *Measure · Value · Data · Hardware · Method*.

### 3.5 Site mark

A monogram "A" drawn from two straight strokes meeting at an apex, with one `--mark` dot at the apex (the node). SVG, 24×24 grid, 2px stroke. Works at 16px as favicon. Provide `favicon.svg`, a 180px `apple-touch-icon.png`, and a dark-mode favicon via `prefers-color-scheme` inside the SVG.

---

## 4. The scene

**Library:** Three.js, installed from npm at an exact pinned version at least two weeks old, bundled with esbuild into `/assets`. No CDN. Tree-shake aggressively. Scene code is a lazy-loaded chunk fetched after first paint.

### 4.1 Nodes (15, hand-placed in `content/graph.json`)

| Node | Size | Start position (x, y, z) |
|---|---|---|
| Inferyx | large (lead) | 0, 0, 0 |
| AegisZ | large | −4, 1.5, −3 |
| OrgMind | large | 4, 1, −5 |
| AI Threat Detection | large | −2.5, −2, −7 |
| RoadSaarthi | large | 3.5, −2, −9 |
| phenom (Lab) | small, outlying | 7, 3, −11 |
| 4 certification nodes | small, ~1.2 units from their project | see §4.2 |

Positions are deterministic, not random. Tune for composition but keep the order of the camera path: Inferyx → AegisZ → OrgMind → Threat Detection → RoadSaarthi → Lab.

### 4.2 Certification nodes

Labelled "related", never "used in".

| Certification | Attached to |
|---|---|
| Neo4j Certified Professional | OrgMind (graph and Cypher concepts; OrgMind runs on FalkorDB, not Neo4j) |
| Google Cloud: Security Command Center skill badge | AI Threat Detection |
| Cisco Junior Cybersecurity Analyst Career Path | AI Threat Detection |
| Summer Analytics 2025, IIT Guwahati (top 25%) | Inferyx |

### 4.3 Edges (draft; `[[VERIFY]]` each)

- **Solid lines = shared concepts**
  - audit trail / tamper evidence: AegisZ — OrgMind
  - role-based access control: AegisZ — OrgMind — Inferyx
  - signed artifacts and integrity: Inferyx — AegisZ
  - anomaly and drift detection: Inferyx — AegisZ — AI Threat Detection
  - unsupervised learning on streams: AI Threat Detection — RoadSaarthi
- **Dashed lines = shared technology**
  - FastAPI: Inferyx — OrgMind — RoadSaarthi
  - Redis: Inferyx — OrgMind
  - React: Inferyx — AegisZ — OrgMind — RoadSaarthi
  - Tailwind: AegisZ — OrgMind — RoadSaarthi
  - scikit-learn: Inferyx — AI Threat Detection — RoadSaarthi
  - Flask: AI Threat Detection — phenom
  - Docker Compose: Inferyx — AegisZ — OrgMind — RoadSaarthi
  - WebSockets: Inferyx — AegisZ — RoadSaarthi

A small legend in the lower corner explains the two line styles. Hovering or focusing a node highlights its edges and dims the rest to `--rule`.

### 4.4 Rendering

- Orthographic-feeling perspective camera (low FOV, ~28°), thin ink lines, small ring nodes, `--mark` fill only on the active node. Flat shading; no lights, shadows, bloom or particles.
- Node labels are **HTML elements positioned over the canvas**, not canvas text, so they are real text, selectable and screen-reader accessible.
- The canvas is `aria-hidden="true"`. An equivalent, fully keyboard-operable **Index** list (links to every project) always exists in the DOM and is the accessible navigation.
- Scroll drives camera progress along a spline through the nodes. Mouse movement tilts the camera ≤ 2.5° with damping. Clicking a node flies the camera in (≈900ms, ease-in-out) and then navigates to that project page.
- The scene persists across routes (see §9.1). On project pages the camera parks near that project's node and the canvas dims to 18% opacity behind the content so text stays readable.

### 4.5 Tiers and fallbacks

| Tier | When | Behaviour |
|---|---|---|
| 0 | viewport < 1024px, or no WebGL2, or `prefers-reduced-motion`, or the visitor switched 3D off | Static SVG of the constellation (build-generated from `graph.json`, top-down projection). No JS scene is loaded. |
| 1 | WebGL works but median frame time over the first 90 frames > 33ms | Lighter scene: DPR capped at 1, no edge dash animation, camera tilt off. |
| 2 | otherwise | Full scene. |

- A visible **Reduce 3D** switch in the nav toggles tier 0/2. The choice persists in `localStorage` under `reduce3d`. The scene also re-checks frame rate during use and offers (does not force) the switch if it drops under 24 fps for 3 seconds.
- Never load Three.js on tier 0.

---

## 5. Pages and routes

Every route is **prerendered to its own static HTML file** at build time (real content, indexable, readable with JS off). JS enhances navigation (§9.1).

| Route | Phase | Notes |
|---|---|---|
| `/` | 1 | Home + scene + opening lines |
| `/work` | 1 | Index of the five case studies, Inferyx first |
| `/work/inferyx`, `/work/aegisz`, `/work/orgmind`, `/work/threat-detection`, `/work/roadsaarthi` | 1 | Split-screen case studies |
| `/about` | 1 | Bio, how I work, timeline, currently learning, skills tied to projects |
| `/certifications` | 1 | Four featured, seven listed |
| `/resume` | 1 | Designed summary + embedded PDF + download |
| `/contact` | 1 | Form, email reveal, calendar link, LinkedIn, both GitHubs |
| `/demos` | 1 | Hosted demos with live/down status stamped at build |
| `/security` | 1 (page) / 2 (live check) | Explains headers; Phase 2 adds the live check |
| `/lab` | 2 | phenom only |
| `/404` | 1 | Plain, left-aligned, with the index |
| `/.well-known/security.txt` | 1 | See §8 |

**Navigation:** mark · Work · Lab · About · Certifications · Resume · Contact · **Get in touch** (opens the contact form as a panel) · Reduce 3D · Sound (Phase 2). Mobile: a simple full-width list, no hamburger animation.

**Status strip** (every page, top, one line): "Open to internships. Available from [[PLACEHOLDER: availability date]]." Controlled by `content/status.json` → `open_to_internships: true|false`. Hidden when false.

**Footer:** site map; both GitHub accounts (`github.com/ambulj`, `github.com/Bloated11`); LinkedIn (`linkedin.com/in/ambul`); "Last updated <build date>"; link to `/.well-known/security.txt`; one line: "Hand-built with HTML, CSS and a small amount of JavaScript." No newsletter, no "made with ♥".

---

## 6. Content model

```
content/
  site.json            name, tag, location, work_mode, email_parts, calendar_url, linkedin, github[]
  status.json          open_to_internships, available_from
  graph.json           nodes (positions), edges (type: concept|tech, label, verified:boolean)
  lines.json           per-node opening lines
  certs.json           [{title, issuer, date, credential_id, url, featured, attach_to, verified}]
  timeline.json        [{date, title, detail, kind}]
  about.md             bio, how_i_work[], currently[] (each with updated: YYYY-MM-DD)
  projects/
    inferyx.md  aegisz.md  orgmind.md  threat-detection.md  roadsaarthi.md  phenom.md
```

Project front matter (validated with JSON Schema; the build fails on any missing required field):

```yaml
title: string
slug: string
order: number
summary: string               # one sentence
status: prototype|live|archived
data_note: string             # states synthetic/real data plainly
repo_url: string|null         # null for private repos
repo_private: boolean
demo_url: string|null         # [[PLACEHOLDER]] until supplied
demo_status: live|slow-start|down|none
demo_note: string|null        # e.g. "Free tier; may take a moment to wake."
diagram_verified: boolean     # false → page shows a "draft diagram" tag
stack: { group: [items] }     # grouped lists
metrics: [{measure, value, data, hardware, method, verified}]
changes: [string]             # "What I'd change"
```

Build steps (`scripts/build.mjs`, plain Node 20+): validate content → render Markdown (`marked`, with raw HTML disabled) → prerender every route to HTML → generate the static scene SVG from `graph.json` → bundle JS with esbuild → write `_headers`, `_redirects`, `sitemap.xml`, `robots.txt`, `security.txt` → check demo URLs (HEAD request, 8s timeout) and stamp `demo_status` → print a placeholder/verify report.

---

## 7. Content (draft — owner edits in the files above)

### 7.1 Site facts

- Name: **Ambul Jaiswal** (shown as "Ambul" in the nav mark's accessible name and "Ambul Jaiswal" on pages).
- Tag: *Data science × cybersecurity · B.Tech CSE '28*
- Location: Roorkee, India (IST). Open to remote, hybrid or on-site.
- Email: `ambuljaiswal5@gmail.com` — **must not appear in built HTML.** Store as two parts, assemble on click ("Show email"), and offer the contact form as the main path.
- LinkedIn: `https://www.linkedin.com/in/ambul/`
- GitHub: `https://github.com/ambulj` and `https://github.com/Bloated11`
- Calendar: [[PLACEHOLDER: calendar link]]
- Domain: [[PLACEHOLDER: domain]]

### 7.2 Opening lines (one per node; the Home shows the line of the current node)

| Node | Line |
|---|---|
| Inferyx | Models fail quietly. |
| AegisZ | Privacy should be a property of the system, not a promise. |
| OrgMind | An answer without a source is a guess. |
| AI Threat Detection | Most attacks look normal until you measure them. |
| RoadSaarthi | Infrastructure data only matters if someone acts on it. |
| Lab | Some things I build only to see how they work. |

### 7.3 Projects

Order: Inferyx, AegisZ, OrgMind, AI Threat Detection, RoadSaarthi. phenom lives in `/lab`.

#### Inferyx

- **Summary:** An AutoML studio that keeps going after training: it profiles and repairs data, trains with live telemetry, explains the winner, watches for drift, and exports signed models.
- **Problem (his words, from his April 2026 post):** Building the model is not the hard part. Understanding it, trusting it, monitoring it and knowing when it breaks is.
- **Data note:** [[PLACEHOLDER: which datasets were used for the demo and benchmarks]]
- **Architecture (draw this):**
  1. React 19 single-page studio (seven pages: Overview, Data, Training, Results, Tracking, Monitoring, Tools; state in four contexts).
  2. FastAPI backend with optional JWT and API-key auth and three roles (viewer, editor, admin).
  3. Polars/Arrow data engine: multi-format ingestion, parallel profiling in one pass.
  4. Feature engineering: calendar, lag and leak-free rolling features for time series; `TimeSeriesSplit`.
  5. Dual-mode worker: Celery + Redis when Redis is reachable, otherwise an in-process thread pool; a reaper recovers interrupted jobs at startup.
  6. Training: Optuna Bayesian search; WebSocket telemetry to the UI with HTTP polling fallback.
  7. Results: SHAP and permutation explainability, threshold optimisation, leaderboard.
  8. Export: HMAC-SHA256-signed joblib bundle, plus ONNX and Safetensors; each bundle ships a standalone FastAPI inference service and Dockerfile.
  9. Monitoring: PSI and KS drift detection with webhook alerts.
- **Stack groups:** Backend — Python 3.11, FastAPI, Celery, Redis, SQLAlchemy. Data and ML — Polars, PyArrow, scikit-learn, LightGBM, XGBoost, Optuna, SHAP, ONNX, Safetensors. Frontend — React 19, esbuild, Vitest. Ops — Docker, Docker Compose.
- **Metrics:** [[PLACEHOLDER: measured values, each with dataset, hardware and method. Candidates: test count, profiling time on a named dataset, training time, drift-alert latency.]]
- **Demo:** [[PLACEHOLDER: Hugging Face Space URL]] · note: "Runs full workflows on free infrastructure, so the first load can be slow."
- **Repo:** private. Say: "Source is private. Walkthrough on request."
- **What I'd change (draft):**
  - I'd benchmark it against FLAML or AutoGluon on OpenML datasets, so "AutoML studio" comes with comparative numbers.
  - Authentication is off by default and a default admin key ships with the config. I'd require a configured secret at startup and use separate keys for tokens and for model signing.
  - Model bundles still include signed joblib files. I'd make ONNX or Safetensors the default and drop pickle by default.
- **Callout (`hardening_status: [[VERIFY: fixed | in progress | not started]]`):** A short boxed note, same style as "What I'd change": *Hardening my own tool.* Only keep it if the three issues above are real; update the wording to the true status.

#### AegisZ

- **Summary:** A zero-knowledge AI gateway for clinical and public-welfare records: it strips and tokenises personal data before any model sees it, adds calibrated noise, and records every decision in a tamper-evident, post-quantum-signed ledger.
- **Context:** Built for the IBM Z Datathon, Track 1: Security, Privacy and Responsible AI by Design. Result: [[PLACEHOLDER: outcome, or delete this line]].
- **Data note:** Synthetic records only.
- **Architecture (draw this):**
  1. Ingress (clinical records, welfare applications, HL7/EDI).
  2. Threat detector (ONNX Runtime; Isolation Forest + gradient booster): prompt injection, RBAC escalation, anomalous velocity, insider misuse → quarantine or permit.
  3. PII vault and differential-privacy engine: HMAC-SHA3-256 format-preserving tokens; Laplace noise with ε between 0.1 and 5.0.
  4. Triage model runs only on the sanitised payload.
  5. Audit ledger: SHA3-512 Merkle hash-chain; ML-DSA-65 signatures (FIPS 204); ML-KEM-768 metadata (FIPS 203); public verify endpoint.
  6. CBOM scanner (CycloneDX 1.6) that flags classical keys exposed to "harvest now, decrypt later".
  7. React command center with WebSocket stream; multi-arch Docker including `linux/s390x`.
- **Stack groups:** Backend — Python 3.11, FastAPI, ONNX Runtime. Security — HMAC-SHA3-256, Laplace DP, ML-DSA-65, ML-KEM-768, CycloneDX. Frontend — React, Tailwind, WebSockets. Ops — Docker, multi-arch images, pytest.
- **Metrics (from README, all `verified:false`):**
  - Inference latency ~380 µs. [[VERIFY: measured on what hardware? State if it ran on a laptop CPU with ONNX Runtime rather than IBM Z.]]
  - ε range 0.1–5.0 in the sandbox. (Design parameter, not a measurement.)
  - Seven requirement checks marked verified in the README. [[VERIFY: link each to a test.]]
- **Repo:** `https://github.com/ambulj/AegisZ`. **Demo:** [[PLACEHOLDER]]
- **What I'd change (draft):**
  - The ~380 µs figure is the IBM Z target unless I've measured it there. I'd publish a measured number with the hardware and method.
  - Triage was checked on synthetic records. I'd evaluate on a public synthetic clinical set such as Synthea and report calibration, not only accuracy.
  - I'd make the differential-privacy budget cumulative across a session, if it isn't already, so repeated queries can't quietly erode it.

#### OrgMind

- **Summary:** A company knowledge graph with an agent on top. Every answer cites a source that exists in the graph and that the asker is allowed to see.
- **Data note:** A synthetic company ("Northwind Labs"), labelled as synthetic throughout the UI.
- **Architecture (draw this):**
  1. Connectors → an eight-stage, retryable ingestion pipeline (arq worker + Redis).
  2. FalkorDB knowledge graph (OpenCypher) + PostgreSQL for users, workspaces, jobs and the audit log.
  3. Agent: provider-agnostic LiteLLM tool loop with a grounding validator and allow-listed, parameterised Cypher tools.
  4. FastAPI REST + SSE (24 endpoints, OpenAPI 3.1); an MCP server with 11 tools.
  5. Next.js 14 web app (Ask, Graph Explorer with Cytoscape, Decision Lineage, Reviews).
  6. Governance: four roles (admin, editor, viewer, auditor); untrusted-data delimiters against prompt injection; two-phase, role-gated actions; bitemporal supersession instead of deletion.
- **Stack groups:** Backend — Python 3.11+, FastAPI, SQLAlchemy, arq, Redis, PostgreSQL 16, FalkorDB, LiteLLM. Frontend — Next.js 14, React 18, TypeScript, Tailwind, Cytoscape.js. Quality — pytest (48 tests), Ruff, Mypy, pre-commit. Ops — Docker Compose.
- **Metrics:** 48 automated tests (`verified` once run output is recorded); 24-question evaluation harness (results: [[PLACEHOLDER: publish scores]]); 24 documented endpoints.
- **Repo:** `https://github.com/ambulj/OrgMind`. **Demo:** [[PLACEHOLDER]]
- **What I'd change (draft):**
  - The graph runs on a synthetic company. I'd ingest a real, public corpus to test entity resolution on messy data.
  - Slack, Drive, Jira and GitHub connectors are specified in the docs. I'd ship one end to end instead of four contracts.
  - I'd publish the 24-question benchmark results so the grounding claims can be checked.

#### AI Threat Detection System

- **Summary:** A network-traffic anomaly detector that scores flows with an Isolation Forest, assigns a severity, and raises alerts on a live dashboard.
- **Data note:** Trained and evaluated on synthetic traffic (85% normal, 15% injected port scans, DDoS, exfiltration and brute force).
- **Architecture (draw this):** traffic generator → real-time traffic analyser (windowed buffer) → Isolation Forest on flow features (ports, protocol, packet size, duration, rate, entropy, bytes) → severity scoring (low to critical) → alert system → Flask dashboard and JSON API. The repository also contains modules for alert correlation, kill-chain mapping, SIEM and Kafka integration. [[VERIFY: which of these run end to end; draw only those that do.]]
- **Stack groups:** Python, Flask, scikit-learn, Pandas, NumPy, Plotly, SQLite.
- **Metrics (from README, all `verified:false`):** ~92% detection accuracy; ~3–5% false-positive rate; <1 ms per flow; "35% fewer false positives than rule-based". [[VERIFY: for each, the dataset split, the rule-based baseline used, and the hardware.]]
- **Repo:** `https://github.com/Bloated11/AI-Enhanced-Threat-Detection-System`. **Demo:** [[PLACEHOLDER]]
- **What I'd change (draft):**
  - It was trained and tested on synthetic traffic. I'd re-evaluate on CIC-IDS2017 or UNSW-NB15.
  - I'd report precision, recall and F1 with PR curves instead of one accuracy figure, and document the rule-based baseline behind the false-positive claim.
  - The repo carries three app versions and a README that lists already-built features as future work. I'd consolidate to one entry point.
- **Authorship:** [[VERIFY: confirm this is solely Ambul's work; the README contains another person's local path.]]

#### RoadSaarthi

- **Summary:** A prototype road-condition platform: it generates road-sensor events, scores each road segment, clusters hotspots spatially, and shows them on a live map with work orders.
- **Required wording on the page:** "An independent prototype. It is not an official product of any government body, and its data is synthetic."
- **Architecture (draw this):** synthetic event generator (every 300s) → FastAPI + SQLAlchemy (SQLite, or PostgreSQL/PostGIS) → RPI scoring engine [[VERIFY: expand "RPI"]] → DBSCAN clustering (scikit-learn) → WebSocket → React + MapLibre UI with seven views (command centre, incidents, road history, analytics, fleet, work orders, report).
- **Stack groups:** Backend — Python, FastAPI, SQLAlchemy 2, PostGIS. ML — scikit-learn (DBSCAN). Frontend — React 18, TypeScript, Vite, Tailwind, MapLibre GL, ApexCharts.
- **Metrics:** [[PLACEHOLDER: real, measured values or leave the table empty with the note "No measured results yet"]].
- **Repo:** `https://github.com/ambulj/roads`. **Demo:** [[PLACEHOLDER]]
- **What I'd change (draft):**
  - I'd swap the synthetic data for open pothole and road-condition datasets.
  - I'd show the edge-inference model itself, or drop the "edge AI" label.

#### phenom (Lab, Phase 2)

- **Summary:** A local-first personal assistant: Flask and PyQt5 front ends over a local model served by Ollama, with a memory layer and a set of small service modules.
- **Honest framing:** an experiment in how far one assistant can stretch; the repository has about ninety flat files covering assistant, tracking and home-automation ideas.
- **Repo:** `https://github.com/Bloated11/phenom`.
- **What I'd change (draft):**
  - Split it into a small core with optional plugins, and delete what I don't use.
  - An assistant that executes actions needs an explicit permission model, which I'd design and document.

### 7.4 Certifications

**Featured (shown on `/certifications` first, and as small nodes in the scene):**

| Title | Issuer | Date | Credential |
|---|---|---|---|
| Neo4j Certified Professional | Neo4j | Jun 2025 | https://graphacademy.neo4j.com/c/de5569ae-2ad2-4aab-bd52-8826b559b81e/ |
| Mitigate Threats and Vulnerabilities with Security Command Center (skill badge) | Google | Jun 2025 `[[VERIFY: LinkedIn post says Jul 2025]]` | https://www.credly.com/badges/811748fa-13b8-42a1-b4b9-ba10bd22feb9/linked_in_profile |
| Junior Cybersecurity Analyst Career Path | Cisco | Jun 2025 | https://www.credly.com/badges/dbdf16ff-c826-4aea-8ecf-dcfe012e118a/linked_in_profile |
| Summer Analytics 2025 (top 25%) | Consulting & Analytics Club, IIT Guwahati | **Apr 2025** | https://certificate.givemycertificate.com/c/2bae8ea1-ddbf-4fd1-bf74-c4035f1ee688 |

**Listed:**

| Title | Issuer | Date | Credential |
|---|---|---|---|
| Summer Analytics 2026 | Consulting & Analytics Club, IIT Guwahati | Apr 2026 | https://certificate.givemycertificate.com/c/853f0550-8241-4cd5-9aa5-380e6a19325f |
| Deloitte Australia — Cyber Job Simulation | Forage | Jun 2025 | ID `GFdR3HuoXgPbbAgaL` · [[PLACEHOLDER: certificate URL]] |
| Deloitte Australia — Data Analytics Job Simulation | Forage | Jun 2025 | ID `JH7GuQwbw4XADzQNS` · [[PLACEHOLDER: certificate URL]] |
| Introduction to Cybersecurity | Cisco | Jun 2025 | https://www.credly.com/badges/8677e3b9-26c4-4f32-93b1-595c55f0736c/linked_in_profile |
| Data Analysis with Python | IBM SkillsBuild | Dec 2024 | https://courses.yl-ptech.skillsnetwork.site/certificates/47fa7a9840ad43968538cba0ddc31df3 |
| Basics of AI/ML workshop (with GeeksforGeeks) | Cognizance, IIT Roorkee | Nov 2024 | https://hyperstack.id/credential/98a70134-cbe2-4e1f-9015-7bfe84980cec |

Do **not** include the duplicate "Summer Analytics 2025" entry attributed to "United Latino Students Association". All credential links open in a new tab with `rel="noopener noreferrer"`.

### 7.5 Timeline (About)

A timeline is a real sequence, so dates are used as the structure.

| Date | Entry |
|---|---|
| Aug 2024 | Began B.Tech CSE at UTU |
| Nov–Dec 2024 | AI/ML workshop (Cognizance, IIT Roorkee); IBM SkillsBuild Data Analysis with Python |
| Mar 2025 | Hack-N-Win 2.0, 24-hour hackathon, CGC Jhanjeri |
| Apr 2025 | Summer Analytics 2025, IIT Guwahati (top 25%; capstone on real-time ticketing with streaming data, Aug 2025) |
| May–Jul 2025 | Cyber Security Analyst intern, Workstreet (remote) — [[PLACEHOLDER: what I did]] |
| Jun–Aug 2025 | Cybersecurity intern, NIIT Foundation (remote) — [[PLACEHOLDER: what I did]] |
| Jun 2025 | Neo4j, Google Cloud, Cisco and Deloitte certifications |
| Dec 2025 | Campus Ambassador, Open Source Connect |
| Mar 2026 | Hack-N-Win 3.0, Top Performers |
| Apr 2026 | Summer Analytics 2026; Inferyx released publicly |

### 7.6 About page

**Bio (draft, two paragraphs, edit freely):**

> I'm a third-year B.Tech CSE student in Roorkee. I build machine-learning systems and then try to break them: check the data before training, sign the model before loading it, watch for drift, and show where an answer came from.
>
> Most of my projects are prototypes on synthetic data, and each page says so. I'm looking for an internship in security-focused data science, remote or on-site.

**How I work (draft; keep only what is true):**
- I scan data for leakage before I train.
- I compare holdout against live data to catch drift.
- I sign and verify model files before loading them.
- A system should cite a source for every claim it makes.
- Synthetic data is labelled as synthetic, everywhere.

**Currently learning and building:** [[PLACEHOLDER: three short items, each with an "updated" date]]

**Skills:** no separate section and no percentage bars. Skills appear only as grouped lists inside each project (§7.3). A short "Learning" list may hold items without a project yet.

### 7.7 Resume (`/resume`)

Designed summary (education, experience, certifications) + an embedded PDF (`<object>`/`<embed>` from the same origin) + a "Download resume" button. If the PDF is missing, show: "Resume PDF not uploaded yet." [[PLACEHOLDER: resume PDF at `/public/resume.pdf`]]

---

## 8. Contact and security

### 8.1 Contact

- Form fields: name, email, message (max 2,000 chars). Validation on both sides.
- `functions/api/contact.js` (Cloudflare Pages Function): verify the Cloudflare Turnstile token, check `Origin`, enforce length limits, apply a simple per-IP rate limit, then deliver the message to the owner's address. **Store nothing.** Delivery method: [[VERIFY: pick the current free option from Cloudflare's docs at build time — e.g. Email Routing to a verified address, or a free-tier mail API — and record the choice in STATUS.md]].
- The function stays within the free plan (100,000 requests/day, 10 ms CPU). Pages is set to fail open so the static site survives a quota hit.
- Email is revealed on click from two stored parts. It must not be present in any built `.html`. Add a test.
- Also on the page: calendar link, LinkedIn, both GitHub accounts.

### 8.2 Headers (`public/_headers`)

Starting point. **Verify the Turnstile and Cloudflare Analytics entries against their current documentation before shipping**, and keep the list as short as it will go.

```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' https://challenges.cloudflare.com https://static.cloudflareinsights.com; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://api.github.com https://cloudflareinsights.com; frame-src https://challenges.cloudflare.com; object-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Resource-Policy: same-origin
```

- No `'unsafe-inline'` or `'unsafe-eval'`. No inline `<script>`, no inline event handlers, no `style=""` attributes in markup. Set dynamic styles through CSSOM or classes.
- The only third-party origins are: Cloudflare Turnstile, Cloudflare Web Analytics (cookie-free), and `api.github.com` (Phase 2 feed). The `/security` page lists each and why it exists.
- Add `Cache-Control: public, max-age=31536000, immutable` for hashed assets and `no-cache` for HTML.
- Do not add `preload` to HSTS until the owner confirms the domain is ready.

### 8.3 `/.well-known/security.txt`

```
Contact: https://[[domain]]/contact
Expires: [[PLACEHOLDER: a date under 12 months from publishing]]
Preferred-Languages: en
Canonical: https://[[domain]]/.well-known/security.txt
```

### 8.4 `/security` page

Plain page: a table with one row per header (name · what it blocks · why it is set here), then the three third-party exceptions. **Phase 2:** a "Check this page" button fetches `location.href` with `HEAD` (same origin) and shows each expected header with a pass/fail mark. Nothing leaves the site. Do not claim the site logs or blocks visitors.

---

## 9. Interaction layer (Phase 2)

### 9.1 Navigation and transitions

- Each route is a real HTML file. JS intercepts same-origin link clicks, fetches the next HTML, swaps `<main>`, updates `<title>` and focus, and calls `history.pushState`. The canvas lives outside `<main>` and is never torn down.
- Use the **View Transitions API** for the content swap where supported (`document.startViewTransition`); otherwise swap instantly.
- Between sections: the camera continues its move while text cross-fades in place (≈250ms).
- Entering or leaving a case study: one thin `--mark` line (2px) wipes left to right across the top of the viewport (≈350ms), once. This is the only wipe on the site.
- On route change move focus to the new `<h1>` (tabindex −1) and announce the title in an `aria-live="polite"` region. Back/forward must work. Direct loads must work with JS disabled.
- `prefers-reduced-motion`: no camera flight, no wipe, instant swaps.

### 9.2 Custom cursor

- Active only when `(pointer: fine)` and not `prefers-reduced-motion`. Otherwise the native cursor is used.
- A 10px ring in `--ink`. Over links and nodes it grows to 28px with a `--mark` fill; over text it becomes a thin caret; over form fields and the terminal the native cursor is restored.
- Never hide the native cursor until the custom one has rendered; restore it on `visibilitychange`, on error, and when the pointer leaves the window.

### 9.3 Sound (off by default; two independent switches)

- Web Audio API only. **No audio files.** Created inside a user gesture. Both switches persist in `localStorage` (`sound.ambient`, `sound.ui`).
- Ambient: two detuned sine oscillators near 55 Hz and 82 Hz, gain ≤ 0.02, a very slow LFO; pitch shifts a few cents with camera progress.
- UI: a ~20 ms filtered-noise tick on node hover and click, gain ≤ 0.04.
- `prefers-reduced-motion` forces both off.

### 9.4 Live GitHub feed (Phase 2)

- Fetch `https://api.github.com/users/<name>/repos?per_page=100&sort=pushed` for both accounts from the browser; cache the response in `sessionStorage` for 10 minutes; on any failure or rate limit, render the **build-time snapshot** and say "Showing the last saved list."
- Show: repo name, primary language, last-push date. **Do not show stars, forks or commit counts.**
- Render API data as text only (`textContent`). Never inject it as HTML.
- Private repos (Inferyx) do not appear in the feed; the Work page covers them.

---

## 10. Hidden features (Phase 3)

All run in the browser. Nothing is sent anywhere, and no cookies are set. Progress is stored in `localStorage` under `secrets` (an array of ids). Each feature is labelled as a simplified demonstration of an idea from the projects, not the real implementation.

**Discovery:** (1) a `hint` command in the terminal gives a vague clue for the next unfound secret; (2) subtle visual clues: a faint 1-frame glitch on one heading, an odd character in a footer line; (3) a "Secrets found: n of 8" counter that appears in the footer only after the first discovery.

| # | Feature | Spec |
|---|---|---|
| 1 | **Terminal** | Opens with the backtick key or from a footer link. Commands: `help`, `projects`, `certs`, `contact`, `theme` (explains it follows the system), `hint`, `secrets`, `clear`. Plex Mono. Escape closes. Focus trapped while open. Output is built with `textContent`. |
| 2 | **CTF-style puzzle** | `hint` → a base64 string inside the view-source note → decoded passphrase → typing it in the terminal (`unlock <phrase>`) compares its SHA-256 to a stored hash and reveals a short recruiter note ([[PLACEHOLDER: note text]]). State plainly in the view-source note that this is a game, not access control; nothing sensitive sits behind it. |
| 3 | **View-source note** | An HTML comment at the top of `index.html` and a `/colophon` route: how the scene, transitions and build work. Plain, short, first person. |
| 4 | **Konami intrusion mode** | Sequence ↑↑↓↓←→←→ B A. The scene tints to `--fault`; a mock IDS log prints a few lines such as `input sequence anomaly score 0.71 (threshold 0.60) → flagged`. No flashing faster than 3 per second. Disabled under `prefers-reduced-motion`. Esc exits. |
| 5 | **Tamper-detection chain** | On the AegisZ page: five blocks, each hash = SHA-256 (Web Crypto) of its data + previous hash. Editing one block turns every later block `--fault` and prints "chain invalid at block n". Labelled "Simplified. The real ledger uses SHA3-512 and ML-DSA-65." |
| 6 | **Differential-privacy blur** | On About, clicking "Roorkee, India" shows city-level coordinates with Laplace noise added and an ε slider (0.1–5.0); 50 sampled points plotted on a plain SVG axis. Use only the public city centroid, never a precise location. |
| 7 | **Anomaly hunt** | On the Threat Detection page: a seeded scatter of 200 points with ~6 outliers. The visitor clicks suspected anomalies; the page then reveals each point's score from a small in-browser isolation-forest implementation. |
| 8 | **Drift slider** | On the Inferyx page: reference vs. live distribution, a slider that shifts mean and variance, a live PSI over 10 bins with warning (0.10) and critical (0.25) thresholds. [[VERIFY: match Inferyx's own thresholds.]] |

Left out on purpose: hidden text aimed at AI résumé screeners, fake honeypot pages, and any claim that the site logs visitors.

---

## 11. Accessibility and performance

- WCAG 2.2 AA. Visible focus: 2px `--ink` outline with a 2px `--mark` offset ring. Skip link first in the DOM. Landmarks. One `<h1>` per page.
- All interactive scene functions are reachable by keyboard through the Index list and the nav; the terminal and secrets are reachable by keyboard.
- Respect `prefers-reduced-motion`, `prefers-color-scheme`, `prefers-reduced-data` (skip the scene and fonts beyond the critical two).
- No content depends on hover. Targets ≥ 44×44px on touch.
- Budgets (gzip): HTML + CSS per page < 60 KB; main JS < 40 KB; scene chunk < 220 KB; fonts critical path < 90 KB; initial image weight < 150 KB.
- Targets: Lighthouse accessibility ≥ 95 and best-practices ≥ 95 on every page; performance ≥ 90 on the mobile profile (static scene); performance ≥ 80 on the desktop profile with the scene. LCP < 2.5s and CLS < 0.05 under throttling. Record real results; do not round up.

---

## 12. Phases and verification gates

Build in order. **Do not start a phase until the previous phase's gate passes**, and do not mark a phase done without evidence. Maintain `STATUS.md` in the repo root: for each gate, the exact command run and its real output (trimmed), pass/fail, and anything not verified. A gate that was not run is reported as "not run", never as passed.

### Phase 1 — Core

Scope: build system and content validation; prerendered routes; Home with the scene (tiers 0–2, GPU check, Reduce 3D switch); Work index and the five case studies (split screen, diagrams marked draft); About; Certifications; Resume; Contact (form + email reveal); Demos; `/security` (static); 404; status strip; light/dark; headers; security.txt; sitemap/robots; Cloudflare Web Analytics.

Gate 1:
1. `npm run build:dev` succeeds; content validation passes; placeholder report generated.
2. `npm run build:prod` **fails** while placeholders remain (prove it once), and a test confirms the email address is absent from built HTML.
3. Playwright: every route returns 200; each page has one `<h1>`; no console errors; **zero CSP violations** (listen for `securitypolicyviolation`).
4. `curl -sI` against the local preview (or the deployed preview) shows every header in §8.2.
5. axe-core: zero serious or critical violations on every route in both colour schemes.
6. Contrast script confirms every token pair in §3.1 in both themes.
7. Keyboard-only run: reach every control, skip link works, focus is visible, no trap.
8. JS disabled: all content readable and all links work.
9. Mobile (390px) and `prefers-reduced-motion`: static scene, no WebGL context created.
10. Throttled run (CPU 4×): scene reaches tier 1 or the offer to reduce 3D appears; Reduce 3D persists across reload.
11. Lighthouse results recorded for `/`, `/work/inferyx`, `/about` on mobile and desktop.
12. Link checker passes; demo URLs checked and statuses stamped.

### Phase 2 — Interaction

Scope: client-side navigation with persistent canvas; View Transitions; wipe line; pinned-diagram highlighting; custom cursor; sound; `/lab`; live GitHub feed with snapshot fallback; `/security` live header check; Open Graph image.

Gate 2: all Gate 1 checks still pass, plus
1. Navigation works back/forward, with direct loads, and with JS disabled.
2. Focus moves to the new `<h1>` and the live region announces it (assert in Playwright).
3. Reduced motion: no flight, no wipe, native cursor, sound forced off.
4. Sound is silent until the user enables it (assert no `AudioContext` running at load); no audio requests in the network log.
5. GitHub feed: simulate a 403 and a network failure; the snapshot renders and the message appears; an injected `<img onerror>` in a repo name renders as text.
6. Live header check page reports every §8.2 header as present.
7. Cursor falls back to native on touch and over form fields.

### Phase 3 — Hidden features

Scope: the eight features in §10.

Gate 3: all earlier gates pass, plus
1. No network request is made by any hidden feature; no cookies exist (assert `document.cookie === ''`).
2. Konami mode never flashes faster than 3 Hz (frame-timing test) and is off under reduced motion.
3. Each hash-chain edit invalidates every later block; the puzzle hash check passes only for the right phrase.
4. Terminal output cannot inject HTML (test with `<script>` and `<img onerror>` input).
5. The secrets counter appears only after the first discovery and survives a reload.

---

## 13. Placeholder register (owner supplies)

| Item | Where |
|---|---|
| Domain | `site.json`, `security.txt`, sitemap |
| Calendar link | `site.json` |
| Demo URL and status for each project | `projects/*.md` |
| Resume PDF | `public/resume.pdf` |
| Availability date | `status.json` |
| Workstreet and NIIT role descriptions | `timeline.json` |
| IBM Z Datathon result (or delete the line) | `projects/aegisz.md` |
| Dataset, hardware and method for every metric | `projects/*.md` |
| Corrections to every draft diagram (then `diagram_verified: true`) | `projects/*.md` |
| Forage certificate URLs (two) | `certs.json` |
| "Currently learning" items | `about.md` |
| CTF recruiter note | `content/secrets.json` |
| Confirm Google badge date; confirm Threat Detection authorship; expand "RPI"; confirm graph edges | `[[VERIFY]]` tokens |
| Repo cleanup (remove `app_v2.py`/`app_v3.py`, committed `.db` and `__pycache__`, stray local paths in READMEs; add `.gitignore`) | the repos themselves |

---

## 14. Banned patterns (self-check before every phase gate)

- Gradients, glass, glow, bloom, particles, drop shadows, blur
- Rounded-card grids, one radius everywhere, icon-in-a-circle
- Centred hero, "Hi, I'm …", gradient or accent-word headlines
- Cream background with a terracotta/clay accent; near-black with an acid-green or vermilion accent
- Fade-up on every section; hover lifts; animated counters
- ALL-CAPS eyebrows; numbered markers on non-sequences; "→" on every link; tinted-black text
- Skill percentage bars; testimonial carousels; stock-photo or AI-generated imagery
- The words listed in §2
- Any third-party script, font or image host beyond §8.2
