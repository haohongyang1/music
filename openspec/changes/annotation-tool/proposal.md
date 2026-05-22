## Why

当前乐谱段落数据需要手动在 scoreData.js 中编辑比例值，这种方式效率低且容易出错。需要一个可视化标注工具，让用户在浏览器中直接标记段落边界和反复规则，然后导出数据，提升标注效率和准确性。

## What Changes

- 添加标注模式入口（播放页面显示「📝 标注」按钮，仅开发环境）
- 实现标注面板 UI（段落列表、操作按钮、JSON 导出）
- 支持段落添加（在当前滚动位置）、编辑（名称、边界）、删除
- 支持反复规则配置（起始段落、结束段落、跳转目标、重复次数）
- 支持预览播放功能
- 支持草稿自动保存和恢复（localStorage）
- 支持 JSON 导出和粘贴到 scoreData.js

## Capabilities

### New Capabilities
- `annotation-mode`: 可视化标注乐谱段落和反复规则
- `section-management`: 添加、编辑、删除段落
- `repeat-configuration`: 配置单段/跨段反复规则
- `preview-playback`: 预览标注效果
- `json-export`: 导出标注数据为 JSON

## Impact

- 新增 `src/AnnotationView.jsx` 组件
- 更新 `src/App.jsx` 添加标注模式路由和切换
- 新增 CSS 样式支持标注面板 UI
- 向后兼容：未标注的乐谱保持原有播放方式