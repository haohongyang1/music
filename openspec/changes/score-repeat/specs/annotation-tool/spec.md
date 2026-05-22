# 标注工具规格

## 概述

标注工具允许在浏览器中可视化地标记乐谱段落和反复规则，替代手动计算比例值。

## 数据模型

### 段落标注状态

```typescript
interface AnnotationState {
  mode: 'play' | 'annotate'        // 当前模式
  sections: SectionDraft[]          // 段落草稿
  repeats: RepeatDraft[]            // 反复规则草稿
  selectedSectionId: string | null  // 选中的段落
  dragging: 'start' | 'end' | null  // 拖拽状态
}

interface SectionDraft extends Section {
  // 继承 Section，添加临时标记
  isEditing?: boolean               // 是否正在编辑名称
}

interface RepeatDraft extends Repeat {
  // 继承 Repeat
}
```

### 环境检测

```typescript
const IS_DEV = import.meta.env.DEV

// 标注按钮仅在开发环境显示
```

## 核心算法

### 计算当前滚动位置的比例

```javascript
function getCurrentRatio(scrollTop, maxScroll) {
  if (maxScroll <= 0) return 0
  return Math.min(1, Math.max(0, scrollTop / maxScroll))
}
```

### 在当前位置添加段落

```javascript
function addSectionAtPosition(currentRatio, sections) {
  const newSection = {
    id: `section-${Date.now()}`,
    name: `段落 ${sections.length + 1}`,
    startRatio: Math.max(0, currentRatio - 0.05),
    endRatio: Math.min(1, currentRatio + 0.05)
  }

  return [...sections, newSection].sort((a, b) => a.startRatio - b.startRatio)
}
```

### 拖拽调整边界

```javascript
function adjustSectionBoundary(section, boundary, newRatio, sections) {
  const ratio = Math.min(1, Math.max(0, newRatio))

  if (boundary === 'start') {
    // 确保不与下一个段落重叠
    const nextSection = sections.find(s => s.startRatio > section.startRatio)
    const maxStart = nextSection ? nextSection.startRatio - 0.01 : 1
    return {
      ...section,
      startRatio: Math.min(ratio, maxStart)
    }
  } else {
    // 确保不与上一个段落重叠
    const prevSection = sections.find(s => s.endRatio < section.endRatio)
    const minEnd = prevSection ? prevSection.endRatio + 0.01 : 0
    return {
      ...section,
      endRatio: Math.max(ratio, minEnd)
    }
  }
}
```

### 检测边界重叠

```javascript
function hasOverlap(section, sections) {
  return sections.some(s => {
    if (s.id === section.id) return false
    return !(s.endRatio <= section.startRatio || s.startRatio >= section.endRatio)
  })
}
```

### JSON 导出

```javascript
function exportAnnotations(sections, repeats) {
  return JSON.stringify({
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
  }, null, 2)
}
```

## UI 规范

### 标注按钮

```
位置：播放控制栏右侧，仅开发环境显示
图标：📝
样式：半透明背景，白色图标，尺寸 32px × 32px
提示：点击进入标注模式
```

### 标注模式布局

```
┌─────────────────────────────────────────────┐
│  [← 返回] 标注模式 - 红色高跟鞋              │
├─────────────────────────────────────────────┤
│                                             │
│  段落列表 (可滚动)                           │
│  ┌─────────────────────────────────────┐   │
│  │ 📍 前奏              [×]            │   │
│  │ 0.0000 - 0.1500   [编辑名称]        │   │
│  │ [反复×1]                    [编辑]  │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │ 📍 A段              [×]            │   │
│  │ 0.1500 - 0.4500   [编辑名称]        │   │
│  │ [反复×2]                    [编辑]  │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [+ 在当前位置添加段落]                      │
│                                             │
├─────────────────────────────────────────────┤
│  [预览播放] [导出 JSON] [清空]              │
└─────────────────────────────────────────────┘
```

### 边界指示器

```
在乐谱上显示段落边界：
- 段落起始：橙色虚线 + 向上箭头
- 段落结束：橙色虚线 + 向下箭头
- 选中段落：高亮边界，显示拖拽手柄
```

### 拖拽手柄

```
样式：圆形手柄，橙色背景，白色箭头
尺寸：20px × 20px
位置：段落边界线中央
交互：拖拽调整边界
```

### 反复规则编辑

```
点击 [反复×N] 打开编辑面板：
┌─────────────────────┐
│ 反复设置            │
├─────────────────────┤
│ 回跳段落: [A段 ▼]   │
│ 重复次数: [2]       │
│                     │
│ [取消] [保存]       │
└─────────────────────┘
```

## 键盘快捷键

```
Esc    - 退出标注模式
N      - 在当前位置添加段落
Del    - 删除选中的段落
S      - 保存草稿
E      - 导出 JSON
```

## 交互流程

### 添加段落流程

```
1. 点击 [+ 在当前位置添加段落]
2. 在当前滚动位置创建新段落
3. 自动选中该段落
4. 显示段落卡片在侧边栏
5. 可拖拽边界调整范围
```

### 调整边界流程

```
1. 点击段落卡片上的 [编辑]
2. 段落边界显示拖拽手柄
3. 拖拽手柄调整起始/结束位置
4. 实时更新比例显示
5. 释放手柄完成调整
```

### 添加反复规则流程

```
1. 点击段落卡片上的 [反复×1]
2. 打开反复设置面板
3. 选择回跳段落（默认当前段落）
4. 设置重复次数（1-10）
5. 点击 [保存]
```

### 导出流程

```
1. 点击 [导出 JSON]
2. 将数据复制到剪贴板
3. 显示 "已复制到剪贴板" 提示
4. 提示用户粘贴到 scoreData.js
```

## localStorage Keys

```typescript
const STORAGE_KEYS = {
  // ... 现有 keys
  ANNOTATION_DRAFT: 'score-annotation-draft-<scoreId>'
} as const

// 保存草稿
function saveDraft(scoreId, sections, repeats) {
  const key = `score-annotation-draft-${scoreId}`
  localStorage.setItem(key, JSON.stringify({ sections, repeats }))
}

// 加载草稿
function loadDraft(scoreId) {
  const key = `score-annotation-draft-${scoreId}`
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : null
}
```

## 测试用例

### 功能测试
- [ ] 添加段落
- [ ] 删除段落
- [ ] 编辑段落名称
- [ ] 拖拽调整起始边界
- [ ] 拖拽调整结束边界
- [ ] 边界重叠检测
- [ ] 添加反复规则
- [ ] 编辑反复规则
- [ ] 删除反复规则
- [ ] 导出 JSON
- [ ] 清空标注

### 边界测试
- [ ] 在 0% 位置添加段落
- [ ] 在 100% 位置添加段落
- [ ] 拖拽边界超出 0-100%
- [ ] 相邻段落重叠处理
- [ ] 草稿保存和恢复

### 兼容性测试
- [ ] 开发环境显示标注按钮
- [ ] 生产环境隐藏标注按钮
- [ ] 不同屏幕尺寸的标注面板布局