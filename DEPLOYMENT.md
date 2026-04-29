# Minecraft 基岩版结构提取工具 - 部署指南

## 🚀 GitHub Pages 自动部署

项目配置了 **GitHub Actions** 自动部署管道。每当你推送代码到 `main` 分支时，网站会自动部署到 GitHub Pages。

### 部署流程

1. **代码验证**
   - 检查 HTML 文件存在性
   - 验证 JavaScript 语法
   
2. **自动部署**
   - 构建网站工件
   - 部署到 GitHub Pages

3. **访问网站**
   ```
   https://你的用户名.github.io/mcsextractor
   ```

## 🔧 配置 GitHub Pages

### 第一次部署设置

1. 进入 GitHub 仓库 **Settings** > **Pages**
2. 选择 **Deploy from a branch**
3. 选择分支：**main**
4. 选择文件夹：**/ (root)**
5. 点击 **Save**

GitHub Actions 工作流将自动运行，网站将在几分钟内上线。

## 📦 创建 Release 版本

### 创建新的 Release

```bash
# 1. 创建新的 git tag
git tag -a v1.0.0 -m "Initial release - Minecraft structure extractor"

# 2. 推送到 GitHub
git push origin v1.0.0
```

然后访问 GitHub 仓库：
- 进入 **Releases** > **Create a new release**
- 选择 tag：**v1.0.0**
- 填写发布标题和描述
- 点击 **Publish release**

### Release 发布说明模板

```markdown
# Minecraft 基岩版结构提取工具 v1.0.0

## ✨ 功能特性

- ✅ 从 .mcworld 存档提取结构
- ✅ 支持拖拽上传
- ✅ LevelDB 数据库解析
- ✅ NBT 格式验证
- ✅ ZIP 打包下载
- ✅ 实时操作日志

## 🔧 技术栈

- HTML5 + CSS3 + JavaScript (ES6+)
- JSZip - ZIP 文件处理
- pako - gzip 压缩支持

## 🌐 在线访问

[GitHub Pages](https://你的用户名.github.io/mcsextractor)

## 📝 更新日志

### v1.0.0 (2026-04-29)
- 初始版本发布
- 完整的结构提取功能
- 改进的 LevelDB 解析
- 严格的 NBT 格式验证

## 💬 反馈

如有问题或建议，请提交 Issue。
```

## 📊 CI/CD 工作流状态

点击仓库中的 **Actions** 标签页查看：
- ✅ 工作流执行历史
- ✅ 构建日志
- ✅ 部署状态

## 🆘 故障排除

### GitHub Pages 部署失败

**检查清单**：
1. 仓库设置中启用了 GitHub Pages
2. 选择了正确的分支（main）
3. 选择了正确的文件夹（root）
4. Actions 工作流没有被禁用

**查看错误日志**：
- GitHub 仓库 > Actions > 选择最近的工作流运行
- 查看 "Deploy to GitHub Pages" 步骤的详细输出

### CDN 库加载失败

如果 index.html 中的 CDN 链接无法加载：

```html
<!-- 替换为本地版本或其他 CDN -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js"></script>
```

## 📈 下一步改进

- [ ] 添加单元测试
- [ ] 添加 ESLint 代码检查
- [ ] 支持更多 Minecraft 版本
- [ ] 添加结构预览功能
- [ ] 国际化多语言支持

## 🔗 相关链接

- [GitHub Pages 文档](https://docs.github.com/en/pages)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [JSZip 文档](https://stuk.github.io/jszip/)
- [pako 文档](https://github.com/nodeca/pako)

---

**部署完成！** 🎉 你的网站现在支持自动化部署和发布管理了。
