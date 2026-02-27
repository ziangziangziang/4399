import { readdir, copyFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT_DIR = join(__dirname, '..');
const GAMES_DIR = join(ROOT_DIR, 'games');
const SITE_PLAY_DIR = join(ROOT_DIR, 'site', 'public', 'play');

async function copyDirectory(srcDir, destDir) {
  try {
    const entries = await readdir(srcDir, { withFileTypes: true });
    console.log(`    Reading ${srcDir}: ${entries.map(e => e.name).join(', ')}`);
    for (const entry of entries) {
      const srcPath = join(srcDir, entry.name);
      const destPath = join(destDir, entry.name);
      if (entry.isDirectory()) {
        await mkdir(destPath, { recursive: true });
        await copyDirectory(srcPath, destPath);
      } else {
        await copyFile(srcPath, destPath);
      }
    }
  } catch (err) {
    console.log(`    Error copying from ${srcDir}: ${err.message}`);
    // Directory doesn't exist, that's ok
  }
}

async function main() {
  console.log('Assembling games to site/public/play...');
  
  const gamesDir = await readdir(GAMES_DIR);
  
  for (const slug of gamesDir) {
    const gameDir = join(GAMES_DIR, slug);
    const buildDir = join(gameDir, 'build');
    const assetsDir = join(gameDir, 'assets');
    const playDir = join(SITE_PLAY_DIR, slug);
    
    try {
      await readdir(buildDir);
    } catch {
      console.log(`  Skipped ${slug}: no build directory`);
      continue;
    }
    
    console.log(`  Assembling: ${slug}`);
    
    await mkdir(playDir, { recursive: true });
    
    // Copy build files
    const buildFiles = await readdir(buildDir);
    for (const file of buildFiles) {
      await copyFile(join(buildDir, file), join(playDir, file));
    }
    
    // Copy assets if they exist
    try {
      await readdir(assetsDir);
      await mkdir(join(playDir, 'assets'), { recursive: true });
      await copyDirectory(assetsDir, join(playDir, 'assets'));
      console.log(`    Copied assets`);
    } catch {
      // No assets directory, that's ok
    }
    
    console.log(`  ✓ Assembled: ${slug}`);
  }
  
  console.log('✓ Assembly complete');
}

main().catch(err => {
  console.error('Error assembling:', err);
  process.exit(1);
});