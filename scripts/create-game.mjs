#!/usr/bin/env node
/**
 * create-game.mjs
 * 
 * Creates a new game from prompt.md file.
 * Reads prompt.md from games/{slug}/, infers:
 * - Library (Three.js, Phaser, or vanilla)
 * - Game metadata (title, description, tags, etc.)
 * - Image prompt for icon generation
 * 
 * Then:
 * 1. Creates directory structure
 * 2. Copies appropriate template
 * 3. Generates game.yml
 * 4. Creates icons via waypoint MCP
 * 5. Runs build pipeline
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const GAMES_DIR = join(ROOT, 'games');

// Template mappings
const TEMPLATES = {
  'three': {
    name: 'hello-cube',
    src: join(ROOT, 'games/hello-cube/src'),
    index: join(ROOT, 'games/hello-cube/index.html'),
    deps: ['three']
  },
  'phaser': {
    name: 'hello-phaser',
    src: join(ROOT, 'games/hello-phaser/src'),
    index: join(ROOT, 'games/hello-phaser/index.html'),
    deps: ['phaser']
  },
  'vanilla': {
    name: 'snake',
    src: join(ROOT, 'games/snake/src'),
    index: join(ROOT, 'games/snake/index.html'),
    deps: []
  }
};

/**
 * Detect library from prompt.md content
 */
function detectLibrary(promptContent) {
  const text = promptContent.toLowerCase();
  
  if (text.includes('three') || text.includes('3d') || text.includes('webgl')) {
    return 'three';
  }
  if (text.includes('phaser') || text.includes('2d') || text.includes('sprite') || text.includes('game engine')) {
    return 'phaser';
  }
  return 'vanilla';
}

/**
 * Parse prompt.md to extract game metadata
 */
function parsePrompt(promptContent) {
  const metadata = {
    slug: '',
    title: '',
    titleZh: '',
    category: '',
    categoryZh: '',
    description: '',
    descriptionZh: '',
    tags: [],
    controls: 'Arrow keys or WASD to control',
    controlsZh: '方向键或 WASD 控制',
    library: 'vanilla',
    imagePrompt: ''
  };

  const lines = promptContent.split('\n');
  let currentField = null;
  let currentContent = [];

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Check for field markers
    if (trimmed.startsWith('slug:')) {
      metadata.slug = trimmed.replace('slug:', '').trim();
      continue;
    }
    if (trimmed.startsWith('title:')) {
      metadata.title = trimmed.replace('title:', '').trim();
      continue;
    }
    if (trimmed.startsWith('titleZh:')) {
      metadata.titleZh = trimmed.replace('titleZh:', '').trim();
      continue;
    }
    if (trimmed.startsWith('category:')) {
      metadata.category = trimmed.replace('category:', '').trim();
      continue;
    }
    if (trimmed.startsWith('categoryZh:')) {
      metadata.categoryZh = trimmed.replace('categoryZh:', '').trim();
      continue;
    }
    if (trimmed.startsWith('description:')) {
      metadata.description = trimmed.replace('description:', '').trim();
      continue;
    }
    if (trimmed.startsWith('descriptionZh:')) {
      metadata.descriptionZh = trimmed.replace('descriptionZh:', '').trim();
      continue;
    }
    if (trimmed.startsWith('library:')) {
      metadata.library = trimmed.replace('library:', '').trim();
      continue;
    }
    if (trimmed.startsWith('image_prompt:') || trimmed.startsWith('imagePrompt:')) {
      metadata.imagePrompt = trimmed.replace(/image_prompt:|imagePrompt:/, '').trim();
      continue;
    }
    if (trimmed.startsWith('tags:')) {
      continue; // Tags handled below
    }
    
    // Auto-detect slug if not specified
    if (!metadata.slug && trimmed && !trimmed.startsWith('-')) {
      // Could be title or description
      if (metadata.title === '') {
        metadata.title = trimmed;
        metadata.slug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      } else if (metadata.description === '') {
        metadata.description = trimmed;
      }
    }
  }

  // Auto-generate missing fields
  if (!metadata.slug) {
    metadata.slug = 'new-game';
  }
  if (!metadata.title) {
    metadata.title = metadata.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  if (!metadata.titleZh) {
    metadata.titleZh = metadata.title; // User should fill this
  }
  if (!metadata.category) {
    metadata.category = metadata.library === 'phaser' ? 'Arcade/街机' : 
                       metadata.library === 'three' ? '3D/3D 游戏' : 'Classic/经典游戏';
  }
  if (!metadata.categoryZh) {
    metadata.categoryZh = metadata.category.split('/')[1] || '游戏';
  }
  if (!metadata.description) {
    metadata.description = 'A game created with the 4399 game creator.';
  }
  if (!metadata.descriptionZh) {
    metadata.descriptionZh = metadata.description;
  }
  if (!metadata.imagePrompt) {
    metadata.imagePrompt = `Game scene for ${metadata.title}, ${metadata.library} style, colorful, engaging`;
  }

  // Detect library if not specified
  if (metadata.library === 'vanilla') {
    metadata.library = detectLibrary(promptContent);
  }

  return metadata;
}

/**
 * Create game directory structure
 */
