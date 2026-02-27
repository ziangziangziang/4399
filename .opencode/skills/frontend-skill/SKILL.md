---
name: frontend-design
description: Build a classic 4399-style mini game portal (MPA, zh-CN default) with auto-generated category tabs, dense game grid, detail modal + “开始游戏”, and a dedicated play page with quit/back.
compatibility: GitHub Pages, Vite MPA, TypeScript, esbuild-bundled games, modern browsers
metadata:
  ui_style: "classic 4399 (nostalgia)"
  architecture: "MPA (index.html + game.html)"
  default_language: "zh-CN"
  i18n: "auto-en when navigator.language startsWith en + toggle"
license: MIT
---

## Skill Rules

- **MPA only:** `index.html` (portal) and `game.html?slug=...` (play). Leaving `game.html` must release memory naturally.
- **No non-critical features:** no login/register/ads; keep only search + categories + ranking/recommend blocks + language toggle.
- **Classic layout:** green nav strip, centered container, dense sections, compact typography; follow the screenshot vibe and `docs/STYLE_4399_CLASSIC.md`.
- **Tabs auto-generated:** build `catalog.json` from `games/*/game.yml`; generate tabs from `category` counts (`全部` + top categories; overflow → “更多”).
- **Click → modal:** clicking a game card opens a **detail modal** with thumbnail, title, tags, short desc, controls, and primary **开始游戏**.
- **Start game:** modal button navigates to `game.html?slug=<slug>`; play page embeds `play/<slug>/index.html` in an iframe.
- **Quit/back:** play page must have a prominent `退出/返回` that returns to `index.html`.
- **i18n:** default zh-CN; if `navigator.language` starts with `en`, default English; always show `中文/EN` toggle persisted in `localStorage`.
- **SVG-first icons:** each game has `assets/thumbnail.svg` + `assets/icon.svg` (512×512, no scripts/external images).
