# Agents Guide (AGENTS.md)

This repository is a mini “game portal” published on GitHub Pages. Each game is playable in-browser and accompanied by provenance: prompts, model config, and tool/skill usage that created it.

## Mission

1) Build and maintain a GitHub Pages portal that:
- Lists games from `games/*/game.yml`
- Plays games from `/play/<slug>/index.html` (via iframe or link)
- Links to source and provenance (runs)

2) Maintain a shared, centrally hosted vendor library set (downloaded from cdnjs and committed in `/vendor`) usable by all games.

3) Keep provenance human-readable, reproducible, and safe to publish.

## Current Phase

Portal-first.
- Focus on the portal, build pipeline, vendor strategy, and conventions.
- Keep sample games minimal (one placeholder is fine).
- Do not add complex generation “skills” until the portal is stable.

## Default Tech Choices

### Engines
- **Default 2D engine:** Phaser 3
- **Default 3D engine:** Three.js

### Shared utilities (optional but recommended)
- `lil-gui` for tweak panels
- `stats.js` for FPS/diagnostics
- (later) `howler.js` for audio, `matter-js` for physics when needed

## Repo Structure (Canonical)

- `games/<slug>/`
  - `game.yml` (catalog metadata; includes icon paths and optional pinned lib versions)
  - `README.md` (game notes)
  - `assets/` (icons, thumbnails, small media)
  - `src/` (editable source; may mirror build, but not required)
  - `build/` (the playable artifact that gets deployed)
  - `runs/` (provenance history: prompts, transcripts, configs)

- `vendor/`
  - Versioned libraries downloaded from https://cdnjs.cloudflare.com/
  - Example: `vendor/three@0.160.0/three.module.js`
  - These are committed to git (this is our “library cache”).

- `site/`
  - Portal source (TypeScript) and build output (JavaScript)
  - Source: `site/src/**` (TS/HTML/CSS)
  - Public static assets: `site/public/**` (catalog.json, importmap.json, play/…)
  - Build output: `site/dist/**` (deploy folder)

- `scripts/`
  - Node scripts for catalog generation, syncing builds, vendor downloading, importmap generation

- `.github/workflows/pages.yml`
  - CI that builds + deploys to GitHub Pages from `main`

- `prompts/`
  - Prompts used to bootstrap and later to generate games consistently

- `docs/`
  - Project documentation (architecture, vendor policy, icon style guide)

## Languages / Build Policy (TypeScript in dev → JS on deploy)

- Portal code is written in **TypeScript** under `site/src/`.
- Production deployment is **compiled JavaScript** emitted into `site/dist/`.
- Do **not** commit `site/dist/` (CI produces it during deploy).
- Node helper scripts in `scripts/` should be `.mjs` (preferred).

## GitHub Pages Base Path (Critical)

GitHub Pages is typically served at:
`https://<user>.github.io/<repo>/`

Therefore **all asset paths must work under a repo subpath**.

Rules:
- Do NOT hardcode domain-root absolute paths like `/vendor/...` unless they include the base prefix.
- Preferred approach:
  - Configure the site builder base (Vite `base`) at build time using the repo name
  - Generate `importmap.json` with the correct base prefix during build

Definition: **Base path** = `/<repo-name>/` in common GH Pages setups.

## Shared Vendor Libraries Policy (Repo “cache”)

Goal: all games share the same centrally hosted libraries.

- Libraries MUST be downloaded from cdnjs and committed into `/vendor`.
- `/vendor` MUST be versioned by folder name: `<name>@<version>/...`.
- Never “silently upgrade” a vendor version. Adding a new version folder is allowed.
- Import strategy:
  - Use an import map (`importmap.json`) so games can `import "three"` / `import "phaser"` etc.
  - Default mapping is central; per-game override can be added later.

Vendor management:
- `vendor/manifest.json` declares pinned versions and file paths to fetch.
- `scripts/vendor-fetch.mjs` downloads from cdnjs deterministically.
- Do not implement “auto-detect latest version” unless explicitly requested.

### Caching expectations

