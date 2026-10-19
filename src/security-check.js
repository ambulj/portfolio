// Live Security Header Verification (§8.4)
// Fetches location.href via same-origin HEAD request and verifies §8.2 security headers.

const EXPECTED_HEADERS = [
  {
    name: 'content-security-policy',
    label: 'Content-Security-Policy',
    purpose: 'Blocks inline scripts, style attributes, and unlisted third-party domains.'
  },
  {
    name: 'strict-transport-security',
    label: 'Strict-Transport-Security',
    purpose: 'Enforces TLS and protects against protocol downgrade attacks.'
  },
  {
    name: 'x-content-type-options',
    label: 'X-Content-Type-Options',
    purpose: 'Prevents MIME-sniffing away from declared content-type.'
  },
  {
    name: 'x-frame-options',
    label: 'X-Frame-Options',
    purpose: 'Prevents framing and clickjacking attacks.'
  },
  {
    name: 'referrer-policy',
    label: 'Referrer-Policy',
    purpose: 'Limits path and query parameter leakage in HTTP referrers.'
  },
  {
    name: 'permissions-policy',
    label: 'Permissions-Policy',
    purpose: 'Disables access to device camera, microphone, and geolocation.'
  },
  {
    name: 'cross-origin-opener-policy',
    label: 'Cross-Origin-Opener-Policy',
    purpose: 'Isolates top-level document from cross-origin popups.'
  },
  {
    name: 'cross-origin-resource-policy',
    label: 'Cross-Origin-Resource-Policy',
    purpose: 'Restricts resource loading to same-origin requests.'
  }
];

export function initSecurityCheck() {
  const checkBtn = document.getElementById('check-headers-btn');
  const resultsContainer = document.getElementById('header-check-results');
  if (!checkBtn || !resultsContainer) return;

  checkBtn.addEventListener('click', async () => {
    checkBtn.disabled = true;
    checkBtn.textContent = 'Checking headers...';

    // Clear previous results
    while (resultsContainer.firstChild) {
      resultsContainer.removeChild(resultsContainer.firstChild);
    }

    try {
      const res = await fetch(window.location.href, {
        method: 'HEAD',
        cache: 'no-store'
      });

      const table = document.createElement('table');
      table.className = 'security-live-table';

      const thead = document.createElement('thead');
      const trHead = document.createElement('tr');
      ['Header', 'Status', 'Delivered Value'].forEach((thText) => {
        const th = document.createElement('th');
        th.textContent = thText;
        trHead.appendChild(th);
      });
      thead.appendChild(trHead);
      table.appendChild(thead);

      const tbody = document.createElement('tbody');
      let presentCount = 0;

      EXPECTED_HEADERS.forEach((h) => {
        const value = res.headers.get(h.name);
        const isPresent = Boolean(value);
        if (isPresent) presentCount++;

        const tr = document.createElement('tr');

        const tdName = document.createElement('td');
        const code = document.createElement('code');
        code.textContent = h.label;
        tdName.appendChild(code);
        tr.appendChild(tdName);

        const tdStatus = document.createElement('td');
        const badge = document.createElement('span');
        badge.className = isPresent ? 'header-badge-pass' : 'header-badge-fail';
        badge.textContent = isPresent ? 'PRESENT' : 'MISSING';
        tdStatus.appendChild(badge);
        tr.appendChild(tdStatus);

        const tdVal = document.createElement('td');
        const valCode = document.createElement('code');
        valCode.className = 'text-small text-quiet break-all';
        valCode.textContent = value || 'Not returned in HEAD response';
        tdVal.appendChild(valCode);
        tr.appendChild(tdVal);

        tbody.appendChild(tr);
      });

      table.appendChild(tbody);

      const summaryDiv = document.createElement('div');
      summaryDiv.className = 'mt-4 mb-3 font-heading';
      summaryDiv.textContent = `${presentCount} of ${EXPECTED_HEADERS.length} security headers verified active on this response.`;

      resultsContainer.appendChild(summaryDiv);
      resultsContainer.appendChild(table);
    } catch (err) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'text-fault';
      errorDiv.textContent = `Header check request failed: ${err.message}`;
      resultsContainer.appendChild(errorDiv);
    } finally {
      checkBtn.disabled = false;
      checkBtn.textContent = 'Re-check headers';
    }
  });
}
