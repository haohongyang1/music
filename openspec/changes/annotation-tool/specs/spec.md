# 标注工具规格

## 数据模型

### 编辑状态

```typescript
interface AnnotationState {
  scoreId: string
  scoreHash: string  // 图片内容 hash，用于草稿隔离
  draftKey: string      // localStorage key（异步计算后设置）
  mode: 'annotate' | 'preview'
  sections: SectionDraft[]
  repeats: RepeatDraft[]
  selectedSectionId: string | null
  dragging: 'start' | 'end' | null
  isDraggingBoundary: boolean  // 是否正在拖拽边界
  loading: boolean       // hash 计算中
}

interface SectionDraft {
  id: string
  name: string
  startRatio: number  // 0-1
  endRatio: number    // 0-1
}

interface RepeatDraft {
  type: 'segment'
  startSection: string
  endSection: string
  jumpToSection: string
  times: number  // 1-10
}
```

### localStorage Keys

```typescript
// 使用 scoreId + scoreHash 作为草稿 key（含错误降级）
async function getDraftKey(scoreId) {
  try {
    const scoreHash = await computeScoreHash(scoreId)
    return `score-annotation-draft-${scoreId}-${scoreHash}`
  } catch (error) {
    console.warn('无法计算图片 hash，使用 scoreId 作为草稿 key', error)
    return `score-annotation-draft-${scoreId}-fallback`
  }
}

// 组件初始化时异步设置 draftKey
const [draftKey, setDraftKey] = useState(null)
const [loading, setLoading] = useState(true)

useEffect(() => {
  getDraftKey(scoreId).then(key => {
    setDraftKey(key)
    setLoading(false)
  }).catch(err => {
    console.error('获取草稿 key 失败', err)
    setLoading(false)
  })
}, [scoreId])

// 加载中显示
if (loading) return <div className="loading-draft">加载标注草稿...</div>
```

## 核心算法

### 计算当前位置比例

```javascript
function getCurrentRatio(scrollTop, maxScroll) {
  if (maxScroll <= 0) return 0
  return Math.min(1, Math.max(0, scrollTop / maxScroll))
}
```

### 在当前位置添加段落

```javascript
function addSectionAtPosition(currentRatio, sections) {
  const defaultHeight = 0.25  // 默认段落高度 25%
  const newSection = {
    id: `section-${Date.now()}`,
    name: `段落 ${sections.length + 1}`,
    startRatio: Math.max(0, currentRatio - defaultHeight / 2),
    endRatio: Math.min(1, currentRatio + defaultHeight / 2)
  }

  return [...sections, newSection].sort((a, b) => a.startRatio - b.startRatio)
}
```

### 调整段落边界

```javascript
function adjustSectionBoundary(section, boundary, newRatio, sections) {
  const MIN_GAP = 0.001  // 0.1%，约 3px
  const ratio = Math.min(1, Math.max(0, newRatio))

  if (boundary === 'start') {
    const nextSection = sections.find(s => s.startRatio > section.startRatio)
    const maxStart = nextSection ? nextSection.startRatio - MIN_GAP : 1
    return { ...section, startRatio: Math.min(ratio, maxStart) }
  } else {
    const prevSection = sections.find(s => s.endRatio < section.endRatio)
    const minEnd = prevSection ? prevSection.endRatio + MIN_GAP : 0
    return { ...section, endRatio: Math.max(ratio, minEnd) }
  }
}
```

### 检测段落重叠

```javascript
function hasOverlap(section, sections) {
  return sections.some(s => {
    if (s.id === section.id) return false
    return !(s.endRatio <= section.startRatio || s.startRatio >= section.endRatio)
  })
}
```

### 获取草稿 Key（含错误降级）

```javascript
async function getDraftKey(scoreId, computeScoreHash) {
  try {
    const scoreHash = await computeScoreHash(scoreId)
    return `score-annotation-draft-${scoreId}-${scoreHash}`
  } catch (error) {
    console.warn('无法计算图片 hash，使用 scoreId 作为草稿 key', error)
    return `score-annotation-draft-${scoreId}-fallback`
  }
}
```

