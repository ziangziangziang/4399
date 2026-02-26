import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';
  
  return {
    base: isProd ? '/4399/' : '/',
    root: 'site',
    publicDir: 'public',
    build: {
      outDir: '../site/dist',
      emptyOutDir: true,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'site/src'),
      },
    },
  };
});