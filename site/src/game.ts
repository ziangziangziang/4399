import { t, getLanguage, applyLanguage } from './i18n.js';

export interface Game {
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  icon: string;
  tags: string[];
  category: string;
  categoryZh: string;
  rating: number;
  views: number;
  publishedAt: string;
}

let games: Game[] = [];
let categories: Map<string, { games: Game[], title: string, titleZh: string }> = new Map();
let selectedGame: Game | null = null;

async function loadCatalog(): Promise<void> {
  try {
    const response = await fetch('./catalog.json');
    const data = await response.json();
    games = Array.isArray(data) ? data : data.games || [];
    categories = await generateCategories(games);
  } catch (error) {
    console.error('Failed to load catalog:', error);
    games = [];
    categories = new Map();
  }
}

async function generateCategories(games: Game[]): Promise<Map<string, { games: Game[], title: string, titleZh: string }>> {
  const categoryMap = new Map<string, { games: Game[], title: string, titleZh: string }>();
  
  games.forEach(game => {
    const categoryKey = game.category || 'other';
    const categoryTitle = getLanguage().startsWith('en') ? game.category || 'Other' : game.categoryZh || '其他';
    
    if (!categoryMap.has(categoryKey)) {
      categoryMap.set(categoryKey, { games: [], title: categoryTitle, titleZh: categoryTitle });
    }
    categoryMap.get(categoryKey)!.games.push(game);
  });
  
  return categoryMap;
}

export function renderGameList(container: HTMLElement): void {
  container.innerHTML = `
    <div class="top-bar">
      <div class="container">
        <span data-i18n="topbar.desc">经典小游戏，怀旧 portal</span>
        <button id="language-toggle" data-i18n="language.toggle">EN</button>
      </div>
    </div>
    
    <header class="portal-header">
      <h1 data-i18n="app.title">4399 小游戏</h1>
      <div class="header-actions">
        <input type="text" class="search-input" placeholder="${t('search.placeholder')}" id="search-input">
        <button class="green-button" data-i18n="header.play">开始游戏</button>
      </div>
    </header>
    
    <nav class="main-nav">
      <div class="container">
        <button class="nav-link active" data-filter="all" data-i18n="catalog.all">全部</button>
        <div class="category-tabs" id="category-tabs"></div>
      </div>
    </nav>
    
    <div class="portal-layout">
      <aside class="sidebar">
        <div class="mega-category">
          <h3 data-i18n="categories.megaTitle">分类浏览</h3>
          <div class="mega-links" id="mega-links"></div>
        </div>
      </aside>
      
      <main class="main-content">
        <div class="game-grid" id="game-grid"></div>
      </main>
      
      <aside class="ranking-sidebar">
        <div class="ranking-section">
          <h3 data-i18n="categories.ranking">排行榜</h3>
          <div class="ranking-list" id="ranking-list"></div>
        </div>
      </aside>
    </div>
    
    <footer class="portal-footer">
      <p data-i18n="footer.desc">经典小游戏，怀旧 portal</p>
    </footer>
  `;

  loadCatalog().then(() => {
    renderCategories();
    renderCategoryTabs();
    renderMegaLinks();
    renderGames(games);
    renderRanking();
    setupFilters();
    setupSearch();
    setupLanguageToggle();
  }).catch(err => {
    console.error('Failed to load catalog or render:', err);
  });
}

function renderCategories(): void {
  const categoryList = document.getElementById('category-list');
  if (!categoryList) return;
  
  const items = Array.from(categories.entries()).map(([key, data]) => {
    const title = getLanguage().startsWith('en') ? data.title : data.titleZh;
    return `<a href="#" class="category-item" data-category="${key}">${title}</a>`;
  }).join('');
  
  categoryList.innerHTML = items;
  
  categoryList.addEventListener('click', (e) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    const category = target.getAttribute('data-category');
    
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    if (category) {
      const filtered = categories.get(category)?.games || [];
      renderGames(filtered);
    } else {
      renderGames(games);
    }
  });
}

function renderRanking(): void {
  const rankingList = document.getElementById('ranking-list');
  if (!rankingList) return;
  
  const sorted = [...games].sort((a, b) => b.views - a.views).slice(0, 10);
  
  rankingList.innerHTML = sorted.map((game, index) => `
    <a href="./game.html?slug=${game.slug}" class="ranking-item">
      <span class="ranking-rank">${index + 1}</span>
      <span class="ranking-title">${game.title}</span>
    </a>
  `).join('');
}

function renderGames(gameList: Game[]): void {
  console.log('renderGames called with:', gameList.length, 'games');
  const grid = document.getElementById('game-grid');
  if (!grid) {
    console.error('Game grid element not found');
    return;
  }

  if (gameList.length === 0) {
    grid.innerHTML = `<p class="no-results">${t('search.noResults')}</p>`;
    return;
  }

  grid.innerHTML = gameList.map(game => `
    <div class="game-card" data-slug="${game.slug}">
      <div class="game-thumbnail">
        <img src="${game.thumbnail}" alt="${game.title}" loading="lazy">
      </div>
      <div class="game-info">
        <h3 class="game-title">${game.title}</h3>
        <p class="game-desc">${game.description}</p>
        <div class="game-meta">
          <span class="game-rating">★ ${game.rating.toFixed(1)}</span>
          <span class="game-views">${game.views} ${t('game.views')}</span>
        </div>
        <div class="game-tags">
          ${game.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      </div>
    </div>
  `).join('');

  grid.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const card = target.closest('.game-card');
    if (card) {
      const slug = card.getAttribute('data-slug');
      const game = games.find(g => g.slug === slug);
      if (game) {
        showGameModal(game);
      }
    }
  });
}

