// functions/api/copilot.ts
// Cloudflare Pages Function exposing Workers AI (@cf/meta/llama-3-8b-instruct) with streaming SSE (AI-01, AI-03)

interface Env {
  AI?: {
    run: (model: string, input: Record<string, unknown>) => Promise<ReadableStream<Uint8Array> | Record<string, unknown>>;
  };
}

interface RequestPayload {
  message?: string;
  contextChunks?: Array<{
    id: string;
    source: string;
    ref: string;
    content: string;
  }>;
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  // Verify method
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let payload: RequestPayload = {};
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const userQuery = payload.message?.trim();
  if (!userQuery) {
    return new Response(JSON.stringify({ error: 'Missing "message" in request payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const chunks = payload.contextChunks || [];
  const contextStr = chunks
    .map((c, i) => `[CHUNK ${i + 1}] Source: ${c.source} | Citation: [REF: ${c.ref}]\n${c.content}`)
    .join('\n\n');

  const systemPrompt = `You are the Neural Research Copilot for Ambul Jaiswal's cybersecurity and machine learning systems portfolio (ambul.dev).
Your role is to explain Ambul's projects, architecture, research papers, and technical capabilities to recruiters and engineers.

CRITICAL GUARDRAILS:
1. STRICT GROUNDING: Answer ONLY using facts from the verified chunks below.
2. ZERO HALLUCINATION: If a metric or detail is missing, say: "That detail is not documented in Ambul's verified portfolio."
3. MANDATORY CITATIONS: Append citation format [REF: /path#anchor] when citing facts.
4. HONESTY: Inferyx repository is private IP; RoadSaarthi is an independent prototype.

VERIFIED CONTEXT CHUNKS:
${contextStr}
`;

  // If Cloudflare Workers AI is available in the environment
  if (env.AI && typeof env.AI.run === 'function') {
    try {
      const stream = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userQuery }
        ],
        stream: true,
        max_tokens: 512,
        temperature: 0.2
      });

      return new Response(stream as ReadableStream, {
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no'
        }
      });
    } catch (err: any) {
      console.error('[copilot edge worker error]:', err);
    }
  }

  // Edge fallback: deterministic token streaming response
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      const fallbackText = `Based on verified project records for Ambul Jaiswal: regarding "${userQuery}", please review the case studies at [REF: /work] or check the experimental lab at [REF: /lab].`;
      const words = fallbackText.split(' ');
      for (const word of words) {
        const sseData = `data: ${JSON.stringify({ response: word + ' ' })}\n\n`;
        controller.enqueue(encoder.encode(sseData));
        await new Promise(r => setTimeout(r, 20));
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    }
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive'
    }
  });
}
