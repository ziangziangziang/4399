# Game Creation Skill

## Overview

Automated workflow to create new games using existing libraries (Three.js, Phaser, or vanilla), register them in the catalog, and generate icons/cards using waypoint MCP image generation.

## Workflow

### 1. Library Detection & Template Selection
- **Three.js games**: Use `games/hello-cube` as template
- **Phaser games**: Use `games/hello-phaser` as template  
- **Vanilla/Canvas games**: Use `games/snake` as template

### 2. Game Scaffolding Steps

#### A. Create Directory Structure
```bash
games/{game-slug}/
├── assets/
│   ├── thumbnail.svg (512×512)
│   └── icon.svg (512×512)
├── src/
│   └── main.ts (entry point)
├── build/
├── game.yml (metadata)
└── index.html (container)
```

#### B. Generate game.yml Metadata
```yaml
slug: "game-slug"
title: "Game Title"
titleZh: "游戏标题"
category: "Adventure"
categoryZh: "冒险"
description: "Game description"
descriptionZh: "游戏描述"
tags:
  - "adventure"
  - "puzzle"
controls: "Arrow keys to move"
controlsZh: "方向键移动"
playPath: "/"
thumbnail: "assets/thumbnail.svg"
icon: "assets/icon.svg"
image_prompt: "A cute robot exploring a colorful cave with gems"
```

#### C. Copy & Adapt Game Code
- Copy template's `src/main.ts` as base
- Adapt game logic to new game
- Update `index.html` canvas and metadata

#### D. Generate Icons via Waypoint MCP
```javascript
// Use waypoint_generate_image tool
- Generate thumbnail.png from image_prompt
- Generate icon.png from image_prompt + style
- Convert to SVG or keep as PNG
```

### 3. Registration Steps

#### A. Run Build Pipeline
```bash
npm run build:games    # Bundle new game
npm run catalog        # Update catalog.json
npm run assemble       # Copy to site/public/play/
```

#### B. Verify Registration
- Check `site/public/catalog.json` includes new game
- Check `site/dist/play/{slug}/` exists

### 4. Icon/Card Generation

#### A. Generate Thumbnail
```
Prompt: "{image_prompt}, game thumbnail, colorful, pixel art style, 512x512"
Style: "pixel-art" or "retro"
```

#### B. Generate Icon  
```
Prompt: "{image_prompt}, game icon, simple, recognizable, 512x512"
Style: "icon" or "minimal"
```

### 5. Content Generation (Optional)

#### A. Game Assets
- Generate background images
- Generate sprite sheets
- Generate UI elements

#### B. Use Waypoint MCP for each asset
```
Prompt: "{game theme} background, pixel art, seamless texture"
```

## Example Usage

```
/user: Create a new Three.js game called "space-miner"
→ Skill creates games/space-miner/
→ Generates game.yml with auto-filled metadata
→ Copies hello-cube template and adapts
→ Calls waypoint_generate_image for thumbnail + icon
→ Runs build:games, catalog, assemble
→ Reports: "Created space-miner game, ready to test at /play/space-miner/"
```

## Implementation Notes

- **Template selection**: Auto-detect based on user request or game type
- **Metadata auto-fill**: Use LLM to generate game.yml from simple description
- **Icon generation**: Call waypoint_generate_image n times (thumbnail + icon)
- **Error handling**: Validate game.yml structure before building
- **Rollback**: If build fails, clean up created files

## Required Tools

- `waypoint_generate_image` - For icon/thumbnail generation
- `write` - For creating game files
- `bash` - For running build commands
- `glob` - For template discovery