---
phase: "05"
phase_slug: "cloudflare-workers-ai-neural-research-copilot"
status: "planned"
date: "2026-10-19"
author: "gsd-planner"
requirements:
  - AI-01
  - AI-02
  - AI-03
  - CONTENT-04
---

# Phase 5: Cloudflare Workers AI Neural Research Copilot — Execution Plan

<phase_header>
Phase: 05 — Cloudflare Workers AI Neural Research Copilot
Goal: Deliver an edge-native, zero-hallucination Neural Research Copilot powered by Cloudflare Workers AI and pre-indexed Vector RAG chunks across Ambul's 5 case studies, research papers, certifications, and background. Package the experience in a floating Mission HUD monospace terminal drawer accessible via global hotkey (Backtick `` ` ``) and bottom bar launcher, featuring Server-Sent Events (SSE) streaming token output, verified source citation pills, and Unix shell utilities with a hidden CTF challenge token (`FLAG{AMBUL_CYBER_ML_2026}`). Complement the copilot with interactive cybersecurity easter eggs: an interactive Konami Code intrusion alarm override and a client-side Differential Privacy Laplace mechanism demonstration with tunable epsilon on `/contact` and `/lab`.
Outputs:
  - Knowledge Base RAG pre-computation build script (`scripts/build-rag-index.mjs`) extracting chunks from all 5 case studies, about profile, certs, and timeline into `public/data/knowledge-base.json`.
  - Client-side semantic retriever & citation resolver (`src/lib/ai/knowledge-retriever.ts`) with BM25/keyword scoring, token TF-IDF, citation linking (`[REF: slug#anchor]`), and anti-hallucination prompt assembly.
  - Edge Cloudflare Pages Function (`functions/api/copilot.ts`) implementing Server-Sent Events (SSE) streaming with `@cf/meta/llama-3-8b-instruct`, sub-500ms TTFT, and Vectorize grounding.
  - Zero-dependency local preview SSE server mock (`scripts/preview.mjs` route `/api/copilot`) and offline client fallback simulating 15–25ms token chunk streaming for deterministic testing.
  - Mission HUD Neural Copilot Terminal (`src/components/copilot/CopilotTerminal.tsx`, `src/components/copilot/CitationPill.tsx`, `src/components/copilot/CopilotLauncher.tsx`) with global hotkey, focus trap, command palette (`/help`, `/projects`, `/clear`, `/metrics`, `/privacy`, `/exit`), suggested queries, and streaming response renderer.
  - Interactive Unix Shell & CTF challenge (`cat flag.txt`, `whoami`, `ls`, `nmap`) embedded into the terminal console.
  - Interactive Konami Code Intrusion Alarm (`src/components/easter-eggs/KonamiIntrusionOverlay.tsx`) with high-contrast `--fault` visual styling, non-jarring Web Audio frequency sweep, and escape dismissal.
  - Differential Privacy Demonstration Widget (`src/components/privacy/DifferentialPrivacyDemo.tsx`) implementing the Laplace mechanism ($\Delta f / \epsilon$) with interactive slider ($\epsilon \in [0.1, 5.0]$) and real-time SVG scatter plot.
  - Global layout integration (`src/app/layout.tsx`, `src/components/layout/HudBottomBar.tsx`, `src/app/contact/page.tsx`, `src/app/lab/page.tsx`).
  - Automated Gate 5 Playwright test suite (`tests/gate5-copilot.spec.ts`) with 7 comprehensive assertions validating toggles, streaming, citations, shell commands, CTF flag, Konami mode, differential privacy, and 0 console errors.
</phase_header>

---

## Architectural & Execution Flow Overview

