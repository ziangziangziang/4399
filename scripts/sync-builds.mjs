import { readdir, copyFile, access, mkdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT_DIR = join(__dirname, '..');
const GAMES_DIR = join(ROOT_DIR, 'games');
const SITE_OUTPUT_DIR = join(ROOT_DIR, 'site', 'dist', 'play');

async function copyDir(src, dest) {
  const entries = await readdir(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    
    if (entry.isDirectory()) {
      await mkdir(destPath, { recursive: true });
      await copyDir(srcPath, destPath);
    } else {
      await copyFile(srcPath, destPath);
    }
  }
}

async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log('Syncing game builds...');
  
  const gamesDir = await readdir(GAMES_DIR);
  let syncedCount = 0;
  
  for (const slug of gamesDir) {
    const gameDir = join(GAMES_DIR, slug);
    const buildDir = join(gameDir, 'build');
    
    if (!(await pathExists(buildDir))) {
      console.log(`  Skipping ${slug}: no build directory`);
      continue;
    }
    
    const gameOutputDir = join(SITE_OUTPUT_DIR, slug);
    await mkdir(gameOutputDir, { recursive: true });
    
    await copyDir(buildDir, gameOutputDir);
    console.log(`  Synced: ${slug}`);
    syncedCount++;
  }
  
  console.log(`✓ Synced ${syncedCount} game(s)`);
}

main().catch(err => {
  console.error('Error syncing builds:', err);
  process.exit(1);
});