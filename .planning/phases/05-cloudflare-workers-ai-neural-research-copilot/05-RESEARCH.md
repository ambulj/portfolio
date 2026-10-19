# Phase 05: Cloudflare Workers AI Neural Research Copilot — Research Report

## Executive Summary & System Overview

Phase 5 introduces the **Neural Research Copilot**, an edge-native, zero-hallucination interactive AI assistant trained and grounded in Ambul Jaiswal's research papers, case studies, academic background, and security engineering achievements. It completes the hybrid AI vision: combining client-side in-browser WebAssembly ML inference (Phase 3 & 4) with low-latency edge-native LLM generation running on Cloudflare Workers AI.

In addition to the neural research copilot, Phase 5 integrates the remaining interactive cybersecurity artifacts and easter eggs mandated by **CONTENT-04**:
1. **Interactive Terminal Shell & CTF Challenge**: Monospace command console responding to Unix commands (`cat`, `ls`, `whoami`, `nmap`, `help`) with a hidden cryptographic CTF token (`FLAG{AMBUL_CYBER_ML_2026}`).
2. **Konami Code Intrusion Alarm**: Key sequence (`↑ ↑ ↓ ↓ ← → ← → B A`) triggering an interactive cyber intrusion audio-visual alert mode (`--fault` OLED red styling, simulated IDS alert telemetry, escape dismiss).
3. **Differential Privacy Demonstration Widget**: Client-side interactive privacy sandbox implementing the **Laplace Mechanism** on visitor location/telemetry data with a tunable privacy budget slider ($\epsilon \in [0.1, 5.0]$) demonstrating privacy preservation techniques pioneered in the AegisZ project.

---

## 1. Cloudflare Workers AI & Pages Functions Architecture

### 1.1 Serverless Edge Function (`functions/api/copilot.ts`)
Cloudflare Pages uses file-system-based routing under `/functions`. Requests to `/api/copilot` are intercepted and handled at edge datacenters by `functions/api/copilot.ts`.

#### Interface & Typing
```typescript
import type { EventContext } from '@cloudflare/workers-types';

interface Env {
  AI: {
    run: (model: string, input: Record<string, unknown>) => Promise<ReadableStream<Uint8Array> | Record<string, unknown>>;
  };
  VECTORIZE?: {
    query: (vector: number[], options: { topK: number; returnMetadata: boolean }) => Promise<unknown>;
  };
  COPILOT_SECRET_KEY?: string;
}

export async function onRequestPost(context: EventContext<Env, any, any>): Promise<Response> {
  // Edge streaming handling
}
```

#### Streaming Server-Sent Events (SSE) Protocol
- Model: `@cf/meta/llama-3-8b-instruct`.
- Input parameters:
  ```json
  {
    "messages": [
      { "role": "system", "content": "..." },
      { "role": "user", "content": "..." }
    ],
    "stream": true,
    "max_tokens": 512,
    "temperature": 0.2
  }
  ```
- Workers AI returns a `ReadableStream<Uint8Array>` in Server-Sent Events format (`data: {"response": "token"}\n\n`).
- Headers returned to client:
  ```http
  Content-Type: text/event-stream; charset=utf-8
  Cache-Control: no-cache, no-transform
  Connection: keep-alive
  X-Accel-Buffering: no
  ```

### 1.2 Dual-Mode Architecture: Production vs. Local Preview Mock
In static export mode (`output: 'export'`), Next.js produces static HTML/JS bundles. Cloudflare Pages binds `functions/` automatically in production. For local development, testing, and continuous integration:

1. **Production Edge Worker (`functions/api/copilot.ts`)**:
   - Executes inside Cloudflare edge V8 isolate.
   - Accesses `env.AI` directly for sub-300ms Time-To-First-Token (TTFT).
   - Injects relevant RAG context chunks from the vector store or embedded knowledge base.
