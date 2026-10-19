// Contrast calculation script based on WCAG 2.1 relative luminance
function luminance(hex) {
  const rgb = hex.replace('#', '').match(/.{2}/g).map(x => parseInt(x, 16) / 255);
  const a = rgb.map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function contrast(hex1, hex2) {
  const lum1 = luminance(hex1);
  const lum2 = luminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

const lightTokens = {
  paper: '#E8ECE9',
  ink: '#1E2528',
  rule: '#C3CCC7',
  quiet: '#5B6A6E',
  mark: '#F2C500',
  fault: '#B3261E'
};

const darkTokens = {
  paper: '#1D2A28',
  ink: '#E8ECE9',
  rule: '#3A4B48',
  quiet: '#A3B3AF',
  mark: '#F2C500',
  fault: '#FF7A6B'
};

console.log('=== Light Theme Contrast ===');
console.log('ink on paper:', contrast(lightTokens.ink, lightTokens.paper).toFixed(2), '(target >= 4.5:1)');
console.log('quiet on paper:', contrast(lightTokens.quiet, lightTokens.paper).toFixed(2), '(target >= 4.5:1)');
console.log('fault on paper:', contrast(lightTokens.fault, lightTokens.paper).toFixed(2), '(target >= 4.5:1)');
console.log('ink on mark (highlighter):', contrast(lightTokens.ink, lightTokens.mark).toFixed(2), '(target >= 4.5:1)');

console.log('\n=== Dark Theme Contrast ===');
console.log('ink on paper:', contrast(darkTokens.ink, darkTokens.paper).toFixed(2), '(target >= 4.5:1)');
console.log('quiet on paper:', contrast(darkTokens.quiet, darkTokens.paper).toFixed(2), '(target >= 4.5:1)');
console.log('fault on paper:', contrast(darkTokens.fault, darkTokens.paper).toFixed(2), '(target >= 4.5:1)');
console.log('ink on mark (highlighter):', contrast('#1E2528', darkTokens.mark).toFixed(2), '(target >= 4.5:1)');
