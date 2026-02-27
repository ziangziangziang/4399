# AGENTS.md

## What we’re building
A classic **4399-style** mini game portal (nostalgia vibe), deployed on GitHub Pages. **No ads**, dense game grid, green nav, search, rankings. Start with **one sample game: Snake**.

## Architecture
- **MPA (multi-page)**:
  - `index.html` = portal list
  - `game.html?slug=...` = play page (iframe) with **退出/返回**
- MPA is preferred for memory cleanup (leave page = release game resources).

## Tech rules
- **npm-only** dependencies; build bundles assets. **No runtime CDN**.
- Portal: **TypeScript + Vite (MPA inputs)** → `site/dist` (do not commit).
- Games: **TypeScript** in `games/<slug>/src/main.ts` bundled by **esbuild** → `games/<slug>/build` (do not commit).
- Build pipeline:
  - `build:games` → bundle games
  - `catalog` → `site/public/catalog.json`
  - `assemble` → copy `games/*/build` to `site/public/play/<slug>`
  - `build:site` → build portal to `site/dist`
  - `build` runs all

## Language
Default **Simplified Chinese**. If browser language starts with `en`, default to English. Always show `中文/EN` toggle (persist in localStorage). `game.yml` supports zh/en fields.

## Icons
SVG-first per game:
- `games/<slug>/assets/thumbnail.svg`
- `games/<slug>/assets/icon.svg`
No `<script>`, no external images, self-contained, 512×512.

## Project tracking
`TODO.md` is the source of truth. Read it before work; update it after.

## Design reference
Use `docs/STYLE_4399_CLASSIC.md` + screenshot-based `SKILL.md`. Do **not** copy modern 4399.com.
