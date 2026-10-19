# Phase 5 Context: Cloudflare Workers AI Neural Research Copilot

## Requirements Covered
- **AI-01**: Cloudflare Workers AI integration exposing edge model endpoints (e.g. `@cf/meta/llama-3-8b-instruct`).
- **AI-02**: Cloudflare Vectorize vector index populated with embeddings of Ambul's case studies and research papers.
- **AI-03**: HUD terminal research copilot interface with streaming token response and verified source citations.
- **CONTENT-04**: View-source easter egg, interactive terminal shell, and differential privacy blur widgets integrated.

## Architectural Goals
1. **Edge-Native Neural Copilot on Cloudflare Pages:**
   - Serverless Cloudflare Pages Function at `functions/api/copilot.ts` leveraging Cloudflare Workers AI (`@cf/meta/llama-3-8b-instruct` / `@cf/baai/bge-small-en-v1.5`) with Server-Sent Events (SSE) streaming token output.
   - Dual-mode architecture: Production edge worker with `env.AI` + local preview server mock (`scripts/preview.mjs` `/api/copilot`) and client-side fallback using pre-indexed knowledge base embeddings (`public/data/knowledge-base.json`).
2. **Deterministic RAG Index & Zero-Hallucination Guardrails:**
   - Pre-computed knowledge base indexing all 5 case studies (Inferyx, AegisZ, OrgMind, Threat Detection, RoadSaarthi), about profile, certifications, and research papers.
   - Strict system prompt guardrails: answers must cite verified source chunks via citation pills (`[REF: inferyx#L24]`); rejects answering unverified facts or hallucinating outside Ambul's actual achievements.
   - Grounding in honesty framework (explicitly respects data notes, prototype disclaimers, and "What I'd change").
3. **Mission HUD Terminal Copilot Interface:**
   - Futuristic floating HUD terminal drawer accessible across all routes.
   - Global hotkey toggle (Backtick `` ` `` key) and floating HUD bottom bar launcher button (`[AI COPILOT]`).
   - Monospace terminal aesthetics: blinking cursor, streaming token response, citation pills, suggested query chips, and command palette (`/help`, `/projects`, `/clear`, `/metrics`).
4. **Futuristic Easter Eggs & Privacy Demonstrations (`CONTENT-04`):**
   - **Interactive Terminal Shell / CTF Flag:** Terminal responds to unix commands (`cat`, `ls`, `whoami`, `nmap`) with a hidden CTF flag token (`FLAG{AMBUL_CYBER_ML_2026}`).
   - **Konami Code Intrusion Mode:** Keystroke sequence (`↑ ↑ ↓ ↓ ← → ← → B A`) triggers SOC Cyber Alarm override animation.
   - **Differential Privacy Blur Widget:** Interactive demo on `/contact` and `/lab` demonstrating $\epsilon$-differential privacy noise injection (Laplace mechanism) masking visitor telemetry.
5. **Strict Accessibility & Security:**
   - Streaming tokens rendered as safe text/markdown without raw HTML injection (`XSS` safe).
   - Full keyboard accessibility (focus trapping in terminal modal, `Escape` key dismissal).
   - Zero cookie leakage and strict CSP compliance with `functions/api/copilot.ts` edge streaming.
