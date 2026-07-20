---
name: Library 写作应用项目
description: 'paper-archive 仓库是一个名为 Library 的静态个人写作 Web 应用(React+TS+Vite),部署到 GitHub Pages'
type: project
---

paper-archive 仓库承载名为 "Library" 的高端静态写作 Web 应用(类 Apple Books/Notion/Muji 美学),用户可创建多种格式的"书"(日记/小说/食谱等)并在其中写作。

**Why:** 目标是生产级、视觉精美、类型安全、可维护,数据本地持久化(IndexedDB)且后端可替换,通过 HashRouter + vite base './' 兼容 GitHub Pages 子路径部署。

**How to apply:** 分层严格 —— UI 组件(src/components)不直接触碰 storage,一律经 Repository(src/lib/repository.ts)。替换后端只需改 LibraryContext.tsx 里 `new Repository(new IndexedDbProvider())` 一行。CSS 用设计系统变量,组件所用 `--color-*`/`--radius-*`/`--ease-*` 是 global.css :root 中映射到真实变量(`--ink`/`--r-*`/`--dur*`)的别名,新增样式应复用这些别名。首轮 MVP 已通过 `npm run build` 验证。