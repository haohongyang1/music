## Context

当前乐谱段落数据存储在 `scoreData.js` 中，使用 0-1 的比例值定义段落边界：

```js
sections: [
  { id: 'intro', name: '前奏', startRatio: 0, endRatio: 0.12 },
  { id: 'verse-a', name: 'A段', startRatio: 0.12, endRatio: 0.35 },
]
```

这种手动编辑方式的问题：
- 需要估算比例值，不直观
- 修改图片后需要重新计算
- 无法实时预览播放效果

## Goals / Non-Goals

**Goals:**
- 在浏览器中可视化标记段落边界
- 支持拖拽调整边界
- 配置反复规则（单段/跨段）
- 实时预览播放效果
- 导出数据到 scoreData.js

**Non-Goals:**
- 自动识别乐谱中的反复记号
- 编辑图片内容
- 多段反复（1st/2nd endings）
- 跳跃反复（D.C./D.S.）

## Decisions

### 标注模式入口

仅在开发环境显示标注按钮：

```js
const isDev = import.meta.env.DEV

{isDev && score.sections?.length > 0 && (
  <button onClick={() => setMode('annotate')}>📝 标注</button>
)}
```

**Why:** 标注工具面向开发者，生产环境不需要。

### 数据结构

标注工具的数据结构与 scoreData.js 一致：

```js
// 编辑状态
interface AnnotationState {
  scoreId: string
  sections: SectionDraft[]
  repeats: RepeatDraft[]
}

interface SectionDraft {
  id: string          // 唯一标识
  name: string        // 显示名称
  startRatio: number // 起始比例 0-1
  endRatio: number    // 结束比例 0-1
}

interface RepeatDraft {
  type: 'segment'
  startSection: string    // 起始段落
  endSection: string      // 结束段落
  jumpToSection: string   // 跳转目标
  times: number           // 重复次数 1-10
}
```

**Why:** 与播放逻辑无缝对接，导出后直接可用。

### 边界调整方式

段落边界调整采用**卡片输入框 + 可选拖拽**两种方式：

**方案 A（主要）：段落卡片输入框**
```
┌─────────────────────────────────────┐
│ 📍 A段              [×] [编辑]     │
│ 起始: [  12%  ▼]   结束: [  35%  ▼]   │
│    [反复×2]                           │
└─────────────────────────────────────┘
```

**方案 B（可选）：乐谱上拖拽边界**
- 进入"边界拖拽模式"后，在乐谱上拖拽创建/调整边界
- 显示拖拽手柄和实时边界线

**Why:**
- 卡片输入框更精确，适合精细调整
- 拖拽更直观，适合快速粗略定位
- 避免与现有触摸滚动冲突

**Alternative considered:** 仅拖拽调整。Rejected，与现有触摸滚动冲突，精度不足。

### 手动输入比例

在"编辑段落"弹窗中提供精确输入：

```
┌─────────────────────┐
│ 编辑段落             │
├─────────────────────┤
│ 名称: [A段         ] │
│ 起始比例: [0.12]    │
│ 结束比例: [0.35]    │
│                     │
│ [取消] [保存]       │
└─────────────────────┘
```

**Why:** 拖拽精度可能不够，手动输入确保精确控制。

### 移动端拖拽冲突处理

标注模式与播放模式的事件传播策略：

| 模式 | 触摸事件处理 |
|------|------------|
| **播放模式** | 拖拽 → 滚动（原有逻辑） |
| **标注模式** | 非控制区域 → 滚动；段落边界手柄 → 拖拽调整 |

**实现方式：**

```js
// 段落边界手柄
<SectionHandle
  onTouchStart={(e) => {
    e.stopPropagation()  // 阻止传播到滚动处理
    setDragging('start')
  }}
  onPointerDown={(e) => {
    e.stopPropagation()  // 阻止传播到滚动处理
    setDragging('start')
  }}
/>

// 标注模式下的滚动容器
<div
  onWheel={e => {
    if (isDragging) return  // 拖拽中不滚动
    // 正常滚动逻辑
  }}
  onPointerMove={e => {
    if (isDragging) {
      // 拖拽调整边界
    } else {
      // 正常滚动
    }
  }}
/>
```

**Why:** 通过 `stopPropagation` 和状态判断区分拖拽和滚动。

### 草稿存储隔离

使用图片内容 hash 作为草稿 key 的一部分，含错误降级：

```js
async function getDraftKey(scoreId) {
  try {
    const scoreHash = await computeScoreHash(scoreId)
    return `score-annotation-draft-${scoreId}-${scoreHash}`
  } catch (error) {
    console.warn('无法计算图片 hash，使用 scoreId 作为草稿 key', error)
    return `score-annotation-draft-${scoreId}-fallback`
  }
}

async function computeScoreHash(scoreId) {
  const score = getScoreById(scoreId)
  const firstImageSrc = score.pages[0].src

  let buffer
  if (firstImageSrc.startsWith('/')) {
    // Vite 开发环境：使用已加载的图片元素避免重复请求
    const img = new Image()
    img.src = firstImageSrc
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
    })

    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)

    const blob = await new Promise(resolve => canvas.toBlob(resolve))
    buffer = await blob.arrayBuffer()
  } else {
    // 生产环境：使用 fetch 获取
    const response = await fetch(firstImageSrc)
    const blob = await response.blob()
    buffer = await blob.arrayBuffer()
  }

  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16)
}
```

**Why:** 即使相同 scoreId 但图片内容不同，草稿也不会冲突；计算失败时使用 fallback key 降级。

**Alternative considered:** 仅使用 scoreId。Rejected，图片更新后草稿失效。

### JSON 导出格式

```js
const exportData = () => {
  // 按 startRatio 排序，提高可读性
  const sortedSections = [...sections].sort((a, b) => a.startRatio - b.startRatio)

  return {
    sections: sortedSections.map(s => ({
      id: s.id,
      name: s.name,
      startRatio: parseFloat(s.startRatio.toFixed(4)),
      endRatio: parseFloat(s.endRatio.toFixed(4))
    })),
    repeats: repeats.map(r => ({
      type: r.type,
      startSection: r.startSection,
      endSection: r.endSection,
      jumpToSection: r.jumpToSection,
      times: r.times
    }))
  }
}
```

**Why:** 保留4位小数足够精确，同时保持可读性。

### 预览播放模式

预览模式直接使用播放页面组件，传入临时数据：

```js
<PlaybackView
  score={{ ...currentScore, sections, repeats }}
  mode="preview"
  onExit={() => setMode('annotate')}
/>
```

**Why:** 复用现有播放逻辑，确保标注效果准确。

## Risks / Trade-offs

- **比例精度**：拖拽精度可能不够。Mitigation：提供手动输入精确控制。
- **段落重叠**：拖拽可能造成重叠。Mitigation：实时检测并防止。
- **草稿污染**：localStorage 可能有残留。Mitigation：提供清空功能。
- **移动端冲突**：拖拽与滚动冲突。Mitigation：使用 `stopPropagation` 和状态判断。
- **Hash 计算**：计算图片 hash 可能影响性能。Mitigation：只计算第一页图片，异步执行。