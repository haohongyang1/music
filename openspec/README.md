# OpenSpec 配置

本目录存储项目的开发规范、设计文档和任务列表。

## 目录结构

```
openspec/
├── changes/
│   └── <feature-name>/
│       ├── proposal.md    # 变更提案（Why / What Changes）
│       ├── design.md      # 设计文档（Context / Decisions）
│       ├── tasks.md       # 任务清单（可勾选）
│       └── specs/
│           └── <sub-feature>/
│               └── spec.md # 功能规格
```

## 使用方式

### 新功能开发

1. 创建新特性目录：`openspec/changes/<feature-name>/`
2. 编写提案说明变更原因和内容
3. 编写设计文档记录关键决策
4. 列出任务清单并勾选完成状态
5. 实现完成后编写规格文档

### Codex 识别

- Codex 会读取 `proposal.md`、`design.md`、`tasks.md` 来理解项目上下文
- 使用标准 Markdown 格式，支持 checkbox 任务列表
- 与 CLAUDE.md 配合使用，获得完整的开发指导