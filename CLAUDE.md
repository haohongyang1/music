# 吉他乐谱自动播放应用

## 项目概述

这是一个基于 Vite + React 的单页应用，用于浏览和练习吉他六线谱。应用支持乐谱自动滚动播放、速度调节和移动端优化。

## 技术栈

- **框架**: React 19.2.6
- **构建工具**: Vite 8.0.12
- **包管理器**: pnpm
- **UI 图标**: lucide-react
- **样式**: 原生 CSS（CSS 变量主题系统）

## 项目结构

```
music/
├── src/
│   ├── App.jsx           # 主应用组件，包含路由和视图逻辑
│   ├── App.css           # 应用样式
│   ├── index.css         # 全局样式和 CSS 变量
│   ├── scoreData.js      # 乐谱数据和元数据
│   └── assets/imgs/      # 乐谱图片资源
├── openspec/             # 开发规范和任务管理（Codex 模式）
├── .claude/              # Claude Code 配置
└── package.json
```

## 开发规范

### 代码风格

- 使用原生 JavaScript（不使用 TypeScript）
- React 函数组件 + Hooks
- 使用 `lucide-react` 图标库
- CSS 使用 `--` 前缀的自定义属性作为变量
- 命名：组件 PascalCase，函数 camelCase，常量 UPPER_SNAKE_CASE

### Git 提交规范

```
<type>: <简短描述>

类型:
- feat: 新功能
- fix: 修复
- refactor: 重构
- chore: 构建/工具链相关
```

### 开发命令

```bash
pnpm install      # 安装依赖
pnpm run dev      # 启动开发服务器（http://localhost:5173）
pnpm run build    # 构建生产版本
pnpm run lint     # 代码检查
```

### 乐谱数据规范

在 `src/scoreData.js` 中添加新乐谱时，保持以下结构：

```js
{
  id: 'unique-id',
  title: '歌曲名',
  artist: '歌手',
  arranger: '编配者',
  originalKey: '原调',
  selectedKey: '选调',
  tuning: '调弦方式',
  tags: ['类型标签'],
  pages: [
    { src: imageImport, label: '第 1 页', focus: '重点内容' }
  ]
}
```

## 功能开发流程

### Codex 开发模式（OpenSpec）

1. 在 `openspec/changes/<feature-name>/` 下创建新特性目录
2. 编辑 `proposal.md` 描述变更
3. 编辑 `design.md` 描述设计决策
4. 编辑 `tasks.md` 列出任务清单（使用 checkbox）
5. 实现后更新 `specs/` 下的规格文档

### Claude Code 开发模式

- 直接对话描述需求
- 参考本文件中的项目结构和规范
- 遵循 Git 提交规范

## 关键技术决策

### 导航方式
- 使用 hash-based 路由（`window.location.hash`）
- 路由格式：`#/`（乐谱库）或 `#/score/<id>`（播放页）

### 自动播放实现
- 使用 `requestAnimationFrame` 实现平滑滚动
- 滚动位置通过 CSS 变量 `--score-offset` 控制
- 速度保存到 localStorage，按歌曲 ID 区分

### 移动端适配
- 使用 `overscroll-behavior: none` 禁用浏览器下拉刷新
- 使用 `svh` 视口单位适配移动浏览器地址栏
- 触摸事件手动处理以支持拖拽滚动

### 暗色主题
- 使用 CSS `@media (prefers-color-scheme: dark)` 查询
- 通过 CSS 变量实现主题切换