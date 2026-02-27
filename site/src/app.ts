import { renderGameList, renderGameDetail } from './game.js';
import './styles.css';

const app = document.getElementById('app');
if (!app) {
  throw new Error('App container not found');
}

const baseUrl = (import.meta as any).env.BASE_URL;

function getBaseUrlPath(): string {
  return baseUrl.startsWith('/') ? baseUrl : '/';
}

function getHomePath(): string {
  const base = getBaseUrlPath();
  return base.endsWith('/') ? base : base + '/';
}

function getGameSlugFromPath(path: string): string | null {
  const base = getBaseUrlPath();
  const gamePath = base + 'play/';
  const match = path.match(new RegExp(`^${gamePath}([^/]+)`));
  return match ? match[1] : null;
}

function isHomePage(path: string): boolean {
  const base = getBaseUrlPath();
  return path === base || path === base + 'index.html';
}

function router() {
  const path = window.location.pathname;
  
  const gameSlug = getGameSlugFromPath(path);
  if (gameSlug) {
    if (app) renderGameDetail(app, gameSlug);
    return;
  }
  
  if (isHomePage(path)) {
    if (app) renderGameList(app);
    return;
  }
  
  if (app) renderGameList(app);
}

window.addEventListener('hashchange', router);
window.addEventListener('popstate', router);
router();