2. **Local Preview Server (`scripts/preview.mjs`)**:
   - Serves static build from `out/` or `dist/`.
   - Intercepts `POST /api/copilot`.
   - Simulates streaming SSE response with token chunking (e.g. 15-25ms per token stream) using a deterministic query analyzer and pre-indexed knowledge base from `public/data/knowledge-base.json`.
3. **Offline Client Fallback**:
   - If the network fails, or if `/api/copilot` is unreachable, `CopilotTerminal.tsx` seamlessly falls back to in-browser query matching against `public/data/knowledge-base.json`, typing out grounded answers locally without crashing.

---

## 2. Knowledge Base & Vector RAG Pipeline

### 2.1 Indexing Script (`scripts/build-rag-index.mjs`)
A deterministic indexing pipeline runs prior to build time (`npm run build`), extracting structured knowledge chunks from:
- Case studies: `content/projects/inferyx.md`, `aegisz.md`, `orgmind.md`, `threat-detection.md`, `roadsaarthi.md`, `phenom.md`.
- Profile & methodology: `content/about.md`, `content/timeline.json`.
- Certifications & credentials: `content/certs.json`.
- Site metadata & contact: `content/site.json`, `content/status.json`.

#### Output Artifact: `public/data/knowledge-base.json`
Each chunk contains:
```typescript
export interface KnowledgeChunk {
  id: string;               // e.g. "inferyx-overview", "aegisz-security-pqc"
  source: string;           // e.g. "Inferyx Case Study", "AegisZ", "Certifications"
  ref: string;              // Anchor tag / citation identifier, e.g. "inferyx#architecture"
  title: string;
  tags: string[];
  content: string;          // Verbatim text chunk verified against project facts
  metrics?: { measure: string; value: string; method: string }[];
}
```

### 2.2 Semantic Retrieval Strategy
1. **Keyword BM25 & Token TF-IDF Matching**:
   - Rapid multi-term scoring over `tags`, `title`, and `content`.
   - Extracts top $k=3$ relevant chunks.
2. **Context Window Assembly**:
   - System prompt dynamically injects the top relevant chunks into the prompt context window before calling the model:
   ```text
   VERIFIED CONTEXT CHUNKS:
   [REF: inferyx#architecture] Inferyx architecture: React 19 single-page studio with FastAPI backend...
   [REF: aegisz#results] AegisZ target inference latency: ~380us benchmarked with ONNX Runtime...
   ```

### 2.3 Strict Anti-Hallucination & Honesty Guardrails
The system prompt enforces strict constraints adhering to `DESIGN.md §1`:
1. **Citation Requirement**: Any assertion made about a project must end with a clickable reference token in the format `[REF: slug#anchor]`.
2. **Honesty Rules**:
   - Explicitly note that Inferyx's source code is private.
   - Note that RoadSaarthi is an independent prototype and not an official government system.
   - Note that AegisZ and Threat Detection models were trained/evaluated on synthetic data.
   - Refuse to fabricate dates, employers, metrics, or personal secrets not present in the verified context chunks.
   - If queried about out-of-scope personal topics, politely respond: *"I can only provide verified facts regarding Ambul's machine learning architectures, security engineering research, and academic background."*

---

## 3. HUD Terminal Copilot Interface

### 3.1 Component Architecture (`src/components/copilot/CopilotTerminal.tsx`)
A cyber-command modal terminal mounted globally in `src/app/layout.tsx`.

