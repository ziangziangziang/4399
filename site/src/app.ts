import { renderGameList, renderGameDetail } from './game.js';
import './styles.css';

const app = document.getElementById('app');
if (!app) {
  throw new Error('App container not found');
}

// Simple router
const routes: { [path: string]: () => void } = {
  '/': () => renderGameList(app),
};

function getGameSlugFromPath(path: string): string | null {
  const match = path.match(/^\/play\/([^/]+)/);
  return match ? match[1] : null;
}

function router() {
  const path = window.location.pathname;
  
  const gameSlug = getGameSlugFromPath(path);
  if (gameSlug) {
    renderGameDetail(app, gameSlug);
    return;
  }
  
  const routeFn = routes[path] || routes['/'];
  routeFn();
}

window.addEventListener('hashchange', router);
window.addEventListener('popstate', router);
router();