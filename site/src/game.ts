export interface Game {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  controls: string[];
  playPath: string;
  thumbnail: string;
  icon: string;
  libs?: {
    three?: string;
    phaser?: string;
  };
}

let catalog: Game[] = [];

const baseUrl = (import.meta as any).env.BASE_URL;

async function loadCatalog(): Promise<Game[]> {
  if (catalog.length > 0) return catalog;
  
  const response = await fetch(baseUrl + 'catalog.json');
  catalog = await response.json();
  return catalog;
}

export async function renderGameList(container: HTMLElement) {
  const games = await loadCatalog();
  
  container.innerHTML = `
    <header class="header">
      <h1>Game Portal</h1>
      <p class="subtitle">A collection of browser games</p>
    </header>
    <main class="game-grid">
      ${games.map(game => `
        <article class="game-card" data-slug="${game.slug}">
          <img src="${game.thumbnail}" alt="${game.title}" class="game-thumbnail" />
          <div class="game-info">
            <h2 class="game-title">${game.title}</h2>
            <p class="game-description">${game.description}</p>
            <div class="game-tags">${game.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
            <button class="play-button" data-slug="${game.slug}">Play</button>
          </div>
        </article>
      `).join('')}
    </main>
  `;
  
  container.querySelectorAll('.play-button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const slug = (e.target as HTMLElement).dataset.slug;
      if (slug) {
        window.history.pushState({}, '', baseUrl + 'play/' + slug);
        router();
      }
    });
  });
  
  container.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const slug = (e.target as HTMLElement).dataset.slug;
      if (slug) {
        window.history.pushState({}, '', baseUrl + 'play/' + slug);
        router();
      }
    });
  });
}

export async function renderGameDetail(container: HTMLElement, slug: string) {
  const games = await loadCatalog();
  const game = games.find(g => g.slug === slug);
  
  if (!game) {
    container.innerHTML = `
      <main class="game-detail">
        <h1>Game not found</h1>
        <p><a href="${baseUrl}">Return home</a></p>
      </main>
    `;
    return;
  }
  
  container.innerHTML = `
    <header class="header">
      <a href="${baseUrl}" class="back-link">← Back to games</a>
      <h1>${game.title}</h1>
    </header>
    <main class="game-detail">
      <div class="game-header">
        <img src="${game.icon}" alt="${game.title}" class="game-icon" />
        <div class="game-meta">
          ${game.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      </div>
      <div class="game-play">
        <iframe src="${baseUrl}${game.playPath}" class="game-frame" frameborder="0" allowfullscreen></iframe>
      </div>
      <section class="game-info">
        <h2>About</h2>
        <p>${game.description}</p>
        <h2>Controls</h2>
        <ul class="controls-list">
          ${game.controls.map(c => `<li>${c}</li>`).join('')}
        </ul>
      </section>
    </main>
  `;
}

function router() {
  const path = window.location.pathname;
  const gameSlug = getGameSlugFromPath(path);
  
  if (gameSlug) {
    renderGameDetail(document.getElementById('app')!, gameSlug);
  } else {
    renderGameList(document.getElementById('app')!);
  }
}

function getGameSlugFromPath(path: string): string | null {
  const match = path.match(/^\/play\/([^/]+)/);
  return match ? match[1] : null;
}