### 计算图片 Hash（草稿隔离，避免重复加载）

```javascript
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

### JSON 导出

```javascript
function exportAnnotation(sections, repeats) {
  // 按 startRatio 排序，提高可读性
  const sortedSections = [...sections].sort((a, b) => a.startRatio - b.startRatio)

  return JSON.stringify({
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
  }, null, 2)
}
```

### 输入验证

```javascript
function validateRatio(value) {
  const num = parseFloat(value)
  if (isNaN(num)) return false
  return num >= 0 && num <= 1
}

// 使用示例
if (!validateRatio(inputValue)) {
  setError('比例值必须在 0-1 之间')
  return
}
```

## UI 规范

### 标注模式布局

```
┌─────────────────────────────────────────────┐
│  [← 返回] 标注模式 - 红色高跟鞋              │
├─────────────────────────────────────────────┤
│  乐谱预览区域（可滚动）                        │
│  (标注模式下显示段落边界指示线)                 │
│                                             │
├─────────────────────────────────────────────┤
│  段落列表                                    │
│  ┌─────────────────────────────────────┐   │
│  │ 📍 A段              [×] [编辑]     │   │
│  │ 起始: [12.5%▼]  结束: [35.2%▼]    │   │
│  │    [反复×2]                        │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │ 📍 B段              [×] [编辑]     │   │
│  │ 起始: [35.2%▼]  结束: [55.0%▼]    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [+ 在当前位置添加段落]                      │
│                                             │
├─────────────────────────────────────────────┤
│  [预览播放] [导出 JSON] [清空]              │
└─────────────────────────────────────────────┘
```

### 段落卡片设计

```
┌─────────────────────────────────────┐
│ 📍 A段              [×] [编辑]     │  ← 段落图标 + 操作按钮
│ 起始: [12.5%▼]  结束: [35.2%▼]    │  ← 精确输入（下拉/输入）
│    [反复×2]                        │  ← 反复配置按钮
└─────────────────────────────────────┘
```

- `▼` 下拉图标：可切换为手动输入框
- 点击 `[编辑]`：切换为手动输入模式

### 编辑段落弹窗

```
┌─────────────────────┐
│ 编辑段落             │
├─────────────────────┤
│ 名称: [A段         ] │
│ 起始: [0.1234]     │  ← 支持手动输入精确值
│ 结束: [0.3521]     │
│ 范围: 22.87%       │  ← 自动计算，只读
│                     │
│ [取消] [保存]       │
└─────────────────────┘
```

### 段落边界指示器（可选功能，后续实现）

```
乐谱上显示段落边界线：
- 起始边界：橙色虚线 + 向上箭头 ▲▲
- 结束边界：橙色虚线 + 向下箭头 ▼▼
- 选中段落：高亮边界 + 拖拽手柄
```

### 反复配置面板

```
点击 [反复×2] 打开：
┌─────────────────────┐
│ 反复配置            │
├─────────────────────┤
│ 起始段落: [A段 ▼]   │
│ 结束段落: [B段 ▼]   │
│ 跳转到: [A段 ▼]     │
│ 重复次数: [2▼]       │
│                     │
│ [取消] [保存]       │
└─────────────────────┘
```

### 事件传播控制

| 区域 | 触摸/鼠标事件 | 行为 |
|------|--------------|------|
| **标注模式 - 段落卡片** | 任何事件 | 阻止传播（`stopPropagation`） |
| **标注模式 - 边界手柄** | PointerDown | 设置拖拽状态，阻止滚动 |
| **标注模式 - 乐谱空白处** | 触摸/滚轮 | 正常滚动 |
| **标注模式 - 拖拽中** | 移动 | 调整边界，不滚动 |
| **播放模式** | 任何事件 | 正常滚动（现有逻辑） |

```js
// 边界拖拽手柄
<div
  className="boundary-handle"
  onPointerDown={(e) => {
    e.stopPropagation()  // 阻止传播到滚动
    setDragging('start')
    setSectionId(sectionId)
  }}
/>

