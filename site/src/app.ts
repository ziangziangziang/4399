import { renderGameList } from './game.js';
import './styles.css';
import { initI18n, getLanguage, applyLanguage } from './i18n.js';

const app = document.getElementById('app');
if (!app) {
  throw new Error('App container not found');
}

function init(): void {
  applyLanguage(getLanguage());
  initI18n();
  if (app) {
    renderGameList(app);
  }
}

init();