# BOOTSTRAP_PORTAL

You are scaffolding an empty `dev` branch.

## Goal
Create a GitHub Pages mini portal that feels like **classic 4399** (dense grid + green nav + search + rankings). Start with **one game: Snake** that can be launched and quit back to the portal.

## Must-haves
- **MPA**: `index.html` (portal) + `game.html?slug=...` (play page w/ iframe + 退出/返回)
- **npm bundling only** (no CDN/importmap/vendor). Use Vite + esbuild.
- **TS-first**: portal and games in TypeScript; build outputs are JS.
- **i18n**: default zh-CN; auto English if `navigator.language` starts with `en`; toggle `中文/EN` (localStorage).
- **SVG icons** per game: `thumbnail.svg` + `icon.svg` (512×512, no script/external images).
- **TODO.md**: Now/Next/Later/Done and keep it updated.
- Add docs: `docs/STYLE_4399_CLASSIC.md`, `docs/ICON_STYLE.md`, and include `SKILL.md` guidance.

## Deliverables
- `AGENTS.md`, `TODO.md`
- `docs/STYLE_4399_CLASSIC.md`, `docs/ICON_STYLE.md`
- `games/snake/{game.yml,assets/,src/,build/,runs/}`
- `site/` (Vite MPA): `index.html`, `game.html`, `src/index.ts`, `src/game.ts`, `src/i18n/*`, `src/styles.css`
- `scripts/`: `build-games.mjs`, `build-catalog.mjs`, `assemble.mjs`
- `.github/workflows/pages.yml` deploys `site/dist` on `main`
- Root `package.json` scripts:
  - `dev`, `build:games`, `catalog`, `assemble`, `build:site`, `build`

## Game requirements (Snake)
- Implement Snake in `games/snake/src/main.ts` (Canvas 2D preferred, minimal deps).
- “Start / Pause / Restart” in-game; portal provides the Quit/Back.

Implement, ensure `npm run dev` works and `npm run build` outputs `site/dist` with playable Snake.
Output only code changes as usual.
