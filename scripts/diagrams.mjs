// Generates precise, technical inline SVG architecture diagrams for case studies.
// Rules: No gradients, no drop shadows, 1.5px ink strokes, 0 radius boxes, IBM Plex Sans Condensed typography.
// Parts correspond to the numbered architecture sections in DESIGN.md §7.3.

export function getDiagramSvg(slug, verified = false) {
  const draftNotice = !verified
    ? `<g class="diag-draft-marker">
         <rect x="12" y="12" width="94" height="20" fill="var(--paper)" stroke="var(--rule)" stroke-width="1"/>
         <text x="59" y="26" text-anchor="middle" font-family="var(--font-heading)" font-size="11" font-weight="600" fill="var(--quiet)">DRAFT DIAGRAM</text>
       </g>`
    : '';

  if (slug === 'inferyx') {
    return `
<svg class="arch-diagram" viewBox="0 0 660 480" width="100%" height="100%" role="img" aria-label="Inferyx architecture diagram" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--ink)"/>
    </marker>
  </defs>
  <rect width="660" height="480" fill="none" stroke="var(--rule)" stroke-width="1"/>
  ${draftNotice}

  <!-- Part 1: React 19 Studio -->
  <g class="diag-part" data-part="1" id="diag-part-1">
    <rect x="30" y="50" width="170" height="65" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.5"/>
    <text x="40" y="72" font-family="var(--font-heading)" font-size="13" font-weight="600" fill="var(--ink)">1. React 19 Studio</text>
    <text x="40" y="90" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">7 views · 4 contexts</text>
    <text x="40" y="104" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">esbuild + Vitest</text>
  </g>

  <!-- Connection 1 -> 2 -->
  <path d="M 200 82 L 245 82" stroke="var(--ink)" stroke-width="1.5" marker-end="url(#arrow)" fill="none"/>

  <!-- Part 2: FastAPI Backend -->
  <g class="diag-part" data-part="2" id="diag-part-2">
    <rect x="250" y="50" width="170" height="65" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.5"/>
    <text x="260" y="72" font-family="var(--font-heading)" font-size="13" font-weight="600" fill="var(--ink)">2. FastAPI Gateway</text>
    <text x="260" y="90" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">JWT &amp; API-key RBAC</text>
    <text x="260" y="104" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">3 roles: view/edit/admin</text>
  </g>

  <!-- Connection 2 -> 3 -->
  <path d="M 420 82 L 465 82" stroke="var(--ink)" stroke-width="1.5" marker-end="url(#arrow)" fill="none"/>

  <!-- Part 3: Polars & Arrow Engine -->
  <g class="diag-part" data-part="3" id="diag-part-3">
    <rect x="470" y="50" width="160" height="65" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.5"/>
    <text x="480" y="72" font-family="var(--font-heading)" font-size="13" font-weight="600" fill="var(--ink)">3. Data Engine</text>
    <text x="480" y="90" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">Polars / PyArrow</text>
    <text x="480" y="104" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">1-pass parallel profile</text>
  </g>

  <!-- Connection 3 -> 4 -->
  <path d="M 550 115 L 550 155" stroke="var(--ink)" stroke-width="1.5" marker-end="url(#arrow)" fill="none"/>

  <!-- Part 4: Feature Engineering -->
  <g class="diag-part" data-part="4" id="diag-part-4">
    <rect x="460" y="160" width="170" height="65" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.5"/>
    <text x="470" y="182" font-family="var(--font-heading)" font-size="13" font-weight="600" fill="var(--ink)">4. Feature Pipeline</text>
    <text x="470" y="200" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">Leak-free rolling &amp; lags</text>
    <text x="470" y="214" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">TimeSeriesSplit</text>
  </g>

  <!-- Connection 4 -> 5 -->
  <path d="M 460 192 L 415 192" stroke="var(--ink)" stroke-width="1.5" marker-end="url(#arrow)" fill="none"/>

  <!-- Part 5: Dual-Mode Worker -->
  <g class="diag-part" data-part="5" id="diag-part-5">
    <rect x="240" y="160" width="170" height="65" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.5"/>
    <text x="250" y="182" font-family="var(--font-heading)" font-size="13" font-weight="600" fill="var(--ink)">5. Dual-Mode Worker</text>
    <text x="250" y="200" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">Celery+Redis | Threads</text>
    <text x="250" y="214" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">Startup job reaper</text>
  </g>

  <!-- Connection 5 -> 6 -->
  <path d="M 240 192 L 195 192" stroke="var(--ink)" stroke-width="1.5" marker-end="url(#arrow)" fill="none"/>

  <!-- Part 6: Training & Optuna -->
  <g class="diag-part" data-part="6" id="diag-part-6">
    <rect x="30" y="160" width="160" height="65" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.5"/>
    <text x="40" y="182" font-family="var(--font-heading)" font-size="13" font-weight="600" fill="var(--ink)">6. Optuna Training</text>
    <text x="40" y="200" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">Bayesian search</text>
    <text x="40" y="214" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">WS stream + HTTP poll</text>
  </g>

  <!-- Connection 6 -> 7 -->
  <path d="M 110 225 L 110 265" stroke="var(--ink)" stroke-width="1.5" marker-end="url(#arrow)" fill="none"/>

  <!-- Part 7: Results & SHAP -->
  <g class="diag-part" data-part="7" id="diag-part-7">
    <rect x="30" y="270" width="170" height="65" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.5"/>
    <text x="40" y="292" font-family="var(--font-heading)" font-size="13" font-weight="600" fill="var(--ink)">7. Explainability</text>
    <text x="40" y="310" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">SHAP &amp; permutations</text>
    <text x="40" y="324" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">Threshold tuning</text>
  </g>

  <!-- Connection 7 -> 8 -->
  <path d="M 200 302 L 245 302" stroke="var(--ink)" stroke-width="1.5" marker-end="url(#arrow)" fill="none"/>

  <!-- Part 8: Signed Model Export -->
  <g class="diag-part" data-part="8" id="diag-part-8">
    <rect x="250" y="270" width="170" height="65" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.5"/>
    <text x="260" y="292" font-family="var(--font-heading)" font-size="13" font-weight="600" fill="var(--ink)">8. Signed Export</text>
    <text x="260" y="310" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">HMAC-SHA256 signed</text>
    <text x="260" y="324" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">ONNX, Safetensors, API</text>
  </g>

  <!-- Connection 8 -> 9 -->
  <path d="M 420 302 L 465 302" stroke="var(--ink)" stroke-width="1.5" marker-end="url(#arrow)" fill="none"/>

  <!-- Part 9: Monitoring & Drift -->
  <g class="diag-part" data-part="9" id="diag-part-9">
    <rect x="470" y="270" width="160" height="65" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.5"/>
    <text x="480" y="292" font-family="var(--font-heading)" font-size="13" font-weight="600" fill="var(--ink)">9. Drift Watcher</text>
    <text x="480" y="310" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">PSI &amp; KS statistical drift</text>
    <text x="480" y="324" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">Webhook alerts</text>
  </g>

  <!-- Legend -->
  <g transform="translate(30, 420)">
    <line x1="0" y1="10" x2="30" y2="10" stroke="var(--ink)" stroke-width="1.5"/>
    <text x="38" y="14" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">Execution sequence</text>
    <rect x="180" y="3" width="14" height="14" fill="var(--mark)" stroke="var(--ink)" stroke-width="1"/>
    <text x="202" y="14" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">Active section highlight</text>
  </g>
</svg>
`;
  }

  if (slug === 'aegisz') {
    return `
<svg class="arch-diagram" viewBox="0 0 660 440" width="100%" height="100%" role="img" aria-label="AegisZ architecture diagram" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--ink)"/>
    </marker>
  </defs>
  <rect width="660" height="440" fill="none" stroke="var(--rule)" stroke-width="1"/>
  ${draftNotice}

  <!-- Part 1: Ingress -->
  <g class="diag-part" data-part="1" id="diag-part-1">
    <rect x="30" y="50" width="160" height="65" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.5"/>
    <text x="40" y="72" font-family="var(--font-heading)" font-size="13" font-weight="600" fill="var(--ink)">1. Ingress Gate</text>
    <text x="40" y="90" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">Clinical / Welfare</text>
    <text x="40" y="104" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">HL7 / EDI payloads</text>
  </g>

  <path d="M 190 82 L 235 82" stroke="var(--ink)" stroke-width="1.5" marker-end="url(#arrow)" fill="none"/>

  <!-- Part 2: Threat Detector -->
  <g class="diag-part" data-part="2" id="diag-part-2">
    <rect x="240" y="50" width="180" height="65" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.5"/>
    <text x="250" y="72" font-family="var(--font-heading)" font-size="13" font-weight="600" fill="var(--ink)">2. Threat Detector</text>
    <text x="250" y="90" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">ONNX Runtime</text>
    <text x="250" y="104" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">Isolation Forest + Boost</text>
  </g>

  <path d="M 420 82 L 465 82" stroke="var(--ink)" stroke-width="1.5" marker-end="url(#arrow)" fill="none"/>

  <!-- Part 3: PII Vault & DP -->
  <g class="diag-part" data-part="3" id="diag-part-3">
    <rect x="470" y="50" width="160" height="65" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.5"/>
    <text x="480" y="72" font-family="var(--font-heading)" font-size="13" font-weight="600" fill="var(--ink)">3. PII &amp; DP Vault</text>
    <text x="480" y="90" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">HMAC-SHA3-256 tokens</text>
    <text x="480" y="104" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">Laplace noise &epsilon; 0.1-5.0</text>
  </g>

  <path d="M 550 115 L 550 165" stroke="var(--ink)" stroke-width="1.5" marker-end="url(#arrow)" fill="none"/>

  <!-- Part 4: Triage Model -->
  <g class="diag-part" data-part="4" id="diag-part-4">
    <rect x="460" y="170" width="170" height="65" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.5"/>
    <text x="470" y="192" font-family="var(--font-heading)" font-size="13" font-weight="600" fill="var(--ink)">4. Sanitized Triage</text>
    <text x="470" y="210" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">Isolated model run</text>
    <text x="470" y="224" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">Zero raw PII exposure</text>
  </g>

  <path d="M 460 202 L 415 202" stroke="var(--ink)" stroke-width="1.5" marker-end="url(#arrow)" fill="none"/>

  <!-- Part 5: Audit Ledger -->
  <g class="diag-part" data-part="5" id="diag-part-5">
    <rect x="230" y="170" width="180" height="65" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.5"/>
    <text x="240" y="192" font-family="var(--font-heading)" font-size="13" font-weight="600" fill="var(--ink)">5. PQC Audit Ledger</text>
    <text x="240" y="210" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">SHA3-512 Merkle chain</text>
    <text x="240" y="224" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">ML-DSA-65 / ML-KEM</text>
  </g>

  <path d="M 230 202 L 185 202" stroke="var(--ink)" stroke-width="1.5" marker-end="url(#arrow)" fill="none"/>

  <!-- Part 6: CBOM Scanner -->
  <g class="diag-part" data-part="6" id="diag-part-6">
    <rect x="30" y="170" width="150" height="65" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.5"/>
    <text x="40" y="192" font-family="var(--font-heading)" font-size="13" font-weight="600" fill="var(--ink)">6. CBOM Scanner</text>
    <text x="40" y="210" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">CycloneDX 1.6 scan</text>
    <text x="40" y="224" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">Detects harvest vectors</text>
  </g>

  <path d="M 105 235 L 105 285" stroke="var(--ink)" stroke-width="1.5" marker-end="url(#arrow)" fill="none"/>

  <!-- Part 7: Command Center -->
  <g class="diag-part" data-part="7" id="diag-part-7">
    <rect x="30" y="290" width="220" height="65" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.5"/>
    <text x="40" y="312" font-family="var(--font-heading)" font-size="13" font-weight="600" fill="var(--ink)">7. Command Center</text>
    <text x="40" y="330" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">React + WebSocket feed</text>
    <text x="40" y="344" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">Multi-arch: x86 &amp; s390x</text>
  </g>

  <!-- Legend -->
  <g transform="translate(30, 395)">
    <line x1="0" y1="10" x2="30" y2="10" stroke="var(--ink)" stroke-width="1.5"/>
    <text x="38" y="14" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">Security processing flow</text>
  </g>
</svg>
`;
  }

  if (slug === 'orgmind') {
    return `
<svg class="arch-diagram" viewBox="0 0 660 440" width="100%" height="100%" role="img" aria-label="OrgMind architecture diagram" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--ink)"/>
    </marker>
  </defs>
  <rect width="660" height="440" fill="none" stroke="var(--rule)" stroke-width="1"/>
  ${draftNotice}

  <!-- Part 1: Ingestion -->
  <g class="diag-part" data-part="1" id="diag-part-1">
    <rect x="30" y="50" width="170" height="65" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.5"/>
    <text x="40" y="72" font-family="var(--font-heading)" font-size="13" font-weight="600" fill="var(--ink)">1. Ingestion Queue</text>
    <text x="40" y="90" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">Connectors → arq queue</text>
    <text x="40" y="104" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">8-stage retryable pipeline</text>
  </g>

  <path d="M 200 82 L 245 82" stroke="var(--ink)" stroke-width="1.5" marker-end="url(#arrow)" fill="none"/>

  <!-- Part 2: Dual Persistence -->
  <g class="diag-part" data-part="2" id="diag-part-2">
    <rect x="250" y="50" width="180" height="65" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.5"/>
    <text x="260" y="72" font-family="var(--font-heading)" font-size="13" font-weight="600" fill="var(--ink)">2. Graph &amp; Storage</text>
    <text x="260" y="90" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">FalkorDB (OpenCypher)</text>
    <text x="260" y="104" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">PostgreSQL 16 audit ledger</text>
  </g>

  <path d="M 430 82 L 475 82" stroke="var(--ink)" stroke-width="1.5" marker-end="url(#arrow)" fill="none"/>

  <!-- Part 3: Grounded Agent -->
  <g class="diag-part" data-part="3" id="diag-part-3">
    <rect x="480" y="50" width="150" height="65" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.5"/>
    <text x="490" y="72" font-family="var(--font-heading)" font-size="13" font-weight="600" fill="var(--ink)">3. Grounded Agent</text>
    <text x="490" y="90" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">LiteLLM tool loop</text>
    <text x="490" y="104" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">Grounding validator</text>
  </g>

  <path d="M 555 115 L 555 165" stroke="var(--ink)" stroke-width="1.5" marker-end="url(#arrow)" fill="none"/>

  <!-- Part 4: API & MCP -->
  <g class="diag-part" data-part="4" id="diag-part-4">
    <rect x="450" y="170" width="180" height="65" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.5"/>
    <text x="460" y="192" font-family="var(--font-heading)" font-size="13" font-weight="600" fill="var(--ink)">4. API &amp; Protocols</text>
    <text x="460" y="210" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">FastAPI REST + SSE</text>
    <text x="460" y="224" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">MCP server (11 tools)</text>
  </g>

  <path d="M 450 202 L 405 202" stroke="var(--ink)" stroke-width="1.5" marker-end="url(#arrow)" fill="none"/>

  <!-- Part 5: Explorer UI -->
  <g class="diag-part" data-part="5" id="diag-part-5">
    <rect x="220" y="170" width="180" height="65" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.5"/>
    <text x="230" y="192" font-family="var(--font-heading)" font-size="13" font-weight="600" fill="var(--ink)">5. Explorer Web App</text>
    <text x="230" y="210" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">Next.js 14 + Cytoscape</text>
    <text x="230" y="224" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">Lineage &amp; peer reviews</text>
  </g>

  <path d="M 220 202 L 175 202" stroke="var(--ink)" stroke-width="1.5" marker-end="url(#arrow)" fill="none"/>

  <!-- Part 6: Governance -->
  <g class="diag-part" data-part="6" id="diag-part-6">
    <rect x="30" y="170" width="140" height="65" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.5"/>
    <text x="40" y="192" font-family="var(--font-heading)" font-size="13" font-weight="600" fill="var(--ink)">6. Governance</text>
    <text x="40" y="210" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">4 roles &amp; RBAC</text>
    <text x="40" y="224" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">Injection delimiters</text>
  </g>

  <!-- Legend -->
  <g transform="translate(30, 380)">
    <line x1="0" y1="10" x2="30" y2="10" stroke="var(--ink)" stroke-width="1.5"/>
    <text x="38" y="14" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">Knowledge graph and verification pipeline</text>
  </g>
</svg>
`;
  }

  if (slug === 'threat-detection') {
    return `
<svg class="arch-diagram" viewBox="0 0 660 380" width="100%" height="100%" role="img" aria-label="AI Threat Detection architecture diagram" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--ink)"/>
    </marker>
  </defs>
  <rect width="660" height="380" fill="none" stroke="var(--rule)" stroke-width="1"/>
  ${draftNotice}

  <!-- Part 1: Traffic Generator -->
  <g class="diag-part" data-part="1" id="diag-part-1">
    <rect x="30" y="50" width="160" height="65" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.5"/>
    <text x="40" y="72" font-family="var(--font-heading)" font-size="13" font-weight="600" fill="var(--ink)">1. Traffic Generator</text>
    <text x="40" y="90" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">Synthetic flows</text>
    <text x="40" y="104" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">85% norm / 15% attack</text>
  </g>

  <path d="M 190 82 L 235 82" stroke="var(--ink)" stroke-width="1.5" marker-end="url(#arrow)" fill="none"/>

  <!-- Part 2: Flow Analyzer -->
  <g class="diag-part" data-part="2" id="diag-part-2">
    <rect x="240" y="50" width="170" height="65" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.5"/>
    <text x="250" y="72" font-family="var(--font-heading)" font-size="13" font-weight="600" fill="var(--ink)">2. Flow Analyzer</text>
    <text x="250" y="90" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">Windowed buffer</text>
    <text x="250" y="104" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">7 continuous features</text>
  </g>

  <path d="M 410 82 L 455 82" stroke="var(--ink)" stroke-width="1.5" marker-end="url(#arrow)" fill="none"/>

  <!-- Part 3: Isolation Forest -->
  <g class="diag-part" data-part="3" id="diag-part-3">
    <rect x="460" y="50" width="170" height="65" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.5"/>
    <text x="470" y="72" font-family="var(--font-heading)" font-size="13" font-weight="600" fill="var(--ink)">3. Isolation Forest</text>
    <text x="470" y="90" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">scikit-learn engine</text>
    <text x="470" y="104" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">Multidimensional depth</text>
  </g>

  <path d="M 545 115 L 545 165" stroke="var(--ink)" stroke-width="1.5" marker-end="url(#arrow)" fill="none"/>

  <!-- Part 4: Severity Scoring -->
  <g class="diag-part" data-part="4" id="diag-part-4">
    <rect x="460" y="170" width="170" height="65" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.5"/>
    <text x="470" y="192" font-family="var(--font-heading)" font-size="13" font-weight="600" fill="var(--ink)">4. Severity Scoring</text>
    <text x="470" y="210" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">Calibrated thresholds</text>
    <text x="470" y="224" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">Low to critical tiers</text>
  </g>

  <path d="M 460 202 L 415 202" stroke="var(--ink)" stroke-width="1.5" marker-end="url(#arrow)" fill="none"/>

  <!-- Part 5: Alert System -->
  <g class="diag-part" data-part="5" id="diag-part-5">
    <rect x="240" y="170" width="170" height="65" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.5"/>
    <text x="250" y="192" font-family="var(--font-heading)" font-size="13" font-weight="600" fill="var(--ink)">5. Alert System</text>
    <text x="250" y="210" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">Event correlation</text>
    <text x="250" y="224" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">Notification dispatch</text>
  </g>

  <path d="M 240 202 L 195 202" stroke="var(--ink)" stroke-width="1.5" marker-end="url(#arrow)" fill="none"/>

  <!-- Part 6: Flask Dashboard -->
  <g class="diag-part" data-part="6" id="diag-part-6">
    <rect x="30" y="170" width="160" height="65" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.5"/>
    <text x="40" y="192" font-family="var(--font-heading)" font-size="13" font-weight="600" fill="var(--ink)">6. Dashboard UI</text>
    <text x="40" y="210" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">Flask + Plotly charts</text>
    <text x="40" y="224" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">JSON REST telemetry</text>
  </g>

  <!-- Legend -->
  <g transform="translate(30, 320)">
    <line x1="0" y1="10" x2="30" y2="10" stroke="var(--ink)" stroke-width="1.5"/>
    <text x="38" y="14" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">Packet anomaly classification stream</text>
  </g>
</svg>
`;
  }

  if (slug === 'roadsaarthi') {
    return `
<svg class="arch-diagram" viewBox="0 0 660 380" width="100%" height="100%" role="img" aria-label="RoadSaarthi architecture diagram" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--ink)"/>
    </marker>
  </defs>
  <rect width="660" height="380" fill="none" stroke="var(--rule)" stroke-width="1"/>
  ${draftNotice}

  <!-- Part 1: Event Generator -->
  <g class="diag-part" data-part="1" id="diag-part-1">
    <rect x="30" y="50" width="160" height="65" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.5"/>
    <text x="40" y="72" font-family="var(--font-heading)" font-size="13" font-weight="600" fill="var(--ink)">1. Event Generator</text>
    <text x="40" y="90" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">Synthetic road hits</text>
    <text x="40" y="104" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">300s telemetry cycle</text>
  </g>

  <path d="M 190 82 L 235 82" stroke="var(--ink)" stroke-width="1.5" marker-end="url(#arrow)" fill="none"/>

  <!-- Part 2: API & PostGIS -->
  <g class="diag-part" data-part="2" id="diag-part-2">
    <rect x="240" y="50" width="170" height="65" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.5"/>
    <text x="250" y="72" font-family="var(--font-heading)" font-size="13" font-weight="600" fill="var(--ink)">2. Backend &amp; GIS</text>
    <text x="250" y="90" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">FastAPI + SQLAlchemy 2</text>
    <text x="250" y="104" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">PostGIS spatial indexing</text>
  </g>

  <path d="M 410 82 L 455 82" stroke="var(--ink)" stroke-width="1.5" marker-end="url(#arrow)" fill="none"/>

  <!-- Part 3: Road Scoring -->
  <g class="diag-part" data-part="3" id="diag-part-3">
    <rect x="460" y="50" width="170" height="65" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.5"/>
    <text x="470" y="72" font-family="var(--font-heading)" font-size="13" font-weight="600" fill="var(--ink)">3. Scoring Engine</text>
    <text x="470" y="90" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">Road condition index</text>
    <text x="470" y="104" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">Segment degradation</text>
  </g>

  <path d="M 545 115 L 545 165" stroke="var(--ink)" stroke-width="1.5" marker-end="url(#arrow)" fill="none"/>

  <!-- Part 4: Spatial Clustering -->
  <g class="diag-part" data-part="4" id="diag-part-4">
    <rect x="460" y="170" width="170" height="65" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.5"/>
    <text x="470" y="192" font-family="var(--font-heading)" font-size="13" font-weight="600" fill="var(--ink)">4. DBSCAN Clustering</text>
    <text x="470" y="210" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">scikit-learn spatial</text>
    <text x="470" y="224" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">Pothole hotspot grouping</text>
  </g>

  <path d="M 460 202 L 415 202" stroke="var(--ink)" stroke-width="1.5" marker-end="url(#arrow)" fill="none"/>

  <!-- Part 5: WebSocket Stream -->
  <g class="diag-part" data-part="5" id="diag-part-5">
    <rect x="240" y="170" width="170" height="65" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.5"/>
    <text x="250" y="192" font-family="var(--font-heading)" font-size="13" font-weight="600" fill="var(--ink)">5. Streaming Bus</text>
    <text x="250" y="210" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">WebSocket real-time</text>
    <text x="250" y="224" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">Live cluster broadcast</text>
  </g>

  <path d="M 240 202 L 195 202" stroke="var(--ink)" stroke-width="1.5" marker-end="url(#arrow)" fill="none"/>

  <!-- Part 6: MapLibre UI -->
  <g class="diag-part" data-part="6" id="diag-part-6">
    <rect x="30" y="170" width="160" height="65" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.5"/>
    <text x="40" y="192" font-family="var(--font-heading)" font-size="13" font-weight="600" fill="var(--ink)">6. Command Center</text>
    <text x="40" y="210" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">React 18 + MapLibre</text>
    <text x="40" y="224" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">7 views &amp; work orders</text>
  </g>

  <!-- Legend -->
  <g transform="translate(30, 320)">
    <line x1="0" y1="10" x2="30" y2="10" stroke="var(--ink)" stroke-width="1.5"/>
    <text x="38" y="14" font-family="var(--font-heading)" font-size="11" fill="var(--quiet)">Spatial road condition telemetry</text>
  </g>
</svg>
`;
  }

  return '';
}
