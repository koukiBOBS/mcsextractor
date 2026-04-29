# 🏗️ Minecraft 基岩版结构提取工具

一个轻量级、功能完整的网页应用，用于从 **Minecraft 基岩版**的 `.mcworld` 世界存档文件中提取结构数据。

## ✨ 功能特性

- 🎯 **智能结构提取** - 自动识别并提取 `mystructure:` 命名空间的所有结构
- 📦 **LevelDB 解析** - 深度扫描 LevelDB 数据库查找结构数据
- 🔍 **多层级检测** - 支持 `.mcstructure` 文件、LevelDB、level.dat 等多种数据源
- 📋 **详细日志** - 实时显示处理进度和错误信息
- ⬇️ **一键下载** - 将所有结构打包为 ZIP 文件下载
- 🔒 **完全本地** - 所有处理在浏览器中进行，无需上传服务器

## 🚀 快速开始

### 直接在线使用

访问你的 GitHub Pages 网址：
```
https://你的用户名.github.io/mcsextractor
```

### 本地运行

1. **直接打开** HTML 文件
   ```bash
   # 在浏览器中打开 index.html
   ```

2. **使用本地服务器**（推荐）
   ```bash
   # Python 3
   python -m http.server 8000
   
   # 然后访问 http://localhost:8000
   ```

## 📋 使用步骤

1. 📁 **上传** - 点击或拖拽你的 `.mcworld` 文件
2. ⚙️ **处理** - 点击"开始提取"按钮
3. ✅ **预览** - 查看找到的所有结构
4. ⬇️ **下载** - 获得打包后的 ZIP 文件

## 🔧 技术架构

### 前端技术
- **HTML5** + **CSS3** + **JavaScript (ES6+)**
- **JSZip** - ZIP 文件处理
- **pako** - gzip 压缩支持

### 工作流程

```
.mcworld 文件
    ↓
ZIP 解压
    ↓
多层级结构检测
    ├→ 直接查找 .mcstructure 文件
    ├→ 从 LevelDB (db/) 搜索结构标记
    ├→ 解析 level.dat NBT 数据
    └→ 二进制模式匹配查找
    ↓
数据验证和排重
    ↓
打包下载 ZIP
```

## 📁 文件结构

```
mcsextractor/
├── index.html          # 前端界面和样式
├── app.js              # 核心逻辑
├── README.md           # 说明文档
└── DEPLOYMENT.md       # 部署指南
```

## 🐛 常见问题

### 找不到结构？

这可能是因为：
- 结构不是用结构方块保存的
- 结构未以 `mystructure:` 形式命名
- .mcworld 文件不完整或来自不兼容版本

### 为什么是这么简单的工具？

GitHub Pages 只能托管静态文件，不支持 Node.js 后端。所以这是一个完全基于浏览器的解决方案。如果你需要更高的准确率，可以：
- 本地运行完整的 Node.js + LevelDB 版本
- 搭建自己的服务器

### 文件会上传到服务器吗？

**不会！** 所有处理都在你的浏览器中进行，文件绝不离开你的电脑。

## 🔐 隐私和安全

✅ **零数据上传** - 完全离线运行
✅ **开源透明** - 代码完全公开
✅ **浏览器处理** - 利用原生 FileAPI

## 📱 浏览器兼容

| 浏览器 | 支持 |
|--------|------|
| Chrome | ✅ |
| Firefox | ✅ |
| Safari | ✅ |
| Edge | ✅ |

## 🎮 支持版本

- ✅ **Minecraft 基岩版** (Windows 10/11, Xbox, Switch, Mobile)
- ❌ Java 版（暂不支持）

## 📖 详细说明

- [部署指南](./DEPLOYMENT.md) - 如何在 GitHub Pages 或其他平台部署
- [贡献指南](./CONTRIBUTING.md) - 如何参与项目开发

## 📦 依赖库

- [JSZip](https://stuk.github.io/jszip/) - ZIP 文件处理
- [pako](https://github.com/nodeca/pako) - 数据压缩

## 📄 许可证

MIT License - 自由使用和修改

---

**提示**: 如果需要更强大的后端支持，可以 fork 本项目并集成 Node.js + @mcbe/leveldb。

