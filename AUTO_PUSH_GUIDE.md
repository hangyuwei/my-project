# 自动Git推送配置指南

本项目已配置多种自动提交和推送到GitHub的方案，您可以根据需要选择使用。

## 方案1：VSCode任务（推荐 - 最简单）

### 使用方法：
1. 按 `Ctrl+Shift+P` 打开命令面板
2. 输入 `Tasks: Run Task`
3. 选择 `Quick Push` 快速推送，或选择 `Auto Commit and Push` 自定义提交信息

### 快捷键设置（可选）：
在 VSCode 的 `keybindings.json` 中添加：
```json
{
  "key": "ctrl+shift+g p",
  "command": "workbench.action.tasks.runTask",
  "args": "Quick Push"
}
```

---

## 方案2：Node.js文件监听（真正的实时自动推送）

### 安装依赖：
```bash
cd c:\Users\13811\WeChatProjects\miniprogram-1
npm install chokidar simple-git
```

### 启动监听：
```bash
node watch-and-push.js
```

### 功能特点：
- ✅ 自动监听文件变化
- ✅ 3秒延迟批量提交（避免频繁提交）
- ✅ 自动推送到远程仓库
- ✅ 智能忽略 node_modules、.git 等目录
- ✅ 显示详细的操作日志

### 后台运行（可选）：
使用 `pm2` 在后台运行：
```bash
npm install -g pm2
pm2 start watch-and-push.js --name "auto-git-push"
pm2 save
pm2 startup
```

---

## 方案3：Git Hooks（提交后自动推送）

已配置 `.git/hooks/post-commit` hook，每次提交后自动推送。

### 使用方法：
正常使用 git commit，提交后会自动推送：
```bash
git add .
git commit -m "your message"
# 自动推送到远程
```

---

## 方案4：批处理脚本（Windows）

### 使用方法：
双击运行 `auto-commit.bat` 文件，或在命令行执行：
```bash
.\auto-commit.bat
```

---

## 方案5：VSCode设置（保存时自动提交）

已在 `.vscode/settings.json` 中配置：
- 自动保存
- 智能提交
- 提交后自动推送

### 注意事项：
需要在 VSCode 的 Git 源代码管理面板中手动暂存文件，然后会自动提交并推送。

---

## 推荐使用顺序

### 初学者：
**方案1（VSCode任务）** - 简单直观，按快捷键即可推送

### 进阶用户：
**方案2（Node.js监听）** - 真正的自动化，保存即推送

### 专业用户：
**方案3（Git Hooks）** + **方案1** 组合使用

---

## 注意事项

1. **首次使用前**，请确保已配置 Git 凭据：
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

2. **GitHub认证**：
   - 使用 Personal Access Token (PAT)
   - 或配置 SSH 密钥

3. **远程仓库**：
   确认远程仓库地址正确：
   ```bash
   git remote -v
   ```

4. **分支名称**：
   所有脚本默认推送到 `main` 分支，如果您的主分支是 `master` 或其他名称，请修改脚本中的分支名。

---

## 故障排除

### 推送失败：
```bash
# 检查远程连接
git remote -v

# 测试推送
git push origin main
```

### 认证失败：
```bash
# 使用 GitHub CLI 登录
gh auth login

# 或配置 credential helper
git config --global credential.helper store
```

### 冲突处理：
自动推送可能遇到冲突，建议定期手动拉取：
```bash
git pull origin main --rebase
```

---

## 当前项目状态

您的项目有大量未提交的更改。建议先手动提交一次：

```bash
cd c:\Users\13811\WeChatProjects\miniprogram-1
git add .
git commit -m "Initial commit before auto-push setup"
git push origin main
```

然后再启用自动推送功能。
