import { copyFile, mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT_DIR = join(__dirname, '..');
const VENDOR_DIR = join(ROOT_DIR, 'vendor');
const PLAY_DIR = join(ROOT_DIR, 'site', 'dist', 'play');
const PUBLIC_DIR = join(ROOT_DIR, 'site', 'public');

async function copyDirRecursive(src, dest) {
  try {
    const entries = await readdir(src, { withFileTypes: true });
    await mkdir(dest, { recursive: true });
    
    for (const entry of entries) {
      const srcPath = join(src, entry.name);
      const destPath = join(dest, entry.name);
      
      if (entry.isDirectory()) {
        await copyDirRecursive(srcPath, destPath);
      } else {
        await copyFile(srcPath, destPath);
      }
    }
  } catch (err) {
    // Directory might not exist, which is ok
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }
}

async function main() {
  console.log('Copying static assets to public...');
  
  // Copy vendor directory
  await copyDirRecursive(VENDOR_DIR, join(PUBLIC_DIR, 'vendor'));
  console.log('  Copied: vendor/');
  
  // Copy play directory (game builds synced by sync-builds)
  await copyDirRecursive(PLAY_DIR, join(PUBLIC_DIR, 'play'));
  console.log('  Copied: play/');
  
  console.log('✓ Assets copied to site/public/');
}

main().catch(err => {
  console.error('Error copying assets:', err);
  process.exit(1);
});