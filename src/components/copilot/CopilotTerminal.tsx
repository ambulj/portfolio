'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Send, X, CornerDownLeft, Sparkles, RefreshCw, ShieldAlert, Cpu } from 'lucide-react';
import CitationPill from './CitationPill';
import { findRelevantChunks, buildSystemPrompt } from '@/lib/ai/knowledge-retriever';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  citations?: string[];
}

const SUGGESTED_QUERIES = [
  'Tell me about Inferyx architecture',
  'Explain AegisZ post-quantum cryptography',
  'What are Ambul\'s security achievements?',
  'How does the threat detection model work?'
];

const CTF_FLAG = 'FLAG{AMBUL_CYBER_ML_2026}';

export default function CopilotTerminal() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: 'system',
      content: 'NEURAL RESEARCH COPILOT v2.4 // EDGE INFERENCE ACTIVE\nModel: @cf/meta/llama-3-8b-instruct (Cloudflare Workers AI)\nRAG Knowledge Base: Ingested & Verified.\nType /help for system commands or select a query below.',
      timestamp: '00:00:00'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Toggle on Global Backtick (`) or Custom Event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '`' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => setIsOpen(true);
    const handleCustomToggle = () => setIsOpen((prev) => !prev);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-copilot', handleCustomOpen);
    window.addEventListener('toggle-copilot', handleCustomToggle);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-copilot', handleCustomOpen);
      window.removeEventListener('toggle-copilot', handleCustomToggle);
    };
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  // Format timestamp
  const getTimestamp = () => {
    const d = new Date();
    return d.toTimeString().split(' ')[0];
  };

  const handleCommand = (cmd: string): boolean => {
    const trimmed = cmd.trim();
    const lower = trimmed.toLowerCase();

    if (lower === '/clear') {
      setMessages([]);
      return true;
    }

    if (lower === '/exit' || lower === 'exit') {
      setIsOpen(false);
      return true;
    }

    if (lower === '/help' || lower === 'help') {
      setMessages((prev) => [
        ...prev,
        {
          id: `cmd-${Date.now()}`,
          role: 'system',
          content: `AVAILABLE COMMANDS:\n/help, help         - Show this telemetry manual\n/projects           - List all verified production case studies\n/metrics            - Display inference telemetry & model manifest\n/clear              - Clear active session buffer\n/exit, exit         - Close neural terminal\nwhoami              - Inspect current operator identity\ncat flag.txt        - CTF Challenge payload inspection\nnmap localhost      - Network vulnerability port audit`,
          timestamp: getTimestamp()
        }
      ]);
      return true;
    }

    if (lower === '/projects') {
      setMessages((prev) => [
        ...prev,
        {
          id: `cmd-${Date.now()}`,
          role: 'system',
          content: `VERIFIED CASE STUDIES:\n1. INFERYX          - Sub-10ms Privacy-Preserving Neural Engine [REF: inferyx]\n2. AEGISZ           - Post-Quantum Cryptographic VPN & ML Tunnel [REF: aegisz]\n3. ORGMIND          - Decentralized Multi-Tenant Intelligence Engine [REF: orgmind]\n4. THREAT DETECTION - 50k pkt/s Neural Zero-Day Classifier [REF: threat-detection]\n5. ROADSAARTHI      - Offline Edge Computer Vision Safety System [REF: roadsaarthi]`,
          timestamp: getTimestamp()
        }
      ]);
      return true;
    }

    if (lower === '/metrics') {
      setMessages((prev) => [
        ...prev,
        {
          id: `cmd-${Date.now()}`,
          role: 'system',
          content: `COPILOT TELEMETRY:\nRuntime: Cloudflare Workers AI Edge Pages Function\nModel ID: @cf/meta/llama-3-8b-instruct\nLocal RAG Vector Chunks: 21 items\nStreaming Protocol: SSE text/event-stream\nSecurity Status: SHA-256 Validated, Zero-Data Exfiltration Active`,
          timestamp: getTimestamp()
        }
      ]);
      return true;
    }

    // UNIX Easter Eggs
    if (lower === 'whoami') {
      setMessages((prev) => [
        ...prev,
        {
          id: `cmd-${Date.now()}`,
          role: 'assistant',
          content: `operator: guest_researcher@ambul.dev (AUTH_LEVEL: CYBER_INSPECT)`,
          timestamp: getTimestamp()
        }
      ]);
      return true;
    }

    if (lower === 'cat flag.txt' || lower === 'cat flag') {
      setMessages((prev) => [
        ...prev,
        {
          id: `cmd-${Date.now()}`,
          role: 'assistant',
          content: `ACCESS GRANTED // CTF PAYLOAD DECRYPTED:\n${CTF_FLAG}\n\n[REF: security#ctf]`,
          timestamp: getTimestamp()
        }
      ]);
      return true;
    }

    if (lower.startsWith('nmap')) {
      setMessages((prev) => [
        ...prev,
        {
          id: `cmd-${Date.now()}`,
          role: 'assistant',
          content: `Starting Nmap 7.94 ( https://nmap.org ) at ${new Date().toISOString()}\nNmap scan report for localhost (127.0.0.1)\nHost is up (0.00012s latency).\nNot shown: 997 closed tcp ports (reset)\nPORT     STATE SERVICE\n80/tcp   open  http (Next.js 15.2.1 static export)\n443/tcp  open  https (Cloudflare Pages edge TLS 1.3)\n8443/tcp open  pqc-tunnel (AegisZ Dilithium-3)\n\nNmap done: 1 IP address (1 host up) scanned in 0.08 seconds`,
          timestamp: getTimestamp()
        }
      ]);
      return true;
    }

    return false;
  };

  const handleSend = async (overridePrompt?: string) => {
    const promptToSend = overridePrompt || input;
    if (!promptToSend.trim() || isLoading) return;

    const userTimestamp = getTimestamp();
    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: promptToSend.trim(),
      timestamp: userTimestamp
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Check for internal commands
    if (handleCommand(promptToSend)) {
      return;
    }

    setIsLoading(true);
    setStreamingText('');

    try {
      abortControllerRef.current = new AbortController();

      // Retrieve local RAG context
      const relevantChunks = await findRelevantChunks(promptToSend, 3);
      const systemPrompt = buildSystemPrompt(relevantChunks);

      // Call streaming API
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: promptToSend }
          ]
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`Edge AI copilot returned HTTP ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No streaming response body available');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6);
            if (dataStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.response) {
                accumulated += parsed.response;
                setStreamingText(accumulated);
              }
            } catch {
              // Non-JSON SSE line, ignore
            }
          }
        }
      }

      // Finalize assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content: accumulated || 'No response generated from edge worker.',
          timestamp: getTimestamp()
        }
      ]);
      setStreamingText('');
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') return;

      // Fallback offline synthesizer if API is unreachable
      const fallbackChunks = await findRelevantChunks(promptToSend, 2);
      let fallbackText = `[OFFLINE SYNTHESIZER ACTIVE]\n`;
      if (fallbackChunks.length > 0) {
        fallbackText += `According to verified project records:\n\n${fallbackChunks[0].content}\n\n[REF: ${fallbackChunks[0].ref}]`;
      } else {
        fallbackText += `I cannot answer this without verified records in Ambul's security archive. For security inquiries, please check /security or /work.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `asst-fallback-${Date.now()}`,
          role: 'assistant',
          content: fallbackText,
          timestamp: getTimestamp()
        }
      ]);
      setStreamingText('');
    } finally {
      setIsLoading(false);
    }
  };

  // Render message content with clickable citation pills
  const renderMessageContent = (content: string) => {
    // Match [REF: target]
    const refRegex = /\[REF:\s*([^\]]+)\]/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = refRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }
      parts.push(
        <CitationPill key={`pill-${match.index}`} refTarget={match[1]} />
      );
      lastIndex = refRegex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }

    return (
      <div className="whitespace-pre-wrap leading-relaxed font-mono text-xs">
        {parts}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div 
      role="dialog" 
      aria-modal="true"
      aria-label="Neural Research Copilot HUD Terminal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div 
        className="w-full max-w-3xl h-[620px] bg-oled border border-accent-cyan/60 rounded-lg shadow-2xl flex flex-col overflow-hidden text-ink-primary font-mono relative"
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-surface-subtle/80 select-none">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-accent-cyan" aria-hidden="true" />
            <span className="text-xs font-bold tracking-wider text-accent-cyan">
              NEURAL RESEARCH COPILOT // TERMINAL SHELL
            </span>
            <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30">
              LLAMA-3-8B-INSTRUCT
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-[10px] text-ink-muted hidden md:inline">
              HOTKEY: [`] TO TOGGLE
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded text-ink-muted hover:text-accent-red hover:bg-surface-elevated transition-colors"
              aria-label="Close terminal dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Suggested Queries Chips */}
        <div className="flex items-center space-x-2 px-4 py-2 border-b border-border-subtle bg-surface-subtle/40 overflow-x-auto text-[11px] no-scrollbar">
          <span className="text-ink-muted flex items-center space-x-1 flex-shrink-0">
            <Sparkles className="w-3 h-3 text-accent-amber" />
            <span>QUICK:</span>
          </span>
          {SUGGESTED_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded bg-surface-elevated border border-border-subtle hover:border-accent-cyan/50 hover:text-accent-cyan text-ink-secondary whitespace-nowrap transition-colors flex-shrink-0 text-[10px]"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-oled/90">
          {messages.map((m) => (
            <div 
              key={m.id} 
              className={`flex flex-col ${
                m.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="flex items-center space-x-2 text-[10px] text-ink-muted mb-1">
                <span>{m.role === 'user' ? 'OPERATOR' : m.role === 'system' ? 'SYSTEM' : 'NEURAL_EDGE'}</span>
                <span>[{m.timestamp}]</span>
              </div>
              <div 
                className={`max-w-[85%] rounded p-3 border ${
                  m.role === 'user'
                    ? 'bg-accent-cyan/10 border-accent-cyan/40 text-ink-primary'
                    : m.role === 'system'
                    ? 'bg-surface-elevated border-border-subtle text-accent-amber'
                    : 'bg-surface-subtle border-border-subtle text-ink-primary shadow-sm'
                }`}
              >
                {renderMessageContent(m.content)}
              </div>
            </div>
          ))}

          {/* Streaming token stream */}
          {streamingText && (
            <div className="flex flex-col items-start">
              <div className="flex items-center space-x-2 text-[10px] text-ink-muted mb-1">
                <span>NEURAL_EDGE (STREAMING)</span>
                <span>[{getTimestamp()}]</span>
              </div>
              <div className="max-w-[85%] rounded p-3 bg-surface-subtle border border-accent-cyan/40 text-ink-primary">
                {renderMessageContent(streamingText)}
                <span className="inline-block w-2 h-3.5 ml-1 bg-accent-cyan animate-pulse align-middle" />
              </div>
            </div>
          )}

          {isLoading && !streamingText && (
            <div className="flex items-center space-x-2 text-ink-muted text-xs p-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-accent-cyan" />
              <span>Querying edge neural model & resolving RAG citations...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-border-subtle bg-surface-subtle/80 flex items-center space-x-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-accent-cyan text-xs select-none">
              &gt;
            </span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask copilot or type /help, cat flag.txt..."
              disabled={isLoading}
              className="w-full bg-oled border border-border-subtle rounded px-8 py-2 text-xs font-mono text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-accent-cyan transition-colors"
            />
          </div>

          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="px-3 py-2 bg-accent-cyan text-black font-bold rounded text-xs hover:bg-accent-cyan/90 disabled:opacity-40 disabled:hover:bg-accent-cyan transition-colors flex items-center space-x-1"
            aria-label="Send query"
          >
            <Send className="w-3 h-3" />
            <span className="hidden sm:inline">EXEC</span>
          </button>
        </div>
      </div>
    </div>
  );
}
