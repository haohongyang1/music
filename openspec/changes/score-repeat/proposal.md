## Why

当前乐谱播放是单向线性滚动，但吉他六线谱中广泛使用**小反复符号**（如 `||:` 和 `:||` 标记）。练琴时需要在指定段落内循环播放，直到熟练后再继续。没有反复功能会影响练习效率和体验。

## What Changes

- 在乐谱数据中添加段落（section）和反复（repeat）标记
- 实现播放状态机，根据反复规则控制滚动跳转
- 播放界面显示当前段落和反复进度
- 支持「跳过反复」功能，方便完整播放

## Capabilities

### New Capabilities
- `score-sections`: 手动标注乐谱段落边界和名称
- `repeat-logic`: 根据反复规则自动控制播放跳转
- `repeat-ui`: 显示当前段落和重复次数状态
- `skip-repeat`: 一键跳过所有反复，直接播放完整版

### Modified Capabilities
- `score-autoplay`: 从线性滚动升级为状态机驱动的分段播放

## Impact

- 数据结构：扩展 `src/scoreData.js` 中的乐谱元数据
- 播放逻辑：重构 `PlaybackView`，增加段落跟踪和跳转逻辑
- UI 变化：播放界面增加段落指示器和反复控制
- 向后兼容：未标记反复的乐谱保持原有线性播放行为