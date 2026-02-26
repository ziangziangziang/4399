#!/usr/bin/env node

/**
 * vendor-fetch.mjs
 * Downloads vendor libraries from cdnjs based on vendor/manifest.json
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const vendorDir = join(rootDir, 'vendor');
const manifestPath = join(vendorDir, 'manifest.json');

// Using jsdelivr for npm packages (three.js) and cdnjs for others
const CDNJS_BASE = 'https://cdnjs.cloudflare.com/ajax/libs';
const JSDLIERY_BASE = 'https://cdn.jsdelivr.net/npm';

async function downloadFile(url, outputPath) {
  console.log(`Downloading: ${url}`);
  
  if (!existsSync(dirname(outputPath))) {
    mkdirSync(dirname(outputPath), { recursive: true });
  }

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  writeFileSync(outputPath, buffer);
  console.log(`Saved: ${outputPath}`);
}

async function fetchLibrary(name, libConfig) {
  const { version, files } = libConfig;
  const libDir = join(vendorDir, `${name}@${version}`);

  console.log(`\nFetching ${name}@${version}`);

  for (const file of files) {
    let cdnUrl;
    
    // three.js is on npm → use jsdelivr
    if (name === 'three') {
      cdnUrl = `${JSDLIERY_BASE}/${name}@${version}/${file}`;
    } else if (name === 'phaser') {
      cdnUrl = `${CDNJS_BASE}/${name}/${version}/${file}`;
    } else if (name === 'stats-js') {
      cdnUrl = `${CDNJS_BASE}/${name}/${version}/${file}`;
    } else if (name === 'lil-gui') {
      cdnUrl = `${CDNJS_BASE}/${name}/${version}/${file}`;
    }

    const outputPath = join(libDir, file);
    await downloadFile(cdnUrl, outputPath);
  }

  console.log(`✓ ${name}@${version} complete`);
}

async function main() {
  try {
    const manifestContent = readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestContent);

    console.log(`Vendor manifest version: ${manifest.version}`);
    console.log(`Fetching ${Object.keys(manifest.libraries).length} libraries...\n`);

    for (const [name, config] of Object.entries(manifest.libraries)) {
      await fetchLibrary(name, config);
    }

    console.log('\n✓ All vendor libraries fetched successfully!');
  } catch (error) {
    console.error('Error fetching vendor libraries:', error.message);
    process.exit(1);
  }
}

main();