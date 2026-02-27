# TODO.md

## Goal

Build a classic 4399-style mini game portal with MPA architecture, PNG-first assets, automated build pipeline, and ready for GitHub Pages deployment.

## Instructions

- Review icon.png and thumbnail.png for all games with PNG assets
- Test gameplay for each game using Chrome DevTools console to check for errors
- If a game is not playable, remove it from catalog.json and rebuild
- If icons/thumbnails are poor quality, regenerate using Waypoint MCP
- Update catalog.json after any changes
- Use existing build scripts to rebuild and assemble games

## Accomplished

### Completed
- ✅ MPA architecture setup (index.html + game.html)
- ✅ Build pipeline configured (build:games → catalog → assemble → build:site)
- ✅ 13 games built and assembled to `site/public/play/`
- ✅ Generated PNG assets for 7 games (breakout, gold-miner, ice-fire-boy, memory-match, pacman, snake2, tank-battle)
- ✅ GitHub Pages workflow configured
- ✅ Fixed game.yml files to use PNG paths instead of null
- ✅ Regenerated catalog.json with correct icon paths
- ✅ All TypeScript errors resolved, build passes

### In Progress
- ✅ Generated PNG assets for all 13 games (snake, tetris, gate-rush, sky-dominator, hello-cube, hello-phaser added)
- ✅ Updated catalog.json with PNG paths
- ✅ Assembled all games to site/public/play/
- ✅ Removed rating and views metadata from game UI (portal + game page)

### Remaining
- ⏳ Test all 13 games for playability via Chrome DevTools
- ⏳ Review generated PNG icons for quality
- ⏳ Create Tower Defense game
- ⏳ Create Match-3 Puzzle game

## Relevant files

**Catalog:** `site/public/catalog.json` (13 games)

**Games with PNG Assets (7):**
- breakout, gold-miner, ice-fire-boy, memory-match, pacman, snake2, tank-battle

**Games with SVG Assets (6) - need PNG conversion:**
- tetris, gate-rush, hello-cube, hello-phaser, sky-dominator, snake

**Build Scripts:**
- `scripts/build-catalog.mjs` - Build catalog from game.yml
- `scripts/build-games.mjs` - Build games
- `scripts/assemble.mjs` - Assemble games to public folder