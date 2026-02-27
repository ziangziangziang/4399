import { SkyDominatorGame } from './game';

document.addEventListener('DOMContentLoaded', () => {
  const gameContainer = document.getElementById('game-container');
  if (!gameContainer) {
    console.error('Game container not found');
    return;
  }

  const game = new SkyDominatorGame(gameContainer);

  // Start button
  document.getElementById('start-btn')?.addEventListener('click', () => {
    game.start();
  });

  // Resume button
  document.getElementById('resume-btn')?.addEventListener('click', () => {
    game.resume();
  });

  // Restart button
  document.getElementById('restart-btn')?.addEventListener('click', () => {
    game.restart();
  });
});