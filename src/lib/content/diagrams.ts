import { getDiagramSvg as getSvgRaw } from '../../../scripts/diagrams.mjs';

export function getProjectDiagramSvg(slug: string, verified = false): string {
  try {
    const rawSvg = getSvgRaw(slug, verified);
    if (!rawSvg) return '';
    // Adapt CSS custom properties to Cyber-Command HUD tokens
    return rawSvg
      .replace(/var\(--paper\)/g, '#06090c')
      .replace(/var\(--ink\)/g, '#e6edf3')
      .replace(/var\(--rule\)/g, '#161e24')
      .replace(/var\(--quiet\)/g, '#8b949e');
  } catch {
    return '';
  }
}
