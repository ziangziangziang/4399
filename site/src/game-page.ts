import { t, getLanguage, applyLanguage, initI18n } from './i18n.js';

export interface Game {
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  icon: string;
  tags: string[];
  category: string;
  categoryZh: string;
}

let currentGame: Game | null = null;

function getSlugFromURL(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('slug');
}

async function loadCatalog(): Promise<Game[]> {
  try {
    const response = await fetch('./catalog.json');
    const data = await response.json();
    return Array.isArray(data) ? data : data.games || [];
  } catch (error) {
    console.error('Failed to load catalog:', error);
    return [];
  }
}

async function findGame(slug: string): Promise<Game | null> {
  const games = await loadCatalog();
  return games.find(game => game.slug === slug) || null;
}

function renderGamePage(container: HTMLElement, game: Game): void {
  const category = getLanguage().startsWith('en') ? game.category : game.categoryZh;
  
  container.innerHTML = `
    <main class="game-page-main">
      <div class="game-header">
        <div class="game-info">
          <h1 class="game-title">${game.title}</h1>
          <p class="game-desc">${game.description}</p>
          <div class="game-tags">
            ${game.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
        </div>
      </div>
      
      <div class="game-frame-container">
        <iframe 
          id="game-frame" 
          src="./play/${game.slug}/index.html"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; pointer-lock; fullscreen; camera; microphone"
          allowfullscreen
          width="800"
          height="600"
        ></iframe>
      </div>
      
      <section class="game-recommend">
        <h2 data-i18n="game.recommend">相关推荐</h2>
        <div class="recommend-grid" id="recommend-grid"></div>
      </section>
    </main>
  `;
}

function renderRecommendations(container: HTMLElement, currentSlug: string): void {
  loadCatalog().then(games => {
    const recommended = games
      .filter(game => game.slug !== currentSlug)
      .slice(0, 4);
    
    const grid = container.querySelector('.recommend-grid');
    if (!grid) return;
    
    grid.innerHTML = recommended.map(game => `
      <a href="./game.html?slug=${game.slug}" class="recommend-card">
        <img src="${game.thumbnail}" alt="${game.title}" loading="lazy">
        <div class="recommend-info">
          <h3>${game.title}</h3>
        </div>
      </a>
    `).join('');
  });
}

function initLanguageToggle(): void {
  const langBtn = document.getElementById('lang-btn');
  if (!langBtn) return;
  
  langBtn.addEventListener('click', () => {
    const currentLang = getLanguage();
    const newLang = currentLang.startsWith('en') ? 'zh-CN' : 'en-US';
    applyLanguage(newLang);
    langBtn.textContent = newLang.startsWith('en') ? 'EN' : '中文';
    initI18n();
  });
}

function initBackAndExit(): void {
  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.history.back();
    });
  }
  
  const exitBtn = document.querySelector('.main-nav .nav-link');
  if (exitBtn) {
    exitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = './index.html';
    });
  }
}

function init(): void {
  applyLanguage(getLanguage());
  initI18n();
  
  const app = document.getElementById('app');
  if (!app) {
    console.error('App container not found');
    return;
  }
  
  const slug = getSlugFromURL();
  if (!slug) {
    app.innerHTML = '<p>游戏未找到</p>';
    return;
  }
  
  findGame(slug).then(game => {
    if (!game) {
      app.innerHTML = '<p>游戏未找到</p>';
      return;
    }
    
    currentGame = game;
    renderGamePage(app, game);
    renderRecommendations(app, slug);
    initLanguageToggle();
    initBackAndExit();
  });
}

init();