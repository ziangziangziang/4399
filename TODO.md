# 4399 Game Portal - TODO

## Overview
Classic 4399-style mini game portal with MPA architecture, npm-only bundling, TypeScript-first.

## Current Status

### Completed
- [x] MPA architecture setup (index.html + game.html)
- [x] Vite configured with proper root and MPA entries
- [x] Build pipeline (build:games → catalog → assemble → build:site)
- [x] Added three and phaser dependencies
- [x] Snake game (games/snake) - working
- [x] hello-cube game (games/hello-cube) - builds successfully
- [x] hello-phaser game (games/hello-phaser) - TypeScript errors fixed, builds successfully
- [x] Game catalog builder
- [x] Assembly script to copy games to site/public/play/
- [x] Language toggle (zh-CN/en-US) with localStorage persistence
- [x] AI icon workflow (ICON_STYLE.md + scripts/generate-icons.js)
- [x] Added image_prompt field to game.yml files
- [x] Updated docs/STYLE_4399_CLASSIC.md with PNG-first approach
- [x] Fixed build-games.mjs to copy index.html from game directory to build output
- [x] Fixed game.html structure - added <div id="app"> container
- [x] Fixed snake2 build - now generates proper build/index.html
- [x] Fixed generate-icons.js to use ES modules
- [x] Full build completed successfully - all 4 games in catalog
- [x] Portal fully functional - 4 games displayed with ranking sidebar
- [x] snake2 game tested - iframe loads and game is playable
- [x] Fixed duplicate modal CSS in styles.css (removed old position:fixed styles)
- [x] Fixed modal-overlay z-index (0) and modal-content z-index (1)
- [x] Added 3 new games: pacman, breakout, memory-match
- [x] Fixed tank-battle syntax error (extra closing braces)
- [x] Created index.html for pacman, breakout, memory-match games
- [x] Rebuilt project successfully - all 13 games in catalog
- [x] Tested modal navigation flow end-to-end - WORKING
- [x] Verified iframe loads correct game content
- [x] GitHub Pages workflow already configured in .github/workflows/pages.yml
- [x] Search functionality verified - filters games by title/description/tags
- [x] Generated AI icons for pacman, breakout, memory-match using waypoint MCP

### In Progress
- [x] Fixed all absolute paths in game-page.ts (iframe src, recommendations, exit button)
- [x] Rebuilt project with all path fixes
- [x] Updated styles.css with green theme (#6DBB3A) and 3-column layout
- [x] Added category auto-generation, mega category panel, ranking sidebar to portal
- [x] Removed all modern CSS elements (border-radius, box-shadow, transitions, gradients)
- [x] Changed i18n to default to zh-CN (no browser detection)
- [x] Browser testing: portal → modal → game → iframe → 退出/返回 - WORKING
- [x] Full build tested - all 13 games display correctly with thumbnails
- [x] Test waypoint MCP image generation for icons - pacman, breakout, memory-match PNG icons generated successfully
- [x] Fixed YAML parser to handle nested controls (zh/en arrays)
- [x] Fixed tetris game initialization bug (nextPiece before currentPiece)
- [ ] Deploy to GitHub Pages

### Remaining Tasks
- [ ] Add more sample games
- [ ] Implement game search functionality
- [ ] Implement ranking/best-of lists
- [ ] GitHub Pages deployment setup
- [ ] Generate AI icons for all games using waypoint MCP
- [ ] Optimize build pipeline for PNG generation

## Build Output
- `site/dist/` - Final build output (do not commit)
- `site/public/` - Static assets (do not commit except catalog.json template)
- `games/*/build/` - Game builds (do not commit)

## Notes
- LSP errors in hello-cube are false positives (type inference issues)
- Phaser 3.70 uses `color` not `fill` for TextStyle