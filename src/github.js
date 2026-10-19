// Live GitHub feed with 10-minute sessionStorage caching and build-time snapshot fallback
// Rules:
// - Fetches both users: ambulj and Bloated11
// - Renders API data STRICTLY with textContent, never as HTML (blocks injection)
// - Never shows stars, forks, or commit counts
// - On 403, network failure, or rate limit: displays "Showing the last saved list."

const CACHE_KEY = 'portfolio_github_repos_v1';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function initGitHubFeed() {
  const container = document.getElementById('github-feed-container');
  if (!container) return;

  const statusEl = document.getElementById('github-feed-status');
  const listEl = document.getElementById('github-feed-list');
  if (!listEl) return;

  // Render snapshot fallback immediately if list is empty
  const rawSnapshot = container.getAttribute('data-snapshot');
  let snapshotData = [];
  try {
    if (rawSnapshot) {
      snapshotData = JSON.parse(rawSnapshot);
    }
  } catch (e) {
    // ignore parse error
  }

  function renderRepos(repos, isSnapshot = false, statusMessage = '') {
    // Clear list safely
    while (listEl.firstChild) {
      listEl.removeChild(listEl.firstChild);
    }

    if (statusEl) {
      statusEl.textContent = statusMessage;
    }

    if (!repos || repos.length === 0) {
      const emptyLi = document.createElement('li');
      emptyLi.className = 'text-quiet text-small';
      emptyLi.textContent = 'No repositories found.';
      listEl.appendChild(emptyLi);
      return;
    }

    // Render each repo using strict textContent
    repos.forEach((repo) => {
      const li = document.createElement('li');
      li.className = 'github-repo-item';

      const headerDiv = document.createElement('div');
      headerDiv.className = 'github-repo-header';

      const link = document.createElement('a');
      link.href = repo.html_url || `https://github.com/${repo.owner}/${repo.name}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      // CRITICAL SECURITY REQUIREMENT: textContent only!
      link.textContent = repo.name || 'Untitled';
      headerDiv.appendChild(link);

      const ownerBadge = document.createElement('span');
      ownerBadge.className = 'github-repo-owner';
      ownerBadge.textContent = repo.owner || '';
      headerDiv.appendChild(ownerBadge);

      li.appendChild(headerDiv);

      if (repo.description) {
        const descP = document.createElement('p');
        descP.className = 'github-repo-desc';
        // CRITICAL SECURITY REQUIREMENT: textContent only!
        descP.textContent = repo.description;
        li.appendChild(descP);
      }

      const metaDiv = document.createElement('div');
      metaDiv.className = 'github-repo-meta';

      const langSpan = document.createElement('span');
      langSpan.className = 'github-repo-lang';
      langSpan.textContent = repo.language || 'Plain text';
      metaDiv.appendChild(langSpan);

      const dateSpan = document.createElement('span');
      dateSpan.className = 'github-repo-date';
      const pushDate = repo.pushed_at || repo.updated_at;
      if (pushDate) {
        try {
          const dateStr = new Date(pushDate).toISOString().split('T')[0];
          dateSpan.textContent = `Pushed ${dateStr}`;
        } catch {
          dateSpan.textContent = `Pushed ${pushDate}`;
        }
      } else {
        dateSpan.textContent = 'Active';
      }
      metaDiv.appendChild(dateSpan);

      li.appendChild(metaDiv);
      listEl.appendChild(li);
    });
  }

  // 1. Check cache in sessionStorage
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL_MS && Array.isArray(data) && data.length > 0) {
        renderRepos(data, false, 'Live from GitHub API (cached)');
        return;
      }
    }
  } catch (err) {
    // sessionStorage disabled or unavailable
  }

  // 2. Fetch live data from GitHub API
  try {
    const [res1, res2] = await Promise.all([
      fetch('https://api.github.com/users/ambulj/repos?per_page=100&sort=pushed', {
        headers: { Accept: 'application/vnd.github.v3+json' }
      }),
      fetch('https://api.github.com/users/Bloated11/repos?per_page=100&sort=pushed', {
        headers: { Accept: 'application/vnd.github.v3+json' }
      })
    ]);

    if (!res1.ok || !res2.ok) {
      throw new Error(`GitHub API HTTP error: ${res1.status} / ${res2.status}`);
    }

    const data1 = await res1.json();
    const data2 = await res2.json();

    if (!Array.isArray(data1) || !Array.isArray(data2)) {
      throw new Error('Invalid JSON response format from GitHub API');
    }

    const formatRepo = (r, owner) => ({
      name: r.name,
      description: r.description,
      language: r.language,
      pushed_at: r.pushed_at,
      html_url: r.html_url,
      owner: owner,
      private: r.private
    });

    const combined = [
      ...data1.filter(r => !r.private && r.name !== 'Inferyx').map(r => formatRepo(r, 'ambulj')),
      ...data2.filter(r => !r.private).map(r => formatRepo(r, 'Bloated11'))
    ];

    // Sort by pushed_at descending
    combined.sort((a, b) => new Date(b.pushed_at || 0) - new Date(a.pushed_at || 0));

    // Save to sessionStorage
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({
        data: combined,
        timestamp: Date.now()
      }));
    } catch {
      // sessionStorage full or blocked
    }

    renderRepos(combined, false, 'Live from GitHub API');
  } catch (err) {
    // Fall back to build-time snapshot with required message
    renderRepos(snapshotData, true, 'Showing the last saved list.');
  }
}