// 标注模式下的滚动容器
<div
  onWheel={(e) => {
    if (isDraggingBoundary) {
      e.preventDefault()  // 拖拽中不滚动
      // 处理拖拽逻辑
    } else {
      // 正常滚动
    }
  }}
  onTouchMove={(e) => {
    if (isDraggingBoundary) {
      e.preventDefault()  // 拖拽中不滚动
      // 处理拖拽逻辑
    } else {
      // 正常滚动
    }
  }}
/>
```

## 交互流程

### 添加段落
1. 滚动到目标位置
2. 点击 [+ 在当前位置添加段落]
3. 自动创建新段落，默认高度 25%
4. 自动选中该段落

### 编辑段落（精确输入）
1. 点击段落卡片上的 [编辑]
2. 弹出编辑对话框
3. 可手动输入名称、起始比例、结束比例
4. 实时计算段落范围（只读）
5. 保存或取消

### 调整边界（输入框方式）
1. 段落卡片显示起始/结束比例下拉
2. 点击下拉显示可选值（每 1% 或每 0.1% 精度）
3. 选择或手动输入
4. 实时更新并检测重叠

### 添加反复
1. 选中段落，点击 [反复×1]
2. 在面板中选择起始/结束段落
3. 设置重复次数（1-10）
4. 点击 [保存]

### 导出流程
1. 点击 [导出 JSON]
2. 数据复制到剪贴板
3. 提示 "已复制到剪贴板，粘贴到 scoreData.js"
4. 用户切换到 scoreData.js 粘贴数据

## 测试用例

### 功能测试
- [ ] 添加段落
- [ ] 删除段落
- [ ] 编辑段落名称
- [ ] 调整起始边界（输入框）
- [ ] 调整结束边界（输入框）
- [ ] 添加反复规则
- [ ] 编辑反复规则
- [ ] 删除反复规则
- [ ] 导出 JSON
- [ ] 清空标注

### 边界测试
- [ ] 在 0% 位置添加段落
- [ ] 在 100% 位置添加段落
- [ ] 边界超出 0-100% 检测
- [ ] 相邻段落重叠检测和处理
- [ ] 草稿保存和恢复
- [ ] localStorage 清空后的默认行为

### 兼容性测试
- [ ] 开发环境显示标注按钮
- [ ] 生产环境隐藏标注按钮
- [ ] 不同屏幕尺寸的标注面板布局
- [ ] 预览模式与播放模式切换
- [ ] 移动端触摸事件不与滚动冲突

### Pointer Events 兼容性

| 浏览器 | 版本 | Pointer Events | 说明 |
|--------|------|----------------|------|
| Chrome | 55+ | ✅ | 完全支持 |
| Firefox | 59+ | ✅ | 完全支持 |
| Safari | 13.4+ | ✅ | iOS/macOS 完全支持 |
| Edge | 79+ | ✅ | 基于 Chromium |
| Safari < 13 | ✅ | 支持（需 `touch-action: none`） |

**Fallback 方案（如需要支持旧版 Safari）：**
```js
// 同时支持 Pointer 和 Touch Events
<div
  onPointerDown={handlePointerDown}
  onTouchStart={handleTouchStart}
  touch-action="none"
/>

const handlePointerDown = (e) => {
  // Pointer Events 优先
  if (e.pointerType === 'touch') {
    e.preventDefault()
    // 处理拖拽逻辑
  }
}

const handleTouchStart = (e) => {
  // Touch Events fallback
  // 处理拖拽逻辑
}
```

**Why:** Pointer Events 是现代标准，移动端主流浏览器均已支持。仅当需要支持非常旧的浏览器时才添加 Touch Events fallback。

### 图片更新测试
- [ ] 图片更新后草稿自动重新计算 hash
- [ ] 旧草稿不会污染新图片标注

### 边值和输入验证测试
- [ ] 输入 1.2 或 -0.1 时显示错误提示
- [ ] 起始比例大于结束比例时显示警告
- [ ] 段落同名允许（通过 ID 区分）
- [ ] hash 计算失败时使用 fallback key
- [ ] 导出时按 startRatio 排序