- Vendor assets are served from versioned URLs, enabling strong browser caching.
- Portal build assets should use hashed filenames (Vite default) for cache-friendly deploys.
- Optional later: add a service worker to cache `/vendor/**` and `/play/**` offline.

## Icons & Thumbnails Policy (SVG-first)

We use **SVG-first** icons because some models can only output text.
- Each game must have:
  - `games/<slug>/assets/thumbnail.svg` (for portal grid)
  - `games/<slug>/assets/icon.svg` (for game page badge / identity)
- Optional generated raster outputs (later):
  - `icon-192.png`, `icon-512.png`, `thumbnail.webp`

### SVG constraints (security + compatibility)
- SVGs must be **self-contained**:
  - No `<script>` tags
  - No external `<image href="http...">` links
- Use simple primitives (`rect`, `circle`, `path`, `text`) and internal gradients/filters only.
- Fixed size: `512×512` viewBox `0 0 512 512`
- Rounded-corner background recommended (rx ~ 48)

### Styling consistency
- Add and follow `docs/ICON_STYLE.md`.
- Prefer a consistent card layout:
  - background gradient
  - central glyph
  - title text
  - engine badge (`PHASER` or `THREE`)

## Games Policy

- `games/<slug>/build/` must be deployable as static files (no server required).
- Games must not assume they are hosted at domain root.
- Prefer ES Modules and the central import map.
- Avoid bundling vendor libs inside each game (use shared `/vendor`).

### Per-game Metadata (`game.yml`)

Keep it minimal and stable:
- slug, title, description, tags, controls, playPath
- icons:
  - thumbnail (SVG)
  - icon (SVG)

Optional:
- `libs:` pinned versions used by the game (recommended)

Example:
```yaml
slug: hello-cube
title: Hello Cube
description: Spinning cube demo
tags: [demo, three]
controls: ["Mouse drag: orbit"]
playPath: build/index.html
thumbnail: assets/thumbnail.svg
icon: assets/icon.svg
libs:
  three: "0.160.0"
````

## Provenance / Runs Policy

Each generation “run” goes in:
`games/<slug>/runs/<run-id>/`

Recommended structure:

* `run.yml` (model config, tool/skill list, references to prompts/transcript)
* `prompts/*.md`
* `transcripts/chat.md` (sanitized)
* optional: `outputs/diff.patch`, `eval/smoke-tests.md`

### Security and Privacy

Before committing transcripts or configs:

* Remove API keys, tokens, secrets, private URLs, and personal data.
* Prefer redacted placeholders like `REDACTED_TOKEN`.
* Never commit `.env` files or credentials.

## Portal Requirements

* Build output goes to `site/dist/`.
* Build process must ensure these end up in `site/dist/`:

  * `vendor/` → `site/dist/vendor/`
  * `games/*/build/` → `site/dist/play/<slug>/`
  * `catalog.json` and `importmap.json` in `site/dist/`

Portal must support:

* Game list page (search + tag filtering optional but recommended)
* Game detail page:

  * Play (iframe)
  * “View source” link (GitHub)
  * “View provenance” link (GitHub or rendered docs)

## How Agents Reference Docs

When implementing or changing behavior, agents should cite repo docs in:

* PR descriptions / commit messages
* Code comments where relevant, e.g.:
  `// See AGENTS.md#Icons-&-Thumbnails-Policy-(SVG-first)`
* Provenance `run.yml` under `refs:`:

  * `AGENTS.md#Shared-Vendor-Libraries-Policy-(Repo-“cache”)`
  * `docs/ICON_STYLE.md#template`

## Opencode Configuration

Project-specific config lives at repo root:

* `opencode.json`
* `tui.json`

Keep them minimal-valid JSON if schema is unknown. Add notes in README on how to extend.

## Definition of Done (Portal Phase)

A change is “done” when:

* `npm run build` produces `site/dist`
* `site/dist/index.html` lists at least one game from `games/*/game.yml`
* Clicking the game opens a working playable build
* Import map resolves shared vendor libs successfully under GH Pages base path
* CI deploys from `main` to GitHub Pages without manual steps
* Each game has `assets/thumbnail.svg` and `assets/icon.svg`
