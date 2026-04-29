# 贡献指南

感谢您对 Minecraft 基岩版结构提取工具的兴趣！我们欢迎所有形式的贡献，包括 Bug 报告、功能请求、代码改进和文档完善。

## 📋 报告 Bug

如果你发现了 Bug，请：

1. 检查 [Issues](issues) 页面，确保不是重复的问题
2. 创建新的 Issue，提供以下信息：
   - Bug 的详细描述
   - 复现步骤
   - 预期行为 vs 实际行为
   - 你的浏览器和操作系统
   - 浏览器控制台的错误信息（如有）

## 💡 功能请求

提出新功能建议：

1. 在 [Issues](issues) 中搜索是否已有类似请求
2. 创建新的 Issue，说明：
   - 功能描述
   - 为什么需要这个功能
   - 可能的实现方式

## 🔧 代码贡献

### 开发环境设置

1. Fork 本仓库
2. Clone 你的 Fork：
   ```bash
   git clone https://github.com/你的用户名/mcsextractor.git
   cd mcsextractor
   ```

3. 创建特性分支：
   ```bash
   git checkout -b feature/你的功能名
   ```

4. 启动本地服务器：
   ```bash
   python -m http.server 8000
   # 访问 http://localhost:8000
   ```

### 代码风格

- 使用 ES6+ 语法
- 函数和变量使用有意义的名称
- 添加必要的注释说明复杂逻辑
- 保持代码简洁和可读性

### 提交代码

1. 确保代码通过语法检查：
   ```bash
   node --check app.js
   ```

2. 使用清晰的提交消息：
   ```bash
   git commit -m "feat: 添加新功能描述"
   git commit -m "fix: 修复 bug 描述"
   git commit -m "docs: 更新文档"
   git commit -m "refactor: 重构代码"
   ```

3. 推送到你的 Fork：
   ```bash
   git push origin feature/你的功能名
   ```

4. 创建 Pull Request：
   - 清楚地描述你的改动
   - 关联相关的 Issue
   - 截图展示 UI 变化（如有）

### Pull Request 检查清单

- [ ] 代码通过语法检查
- [ ] 没有引入新的浏览器兼容性问题
- [ ] 更新了相关文档
- [ ] 提交消息清晰有意义
- [ ] 没有未相关的改动

## 📚 文档改进

文档改进同样重要：

1. 修复拼写或语法错误
2. 澄清不清楚的部分
3. 添加使用示例
4. 改进代码注释

直接创建 Pull Request 或在 Issue 中提出建议。

## 🎯 项目优先级

当前关注的改进方向：

1. **结构提取准确性** - 改进 LevelDB 和 NBT 解析
2. **用户体验** - 改进 UI/UX，更好的错误提示
3. **浏览器兼容性** - 支持更多浏览器
4. **功能完整性** - 支持更多 Minecraft 版本和结构格式

## ✨ 良好实践

- 小的、focused 的 Pull Request 比大的更容易审查
- 在开始大的改动前，先创建 Issue 讨论
- 查看现有代码和注释来理解项目结构
- 写清楚的代码，不要过度优化

## 📞 联系方式

- GitHub Issues - 用于 Bug 报告和功能请求
- GitHub Discussions - 用于一般讨论和问题

## 📄 许可证

贡献代码即表示你同意在 MIT 许可证下发布你的贡献。

---

感谢你的贡献！ 🎉
