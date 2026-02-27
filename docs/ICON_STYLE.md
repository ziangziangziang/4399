# Icon Style Guide

## Overview

Icons and thumbnails are **AI-generated PNG-first** via waypoint MCP for accessibility and visual quality. SVG fallbacks are optional for screen readers or low-bandwidth scenarios.

## Requirements

### File Locations

Each game must have:
- `games/<slug>/assets/thumbnail.png` (512×512, for portal grid)
- `games/<slug>/assets/icon.png` (512×512, for game page badge)
- Optional: `thumbnail.svg` / `icon.svg` for accessibility fallback

### Image Generation Workflow

1. **Read game metadata** from `game.yml`:
   - `title` (zh/en)
   - `description` (zh/en)
   - `category`
   - `image_prompt` (optional, custom prompt)

2. **Generate thumbnail** via waypoint MCP:
   ```bash
   waypoint_generate_image {
     prompt: "<game-specific description>, 4399 style, colorful, game icon",
     quality: "high",
     response_format: "url",
     output_path: "games/<slug>/assets/thumbnail.png"
   }
   ```

3. **Generate icon** via waypoint MCP:
   ```bash
   waypoint_generate_image {
     prompt: "<game-specific description>, simple icon, 4399 style",
     quality: "high",
     response_format: "url",
     output_path: "games/<slug>/assets/icon.png"
   }
   ```

4. **Optional SVG fallback**: Create simplified SVG version for accessibility

### Image Specifications

- **Dimensions**: 512×512 pixels
- **Format**: PNG (recommended), JPG (alternative)
- **Style**: Colorful, recognizable at small sizes, consistent with 4399 aesthetic
- **Content**: Central game element, avoid clutter, high contrast

## Waypoint MCP Workflow

### Step-by-Step

1. **Prepare game metadata** in `game.yml`:
   ```yaml
   slug: snake
   title:
     zh: 贪吃蛇
     en: Snake
   description:
     zh: 经典的贪吃蛇游戏
     en: Classic snake game
   category: arcade
   image_prompt:
     zh: 一条绿色的蛇在吃苹果，4399 风格，色彩鲜艳
     en: A cute green snake eating an apple, 4399 style, colorful
   ```

2. **Generate thumbnail**:
   ```javascript
   // Call waypoint_generate_image with game-specific prompt
   const thumbnail = await waypoint_generate_image({
     prompt: game.yml.image_prompt.zh || game.yml.image_prompt.en,
     quality: "high",
     response_format: "url",
     output_path: `games/${slug}/assets/thumbnail.png`
   });
   ```

3. **Generate icon**:
   ```javascript
   const icon = await waypoint_generate_image({
     prompt: game.yml.image_prompt.zh || game.yml.image_prompt.en,
     quality: "high",
     response_format: "url",
     output_path: `games/${slug}/assets/icon.png`
   });
   ```

### Prompt Guidelines

**Good prompts include:**
- Game-specific elements (e.g., "green snake", "red car", "blue spaceship")
- Action/context (e.g., "eating apple", "racing", "flying")
- Style reference (e.g., "4399 style", "colorful", "cartoon")
- Composition (e.g., "centered", "simple background")

**Example prompts:**
- `A cute green snake on dark background, 4399 style, simple game icon`
- `Red racing car on track, colorful, 4399 game thumbnail`
- `Blue spaceship with stars, space shooter game, 4399 style`

## SVG Fallback (Optional)

For accessibility or performance optimization, create simplified SVG versions:

### SVG Requirements

1. **Self-contained only**
   - No `<script>` tags
   - No external `<image href="...">` links
   - Use internal gradients/filters only

2. **Fixed dimensions**
   - ViewBox: `0 0 512 512`
   - Recommended size: `512×512`

3. **Security**
   - No external network requests
   - No embedded fonts (use system fonts)

### Layout Template

```svg
<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Background gradient -->
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea"/>
      <stop offset="100%" style="stop-color:#764ba2"/>
    </linearGradient>
  </defs>
  
  <!-- Rounded background -->
  <rect x="8" y="8" width="496" height="496" rx="48" fill="url(#bg)"/>
  
  <!-- Central game element -->
  <circle cx="256" cy="256" r="120" fill="#ffffff" opacity="0.9"/>
  
  <!-- Title text -->
  <text x="256" y="340" text-anchor="middle" font-family="system-ui" font-size="42" fill="#ffffff" font-weight="bold">
    Game Title
  </text>
  
  <!-- Engine badge -->
  <text x="256" y="390" text-anchor="middle" font-family="system-ui" font-size="24" fill="#ffffff" opacity="0.8">
    GAME
  </text>
</svg>
```

## Color Palette

### Default Gradients

- **Arcade games**: `#667eea` → `#764ba2` (purple)
- **Action games**: `#4facfe` → `#00f2fe` (blue)
- **Racing games**: `#f093fb` → `#f5576c` (pink)
- **Puzzle games**: `#43e97b` → `#38f9d7` (green)

### Text Colors

- Primary text: `#ffffff`
- Secondary/opacity: `#ffffff` with `opacity="0.8"`

## Engine Badges

- Use all-caps: `GAME` or platform name
- Font size: ~24px
- Position: below title text

## Naming Conventions

- `thumbnail.png/svg` - Used in game card grid
- `icon.png/svg` - Used on game detail page
- Place in `games/<slug>/assets/` directory

## Helper Script: `scripts/generate-icons.js`

Automate image generation via waypoint MCP:

```javascript
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

async function generateGameIcons(slug) {
  const gameYmlPath = `games/${slug}/game.yml`;
  const gameData = yaml.load(fs.readFileSync(gameYmlPath, 'utf-8'));
  const assetsDir = `games/${slug}/assets`;
  
  // Create assets directory if not exists
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  
  // Generate thumbnail
  const thumbnailPrompt = gameData.image_prompt?.zh || gameData.image_prompt?.en || gameData.title?.zh || gameData.title?.en;
  const thumbnail = await waypoint_generate_image({
    prompt: `${thumbnailPrompt}, 4399 style, colorful, game icon, 512x512`,
    quality: "high",
    response_format: "url",
    output_path: `${assetsDir}/thumbnail.png`
  });
  
  // Generate icon
  const icon = await waypoint_generate_image({
    prompt: `${thumbnailPrompt}, simple icon, 4399 style, 512x512`,
    quality: "high",
    response_format: "url",
    output_path: `${assetsDir}/icon.png`
  });
  
  console.log(`Generated icons for ${slug}:`);
  console.log(`- thumbnail: ${thumbnailPrompt}`);
  console.log(`- icon: ${thumbnailPrompt}`);
}

// Usage: node scripts/generate-icons.js <slug>
const slug = process.argv[2];
if (slug) {
  generateGameIcons(slug).catch(console.error);
} else {
  console.error('Usage: node scripts/generate-icons.js <game-slug>');
}
```

## Tips

1. **Write descriptive prompts**: Include game elements, colors, and style
2. **Test at small sizes**: Ensure recognition at card size (e.g., 128×128)
3. **Keep it simple**: Avoid fine details that may not render well
4. **Consistency matters**: Use similar color palettes across games in same category
5. **Accessibility**: Provide SVG fallbacks for screen readers when possible

## Migration from SVG-Only

If you have existing SVG icons:
1. Generate AI PNG versions using waypoint MCP
2. Keep SVG as fallback for accessibility
3. Update portal to prefer PNG, fallback to SVG
4. Update `catalog.json` to include both formats