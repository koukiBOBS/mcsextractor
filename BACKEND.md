# 使用 Node.js 后端 - LevelDB 高级模式

## 📋 安装和运行

### 1. 安装依赖

```bash
npm install
```

这会安装以下关键依赖：
- `@mcbe/leveldb` - Minecraft 基岩版 LevelDB 解析库
- `express` - Web 服务器框架
- `multer` - 文件上传处理
- `jszip` - ZIP 文件处理

### 2. 启动服务器

```bash
npm start
```

或在开发模式：
```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动

## 🌐 访问应用

### 本地开发模式

启动服务器后，访问：
```
http://localhost:3000
```

应用会自动检测后端服务，启用高级 LevelDB 解析模式。

### 工作流程

1. **检测后端** - 前端自动检测本地后端服务
2. **上传文件** - 点击上传或拖拽 .mcworld 文件
3. **后端处理** - Node.js 后端使用 `@mcbe/leveldb` 解析数据库
4. **高级解析** - 直接读取 LevelDB 中的结构键值对
5. **返回结果** - 前端显示解析结果和下载选项

## 🔧 API 端点

### POST /api/extract

上传 .mcworld 文件进行结构提取

**请求：**
- 方法: `POST`
- 内容: multipart/form-data
- 参数: `file` (File) - .mcworld 存档文件

**响应成功：**
```json
{
  "success": true,
  "structureCount": 5,
  "structures": [
    {
      "name": "mystructure:house",
      "size": 50000,
      "data": "base64_encoded_data",
      "valid": true
    }
  ],
  "message": "成功提取 5 个结构"
}
```

**响应失败：**
```json
{
  "success": false,
  "error": "错误信息",
  "message": "提取失败: 错误信息"
}
```

## ⚙️ 配置

### 环境变量

创建 `.env` 文件（可选）：

```env
PORT=3000
NODE_ENV=development
```

### 文件大小限制

编辑 `server.js` 修改上传文件大小限制：

```javascript
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 500 * 1024 * 1024 } // 500MB
});
```

## 📊 工作原理

### 后端处理流程

1. **接收文件** - Express 通过 multer 接收上传的 .mcworld 文件
2. **解压 ZIP** - 使用 jszip 解压 .mcworld 存档
3. **提取 DB 文件** - 从 ZIP 中提取 db/ 文件夹中的所有文件
4. **初始化 LevelDB** - 使用 @mcbe/leveldb 打开 LevelDB 数据库
5. **迭代键值对** - 遍历所有键，查找 "mystructure:" 和 "structure:" 标记
6. **提取结构** - 将匹配的结构数据编码为 base64 返回
7. **清理临时文件** - 删除临时 db 文件夹

### 优势

✅ **准确性更高** - 直接读取 LevelDB，不依赖二进制搜索
✅ **速度更快** - Node.js 本地处理，无需在浏览器中进行复杂操作
✅ **支持更多格式** - 可以解析 LevelDB 的完整结构
✅ **错误处理** - 专业的错误处理和日志记录

## 🐛 故障排除

### 端口已被占用

```bash
# 使用不同的端口
PORT=3001 npm start
```

### 缺少依赖

```bash
# 重新安装依赖
rm -rf node_modules package-lock.json
npm install
```

### 文件上传失败

- 检查文件大小是否超过限制
- 确认文件格式是 .mcworld
- 查看浏览器控制台错误信息

### LevelDB 解析失败

- 确认 .mcworld 文件完整无损
- 检查存档是否来自 Minecraft 基岩版
- 查看服务器日志中的具体错误

## 📦 部署

### Docker 部署

创建 `Dockerfile`：

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

构建和运行：
```bash
docker build -t mcsextractor .
docker run -p 3000:3000 mcsextractor
```

### 云服务部署

支持部署到：
- Heroku
- Railway
- Render
- DigitalOcean App Platform

## 🔗 相关文档

- [@mcbe/leveldb 文档](https://www.npmjs.com/package/@mcbe/leveldb)
- [Express 文档](https://expressjs.com/)
- [Multer 文档](https://github.com/expressjs/multer)

---

现在你拥有一个专业的、支持 LevelDB 高级解析的 Minecraft 结构提取工具！🚀