```
┌────────────────────────────────────────────────────────────────────────┐
│ [●] NEURAL COPILOT // SEC-ML ASSISTANT [v2.4-EDGE]              [ESC] │
├────────────────────────────────────────────────────────────────────────┤
│ > System initialized. Model: @cf/meta/llama-3-8b-instruct              │
│ > Type /help for terminal commands, or ask about research & systems.   │
│                                                                        │
│ Suggested Queries:                                                     │
│ [Tell me about Inferyx] [AegisZ zero-knowledge gateway] [Verify Certs] │
│                                                                        │
│ User: What hardware was AegisZ evaluated on?                           │
│ Copilot: AegisZ was benchmarked targeting IBM Z (s390x) architectures, │
│ with initial validation runs evaluated locally using ONNX Runtime CPU   │
│ inference pipelines [REF: aegisz#results].                             │
│                                                                        │
│ ────────────────────────────────────────────────────────────────────── │
│ [copilot@ambul.dev:~$] █                                               │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Global Activation Triggers
1. **Keyboard Shortcut**: Backtick (`` ` ``) key toggles the terminal globally (unless user is typing inside an existing `<input>` or `<textarea>`).
2. **HUD Button Launcher**:
   - Added to `src/components/layout/HudBottomBar.tsx` as a prominent action button: `[AI COPILOT]`.
   - Also integrated into `src/components/layout/HudTopBar.tsx` alongside `SECURITY`.
3. **Modal Accessibility & Focus Trap**:
   - `role="dialog"`, `aria-modal="true"`, `aria-label="Neural Research Copilot Terminal"`.
   - Traps Tab key navigation within the terminal input and action buttons.
   - `Escape` key immediately closes the terminal and restores focus to the trigger element.

### 3.3 Interactive Terminal Commands & Suggested Chips
- `/help` — List available terminal utilities and shortcuts.
- `/projects` — List the 5 flagship case studies with direct links.
- `/clear` — Wipe terminal buffer history.
- `/metrics` — Summarize key verified metrics across all 5 systems.
- `/privacy` — Jump to Differential Privacy demonstration.
- `/exit` — Close the terminal.

---

## 4. Futuristic Easter Eggs & Privacy Demos (`CONTENT-04`)

### 4.1 Terminal Unix Shell & CTF Challenge
The terminal command line parses direct Unix commands:
- `whoami`: Returns `ambul_guest_researcher (UID: 1337, GID: 2028 - UTU CSE)`.
- `ls` / `dir`: Lists virtual directory entries (`flag.txt`, `projects/`, `credentials/`, `telemetry/`).
- `cat flag.txt`: Decodes and renders the CTF flag token:
  ```text
  [!] ACCESS GRANTED:
  FLAG{AMBUL_CYBER_ML_2026}
  Verification Hash: 8b1a9953c4611296a827abf8c47804d7
  State: Recruiter puzzle solved.
  ```
- `nmap localhost`: Simulates a security audit scan showing open services (Port 443/HTTPS, Port 8788/Cloudflare Workers AI, Port 9092/Zeek Telemetry).

### 4.2 Konami Code Intrusion Mode
Listening for the standard Konami sequence on `window.addEventListener('keydown')`:
$$\text{ArrowUp} \rightarrow \text{ArrowUp} \rightarrow \text{ArrowDown} \rightarrow \text{ArrowDown} \rightarrow \text{ArrowLeft} \rightarrow \text{ArrowRight} \rightarrow \text{ArrowLeft} \rightarrow \text{ArrowRight} \rightarrow \text{b} \rightarrow \text{a}$$

#### Visual & Audio Behavior
- Global state `intrusionMode: boolean` triggers:
  - Theme override: Root CSS variables flip to `--fault` (`#FF7A6B` / `#B3261E`).
  - Terminal auto-opens displaying an urgent SOC IDS alarm:
    ```text
    [CRITICAL ALERT] UNAUTHORIZED SEQUENCE DETECTED
    Anomaly Confidence: 0.984 (Threshold: 0.600)
    Action: Threat topology isolated. Security posture elevated.
    Press ESC or type /clear to restore system.
    ```
  - Web Audio API synthesizer generates a gentle, non-jarring low-frequency cyber alert pulse (80Hz - 120Hz frequency sweep, gain $\le 0.04$, strictly respecting `prefers-reduced-motion`).

