# 4399

`4399.com` is probably the first URL I type into a browser search bar. The simple joy brought by those tiny HTML games was unparalleled in my childhood. Now I find AI gives me the same feeling. Here I join two excitements — despite being 20 years apart.

## Quick Start

```bash
npm install
npm run vendor-fetch    # Download shared libraries from cdnjs
npm run dev           # Start dev server
# Open http://localhost:5173/4399/
```

## Building for Production

```bash
npm run build
npm run preview       # Test production build locally
```

The output in `site/dist/` is ready to deploy to GitHub Pages.

## How This Project Was Built

This repo is 99% vibe coded. The ONLY writing made by myself is this section of the README. Everything else is machine written.

I did the following, one by one:
1. Got the idea after running few benchmarks, more precisely, the "create a flight simulator" one-shot test.
2. Asked GPT 5.2 Thinking for an `AGENTS.md`, `.opencode/skills/frontend-skill/SKILL.md `, and an `prompts/BOOTSTRAP_PORTAL.md`. Copied over to the files.
3. Asked Opencode to start working, with qwen3.5-122b (`unsloth/Qwen3.5-122B-A10B-GGUF:UD-Q4_K_XL`).

## Adding a New Game

1. Create `games/<slug>/` directory
2. Add `game.yml` (metadata — see examples)
3. Add `assets/thumbnail.svg` and `assets/icon.svg` (512×512, self-contained)
4. Add `build/` with your game's static files
5. Run `npm run catalog` to regenerate catalog.json

See `prompts/BOOTSTRAP_PORTAL.md` for full specification.

## Structure

```
games/<slug>/        # Each game
  game.yml           # Metadata (slug, title, icons, etc.)
  assets/            # SVG icons/thumbnails
  build/             # Playable game files
  runs/              # Provenance history

vendor/              # Shared libraries (cdnjs cache)
  manifest.json      # Pinned versions

site/
  src/               # Portal TypeScript source
  public/            # Static assets
  dist/              # Build output (deploy)

scripts/             # Build helpers
  build-catalog.mjs  # Generate catalog.json
  sync-builds.mjs    # Copy game builds
  build-importmap.mjs # Generate importmap.json
```

## Vendor Libraries

Shared libraries are downloaded from cdnjs and committed to `/vendor`:

```bash
npm run vendor-fetch   # Download all libraries in vendor/manifest.json
npm run vendor-fetch -- --list    # Show available versions
```

Never silently upgrade versions. Add new versions as new folders.

## GitHub Pages Base Path

This repo deploys to `https://<user>.github.io/4399/`.

All paths use the base `/4399/` automatically via Vite config and import map generation.

## Provenance

Each game has a `runs/` folder with:
- `run.yml` — Model config and tool usage
- `prompts/*.md` — Prompts used
- `transcripts/chat.md` — Sanitized conversation

Remove secrets before committing!

## Icons (SVG-First)

- `thumbnail.svg` — For portal grid
- `icon.svg` — For game page identity
- Self-contained only (no external scripts/images)
- Fixed 512×512 viewBox

See `docs/ICON_STYLE.md` for conventions.

## Tech Stack

- **Portal:** TypeScript + Vite
- **2D Games:** Phaser 3 (default)
- **3D Games:** Three.js (default)
- **UI:** lil-gui, stats.js (optional)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build portal to `site/dist/` |
| `npm run preview` | Preview production build |
| `npm run vendor-fetch` | Download vendor libraries |
| `npm run catalog` | Regenerate catalog.json |
| `npm run sync-builds` | Sync game builds to dist |
| `npm run importmap` | Generate importmap.json |

## CI/CD

GitHub Actions automatically builds and deploys on every `main` push:

1. Installs dependencies
2. Downloads vendor libraries
3. Builds portal (`npm run build`)
4. Deploys to GitHub Pages
