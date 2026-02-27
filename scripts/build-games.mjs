import { readdir, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT_DIR = join(__dirname, '..');
const GAMES_DIR = join(ROOT_DIR, 'games');

async function main() {
  console.log('Building games with esbuild...');
  
  const gamesDir = await readdir(GAMES_DIR);
  
  for (const slug of gamesDir) {
    const gameDir = join(GAMES_DIR, slug);
    const srcMainPath = join(gameDir, 'src', 'main.ts');
    const buildDir = join(gameDir, 'build');
    
    let mainTsExists = false;
    try {
      const { stat } = await import('node:fs/promises');
      const s = await stat(srcMainPath);
      mainTsExists = s.isFile();
    } catch {
      // File doesn't exist
    }
    
    if (!mainTsExists) {
      console.log(`  Skipped ${slug}: no src/main.ts`);
      continue;
    }
    
    console.log(`  Building: ${slug}`);
    
    await mkdir(buildDir, { recursive: true });
    
    await build({
      entryPoints: [srcMainPath],
      bundle: true,
      outfile: join(buildDir, 'main.js'),
      format: 'iife',
      target: 'es2020',
      minify: false,
      sourcemap: false,
    });
    
    const indexHtml = join(gameDir, 'index.html');
    try {
      await copyFile(indexHtml, join(buildDir, 'index.html'));
    } catch {
      // No index.html in game directory, skip
    }
    
    console.log(`  ✓ Built: ${slug}`);
  }
  
  console.log('✓ Games build complete');
}

main().catch(err => {
  console.error('Error building games:', err);
  process.exit(1);
});