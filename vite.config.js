import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default {
  base: './',
  root: resolve(__dirname, 'site'),
  build: {
    outDir: resolve(__dirname, 'site/dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'site/index.html'),
        game: resolve(__dirname, 'site/game.html'),
      },
    },
  },
  publicDir: resolve(__dirname, 'site/public'),
};
