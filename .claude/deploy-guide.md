# GitHub Pages 部署指南

## 首次配置

### 1. 安装 gh-pages

```bash
pnpm add -D gh-pages
```

### 2. 确保 vite.config.js 配置正确

```js
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/music/' : '/',  // 仓库名
}))
```

### 3. 确保 package.json 有 deploy 脚本

```json
{
  "scripts": {
    "deploy": "pnpm run build && gh-pages -d dist"
  }
}
```

### 4. 执行部署

```bash
pnpm run deploy
```

### 5. 在 GitHub 启用 Pages

1. 进入仓库 Settings → Pages
2. Source 选择 `Deploy from a branch`
3. Branch 选择 `gh-pages`，文件夹选择 `/ (root)`
4. 点击 Save

## 后续更新

每次更新代码后，执行：

```bash
pnpm run deploy
```

## 访问地址

https://haohongyang1.github.io/music/

## 注意事项

- `vite.config.js` 中的 `base` 路径必须与仓库名一致
- 部署后可能需要等待几分钟才能看到更新
- 如果使用自定义域名，需要修改 `base` 为 `/` 并配置 CNAME