### 4.3 Differential Privacy Demonstration Widget (`DifferentialPrivacyDemo.tsx`)
Mounted on `/contact` (accompanying the Location block) and accessible from `/lab`.

#### Theoretical Foundations (Laplace Mechanism)
To achieve $\epsilon$-differential privacy for a numerical query $f(x)$ with global sensitivity $\Delta f$:
$$M(x) = f(x) + \text{Laplace}\left(0, \frac{\Delta f}{\epsilon}\right)$$
Where the Laplace distribution density is:
$$p(z) = \frac{1}{2b} \exp\left(-\frac{|z|}{b}\right), \quad b = \frac{\Delta f}{\epsilon}$$

#### Implementation Details
- Base coordinates: Roorkee, India ($29.8543^\circ\text{ N}, 77.8880^\circ\text{ E}$).
- Sensitivity $\Delta f$: Calibrated to city-level centroid bounding box (~$0.05^\circ$).
- Epsilon slider: $\epsilon \in [0.1, 5.0]$ with step $0.1$.
  - Low $\epsilon$ (e.g. 0.2): High noise, strong privacy protection, scattered distribution.
  - High $\epsilon$ (e.g. 4.0): Low noise, weaker privacy, tight clustering around actual coordinates.
- Interactive SVG scatter visualization: Renders 50 sampled perturbed points in real-time as the slider moves, plotting empirical privacy bounds.

---

## 5. Security & Content Security Policy (CSP) Compatibility

- **Strict CSP Compliance**:
  - `public/_headers` currently allows `connect-src 'self' https://api.github.com https://cloudflareinsights.com;`.
  - The copilot endpoint `/api/copilot` is same-origin (`'self'`), requiring **zero CSP modifications** or external AI gateway domain exemptions.
- **XSS Prevention**:
  - Model responses are streamed as plaintext tokens and rendered via structured React nodes or safe markdown without `dangerouslySetInnerHTML`.
  - Citation tags `[REF: id]` are parsed deterministically into `<CitationPill />` link components.
- **Privacy & Cookie Free**:
  - Zero session cookies or tracking identifiers are emitted.
  - User questions are not stored or exfiltrated.

---

## 6. Verification & Automated Testing Plan (Gate 5)

A comprehensive test suite will be implemented in `tests/gate5-copilot.spec.ts`:

1. **COPILOT-01: Global Terminal Toggle**:
   - Assert terminal opens on backtick (`` ` ``) keypress.
   - Assert terminal opens on clicking `[AI COPILOT]` in `HudBottomBar.tsx`.
   - Assert terminal closes on `Escape` keypress and returns focus.
2. **COPILOT-02: Streaming & Retrieval Quality**:
   - Submit sample question: "What is Inferyx?".
   - Assert streaming response begins under 500ms TTFT.
   - Assert presence of clickable citation pill linking to `/work/inferyx`.
3. **COPILOT-03: Unix Shell Commands & CTF Flag**:
   - Enter `cat flag.txt`.
   - Assert terminal outputs `FLAG{AMBUL_CYBER_ML_2026}`.
   - Enter `whoami` and `help` commands; assert clean formatted outputs.
4. **COPILOT-04: Konami Intrusion Mode**:
   - Dispatch key sequence: `ArrowUp, ArrowUp, ArrowDown, ArrowDown, ArrowLeft, ArrowRight, ArrowLeft, ArrowRight, b, a`.
   - Assert intrusion alert banner appears.
   - Assert `Escape` dismisses intrusion state.
5. **COPILOT-05: Differential Privacy Demo**:
   - Navigate to `/contact` or `/lab`.
   - Locate Differential Privacy widget.
   - Adjust epsilon slider from 1.0 to 0.2; assert noise variance increases across plotted points.
6. **COPILOT-06: Zero Regressions & A11y**:
   - Assert 0 browser console errors.
   - Assert `role="dialog"`, `aria-modal="true"`, and keyboard navigation meet WCAG AA standards.

---
*Phase 5 research completed.*