function setupFilters(): void {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      navLinks.forEach(l => l.classList.remove('active'));
      target.classList.add('active');
      
      const filter = target.getAttribute('data-filter');
      let filteredGames = games;
      
      if (filter === 'popular') {
        filteredGames = [...games].sort((a, b) => b.views - a.views);
      } else if (filter === 'latest') {
        filteredGames = [...games].sort((a, b) => 
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
      }
      
      renderGames(filteredGames);
    });
  });
}

function setupSearch(): void {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = (e.target as HTMLInputElement).value.toLowerCase();
    const filteredGames = games.filter(game => 
      game.title.toLowerCase().includes(query) ||
      game.description.toLowerCase().includes(query) ||
      game.tags.some(tag => tag.toLowerCase().includes(query))
    );
    renderGames(filteredGames);
  });
}

function renderCategoryTabs(): void {
  const tabsContainer = document.getElementById('category-tabs');
  if (!tabsContainer) return;
  
  const categoryItems = Array.from(categories.entries()).map(([key, data]) => {
    const title = getLanguage().startsWith('en') ? data.title : data.titleZh;
    const count = data.games.length;
    return { key, title, count };
  }).sort((a, b) => b.count - a.count);
  
  tabsContainer.innerHTML = categoryItems.map(item => `
    <button class="nav-link category-tab" data-category="${item.key}">
      ${item.title} (${item.count})
    </button>
  `).join('');
  
  tabsContainer.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('category-tab')) {
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      target.classList.add('active');
      
      const category = target.getAttribute('data-category');
      if (category) {
        const filtered = categories.get(category)?.games || [];
        renderGames(filtered);
      }
    }
  });
}

function renderMegaLinks(): void {
  const megaContainer = document.getElementById('mega-links');
  if (!megaContainer) return;
  
  const categoryItems = Array.from(categories.entries()).map(([key, data]) => {
    const title = getLanguage().startsWith('en') ? data.title : data.titleZh;
    const count = data.games.length;
    return { key, title, count };
  }).sort((a, b) => b.count - a.count);
  
  megaContainer.innerHTML = categoryItems.map(item => `
    <a href="#" class="mega-link" data-category="${item.key}">
      ${item.title} (${item.count})
    </a>
  `).join('');
  
  megaContainer.addEventListener('click', (e) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    const category = target.getAttribute('data-category');
    
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    if (category) {
      const filtered = categories.get(category)?.games || [];
      renderGames(filtered);
      
      document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-category') === category) {
          tab.classList.add('active');
        }
      });
      
      const allLink = document.querySelector('[data-filter="all"]');
      if (allLink) allLink.classList.remove('active');
    }
  });
}

function showGameModal(game: Game): void {
  selectedGame = game;
  
  const modal = document.createElement('div');
  modal.className = 'game-modal';
  modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-content">
      <button class="modal-close">&times;</button>
      <div class="modal-header">
        <img src="${game.thumbnail}" alt="${game.title}" class="modal-thumbnail">
        <h2 class="modal-title">${game.title}</h2>
      </div>
      <div class="modal-body">
        <p class="modal-desc">${game.description}</p>
        <div class="modal-meta">
          <span class="modal-category">${game.categoryZh || game.category}</span>
          <span class="modal-rating">★ ${game.rating.toFixed(1)}</span>
          <span class="modal-views">${game.views} ${t('game.views')}</span>
        </div>
        <div class="modal-tags">
          ${game.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        <button class="modal-play-btn" data-i18n="game.play">开始游戏</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  modal.classList.add('modal-visible');
  
  const closeBtn = modal.querySelector('.modal-close');
  const overlay = modal.querySelector('.modal-overlay');
  const playBtn = modal.querySelector('.modal-play-btn');
  
  const closeModal = () => {
    modal.classList.remove('modal-visible');
    setTimeout(() => modal.remove(), 300);
  };
  
  closeBtn?.addEventListener('click', closeModal);
  overlay?.addEventListener('click', closeModal);
  
  playBtn?.addEventListener('click', () => {
    window.location.href = `./game.html?slug=${game.slug}`;
  });
}

function setupLanguageToggle(): void {
  const toggleBtn = document.getElementById('language-toggle');
  if (!toggleBtn) return;
  
  toggleBtn.addEventListener('click', () => {
    const current = getLanguage();
    const next = current.startsWith('en') ? 'zh-CN' : 'en-US';
    localStorage.setItem('language', next);
    applyLanguage(next);
    location.reload();
  });
}