# Icon Style Guide

## Overview

Icons and thumbnails are **SVG-first** to support models that can only output text. All SVGs must be self-contained with no external dependencies.

## Requirements

### File Locations

Each game must have:
- `games/<slug>/assets/thumbnail.svg` (512×512, for portal grid)
- `games/<slug>/assets/icon.svg` (512×512, for game page badge)

### SVG Constraints

1. **Self-contained only**
   - No `<script>` tags
   - No external `<image href="...">` links
   - Use internal gradients/filters only

2. **Fixed dimensions**
   - ViewBox: `0 0 512 512`
   - Recommended size: `512×512`

3. **Security**
   - No external network requests
   - No embedded fonts (use system fonts)

## Layout Template

### Thumbnail (card style)

```svg
<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Background gradient -->
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea"/>
      <stop offset="100%" style="stop-color:#764ba2"/>
    </linearGradient>
  </defs>
  
  <!-- Rounded background -->
  <rect x="8" y="8" width="496" height="496" rx="48" fill="url(#bg)"/>
  
  <!-- Central glyph (game-specific) -->
  <circle cx="256" cy="200" r="80" fill="#ffffff" opacity="0.9"/>
  
  <!-- Title text -->
  <text x="256" y="340" text-anchor="middle" font-family="system-ui" font-size="42" fill="#ffffff" font-weight="bold">
    Game Title
  </text>
  
  <!-- Engine badge -->
  <text x="256" y="390" text-anchor="middle" font-family="system-ui" font-size="24" fill="#ffffff" opacity="0.8">
    PHASER
  </text>
</svg>
```

### Icon (badge style)

```svg
<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Background gradient -->
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea"/>
      <stop offset="100%" style="stop-color:#764ba2"/>
    </linearGradient>
  </defs>
  
  <!-- Rounded background -->
  <rect x="8" y="8" width="496" height="496" rx="48" fill="url(#bg)"/>
  
  <!-- Central glyph (game-specific) -->
  <circle cx="256" cy="256" r="120" fill="#ffffff" opacity="0.9"/>
</svg>
```

## Color Palette

### Default Gradients

- **Phaser games**: `#667eea` → `#764ba2` (purple)
- **Three.js games**: `#4facfe` → `#00f2fe` (blue)
- **Generic**: `#f093fb` → `#f5576c` (pink)

### Text Colors

- Primary text: `#ffffff`
- Secondary/opacity: `#ffffff` with `opacity="0.8"`

## Engine Badges

- Use all-caps: `PHASER` or `THREE`
- Font size: ~24px
- Position: below title text

## Naming Conventions

- `thumbnail.svg` - Used in game card grid
- `icon.svg` - Used on game detail page

## Tips

1. Keep SVGs simple - complex paths increase file size
2. Use `<defs>` for reusable gradients
3. Test icons in both light and dark backgrounds
4. Avoid fine details that may not render well at small sizes