---
name: game-dev
description: 4399 小游戏门户游戏开发工作流，支持 Phaser/Three.js/Vanilla Canvas，集成 Chrome DevTools MCP 截图和 Understand Image 视觉分析
---

# Game Development Skill - 4399 小游戏门户

## 游戏开发工作流

### 1. 创建新游戏

```bash
npm run create <game-name>
```

**游戏结构:**
```
games/<slug>/
├── src/main.ts          # 游戏主代码 (TypeScript)
├── game.yml             # 元数据 (zh/en 标题、描述)
├── assets/
│   ├── thumbnail.png    # 缩略图 (AI 生成，512x512)
│   └── icon.png         # 图标 (AI 生成，128x128)
└── build/               # esbuild 打包输出 (不提交)
    └── main.js
```

### 2. 游戏开发模式

**支持的游戏引擎:**
- **Vanilla Canvas** - 简单游戏，直接使用 Canvas API
- **Phaser 3** - 2D 游戏，功能丰富
- **Three.js** - 3D 游戏

**代码模板模式:**
```typescript
// IIFE 格式，立即暴露到 window
(() => {
  class Game {
    constructor() { /* 初始化 */ }
    start() { /* 开始游戏 */ }
    update() { /* 游戏循环 */ }
    stop() { /* 清理 */ }
  }
  
  window.__GAME_INSTANCE__ = new Game();
})();
```

### 3. 构建与部署

**完整构建流程:**
```bash
npm run build
```

**分步执行:**
1. `npm run build:games` - esbuild 打包所有游戏
2. `npm run catalog` - 生成 `site/public/catalog.json`
3. `npm run assemble` - 复制游戏到 `site/public/play/<slug>`
4. `npm run build:site` - 构建门户到 `site/dist`

**部署到 GitHub Pages:**
```bash
npm run build
git add site/dist
git commit -m "build: deploy games"
git push origin main
```

### 4. 使用 Chrome DevTools MCP 调试游戏

**截图捕获:**
```typescript
// 在 game.html?slug=<game-name> 页面
1. 使用 chrome-dev-tools_take_screenshot 捕获游戏画面
2. 保存为调试证据或 bug 报告
```

**性能分析:**
```typescript
// 分析游戏性能
1. chrome-dev-tools_performance_start_trace (reload=true, autoStop=true)
2. 玩游戏若干秒
3. chrome-dev-tools_performance_stop_trace
4. 查看 Core Web Vital 指标
```

**网络请求检查:**
```typescript
// 检查游戏资源加载
chrome-dev-tools_list_network_requests(resourceTypes=["image", "script"])
```

### 5. 使用 Understand Image 分析游戏画面

**视觉问题诊断:**
```typescript
// 分析游戏截图
waypoint_understand_image({
  image_path: "screenshot.png",
  instruction: "分析游戏画面：检查渲染问题、UI 布局、视觉错误",
  model: "gpt-4o"
})
```

**游戏元素识别:**
```typescript
// 识别游戏对象和状态
waypoint_understand_image({
  image_path: "gameplay.png",
  instruction: "识别游戏中的元素：角色、道具、分数、生命值、关卡进度",
  model: "gpt-4o"
})
```

**UI 布局检查:**
```typescript
// 检查界面布局是否符合 4399 风格
waypoint_understand_image({
  image_path: "ui-screenshot.png",
  instruction: "检查界面是否符合经典 4399 风格：绿色导航栏、紧凑布局、中文界面",
  model: "gpt-4o"
})
```

### 6. AI 生成游戏素材

**缩略图生成:**
```typescript
waypoint_generate_image({
  prompt: "4399 小游戏缩略图，<游戏类型> 风格，色彩鲜艳，卡通风格，正方形构图，512x512",
  size: "1024x1024",
  quality: "high",
  output_path: "games/<slug>/assets/thumbnail.png"
})
```

**图标生成:**
```typescript
waypoint_generate_image({
  prompt: "小游戏图标，<游戏名称>，简洁图标设计，圆角正方形，128x128",
  size: "256x256",
  output_path: "games/<slug>/assets/icon.png"
})
```

### 7. 常见问题排查

**Catalog 识别问题:**
```bash
# 检查 catalog.json 中的缩略图路径
# 自动检测：优先 PNG， fallback 到 SVG
# 修复：scripts/build-catalog.mjs 添加文件存在性检查
```

**游戏资源加载失败:**
```typescript
// 检查游戏路径是否正确
// 游戏资源应使用相对路径或 /play/<slug>/ 绝对路径
```

**性能优化:**
```typescript
// 使用 Chrome DevTools Performance 分析
// 检查：FPS、内存泄漏、渲染耗时
// 优化：对象池、纹理压缩、减少 draw calls
```

### 8. 测试与验收

**本地测试流程:**
```bash
# 1. 构建游戏
npm run build

# 2. 启动开发服务器
cd site && npm run dev

# 3. 访问游戏页面
# http://localhost:5173/play/<slug>

# 4. 使用 Chrome DevTools 捕获截图
# 验证游戏功能、UI 布局、性能表现

# 5. 使用 Understand Image 分析截图
# 检查视觉质量、布局问题
```

**验收清单:**
- [ ] 游戏能正常启动和运行
- [ ] 缩略图和图标正确显示
- [ ] 游戏页面有"返回门户"按钮
- [ ] 语言切换正常工作
- [ ] 性能指标达标 (FPS > 30, LCP < 3s)
- [ ] 截图清晰，无渲染错误

### 9. 代码规范

**游戏代码要求:**
- 使用 TypeScript
- IIFE 格式封装
- 暴露 `window.__GAME_INSTANCE__`
- 实现 `start()`, `update()`, `stop()` 方法
- 清理资源 (移除事件监听、释放 Canvas 等)

**文件组织:**
- 代码放在 `src/`
- 静态资源放在 `assets/`
- 打包输出到 `build/` (不提交)
- `game.yml` 定义元数据

**命名规范:**
- 目录名使用 kebab-case (如 `snake-game`)
- 游戏 slug 与目录名一致
- 文件命名清晰易懂

### 10. 调试技巧

**控制台调试:**
```typescript
// 在浏览器控制台
window.__GAME_INSTANCE__.start()  // 手动启动
window.__GAME_INSTANCE__.stop()   // 手动停止
```

**性能监控:**
```typescript
// 添加性能埋点
console.time('game-loop');
// 游戏逻辑
console.timeEnd('game-loop');
```

**截图取证:**
```typescript
// 关键状态截图
// 1. 游戏启动画面
// 2. 游戏进行中
// 3. 游戏结束/得分界面
// 4. UI 问题截图
```