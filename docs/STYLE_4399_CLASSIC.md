# Classic 4399 Style Reference (Nostalgia Target)

Goal: Users should think “哇，这就是我记忆里的 4399！”  
Reference: the provided screenshot + SKILL.md. Ignore modern 4399.com (ads/noise).

## Overall vibe
- “Portal” feeling: lots of content above the fold, dense but orderly.
- Bright and friendly: light background + green accents.
- Practical, not fancy: minimal animations, clear sections, compact typography.

## Page layout (index.html)
### 1) Top utility bar (thin, minimal)
- No accounts, no login/register (GitHub Pages, keep it simple).
- Right side: language toggle `中文 / EN` only.
- Optional: a small non-interactive hint like “经典小游戏合集”.

### 2) Header row
- Left: logo area (text logo ok: “4399小游戏” style)
- Center: search input (wide)
- Right: green search button (prominent)

### 3) Primary navigation (green strip, auto-generated)
- Horizontal tabs are **auto-generated** from game metadata (`category` field).
- Tabs: `全部` + categories sorted by game count.
- Active tab highlight; hover feedback.
- Keep the tab list compact; if too many categories, collapse overflow into “更多”.


### 4) “Mega category” panel (dense links)
- Light-green panel with multiple rows/columns of small links.
- Can be tabbed (e.g., 推荐 / 热门 / 最新).
- This is a signature “classic portal” density block.

### 5) Main content area (3-column feel)
- Center: dense game grid (many small square cards).
- Right: ranking list (Top 10) + “今日推荐” small list cards.
- Left (optional): category list or featured section.
- If no side banners, keep margins clean; if decorative banners, ensure no ad-like behavior.

## Card design (game icon)
- Square thumbnail (PNG/SVG) + 1-line title below.
- Optional tiny badge: 热门 / 新 / 推荐.
- Hover: slight lift + border highlight; no heavy shadows.

## Section design
- Each section has:
  - Title bar (light green background or border)
  - “更多 >” link
  - Dense grid/list beneath
- Example sections:
  - 热门推荐
  - 最新更新
  - 今日推荐
  - 排行榜

## Colors & typography (suggested)
- Primary green: `#6DBB3A`, hover `#4F9A25`
- Light panel background: `#F3FAE8` / `#F7FBEF`
- Border: `#D9E6C8`
- Text: 12–14px body, bold section titles
- Keep spacing tight; maximize visible content.

## Interactions (must-have)
- Click a game card → open detail modal:
  - thumbnail, title, tags, short description, controls
  - Primary button: **开始游戏 / Start Game**
- Start Game → navigate to `game.html?slug=<slug>` (MPA)
- Game page must have **退出/返回** (back to index) to release memory.

## Non-goals
- Don’t emulate modern 4399.com layout, ads, or clutter.
- Don’t over-modernize into a minimalist gallery.
- Avoid heavy animations, autoplay audio, popups.

## Success checklist
- Green nav + search + dense sections visible immediately.
- Grid feels “portal-like” (lots of choices).
- Detail modal + “开始游戏” works smoothly.
- Chinese-first UI feels natural; English works when browser is English.

