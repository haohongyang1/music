# 乐谱段落标注工具设计

## 概述

标注工具用于在浏览器中可视化地标记乐谱段落和反复规则，替代手动计算比例值，提高标注效率和准确性。

## 功能需求

### 标注模式

```
┌─────────────────────────────────────────┐
│  [返回] 段落标注 - 红色高跟鞋              │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  前奏  □                        │   │
│  │  ╔═══════════════════════╗      │   │
│  │  ║                       ║      │   │
│  │  ║                       ║      │   │
│  │  ╚═══════════════════════╝      │   │
│  │  0% - 15%                       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  A段  ☑                        │   │
│  │  ╔═══════════════════════╗      │   │
│  │  ║                       ║      │   │
│  │  ║    ▲ 拖动调整         ║      │   │
│  │  ║    ▼ 拖动调整         ║      │   │
│  │  ╚═══════════════════════╝      │   │
│  │  15% - 45%  [反复×2]             │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [+ 添加段落]                           │
├─────────────────────────────────────────┤
│  [导出 JSON] [预览播放]                 │
└─────────────────────────────────────────┘
```

## 核心功能

### 1. 可视化标记

```js
interface AnnotationTool {
  // 乐谱选择
  currentScore: Score | null

  // 段落列表
  sections: Section[]

  // 选中的段落
  selectedSection: Section | null

  // 当前正在拖拽的边界
  dragging: 'start' | 'end' | null
}
```

### 2. 边界拖拽

```js
function handleDragStart(section, boundary) {
  dragging = boundary // 'start' | 'end'
}

function handleDragMove(yPosition, maxScroll) {
  if (!selectedSection || !dragging) return

  const ratio = yPosition / maxScroll

  if (dragging === 'start') {
    selectedSection.startRatio = Math.min(ratio, selectedSection.endRatio - 0.01)
  } else {
    selectedSection.endRatio = Math.max(ratio, selectedSection.startRatio + 0.01)
  }
}
```

### 3. 实时预览

```js
// 标注时可以切换到预览模式，测试反复播放
function togglePreviewMode() {
  // 临时应用标注数据到播放视图
  // 播放完成后自动返回标注模式
}
```

### 4. JSON 导出

```js
function exportAnnotations() {
  const output = {
    sections: sections.map(s => ({
      id: s.id,
      name: s.name,
      startRatio: parseFloat(s.startRatio.toFixed(4)),
      endRatio: parseFloat(s.endRatio.toFixed(4))
    })),
    repeats: repeats.map(r => ({
      type: r.type,
      fromSection: r.fromSection,
      toSection: r.toSection,
      times: r.times
    }))
  }

  // 复制到剪贴板或下载文件
  return JSON.stringify(output, null, 2)
}
```

## UI 交互

### 段落添加

```
点击 [+ 添加段落]：
1. 在当前滚动位置创建新段落
2. 默认高度为当前视图高度的 50%
3. 自动命名为 "段落 N"
```

### 段落删除

```
长按段落卡片 → 显示删除确认 → 删除
```

### 反复规则添加

```
选中段落 → 点击 [反复×]：
- 选择重复次数（1-10）
- 选择回跳段落（默认当前段落）
```

## 实现方案

### 方案 A: 独立标注页面

```js
// 路由: #/annotate/<scoreId>
function AnnotationView({ scoreId }) {
  // 完整的标注界面
  // 与播放页面分离
}
```

**优点:**
- 界面清晰，互不干扰
- 可以复用现有的滚动和图片渲染逻辑

**缺点:**
- 需要额外的路由处理
- 代码量较多

### 方案 B: 播放页面内嵌标注模式（推荐）

```js
// 在播放页面添加标注模式开关
function PlaybackView({ score }) {
  const [mode, setMode] = useState('play' | 'annotate')

  return mode === 'play' ? (
    <PlayMode score={score} />
  ) : (
    <AnnotateMode score={score} />
  )
}
```

**优点:**
- 实时对比标注效果
- 代码复用率高
- 切换方便

**缺点:**
- UI 可能稍显复杂

### 方案 C: 浏览器控制台标注工具

```js
// 通过浏览器控制台命令进行标注
window.annotate = {
  addSection(name, startRatio, endRatio),
  addRepeat(fromSection, toSection, times),
  export()
}
```

**优点:**
- 实现简单，无需 UI
- 适合高级用户

**缺点:**
- 易用性差
- 不适合普通用户

## 推荐方案

**采用方案 B：播放页面内嵌标注模式**

### MVP 实现

1. 在播放控制栏添加「📝 标注」按钮（仅开发环境显示）
2. 点击进入标注模式，显示标注面板
3. 基础功能：
   - 添加/删除段落
   - 拖拽调整边界
   - 添加反复规则
   - 导出 JSON

### 扩展功能（后续）

- 导入已有标注数据
- 段落键盘快捷键（Ctrl+M 添加，Ctrl+D 删除）
- 多段反复支持
- 批量标注多首乐谱

## 数据持久化

标注过程中临时保存到 localStorage：

```js
const ANNOTATION_KEY = `annotation-${scoreId}`

// 保存草稿
function saveDraft(sections, repeats) {
  localStorage.setItem(ANNOTATION_KEY, JSON.stringify({ sections, repeats }))
}

// 加载草稿
function loadDraft(scoreId) {
  return JSON.parse(localStorage.getItem(`annotation-${scoreId}`) || 'null')
}
```

## MVP 任务清单（标注工具）

- [ ] A.1 在播放页面添加「📝 标注」按钮（仅开发环境）
- [ ] A.2 实现标注模式状态切换
- [ ] A.3 实现标注面板 UI（段落列表、操作按钮）
- [ ] A.4 实现段落添加功能（在当前滚动位置）
- [ ] A.5 实现段落边界拖拽调整
- [ ] A.6 实现反复规则添加功能
- [ ] A.7 实现 JSON 导出功能
- [ ] A.8 实现草稿自动保存和恢复
- [ ] A.9 实现预览播放功能

## 使用流程

```
1. 打开乐谱播放页面
2. 点击「📝 标注」按钮进入标注模式
3. 滚动到段落起始位置，点击 [+ 添加段落]
4. 拖拽边界调整段落范围
5. 重复 3-4 完成所有段落标注
6. 为需要反复的段落添加反复规则
7. 点击 [预览播放] 验证效果
8. 点击 [导出 JSON] 复制数据
9. 将数据粘贴到 scoreData.js 中
```