async function createGameStructure(slug, library) {
  const gameDir = join(GAMES_DIR, slug);
  
  if (existsSync(gameDir)) {
    // Check if it's just the prompt.md placeholder (may have build/src/assets folders)
    const { readdirSync } = await import('fs');
    const dirFiles = readdirSync(gameDir);
    
    // Allow if only prompt.md + build/src/assets exist (empty structure)
    const hasPromptMd = dirFiles.includes('prompt.md');
    const allowedDirs = ['build', 'src', 'assets'];
    const hasOnlyAllowed = dirFiles.every(f => f === 'prompt.md' || allowedDirs.includes(f));
    
    if (hasPromptMd && hasOnlyAllowed) {
      console.log(`   Found existing prompt.md, proceeding...`);
    } else {
      throw new Error(`Game directory already exists: ${slug}`);
    }
  }

  mkdirSync(gameDir, { recursive: true });
  mkdirSync(join(gameDir, 'assets'), { recursive: true });
  mkdirSync(join(gameDir, 'src'), { recursive: true });
  mkdirSync(join(gameDir, 'build'), { recursive: true });

  // Copy template files
  const template = TEMPLATES[library];
  if (!template) {
    throw new Error(`Unknown library: ${library}`);
  }

  // Copy all src files from template
  const { readdirSync, statSync } = await import('fs');
  const srcFiles = readdirSync(template.src);
  for (const file of srcFiles) {
    const srcPath = join(template.src, file);
    const stat = statSync(srcPath);
    if (stat.isFile()) {
      const content = readFileSync(srcPath, 'utf8');
      writeFileSync(join(gameDir, 'src', file), content);
    }
  }

  // Copy index.html
  const indexHtml = readFileSync(template.index, 'utf8');
  writeFileSync(join(gameDir, 'index.html'), indexHtml);

  return gameDir;
}

/**
 * Generate game.yml from metadata
 */
function generateGameYml(metadata) {
  const yml = `slug: "${metadata.slug}"
title: "${metadata.title}"
titleZh: "${metadata.titleZh}"
category: "${metadata.category}"
categoryZh: "${metadata.categoryZh}"
description: "${metadata.description}"
descriptionZh: "${metadata.descriptionZh}"
tags:
  - "${metadata.library}"
  - "${metadata.category.split('/')[0].toLowerCase()}"
controls: "${metadata.controls}"
controlsZh: "${metadata.controlsZh}"
playPath: "/"
thumbnail: "assets/thumbnail.svg"
icon: "assets/icon.svg"
image_prompt: "${metadata.imagePrompt}"
`;

  return yml;
}

/**
 * Generate placeholder SVG icons
 */
function generatePlaceholderIcons(slug, metadata) {
  const gameDir = join(GAMES_DIR, slug);
  
  // Thumbnail SVG (512x512)
  const thumbnailSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#6DBB3A"/>
  <text x="256" y="256" font-family="Arial" font-size="48" fill="white" text-anchor="middle">${metadata.title}</text>
  <text x="256" y="320" font-family="Arial" font-size="24" fill="white" text-anchor="middle">${metadata.titleZh}</text>
</svg>`;

  // Icon SVG (512x512)
  const iconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <circle cx="256" cy="256" r="200" fill="#6DBB3A"/>
  <text x="256" y="280" font-family="Arial" font-size="64" fill="white" text-anchor="middle">${metadata.title.charAt(0)}</text>
</svg>`;

  writeFileSync(join(gameDir, 'assets', 'thumbnail.svg'), thumbnailSvg);
  writeFileSync(join(gameDir, 'assets', 'icon.svg'), iconSvg);
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node scripts/create-game.mjs <game-slug>');
    console.log('');
    console.log('Creates a new game from prompt.md in games/{slug}/prompt.md');
    console.log('');
    console.log('Example:');
    console.log('  mkdir games/space-miner');
    console.log('  echo "space shooter game with three.js" > games/space-miner/prompt.md');
    console.log('  node scripts/create-game.mjs space-miner');
    process.exit(1);
  }

  const slug = args[0];
  const promptPath = join(GAMES_DIR, slug, 'prompt.md');

  // Check if prompt.md exists
  if (!existsSync(promptPath)) {
    console.error(`Error: prompt.md not found at ${promptPath}`);
    console.error('');
    console.error('Please create the prompt.md file first with game details.');
    process.exit(1);
  }

  try {
    console.log(`🎮 Creating game: ${slug}`);
    
    // Read prompt.md
    const promptContent = readFileSync(promptPath, 'utf8');
    console.log('📄 Reading prompt.md...');
    
    // Parse metadata
    const metadata = parsePrompt(promptContent);
    console.log(`📋 Detected metadata:`);
    console.log(`   Title: ${metadata.title}`);
    console.log(`   Library: ${metadata.library}`);
    console.log(`   Category: ${metadata.category}`);
    
    // Detect library if not specified
    if (metadata.library === 'vanilla') {
      metadata.library = detectLibrary(promptContent);
      console.log(`🔍 Auto-detected library: ${metadata.library}`);
    }

    // Create directory structure
    console.log('📁 Creating directory structure...');
    const gameDir = await createGameStructure(slug, metadata.library);
    
    // Generate game.yml
    console.log('📝 Generating game.yml...');
    const gameYml = generateGameYml(metadata);
    writeFileSync(join(gameDir, 'game.yml'), gameYml);
    
    // Generate placeholder icons
    console.log('🎨 Generating placeholder icons...');
    generatePlaceholderIcons(slug, metadata);
    
    console.log('✅ Game structure created!');
    console.log('');
    console.log('Next steps:');
    console.log(`1. Edit ${join(slug, 'src', 'main.ts')} with your game logic`);
    console.log(`2. Run 'npm run build:games' to bundle`);
    console.log(`3. Run 'npm run catalog' to register`);
    console.log(`4. Run 'npm run assemble' to copy to site`);
    console.log('');
    console.log('To generate real icons with AI, run:');
    console.log(`  node scripts/generate-icons.js ${slug}`);
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main();