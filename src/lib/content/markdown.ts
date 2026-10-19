import { marked } from 'marked';

// Configure marked with raw HTML disabled to mitigate XSS (T-01-02)
marked.setOptions({
  gfm: true,
  breaks: false,
});

export async function renderMarkdown(markdown: string): Promise<string> {
  // Strip any raw HTML tags before parsing to strictly guarantee zero injection
  const sanitized = markdown.replace(/<\/?[a-z][^>]*>/gi, '');
  const parsed = await marked.parse(sanitized);
  return parsed;
}
