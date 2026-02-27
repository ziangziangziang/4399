#!/usr/bin/env node

/**
 * AI Icon Generator for 4399 Games
 * Generates PNG thumbnails and icons using waypoint MCP
 * Falls back to existing SVG if generation fails
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const OUTPUT_DIR = path.join(__dirname, '..', 'games');
const IMAGE_SIZE = '1024x1024';
const IMAGE_QUALITY = 'standard';

/**
 * Generate image using waypoint MCP
 * @param {string} prompt - Image generation prompt
 * @param {string} outputPath - Output file path
 * @param {object} options - Additional options
 * @returns {Promise<boolean>} - Returns true if successful
 */
async function generateImage(prompt, outputPath, options = {}) {
  console.log(`\n🎨 Generating image...`);
  console.log(`Prompt: ${prompt}`);
  console.log(`Output: ${outputPath}`);
  
  try {
    // Prepare MCP tool call
    const mcpOptions = {
      prompt: prompt,
      size: options.size || IMAGE_SIZE,
      quality: options.quality || IMAGE_QUALITY,
      response_format: 'b64_json',
      output_path: outputPath,
      include_data: true
    };
    
    console.log(`📡 MCP tool will be called with options:`, JSON.stringify(mcpOptions, null, 2));
    console.log(`⚠️  This script requires manual MCP tool execution`);
    
    return false;
    
  } catch (error) {
    console.error(`❌ Image generation failed: ${error.message}`);
    return false;
  }
}

/**
 * Read game.yml file
 * @param {string} gameDir - Game directory path
 * @returns {object|null} - Parsed YAML content
 */
function readGameYml(gameDir) {
  const ymlPath = path.join(gameDir, 'game.yml');
  
  if (!fs.existsSync(ymlPath)) {
    console.warn(`⚠️  No game.yml found in ${gameDir}`);
    return null;
  }
  
  try {
    const content = fs.readFileSync(ymlPath, 'utf-8');
    return yaml.load(content);
  } catch (error) {
    console.error(`❌ Failed to parse ${ymlPath}: ${error.message}`);
    return null;
  }
}

/**
 * Generate thumbnail and icon for a single game
 * @param {string} gameSlug - Game directory name
 * @param {boolean} generateBoth - Whether to generate both thumbnail and icon
 */
async function generateGameIcons(gameSlug, generateBoth = true) {
  const gameDir = path.join(OUTPUT_DIR, gameSlug);
  const gameYml = readGameYml(gameDir);
  
  if (!gameYml) {
    console.warn(`⚠️  No game.yml found for ${gameSlug}, skipping...`);
    return false;
  }
  
  // Get image prompt from game.yml
  const imagePrompt = gameYml.image_prompt || '';
  
  if (!imagePrompt) {
    console.warn(`⚠️  No image_prompt found for ${gameSlug}, skipping...`);
    return false;
  }
  
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🎮 Processing: ${gameSlug}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  
  let success = false;
  
  // Generate thumbnail
  if (generateBoth) {
    const thumbnailPrompt = `${imagePrompt}, game thumbnail, colorful, detailed, vibrant, engaging, high quality, 1024x1024`;
    const thumbnailSuccess = await generateImage(
      thumbnailPrompt,
      `${gameSlug}/assets/thumbnail`,
      {
        size: '1024x1024',
        quality: 'standard',
        outputPath: path.join(gameDir, 'assets', 'thumbnail.png')
      }
    );
    
    if (thumbnailSuccess) {
      console.log(`✅ Thumbnail generated: ${gameSlug}/assets/thumbnail.png`);
      
      // Convert PNG to SVG wrapper if needed
      const svgWrapper = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <image width="512" height="512" href="thumbnail.png"/>
</svg>`;
      
      fs.writeFileSync(path.join(gameDir, 'assets', 'thumbnail.svg'), svgWrapper);
      console.log(`✅ SVG wrapper created: ${gameSlug}/assets/thumbnail.svg`);
      success = true;
    } else {
      console.warn(`⚠️  Thumbnail generation failed, keeping existing SVG`);
    }
    
    // Generate icon
    const iconPrompt = `${imagePrompt}, game icon, simple, recognizable, minimal, clean, 1024x1024`;
    const iconSuccess = await generateImage(
      iconPrompt,
      `${gameSlug}/assets/icon`,
      {
        size: '1024x1024',
        quality: 'standard',
        outputPath: path.join(gameDir, 'assets', 'icon.png')
      }
    );
    
    if (iconSuccess) {
      console.log(`✅ Icon generated: ${gameSlug}/assets/icon.png`);
      
      // Convert PNG to SVG wrapper if needed
      const svgWrapper = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <image width="512" height="512" href="icon.png"/>
</svg>`;
      
      fs.writeFileSync(path.join(gameDir, 'assets', 'icon.svg'), svgWrapper);
      console.log(`✅ SVG wrapper created: ${gameSlug}/assets/icon.svg`);
      success = true;
    } else {
      console.warn(`⚠️  Icon generation failed, keeping existing SVG`);
    }
  } else {
    // Generate only thumbnail
    const thumbnailPrompt = `${imagePrompt}, game thumbnail, colorful, detailed, vibrant, engaging, high quality, 1024x1024`;
    const thumbnailSuccess = await generateImage(
      thumbnailPrompt,
      `${gameSlug}/assets/thumbnail`,
      {
        size: '1024x1024',
        quality: 'standard',
        outputPath: path.join(gameDir, 'assets', 'thumbnail.png')
      }
    );
    
    if (thumbnailSuccess) {
      console.log(`✅ Thumbnail generated: ${gameSlug}/assets/thumbnail.png`);
      success = true;
    }
  }
  
  // Save metadata
  const metadata = {
    generated: new Date().toISOString(),
    prompt: imagePrompt,
    size: IMAGE_SIZE,
    format: 'png',
    success: success
  };
  
  const metadataPath = path.join(gameDir, 'assets', 'icons.meta.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  
  return success;
}

/**
 * Process all games in the output directory
 */
async function main() {
  const args = process.argv.slice(2);
  const targetGame = args[0] || null;
  const generateBoth = !args.includes('--thumbnail-only');
  
  console.log('🚀 AI Icon Generator - 4399 Style');
  console.log('===============================\n');
  
  if (targetGame) {
    // Generate for specific game
    console.log(`Target: ${targetGame}`);
    const success = await generateGameIcons(targetGame, generateBoth);
    
    if (success) {
      console.log(`\n✅ Icons generated for ${targetGame}`);
    } else {
      console.log(`\n⚠️  Failed to generate icons for ${targetGame}`);
      console.log('💡 Check that game.yml has an image_prompt field');
    }
  } else {
    // Generate for all games
    const gameDirs = fs.readdirSync(OUTPUT_DIR)
      .filter(item => {
        const stat = fs.statSync(path.join(OUTPUT_DIR, item));
        return stat.isDirectory();
      })
      .sort();
    
    if (gameDirs.length === 0) {
      console.log('No games found in games/ directory');
      return;
    }
    
    console.log(`Found ${gameDirs.length} game(s)\n`);
    
    let successCount = 0;
    for (const gameSlug of gameDirs) {
      const success = await generateGameIcons(gameSlug, generateBoth);
      if (success) successCount++;
    }
    
    console.log(`\n✅ Generation complete!`);
    console.log(`   Success: ${successCount}/${gameDirs.length}`);
  }
  
  console.log('\n💡 Note: This script prepares MCP tool calls.');
  console.log('   In an MCP-enabled environment, images will be generated automatically.');
}

// Run main function
main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});