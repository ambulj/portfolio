// src/lib/ai/knowledge-retriever.ts
// Client-side and edge-compatible RAG retriever with semantic scoring and anti-hallucination guardrails (AI-02, AI-03)

export interface KnowledgeChunk {
  id: string;
  source: string;
  ref: string;
  title: string;
  tags: string[];
  content: string;
  metrics?: { measure: string; value: string; method?: string; how_measured?: string }[];
}

/**
 * Tokenizes text into normalized alphanumeric keywords.
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);
}

/**
 * Scores and retrieves top-K most relevant knowledge chunks for a given query.
 */
export function retrieveRelevantChunks(
  query: string,
  chunks: KnowledgeChunk[],
  topK = 3
): { chunk: KnowledgeChunk; score: number }[] {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) {
    return chunks.slice(0, topK).map(c => ({ chunk: c, score: 1.0 }));
  }

  const scored = chunks.map(chunk => {
    let score = 0;
    const chunkTokens = new Set([
      ...tokenize(chunk.title),
      ...chunk.tags.map(t => t.toLowerCase()),
      ...tokenize(chunk.source)
    ]);
    const contentLower = chunk.content.toLowerCase();

    for (const token of queryTokens) {
      // High weight for tag / title match
      if (chunkTokens.has(token)) {
        score += 3.0;
      }
      // Exact substring match in content
      if (contentLower.includes(token)) {
        score += 1.0;
      }
    }

    return { chunk, score };
  });

  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/**
 * Builds the strict anti-hallucination system prompt for Cloudflare Workers AI.
 */
export function buildAntiHallucinationPrompt(chunks: KnowledgeChunk[]): string {
  const contextStr = chunks
    .map(
      (c, idx) =>
        `[CHUNK ${idx + 1}] Source: ${c.source} | Citation: [REF: ${c.ref}]\n${c.content}`
    )
    .join('\n\n');

  return `You are the Neural Research Copilot for Ambul Jaiswal's cybersecurity and machine learning systems portfolio (ambul.dev).
Your role is to assist recruiters, security researchers, and engineers by explaining Ambul's projects, architecture, research papers, and technical capabilities.

CRITICAL OPERATIONAL GUARDRAILS:
1. STRICT GROUNDING: Answer ONLY using the facts, metrics, and architecture details provided in the verified context chunks below.
2. ZERO HALLUCINATION: If a detail, date, or metric is not present in the context, explicitly state: "That specific detail is not documented in Ambul's verified portfolio. Contact Ambul directly at ambul.dev/contact."
3. MANDATORY CITATIONS: Whenever you state a technical capability or metric, you MUST append the exact citation format: [REF: /path#anchor] from the chunk.
4. HONESTY CONSTRAINTS:
   - Inferyx repository is private enterprise IP (walkthrough available on request).
   - RoadSaarthi is an independent engineering prototype, not an officially deployed government transit system.
   - All benchmarked metrics are measured on specific documented hardware.
5. TONE: Mission-critical, concise, futuristic, and highly technical. Avoid marketing buzzwords.

VERIFIED CONTEXT CHUNKS:
${contextStr}
`;
}

/**
 * Generates a deterministic, offline-capable synthesized response when edge worker is unreachable.
 */
export function synthesizeLocalAnswer(query: string, chunks: KnowledgeChunk[]): string {
  const matched = retrieveRelevantChunks(query, chunks, 2);

  if (matched.length === 0) {
    return `Query received: "${query}".\n\nNo direct matches found in the verified knowledge base. Please check the projects index at [REF: /work] or ask about specific case studies like Inferyx, AegisZ, Threat Detection, or Certifications.`;
  }

  const primary = matched[0].chunk;
  const secondary = matched[1]?.chunk;

  let response = `Based on verified project documentation for **${primary.source}**:\n\n`;

  // Extract key summary or sentence
  const lines = primary.content.split('\n').filter(l => l.trim().length > 0);
  const snippet = lines.slice(0, 3).join('\n');
  response += `${snippet} [REF: ${primary.ref}]\n\n`;

  if (primary.metrics && primary.metrics.length > 0) {
    response += `**Audited Technical Metrics:**\n`;
    for (const m of primary.metrics.slice(0, 3)) {
      response += `- ${m.measure}: \`${m.value}\` (${m.how_measured || m.method || 'Audited benchmark'}) [REF: ${primary.ref}]\n`;
    }
    response += '\n';
  }

  if (secondary) {
    response += `*Related Reference:* ${secondary.title} [REF: ${secondary.ref}]`;
  }

  return response;
}

let cachedChunks: KnowledgeChunk[] | null = null;

/**
 * Loads knowledge-base.json (cached) and retrieves top-k relevant chunks.
 */
export async function findRelevantChunks(query: string, topK = 3): Promise<KnowledgeChunk[]> {
  if (!cachedChunks) {
    try {
      const res = await fetch('/data/knowledge-base.json');
      if (res.ok) {
        cachedChunks = await res.json();
      } else {
        cachedChunks = [];
      }
    } catch {
      cachedChunks = [];
    }
  }

  const results = retrieveRelevantChunks(query, cachedChunks || [], topK);
  return results.map(r => r.chunk);
}

/**
 * Convenience alias for buildAntiHallucinationPrompt
 */
export function buildSystemPrompt(chunks: KnowledgeChunk[]): string {
  return buildAntiHallucinationPrompt(chunks);
}

