# 反复播放逻辑规格

## 数据模型

### Section（段落）

```typescript
interface Section {
  id: string              // 唯一标识，如 'intro', 'verse-a'
  name: string            // 显示名称，如 '前奏', 'A段'
  startRatio: number      // 起始位置比例 (0-1)
  endRatio: number        // 结束位置比例 (0-1)
}
```

### Repeat（反复规则）

```typescript
interface Repeat {
  type: 'segment'         // 当前仅支持小反复
  fromSection: string     // 反复起始段落 ID
  toSection: string       // 反复回跳段落 ID
  times: number           // 总播放次数（含首次），最小值为 1
}
```

### 播放状态

```typescript
interface PlaybackState {
  currentSectionId: string | null   // 当前段落
  repeatCount: number               // 当前段落重复次数
  skipRepeat: boolean               // 是否跳过所有反复（持久化）
  showSectionIndicator: boolean     // 是否显示段落指示器（持久化）
}

// localStorage keys 统一管理
const STORAGE_KEYS = {
  SPEED: 'score-autoplay-speed',
  SKIP_REPEAT: 'score-skip-repeat',
  SHOW_SECTION_INDICATOR: 'score-show-section-indicator'
} as const
```

## 核心算法

### 获取当前段落

```javascript
function getSectionAtPosition(position, maxScroll, sections) {
  if (!sections?.length) return null

  const maxScrollSafe = maxScroll || 1
  const positionRatio = Math.min(1, Math.max(0, position / maxScrollSafe))

  return sections.find(s =>
    positionRatio >= s.startRatio &&
    positionRatio < s.endRatio
  ) || null
}
```

### 检查是否在触发区域

```javascript
function isInTriggerZone(currentPos, section, maxScroll) {
  const maxScrollSafe = maxScroll || 1
  const sectionStart = section.startRatio * maxScrollSafe
  const sectionEnd = section.endRatio * maxScrollSafe
  const sectionHeight = sectionEnd - sectionStart

  // 触发阈值：段落高度的 5%，至少 20px
  const threshold = Math.max(sectionHeight * 0.05, 20)

  return currentPos >= sectionEnd - threshold
}
```

### 检查是否触发反复

```javascript
function shouldTriggerRepeat(currentPos, state, score, maxScroll) {
  if (state.skipRepeat) return false
  if (!score.sections?.length || !score.repeats?.length) return false

  const section = getSectionAtPosition(currentPos, maxScroll, score.sections)
  if (!section) return false

  // 检查是否有该段落的反复规则
  const repeat = score.repeats.find(r => r.fromSection === section.id)
  if (!repeat) return false

  // 检查是否到达触发区域
  if (!isInTriggerZone(currentPos, section, maxScroll)) return false

  // 检查重复次数是否未完成
  return state.repeatCount < repeat.times
}
```

### 执行反复跳转

```javascript
function executeRepeat(repeat, score, state, maxScroll) {
  const targetSection = score.sections.find(s => s.id === repeat.toSection)

  // 目标段落不存在时，继续线性播放
  if (!targetSection) {
    console.warn(`[Repeat] Target section not found: ${repeat.toSection}`)
    return null
  }

  return {
    position: targetSection.startRatio * (maxScroll || 1),
    repeatCount: state.repeatCount + 1,
    sectionId: targetSection.id
  }
}
```

### 获取下一个段落

```javascript
function getNextSection(currentSectionId, sections) {
  if (!sections?.length) return null

  const currentIndex = sections.findIndex(s => s.id === currentSectionId)
  if (currentIndex === -1 || currentIndex >= sections.length - 1) return null

  return sections[currentIndex + 1]
}
```

### 数据校验

```javascript
function validateScoreData(score) {
  // 校验段落数据
  if (score.sections) {
    for (let i = 0; i < score.sections.length; i++) {
      const s = score.sections[i]
      if (s.startRatio >= s.endRatio) {
        console.warn(`[Validation] Invalid section ${s.id}: startRatio >= endRatio`)
        return false
      }
      // 检查重叠
      if (i > 0) {
        const prev = score.sections[i - 1]
        if (prev.endRatio > s.startRatio) {
          console.warn(`[Validation] Overlapping sections: ${prev.id} and ${s.id}`)
          return false
        }
      }
    }
  }

  // 校验反复规则
  if (score.repeats) {
    for (const r of score.repeats) {
      if (!score.sections?.find(s => s.id === r.fromSection)) {
        console.warn(`[Validation] Invalid repeat: fromSection ${r.fromSection} not found`)
        return false
      }
      if (!score.sections?.find(s => s.id === r.toSection)) {
        console.warn(`[Validation] Invalid repeat: toSection ${r.toSection} not found`)
        return false
      }
      if (r.times < 1) {
        console.warn(`[Validation] Invalid repeat: times must be >= 1`)
        return false
      }
    }
  }

  return true
}
```

## UI 规范

### 段落指示器

```
位置：播放控制栏上方，居中，距控制栏 8px
样式：半透明背景，白色文字，淡入淡出动画
字体：13px

内容规则：
- 有反复：A段 (2/3) → B段
- 无反复：前奏 → A段 → 副歌
- 未标注乐谱：不显示

显示控制：
- 自动模式（默认）：点击/触摸后 2.5 秒自动隐藏
- 手动模式：常驻显示，通过「眼睛」图标切换
- 切换状态持久化到 localStorage

动画：
- 段落切换时：旧内容淡出，新内容淡入（各 150ms）
```

### 跳过反复按钮

```
位置：段落指示器右侧（存在时）
尺寸：28px × 16px
样式：Toggle 开关，小尺寸

状态：
- 关（默认）：正常播放，有反复时循环
- 开：跳过所有反复，线性播放

交互：
- 点击切换状态
- 状态即时生效
- 状态持久化到 localStorage（key: score-skip-repeat）
- 切换时有短暂震动反馈（移动端）
```

### 边界场景 UI

```
场景：段落不存在时
显示：段落数据无效，已禁用反复

场景：反复规则无效时
显示：反复配置错误，请检查乐谱数据
```

## 测试用例

### 正常场景
- [ ] 单段落反复（A 段重复 2 次）
- [ ] 跨段落反复（A→B，B 段开头重复）
- [ ] 多段落各有反复规则
- [ ] 跳过反复开关切换
- [ ] 段落指示器自动/手动显示切换

### 边界场景
- [ ] 反复目标段落不存在
- [ ] 反复次数设置为 1（不重复）
- [ ] 段落边界重叠
- [ ] 快速滚动跳过触发区
- [ ] 段落高度很小（< 100px）
- [ ] maxScroll 为 0 时的容错处理

### 兼容性场景
- [ ] 未标注 sections 的乐谱
- [ ] 有 sections 但无 repeats 的乐谱
- [ ] 不同屏幕尺寸（移动端/平板/桌面）
- [ ] localStorage 清空后的默认行为