```
+--------------------------------------------------------------------------------------------------------------------+
|                                    GLOBAL HUD VIEWPORT (src/app/layout.tsx)                                        |
|                                                                                                                    |
|  [HudTopBar: TIME | WORK | ABOUT | CERTS | LAB | CONTACT]                                                          |
|                                                                                                                    |
|  +--------------------------------------------------------------------------------------------------------------+  |
|  |  MISSION HUD NEURAL COPILOT TERMINAL DRAWER (role="dialog", aria-modal="true", Key: Backtick `)             |  |
|  |                                                                                                              |  |
|  |  [●] NEURAL COPILOT // SEC-ML RESEARCH ASSISTANT [v2.4-EDGE]                                          [ESC] |  |
|  |  ──────────────────────────────────────────────────────────────────────────────────────────────────────────  |  |
|  |  > Connected to edge: @cf/meta/llama-3-8b-instruct                                                           |  |
|  |  > Type /help or enter a research query. Try: [Tell me about Inferyx] [AegisZ zero-knowledge gateway]        |  |
|  |                                                                                                              |  |
|  |  User: What hardware was AegisZ evaluated on?                                                                |  |
|  |  Copilot: AegisZ was benchmarked targeting IBM Z (s390x) architectures, with validation runs evaluated      |  |
|  |           locally using ONNX Runtime CPU pipelines [REF: aegisz#results].                                    |  |
|  |                                                                                                              |  |
|  |  Terminal Shell:                                                                                             |  |
|  |  copilot@ambul.dev:~$ cat flag.txt                                                                           |  |
|  |  [!] FLAG{AMBUL_CYBER_ML_2026} (Hash: 8b1a9953c4611296a827abf8c47804d7)                                     |  |
|  |  copilot@ambul.dev:~$ █                                                                                      |  |
|  +--------------------------------------------------------------------------------------------------------------+  |
|                                                                                                                    |
|  [CanvasDeckContainer (3D Globe)]  |  [ModularDataDeck: Active Route Page (/contact, /lab, /work)]                 |
|                                    |    ├── /contact: Location + DifferentialPrivacyDemo (Laplace slider ε)        |
|                                    |    └── /lab: SOC Telemetry Visualizer + Privacy Demo & Lab Experiments        |
|                                                                                                                    |
|  [HudBottomBar: SYS: NOMINAL | HOST: ambul.dev | [AI COPILOT (`)] | RESUME | SECURITY.TXT | COLOPHON]              |
|                                                                                                                    |
|  [KonamiIntrusionOverlay: Listening for ↑ ↑ ↓ ↓ ← → ← → B A -> Fault Theme Override + Alert Audio Pulse]         |
+--------------------------------------------------------------------------------------------------------------------+
```

### Request & Streaming Architecture
```
[Client Terminal] ── POST /api/copilot ──> [Cloudflare Pages Function (functions/api/copilot.ts)]
         │                                       │ (env.AI available?)
         │                                       ├── YES: @cf/meta/llama-3-8b-instruct + Vectorize RAG Context
         │                                       │        Stream tokens via Server-Sent Events (SSE)
         │                                       └── NO / LOCAL: Handled by scripts/preview.mjs /api/copilot
         │                                                       SSE stream from pre-indexed knowledge base
         ▼
[Offline Fallback] ── If network unreachable ──> [src/lib/ai/knowledge-retriever.ts (Local BM25 + Typewriter)]
```

---

## Tasks

### <task 1: Tracer - Knowledge Base RAG Index Builder & Retrieval Engine>
- **Type**: tracer
- **Files to create/modify**:
  - `scripts/build-rag-index.mjs` (pre-computation script parsing case studies, markdown frontmatter, JSON files, and generating verified semantic chunks)
  - `public/data/knowledge-base.json` (compiled static knowledge base artifact containing chunks, tags, citations, and metrics)
  - `src/lib/ai/knowledge-retriever.ts` (TypeScript RAG retriever, BM25/keyword scorer, citation resolver, and strict anti-hallucination prompt generator)
  - `package.json` (add `build:rag` script and chain it into `build`)
- **Action Steps**:
  1. Author `scripts/build-rag-index.mjs`:
     - Read markdown files from `content/projects/*.md` (inferyx, aegisz, orgmind, threat-detection, roadsaarthi, phenom).
     - Read `content/about.md`, `content/timeline.json`, `content/certs.json`, `content/site.json`, `content/status.json`.
     - Chunk documents into logical semantic sections (Overview, Architecture, Security & Privacy, Metrics & Results, Limitations & Retrospective).
     - Attach citation metadata to every chunk: `id`, `source`, `ref` (e.g. `inferyx#architecture`, `aegisz#results`), `title`, `tags`, `content`, and verified `metrics`.
     - Output JSON array to `public/data/knowledge-base.json`.
  2. Author `src/lib/ai/knowledge-retriever.ts`:
     - Define `KnowledgeChunk` and `RetrievedResult` interfaces.
     - Implement multi-term keyword & token BM25 scoring algorithm over `tags`, `title`, and `content`.
     - Implement `findRelevantChunks(query: string, chunks: KnowledgeChunk[], topK = 3): KnowledgeChunk[]`.
     - Implement strict anti-hallucination prompt template:
       - Rules: Require citation format `[REF: slug#anchor]`, disclaim private code (Inferyx), disclaim prototype status (RoadSaarthi), disclaim synthetic data (AegisZ, Threat Detection), refuse out-of-scope personal queries.
     - Implement deterministic offline synthesizer: generate grounded responses directly from matched chunks when offline or when using the fallback engine.
  3. Update `package.json`:
     - Add `"build:rag": "node scripts/build-rag-index.mjs"`.
     - Prepend `npm run build:rag &&` to `build`, `build:dev`, and `build:prod`.
- **Verification Commands**:
  - `node scripts/build-rag-index.mjs` successfully generates `public/data/knowledge-base.json` with all 6 projects and >25 verified chunks.
  - `npx tsc --noEmit` verifies `src/lib/ai/knowledge-retriever.ts` without errors.
</task>

---

### <task 2: Cloudflare Workers AI Edge Pages Function & Local Preview SSE Server>
- **Type**: expansion
- **Files to create/modify**:
  - `functions/api/copilot.ts` (Cloudflare Pages Function handling `POST /api/copilot` with Workers AI `@cf/meta/llama-3-8b-instruct` and SSE streaming)
  - `scripts/preview.mjs` (add mock `/api/copilot` endpoint supporting streaming SSE responses in local development & Playwright test environment)
- **Action Steps**:
  1. Author `functions/api/copilot.ts`:
     - Handle `onRequestPost(context)` with `@cloudflare/workers-types`.
     - Parse `{ query: string, history?: { role: string, content: string }[] }` from request body.
     - Load embedded chunks or query Vectorize index if available.
     - Construct system prompt with matched RAG chunks and strict citation constraints.
     - Call `context.env.AI.run('@cf/meta/llama-3-8b-instruct', { messages, stream: true, max_tokens: 512, temperature: 0.2 })`.
     - Stream chunks back as Server-Sent Events (`data: {"response": "token"}\n\n`) with headers:
       - `Content-Type: text/event-stream; charset=utf-8`
       - `Cache-Control: no-cache, no-transform`
       - `Connection: keep-alive`
       - `X-Accel-Buffering: no`
     - Provide graceful error fallback if Workers AI is unconfigured or rate-limited.
  2. Enhance `scripts/preview.mjs`:
     - Intercept `pathname === '/api/copilot' && req.method === 'POST'`.
     - Parse request body JSON.
     - Load `public/data/knowledge-base.json` and invoke retrieval matching logic.
     - Set SSE response headers (`text/event-stream`).
     - Emit simulated token stream with realistic 15–25ms intervals using `setInterval` or recursive `setTimeout` until answer and citations are fully flushed.
     - Terminate stream with `data: [DONE]\n\n` and `res.end()`.
- **Verification Commands**:
  - Start preview server and test endpoint:
    `curl -N -X POST http://localhost:8788/api/copilot -H "Content-Type: application/json" -d '{"query":"What is Inferyx?"}'`
  - Assert HTTP 200 with `Content-Type: text/event-stream` and progressive SSE chunks containing verified facts.
</task>

---

### <task 3: Mission HUD Neural Copilot Terminal & Citation Interface>
- **Type**: expansion
- **Files to create/modify**:
  - `src/components/copilot/CitationPill.tsx` (accessible badge linking `[REF: slug#anchor]` to `/work/[slug]#[anchor]` with hover preview tooltip)
  - `src/components/copilot/CopilotTerminal.tsx` (monospaced cyber-terminal modal, SSE reader, history state, command interpreter, keyboard shortcuts, focus trapping)
  - `src/components/copilot/CopilotLauncher.tsx` (floating HUD bottom-bar launcher button with pulsating glow indicator and keyboard shortcut indicator)
  - `src/components/layout/HudBottomBar.tsx` (integrate launcher trigger into global bottom bar)
- **Action Steps**:
  1. Author `src/components/copilot/CitationPill.tsx`:
     - Parse reference token strings formatted as `[REF: slug#anchor]` or `slug#anchor`.
     - Render clickable monospace pill with external link / crosshair icon (`#`).
     - Link directly to project detail route (e.g. `/work/aegisz#results` or `/certifications`).
     - Support keyboard focus, hover contrast (`hover:border-accent-cyan hover:text-accent-cyan`), and ARIA label.
  2. Author `src/components/copilot/CopilotTerminal.tsx`:
     - Implement modal drawer with `role="dialog"`, `aria-modal="true"`, `aria-label="Neural Research Copilot Terminal"`.
     - Focus trap: cyclically trap Tab key within the modal; restore focus to trigger on close.
     - Global key listeners: toggle on Backtick (`` ` ``) key (ignoring inputs/textareas), close on `Escape`.
     - Streaming reader: consume `ReadableStream` from `/api/copilot` using `TextDecoderStream` / `EventSource` parsing, with automatic offline fallback to `src/lib/ai/knowledge-retriever.ts` on network error.
     - Safe rendering: render model output stream without `dangerouslySetInnerHTML`, parsing citation tags `[REF: ...]` dynamically into `<CitationPill />` elements.
     - Command interpreter:
       - `/help`: Display all terminal shortcuts and commands.
       - `/projects`: Display interactive links to all 5 case studies.
       - `/clear`: Wipe terminal output history.
       - `/metrics`: Display table of verified benchmark metrics across Inferyx, AegisZ, Threat Detection, etc.
       - `/privacy`: Navigate or scroll to Differential Privacy demonstration.
       - `/exit`: Close terminal modal.
     - Suggested query chips: `[What is Inferyx?]`, `[AegisZ zero-knowledge gateway]`, `[Verify Certifications]`, `[Hardware benchmarks]`.
  3. Author `src/components/copilot/CopilotLauncher.tsx` & update `HudBottomBar.tsx`:
     - Render HUD terminal button: `[AI COPILOT] [ ` ]` with cyan telemetry dot.
     - Wire `onClick` to toggle global terminal state.
- **Verification Commands**:
  - Run `npx tsc --noEmit` to verify type safety across all copilot components.
  - Test terminal toggles via backtick key and click launcher.
</task>

---

### <task 4: Interactive Cyber Easter Eggs & Differential Privacy Demo (CONTENT-04)>
- **Type**: expansion
- **Files to create/modify**:
  - `src/components/copilot/CopilotTerminal.tsx` (integrate Unix shell command parser & CTF challenge token)
  - `src/components/easter-eggs/KonamiIntrusionOverlay.tsx` (listen for Konami keystrokes, trigger visual fault styling, synthesized alert audio pulse, and SOC IDS overlay)
  - `src/components/privacy/DifferentialPrivacyDemo.tsx` (interactive Laplace mechanism simulator with epsilon slider, real-time noise injection, and SVG coordinate scatter plot)
  - `src/app/contact/page.tsx` (mount `DifferentialPrivacyDemo` alongside Location card)
  - `src/app/lab/page.tsx` (mount `DifferentialPrivacyDemo` in experimental sandbox)
- **Action Steps**:
  1. Add Unix Shell & CTF Flag in `CopilotTerminal.tsx`:
     - Implement command parser for standard Unix commands:
       - `whoami`: Output `ambul_guest_researcher (UID: 1337, GID: 2028 - UTU CSE)`.
       - `ls` / `dir`: List virtual filesystem (`flag.txt`, `inferyx.onnx`, `aegisz_pqc.key`, `system_metrics.log`).
       - `cat flag.txt`: Render cryptographic CTF token:
         ```text
         [!] ACCESS GRANTED:
         FLAG{AMBUL_CYBER_ML_2026}
         Verification Hash: 8b1a9953c4611296a827abf8c47804d7
         State: Recruiter puzzle solved.
         ```
       - `nmap localhost`: Display simulated network scan of active edge services (Port 443 HTTPS, Port 8788 Cloudflare Workers AI, Port 9092 Zeek Telemetry).
  2. Author `src/components/easter-eggs/KonamiIntrusionOverlay.tsx`:
     - Listen on `window.addEventListener('keydown')` for sequence:
       `ArrowUp, ArrowUp, ArrowDown, ArrowDown, ArrowLeft, ArrowRight, ArrowLeft, ArrowRight, b, a` (case-insensitive).
     - When triggered:
       - Set root CSS class `.intrusion-mode` switching accent theme variables to `--fault` (`#FF7A6B` / `#B3261E`).
       - Play gentle synthesized cyber alarm using Web Audio API oscillator (frequency sweep 90Hz -> 140Hz, gain $\le 0.04$, strictly disabled if `prefers-reduced-motion` or audio muted).
       - Display IDS Intrusion Alarm banner:
         ```text
         [CRITICAL ALERT] UNAUTHORIZED SEQUENCE DETECTED (KONAMI_INTRUSION)
         Anomaly Confidence: 0.984 | IDS Rule: SIG-2026-EXPLOIT
         Action: Threat topology isolated. Press ESC to restore system posture.
         ```
       - Dismiss on `Escape` keypress or clicking dismiss button.
  3. Author `src/components/privacy/DifferentialPrivacyDemo.tsx`:
     - Implement numerical Laplace mechanism:
       $$M(x) = f(x) + \text{Laplace}\left(0, \frac{\Delta f}{\epsilon}\right)$$
       using inverse CDF sampling: $Z = -\text{sgn}(U) \cdot b \cdot \ln(1 - 2|U|)$ where $U \sim \text{Uniform}(-0.5, 0.5)$.
     - Center around base coordinates: Roorkee, India ($29.8543^\circ\text{ N}, 77.8880^\circ\text{ E}$) with sensitivity $\Delta f \approx 0.05^\circ$.
     - Provide tunable epsilon range slider: $\epsilon \in [0.1, 5.0]$ with default $1.0$ and step $0.1$.
     - Render interactive SVG scatter plot displaying 50 perturbed coordinate points dynamically dispersing as $\epsilon$ decreases (high privacy / high noise) and clustering tightly as $\epsilon$ increases (low privacy / low noise).
     - Display empirical noise standard deviation ($\sigma = \sqrt{2} \cdot \Delta f / \epsilon$) and AegisZ privacy architecture callout.
  4. Mount `DifferentialPrivacyDemo` into `src/app/contact/page.tsx` and `src/app/lab/page.tsx`.
- **Verification Commands**:
  - Run terminal Unix commands `cat flag.txt` and assert flag string.
  - Trigger Konami sequence and assert intrusion modal appearance.
  - Adjust epsilon slider and assert noise dispersion updates in DOM.
</task>

---

### <task 5: Global Layout Integration & Automated Gate 5 Playwright Test Suite>
- **Type**: expansion
- **Files to create/modify**:
  - `src/app/layout.tsx` (mount `CopilotTerminal` and `KonamiIntrusionOverlay` globally)
  - `tests/gate5-copilot.spec.ts` (comprehensive Playwright end-to-end Gate 5 test suite)
  - `package.json` (register `"test:gate5": "playwright test tests/gate5-copilot.spec.ts"`)
  - `05-VALIDATION.md` (Gate 5 verification signoff and audit documentation)
- **Action Steps**:
  1. Update `src/app/layout.tsx`:
     - Mount `<CopilotTerminal />` and `<KonamiIntrusionOverlay />` alongside top and bottom HUD bars.
  2. Author `tests/gate5-copilot.spec.ts`:
     - **Test 1: Global Terminal Toggles**: Assert terminal drawer opens on Backtick (`` ` ``) keypress and on clicking `[AI COPILOT]` in `HudBottomBar.tsx`. Assert focus is trapped inside dialog. Assert `Escape` key closes terminal and restores focus.
     - **Test 2: SSE Streaming & Citation Resolution**: Submit research query "What is Inferyx?". Assert response text streams progressively (TTFT < 500ms). Assert presence of `<CitationPill />` linking to `/work/inferyx`.
     - **Test 3: Terminal Command Palette**: Execute `/help`, `/projects`, `/metrics`, `/clear`. Assert command outputs match expected formatted text and clear wipes the history.
     - **Test 4: Unix Shell & CTF Flag Verification**: Execute `cat flag.txt`. Assert output contains `FLAG{AMBUL_CYBER_ML_2026}` and verification hash. Execute `whoami` and `nmap`.
     - **Test 5: Konami Code Intrusion Sequence**: Dispatch keystrokes `ArrowUp, ArrowUp, ArrowDown, ArrowDown, ArrowLeft, ArrowRight, ArrowLeft, ArrowRight, b, a`. Assert intrusion banner appears and CSS fault state triggers. Assert `Escape` dismisses intrusion.
     - **Test 6: Differential Privacy Widget**: Navigate to `/contact` and `/lab`. Locate epsilon slider. Change value from 1.0 to 0.2. Assert noise variance updates and SVG scatter points recalculate.
     - **Test 7: Accessibility & Zero Console Errors**: Run `@axe-core/playwright` accessibility audit over Copilot terminal and Differential Privacy widget. Assert 0 console errors across all interactions.
  3. Register `"test:gate5"` in `package.json`.
  4. Author `05-VALIDATION.md` documenting verification run outputs, TTFT benchmarks, and requirement certifications (AI-01, AI-02, AI-03, CONTENT-04).
- **Verification Commands**:
  - `npx tsc --noEmit`
  - `npm run build:prod`
  - `npm run test:gate1`
  - `npm run test:gate2`
  - `npm run test:gate3`
  - `npm run test:gate4`
  - `npm run test:gate5` passes 100% of tests.
</task>

---

## Threat Model & Risk Mitigations

<threat_model>
| Threat ID | Threat Description | Severity | Mitigation Strategy |
|-----------|--------------------|----------|---------------------|
| **T-05-01** | **LLM Hallucination / Fabricated Claims**: LLM generating unverified assertions about Ambul's employment, confidential project source code, or unverified benchmarks. | High | Ground all responses strictly in retrieved chunks from `knowledge-base.json`. Require every assertion to include verified citation references (`[REF: slug#anchor]`). System prompt strictly enforces refusal of unverified facts, notes private repositories (Inferyx), independent prototype status (RoadSaarthi), and synthetic datasets. |
| **T-05-02** | **XSS Injection via Markdown / Token Stream**: Malicious prompt input or model output containing `<script>` or event handlers executed in the user's browser. | Critical | Avoid `dangerouslySetInnerHTML`. Render token stream as structured React text nodes, parsing citation tags deterministically with regex into typed `<CitationPill />` React components. Maintain strict CSP (`connect-src 'self'`). |
| **T-05-03** | **SSE Connection Leak / Memory Accumulation**: Open EventSource or fetch ReadableStream listeners left unclosed on terminal dismiss, leaking background network connections and memory. | Medium | Use `AbortController` bound to the active query. Immediately call `abortController.abort()` if the user closes the terminal, clears the buffer, or submits a new query. |
| **T-05-04** | **Accessibility Focus Trap & Keyboard Navigation**: Terminal dialog fails to trap Tab focus or blocks keyboard navigation, violating WCAG AA compliance. | High | Adhere strictly to WCAG 2.2 AA modal guidelines: implement `role="dialog"`, `aria-modal="true"`, trap focus cyclically using forward and backward Tab handlers, dismiss on `Escape`, and return focus to the previous active element. |
</threat_model>

---

## Verification & Nyquist Gates

<verification>
Execute the following verification checklist to certify Gate 5 completion:

```bash
# 1. Knowledge Base RAG generation
npm run build:rag

# 2. Type check and code integrity
npx tsc --noEmit

# 3. Production build verification
npm run build:prod

# 4. Regression test suites for prior gates
npm run test:gate1
npm run test:gate2
npm run test:gate3
npm run test:gate4

# 5. Phase 5 Gate 5 Neural Copilot test suite
npm run test:gate5
```

### Pass Criteria Checklist
- [ ] Knowledge base build script (`scripts/build-rag-index.mjs`) generates `public/data/knowledge-base.json` indexing all 5 case studies, about profile, certs, and timeline.
- [ ] Cloudflare Pages Function (`functions/api/copilot.ts`) and preview server (`scripts/preview.mjs`) handle `POST /api/copilot` with Server-Sent Events (SSE) streaming tokens.
- [ ] Client seamlessly falls back to offline semantic retrieval if edge is unreachable without throwing unhandled exceptions.
- [ ] Copilot Terminal opens and closes via global hotkey (Backtick `` ` ``), HUD bottom bar launcher, and `Escape` key.
- [ ] Modal dialog traps keyboard focus cyclically and adheres to WCAG 2.2 AA standards.
- [ ] Streaming responses render verified source citation pills linking to project case studies.
- [ ] Terminal command palette (`/help`, `/projects`, `/clear`, `/metrics`, `/exit`) executes cleanly.
- [ ] Unix shell commands (`cat flag.txt`, `whoami`, `ls`, `nmap`) work with CTF flag `FLAG{AMBUL_CYBER_ML_2026}`.
- [ ] Konami code sequence triggers cyber intrusion overlay and gentle synthesized alert audio pulse.
- [ ] Differential Privacy widget demonstrates Laplace mechanism with interactive epsilon slider and real-time SVG scatter plot.
- [ ] All automated tests in `tests/gate5-copilot.spec.ts` pass with 100% success and 0 console errors.
</verification>
