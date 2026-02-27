export type Lang = 'zh-CN' | 'en-US';

export const translations: Record<Lang, Record<string, string>> = {
  'zh-CN': {
    'app.title': '4399 小游戏',
    'app.description': '经典小游戏 portal',
    'nav.home': '首页',
    'nav.back': '返回',
    'nav.exit': '退出',
    'game.play': '开始游戏',
    'game.rating': '评分',
    'game.views': '次播放',
    'game.recommend': '相关推荐',
    'search.placeholder': '搜索游戏...',
    'search.noResults': '未找到相关游戏',
    'catalog.latest': '最新游戏',
    'catalog.popular': '热门游戏',
    'catalog.all': '全部游戏',
    'catalog.categories': '游戏分类',
    'catalog.megaCategory': '全部分类',
    'ranking.top10': '热门排行榜',
    'game.category': '分类',
    'footer.desc': '经典小游戏，怀旧 portal',
    'nav.categories': '分类',
    'nav.ranking': '排行',
  },
  'en-US': {
    'app.title': '4399 Mini Games',
    'app.description': 'Classic mini games portal',
    'nav.home': 'Home',
    'nav.back': 'Back',
    'nav.exit': 'Exit',
    'game.play': 'Play Game',
    'game.rating': 'Rating',
    'game.views': 'views',
    'game.recommend': 'Recommended',
    'search.placeholder': 'Search games...',
    'search.noResults': 'No games found',
    'catalog.latest': 'Latest Games',
    'catalog.popular': 'Popular Games',
    'catalog.all': 'All Games',
    'catalog.categories': 'Categories',
    'catalog.megaCategory': 'All Categories',
    'ranking.top10': 'Top 10 Ranking',
    'game.category': 'Category',
    'footer.desc': 'Classic mini games, nostalgia portal',
    'nav.categories': 'Categories',
    'nav.ranking': 'Ranking',
  }
};

const STORAGE_KEY = '4399_language';

export function detectLanguage(): Lang {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'en-US' || stored === 'zh-CN') {
    return stored;
  }
  return 'zh-CN';
}

export function setLanguage(lang: Lang): void {
  localStorage.setItem(STORAGE_KEY, lang);
  applyLanguage(lang);
}

export function getLanguage(): Lang {
  return (localStorage.getItem(STORAGE_KEY) as Lang) || detectLanguage();
}

export function applyLanguage(lang: Lang): void {
  document.documentElement.lang = lang;
  const toggle = document.getElementById('language-toggle');
  if (toggle) {
    toggle.textContent = translations[lang]['language.toggle'];
    toggle.setAttribute('data-lang', lang);
  }
  updateTexts(lang);
}

export function t(key: string, lang: Lang = getLanguage()): string {
  return translations[lang][key] || key;
}

export function updateTexts(lang: Lang = getLanguage()): void {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      el.textContent = t(key, lang);
    }
  });
}

export function initI18n(): void {
  const lang = getLanguage();
  applyLanguage(lang);
  
  const toggle = document.getElementById('language-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const current = getLanguage();
      const next = current === 'zh-CN' ? 'en-US' : 'zh-CN';
      setLanguage(next);
    });
  }
}