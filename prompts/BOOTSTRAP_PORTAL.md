# BOOTSTRAP_PORTAL — Starting Prompt for OpenCode (TS + Vendor Cache + SVG Icons)

You are a repository scaffolding agent working on an empty `dev` branch.

## Read First
Create/adhere to `AGENTS.md` in the repo root. This file defines conventions, base-path rules for GitHub Pages, vendor policy (“repo-cached” libraries), default 2D/3D engines (Phaser + Three), and the SVG-first icon policy.

## Goal
Scaffold a GitHub Pages–published mini game portal:
- Portal lists games from `games/*/game.yml`
- Each game is playable as static files at `/play/<slug>/index.html`
- Each game page links to source and provenance (runs)
- Shared vendor libraries are downloaded from cdnjs and served from `/vendor/**` (versioned folders)
- Each game has **SVG-first** icons/thumbnails stored in `games/<slug>/assets/`

We will write portal code in **TypeScript** on `dev`, and compile to **JavaScript** in `site/dist` for deployment. CI/CD deploys on every `main` commit.

## Hard Requirements

### A) TypeScript-first portal (Vite)
- Use Vite + TypeScript for the portal (`site/`).
- Portal source code must be `.ts` where applicable.
- Build output must be `site/dist/`.
- Do NOT commit `site/dist/`.

### B) Vendor “cache” committed to repo (cdnjs)
- Create `/vendor` and manage it via a manifest and downloader script.
- Vendor folders must be versioned: `vendor/<name>@<version>/...`
- Vendor files are fetched from https://cdnjs.cloudflare.com/ and committed to git.
- Do not implement “auto-latest” version detection; versions are explicitly pinned in `vendor/manifest.json`.

Default vendor set to include (pinned versions in manifest; user can edit later):
- Phaser (2D default)
- Three.js (3D default) with addons folder mapping
- lil-gui (optional)
- stats.js (optional)

### C) GitHub Pages base path correctness
The site must work when hosted under a repo subpath:
`https://<user>.github.io/<repo>/`

- Configure Vite `base` during build using repo name (in CI via env).
- Generate `importmap.json` during build so it uses the correct base prefix.

### D) SVG-first icons/thumbnails
Each game must include:
- `games/<slug>/assets/thumbnail.svg` (512×512)
- `games/<slug>/assets/icon.svg` (512×512)

SVG constraints:
- No `<script>`
- No external `<image href="http...">`
- Self-contained; use primitives, gradients, and simple filters only
- viewBox `0 0 512 512`

Also create `docs/ICON_STYLE.md` describing a consistent icon layout.

## Deliverables (Create These)

### 1) Repo structure
- `games/<slug>/{game.yml,README.md,assets/,src/,build/,runs/}`
- `vendor/` (manifest + downloaded libs live here)
- `site/` (Vite + TS portal)
- `scripts/` (Node helpers, `.mjs` preferred)
- `.github/workflows/pages.yml`
- `docs/ICON_STYLE.md`
- `prompts/` folder containing this file
- `opencode.json` and `tui.json` at repo root (minimal-valid JSON)

### 2) Portal implementation (MVP)
Implement a small portal (TypeScript) with:
- `site/index.html` (Vite entry)
- `site/src/app.ts` (render catalog list, search, tag filtering)
- `site/src/game.ts` (game detail view with iframe player)
- `site/src/styles.css`

Catalog cards must render SVG thumbnails from each game.

Routing can be simple:
- `index.html` for list
- `game.html?slug=<slug>` for detail view

Output: `site/dist/`

### 3) Catalog build script
Create `scripts/build-catalog.mjs` that:
- Reads `games/*/game.yml`
- Writes `site/public/catalog.json`
- Fields per entry include:
  - `slug, title, description, tags, controls (optional)`
  - `thumbnail` (path to thumbnail.svg)
  - `icon` (path to icon.svg)
  - `playUrl` (base-aware path to `play/<slug>/index.html`)
  - `sourceUrl` (GitHub link to `games/<slug>/src` or repo tree)
  - `provenanceUrl` (GitHub link to `games/<slug>/runs`)
