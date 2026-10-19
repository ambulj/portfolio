// Generates the static constellation SVG from content/graph.json for Tier 0 visitors.
// Projection: isometric technical axonometric projection onto a 860x520 viewport.
// Strictly aria-hidden per DESIGN.md §4.4 (the Index list provides accessible navigation).

export function generateConstellationSvg(graphData, activeSlug = null) {
  const width = 860;
  const height = 520;
  const cx = 390;
  const cy = 250;

  // Project 3D (x, y, z) -> 2D (px, py)
  function project(pos) {
    const px = cx + pos.x * 42 - pos.z * 18;
    const py = cy - pos.y * 22 + pos.z * 16;
    return { x: Math.round(px * 10) / 10, y: Math.round(py * 10) / 10 };
  }

  const nodeMap = new Map();
  for (const node of graphData.nodes) {
    nodeMap.set(node.id, {
      ...node,
      pt: project(node.position)
    });
  }

  // Draw edges
  let edgesMarkup = '';
  for (const edge of graphData.edges) {
    const s = nodeMap.get(edge.source);
    const t = nodeMap.get(edge.target);
    if (!s || !t) continue;
    const isTech = edge.type === 'tech';
    const dash = isTech ? 'stroke-dasharray="3 3"' : '';
    edgesMarkup += `<line x1="${s.pt.x}" y1="${s.pt.y}" x2="${t.pt.x}" y2="${t.pt.y}" stroke="var(--rule)" stroke-width="1" ${dash} data-type="${edge.type}" />\n`;
  }

  // Draw nodes (non-interactive in SVG, Index list below handles keyboard/AT)
  let nodesMarkup = '';
  for (const [id, node] of nodeMap.entries()) {
    const isLarge = node.size === 'large';
    const r = isLarge ? 5.5 : 3.5;
    const isActive = activeSlug && node.slug === activeSlug;
    const fill = isActive ? 'var(--mark)' : 'var(--paper)';
    const stroke = 'var(--ink)';

    nodesMarkup += `
      <g class="graph-node ${isActive ? 'active' : ''}" data-id="${id}" data-slug="${node.slug || ''}">
        <circle cx="${node.pt.x}" cy="${node.pt.y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1.5" />
        <text x="${node.pt.x + (isLarge ? 9 : 7)}" y="${node.pt.y + 4}" font-family="var(--font-heading)" font-size="${isLarge ? 12 : 10}" font-weight="${isLarge ? 600 : 500}" fill="${isActive ? 'var(--ink)' : 'var(--quiet)'}">${node.label}</text>
      </g>
    `;
  }

  return `
<svg class="constellation-svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="none" />
  <g class="constellation-edges">
    ${edgesMarkup}
  </g>
  <g class="constellation-nodes">
    ${nodesMarkup}
  </g>
  <g class="constellation-legend" transform="translate(24, ${height - 30})">
    <line x1="0" y1="5" x2="24" y2="5" stroke="var(--rule)" stroke-width="1.5"/>
    <text x="32" y="9" font-family="var(--font-heading)" font-size="10" fill="var(--quiet)">Concept link</text>
    <line x1="120" y1="5" x2="144" y2="5" stroke="var(--rule)" stroke-width="1.5" stroke-dasharray="3 3"/>
    <text x="152" y="9" font-family="var(--font-heading)" font-size="10" fill="var(--quiet)">Shared technology</text>
  </g>
</svg>
`;
}
