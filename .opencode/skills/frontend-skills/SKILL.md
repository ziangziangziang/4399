# SKILL: Classic 4399-Style Portal Frontend (MPA, zh-CN default)

## Goal
Recreate the “4399.com in my memory” layout (dense, playful, organized), using the provided screenshot as the visual reference (NOT modern ad-heavy 4399).

## Page Model (Multi-Page, memory-friendly)
- `index.html`: portal home (categories + dense game grid + ranking/recommend blocks)
- `game.html?slug=...`: dedicated play page (iframe) with “退出/返回”
- Optional: on `index.html`, clicking a game icon opens a **detail modal** with “开始游戏 / Start Game”.

## Layout Blueprint (match screenshot vibe)
- Use a fixed center container (`~1000–1100px`), with optional left/right “banner” columns (can be decorative, not ads).
- Top thin utility bar:收藏/保存/登录/注册 + language toggle.
- Header row: logo (left), search box (center), green search button (right).
- Primary nav bar: bright green strip with category tabs (首页/动作/益智/射击…).
- Main body: 
  - Top: “mega category” panel (dense link table with light-green background + tabs).
  - Middle: “热门推荐” icon row (small square icons + names).
  - Below: multiple sections with headers (最新/推荐/今日) + dense icon grids.
  - Right sidebar: “今日推荐” list cards (thumb + 2-line text), plus ranking list.

## Visual Style Tokens (approximate)
- Primary green: `#6DBB3A` (nav/button), hover darker `#4F9A25`
- Background: `#F5F8EE` / `#FFFFFF`, section panels light green tint
- Borders: `#D9E6C8`, subtle 1px lines; small shadows only on hover
- Typography: compact (12–14px body), bold section titles, strong link density
- Cards: tight spacing; show more content above the fold (classic portal feel)

## Components (must implement)
- `Header`: logo, search input, search button, language toggle (中文/EN)
- `CategoryNav`: tabs + active state
- `MegaCategoryPanel`: tabbed rows of links (dense, grouped)
- `GameGrid`: 6–10 columns depending on width; thumbnail (SVG) + title
- `SidebarRecommend`: vertical list with small thumbs + short descriptions
- `Ranking`: Top 10 list with numbers/badges
- `GameDetailModal` (index only): thumbnail, title, tags, description, controls, buttons

## Interaction Rules
- Click game icon on index:
  - Open modal (no navigation yet) with “开始游戏 / Start Game” primary button.
  - Secondary: “查看源码 / Source”, “查看生成记录 / Provenance”.
- “开始游戏”:
  - Navigate to `game.html?slug=<slug>` (MPA) OR open a new tab if configured.
- Game page:
  - iframe loads `play/<slug>/index.html`
  - Always show “退出/返回” -> back to `index.html` (releases memory)

## i18n (zh-CN default, English optional)
- UI strings from `site/src/i18n/zh-CN.json` and `en.json`
- Default language: `navigator.language.startsWith("en") ? en : zh`
- Persist user choice in `localStorage`
- Game metadata supports `{ zh, en }` fields; render based on current language

## Accessibility & Performance
- Keyboard: modal close on `Esc`, focus trap in modal, visible focus rings
- Images: prefer SVG thumbnails; use `loading="lazy"` for non-critical images
- Keep JS simple; no heavy SPA state; MPA navigation is preferred

## Done Criteria
- Index visually resembles the screenshot’s classic portal structure (dense + green nav + sections)
- Clicking a game opens detail modal with “开始游戏”
- Start navigates to game page; Quit returns to index reliably
- zh-CN default works; English auto for English browsers; toggle persists