- Warn if `games/<slug>/build/` missing
- Warn if `assets/thumbnail.svg` or `assets/icon.svg` missing

### 4) Sync playable builds into site output
Create `scripts/sync-builds.mjs` that:
- Copies `games/*/build/**` into `site/public/play/<slug>/**`

### 5) Central import map (base-aware)
Create:
- `site/public/importmap.template.json` (placeholder `__BASE__`)
- `scripts/build-importmap.mjs` that:
  - Replaces `__BASE__` with a provided base (default `/`)
  - Writes `site/public/importmap.json`

Import map must include:
- `"three"` → `"__BASE__vendor/three@<version>/three.module.js"`
- `"three/addons/"` → `"__BASE__vendor/three@<version>/examples/jsm/"`
- `"phaser"` → `"__BASE__vendor/phaser@<version>/phaser.esm.js"` if available
  - If Phaser ESM is not available/usable from cdnjs, use UMD build and document how games should load it.

### 6) Vendor management (cdnjs)
Create:
- `vendor/manifest.json` with pinned versions and file paths.
- `scripts/vendor-fetch.mjs` that downloads deterministically via Node 20+ `fetch`.

### 7) Placeholder sample games (with SVG icons)
Create TWO minimal games so both stacks are proven:

A) `games/hello-cube/` (Three.js)
- `assets/thumbnail.svg` and `assets/icon.svg` following `docs/ICON_STYLE.md`
- `game.yml` references those SVGs
- `build/index.html` uses import map and renders a spinning cube

B) `games/hello-phaser/` (Phaser)
- `assets/thumbnail.svg` and `assets/icon.svg`
- `game.yml` references those SVGs
- `build/index.html` uses Phaser and shows a simple bouncing shape or sprite

Both must work under GH Pages base path.

### 8) GitHub Actions Pages pipeline
Create `.github/workflows/pages.yml`:
- Trigger: push to `main`
- Steps:
  - checkout
  - setup node 20
  - npm ci
  - npm run vendor:fetch (optional if vendor already committed; allowed either way)
  - npm run catalog
  - npm run sync
  - npm run importmap -- --base "/${{ github.event.repository.name }}/"
  - npm run build (Vite) with base set appropriately
  - copy `vendor/` into `site/dist/vendor/`
  - ensure `catalog.json` and `importmap.json` are in `site/dist/`
  - deploy via `actions/upload-pages-artifact` + `actions/deploy-pages`

### 9) Root docs
Create `README.md` including:
- How to run locally
- How to add a game (including SVG icon requirements)
- How to fetch/update vendor libs from cdnjs
- How deployment works (merge `dev` → `main` triggers pages deploy)
- Provenance conventions + sanitization expectations
- Notes about GH Pages base path and import map generation

### 10) NPM scripts
At repo root create `package.json` with scripts:
- `vendor:fetch` → node scripts/vendor-fetch.mjs
- `catalog` → node scripts/build-catalog.mjs
- `sync` → node scripts/sync-builds.mjs
- `importmap` → node scripts/build-importmap.mjs (accept `--base` arg)
- `dev` → run Vite dev server in `site/`
- `build` → build portal into `site/dist/` (ensure pre-steps handled)

## Implementation Notes
- Prefer `.mjs` Node scripts and TypeScript for portal UI.
- Keep dependencies minimal (Vite + yaml parser).
- Make path handling robust under GH Pages subpath.
- Ensure SVGs are self-contained and safe.
- Add a “self-check” section in README with commands to run.

## Now Implement
1) Create directories + files with initial content.
2) Ensure `npm run dev` and `npm run build` produce a working portal (TS compiled to JS).
3) Ensure `hello-cube` and `hello-phaser` are listed with SVG thumbnails and playable.
4) Ensure import map resolves shared vendor libs and paths work under GH Pages base path.

Output only the code changes (files created/modified) as usual for OpenCode.
