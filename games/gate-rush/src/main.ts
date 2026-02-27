import { Game } from './game';

const game = new Game('game-canvas');
game.start();

declare global {
  interface Window {
    __GAME_INSTANCE__: Game;
  }
}

window.__GAME_INSTANCE__ = game;