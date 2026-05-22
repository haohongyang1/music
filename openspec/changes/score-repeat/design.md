## Context

吉他六线谱的反复记号主要有：

- **小反复（Repeat）**: `||:` 和 `:||` 标记，通常重复 2 次
- **多段反复**: 1st/2nd endings（第一结尾/第二结尾）
- **跳跃反复**: D.C.（从头）、D.S.（从记号）、Fine（结束）

本功能先实现**小反复**，是最常见的场景。

## Goals / Non-Goals

**Goals:**
- 支持小反复记号的段落循环播放
- 显示当前段落和重复进度（如 "A段 (2/3)"）
- 提供「跳过反复」选项，状态持久化到 localStorage
- 段落指示器支持自动/手动显示切换
- 向后兼容未标记的乐谱

**Non-Goals:**
- 自动识别乐谱中的反复记号（采用手动标注）
- 多段反复（1st/2nd endings）
- 跳跃反复（D.C./D.S.）
- 音频节拍同步

## Decisions

### 数据结构设计

在 `scoreData.js` 中为每首乐谱添加：

```js
{
  // ... 现有字段
  sections: [
    { id: 'intro', name: '前奏', startRatio: 0, endRatio: 0.15 },
    { id: 'verse-a', name: 'A段', startRatio: 0.15, endRatio: 0.45 },
    { id: 'chorus', name: '副歌', startRatio: 0.45, endRatio: 0.70 },
    { id: 'outro', name: '尾奏', startRatio: 0.70, endRatio: 1.0 },
  ],
  repeats: [
    {
      type: 'segment',           // 小反复类型
      fromSection: 'verse-a',    // 反复起始段落 ID
      toSection: 'verse-a',      // 回跳段落 ID
      times: 2                   // 总播放次数（含首次）
    }
  ]
}
```

**Why:**
- `startRatio` / `endRatio` 使用 0-1 比例值，与设备无关
- 响应式布局下，根据当前滚动范围动态计算实际位置
- 段落 ID 支持反复规则引用
- `times` 表示总播放次数（含首次）

**Alternative considered:** 使用固定像素值。Rejected，不同设备图片渲染尺寸不同，比例更可靠。

### 播放状态机

```
┌──────────────┐
│ 开始播放     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ 获取当前段落   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ 检查是否到达   │
│ 反复触发点     │
└──────┬───────┘
       │
   ┌───┴───┐
   │ No    │ Yes
   ▼       ▼
继续播放  检查重复次数
           │
      ┌────┴────┐
      │ 未完成   │ 已完成
      ▼         ▼
   跳转回起点   标记已播放
                 │
                 ▼
             检查后续规则
```

**Why:**
- 状态机清晰处理反复、跳过、完成等状态
- 便于后续扩展（如 D.C./D.S.）

### 反复触发检测

```js
// 使用段落高度的 5% 作为触发阈值
function isInTriggerZone(currentPos, section, maxScroll) {
  const maxScrollSafe = maxScroll || 1  // 容错处理
  const sectionStart = section.startRatio * maxScrollSafe
  const sectionEnd = section.endRatio * maxScrollSafe
  const sectionHeight = sectionEnd - sectionStart
  const threshold = Math.max(sectionHeight * 0.05, 20) // 至少 20px

  return currentPos >= sectionEnd - threshold
}
```

**Why:**
- 阈值与段落大小成正比，避免快速滚动时跳过
- 最小 20px 保证在小段落上也能触发
- `maxScroll || 1` 容错处理，避免除零错误

### localStorage Keys 统一管理

```js
const STORAGE_KEYS = {
  SPEED: 'score-autoplay-speed',
  SKIP_REPEAT: 'score-skip-repeat',
  SHOW_SECTION_INDICATOR: 'score-show-section-indicator'
} as const

// 使用
const speed = localStorage.getItem(STORAGE_KEYS.SPEED)
const skipRepeat = localStorage.getItem(STORAGE_KEYS.SKIP_REPEAT)
```

**Why:**
- 集中管理，避免 key 拼写错误
- `as const` 保证类型安全
- 便于后续扩展和维护

### 边界场景处理

```js
function getSectionAtPosition(position, maxScroll, sections) {
  if (!sections?.length) return null

  const maxScrollSafe = maxScroll || 1
  const positionRatio = Math.min(1, Math.max(0, position / maxScrollSafe))

  return sections.find(s =>
    positionRatio >= s.startRatio &&
    positionRatio < s.endRatio
  ) || null
}

function executeRepeat(repeat, score, state, maxScroll) {
  const targetSection = score.sections.find(s => s.id === repeat.toSection)

  // 目标段落不存在时，继续线性播放
  if (!targetSection) {
    console.warn(`[Repeat] Section not found: ${repeat.toSection}`)
    return null
  }

  return { jumpTo: targetSection.startRatio }
}

function validateRepeats(score) {
  if (!score.repeats) return true

  return score.repeats.every(r => {
    const from = score.sections.find(s => s.id === r.fromSection)
    const to = score.sections.find(s => s.id === r.toSection)
    return from && to && r.times >= 1
  })
}
```

**Why:**
- 防御性编程，避免数据错误导致崩溃
- 开发时 console.warn 提醒标注问题
- validateRepeats 可在启动时校验数据

### UI 设计

播放控制栏上方显示段落状态：

```
有反复：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  A段 (2/3) → B段   [跳过反复] [👁]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

无反复：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  前奏 → A段 → 副歌         [👁]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

未标注：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  （不显示段落指示器）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Why:**
- 段落名称让用户知道当前位置
- 次数显示播放进度
- 👁 眼睛图标控制段落指示器自动/手动显示
- 无反复时简化显示，只展示段落序列
- 未标注时隐藏，不干扰播放
- 跳过反复状态持久化到 localStorage

### 段落指示器显示控制

```
自动模式（默认）：
- 显示后 2.5 秒自动隐藏
- 播放时自动显示当前段落
- 段落切换时自动显示

手动模式：
- 常驻显示，不自动隐藏
- 通过点击 👁 图标切换
- 状态持久化到 localStorage
```

**Alternative considered:** 仅自动隐藏。Rejected，部分用户希望常驻显示，手动切换提供灵活性。

### 向后兼容

没有 `sections` 字段的乐谱保持原有线性播放。

**Why:**
- 不影响现有乐谱使用
- 可渐进式添加反复标记

## Risks / Trade-offs

- **段落位置手动标注**：替换图片后需要更新比例。Mitigation: 集中管理，更新明显。
- **跨段反复**：当前设计支持段内反复，跨段反复可扩展。Mitigation: 数据结构已预留扩展空间。
- **复杂乐谱**：多层反复嵌套较难标注。Mitigation: 先解决单层反复，复杂场景后续扩展。
- **比例精度**：段落边界判断依赖比例精度。Mitigation: 使用触发阈值（5% 或 20px）提供容错空间。