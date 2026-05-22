# 反复播放逻辑规格

## 数据模型

### Section（段落）

```typescript
interface Section {
  id: string              // 唯一标识，如 'intro', 'verse-a'
  name: string            // 显示名称，如 '前奏', 'A段'
  startPos: number        // 起始位置（像素）
  endPos: number          // 结束位置（像素）
}
```

### Repeat（反复规则）

```typescript
interface Repeat {
  type: 'segment'         // 当前仅支持小反复
  fromSection: string     // 反复起始段落 ID
  toSection: string       // 反复回跳段落 ID
  times: number           // 总播放次数（含首次）
}
```

## 播放状态

```typescript
interface PlaybackState {
  currentSectionId: string | null   // 当前段落
  repeatCount: number               // 当前段落重复次数
  skipRepeat: boolean               // 是否跳过所有反复
}
```

## 核心算法

### 获取当前段落

```javascript
function getSectionAtPosition(position, sections) {
  return sections.find(s => position >= s.startPos && position < s.endPos)
}
```

### 检查是否触发反复

```javascript
function shouldTriggerRepeat(currentPos, state, score) {
  if (state.skipRepeat) return false

  const section = getSectionAtPosition(currentPos, score.sections)
  if (!section) return false

  // 检查是否有该段落的反复规则
  const repeat = score.repeats.find(r => r.fromSection === section.id)
  if (!repeat) return false

  // 检查是否到达段落末尾附近
  const nearEnd = currentPos >= section.endPos - 10
  if (!nearEnd) return false

  // 检查重复次数
  return state.repeatCount < repeat.times
}
```

### 执行反复跳转

```javascript
function executeRepeat(repeat, score, state) {
  const targetSection = score.sections.find(s => s.id === repeat.toSection)
  return {
    position: targetSection.startPos,
    repeatCount: state.repeatCount + 1
  }
}
```

## UI 规范

### 段落指示器

```
位置：播放控制栏上方，居中
内容：[段落名称] ([当前次数/总次数]) → [下一段落]
示例：A段 (2/3) → B段
无反复：A段 → B段
```

### 跳过反复按钮

```
位置：段落指示器右侧
状态：关（默认）/ 开
交互：点击切换状态，即时生效
样式：小尺寸切换开关
```