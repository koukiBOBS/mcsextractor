# 完整部署指南 - Minecraft 结构提取工具

这是一份详尽的部署文档，涵盖从本地开发到生产环境的所有方式。

## 📋 目录

1. [本地开发](#本地开发)
2. [云服务部署](#云服务部署)
3. [VPS 自建服务器](#vps-自建服务器)
4. [Docker 容器部署](#docker-容器部署)
5. [生产环境优化](#生产环境优化)
6. [故障排除](#故障排除)
7. [监控和维护](#监控和维护)

---

## 本地开发

### 前置条件

- Node.js 14+ ([下载](https://nodejs.org/))
- npm 6+ (通常随 Node.js 一起安装)
- Git (可选)

### 快速开始

```bash
# 1. 克隆或下载项目
git clone https://github.com/你的用户名/mcsextractor.git
cd mcsextractor

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm start

# 4. 在浏览器打开
# http://localhost:3000
```

**会看到的输出：**
```
🚀 服务器运行在 http://localhost:3000
📁 网站访问地址: http://localhost:3000/index.html
📤 API 端点: http://localhost:3000/api/extract
```

### 开发模式特点

- ✅ 自动热重载
- ✅ 完整的错误堆栈跟踪
- ✅ 详细的日志输出

---

## 云服务部署

### 方案对比

| 平台 | 免费额度 | 成本 | 推荐度 | 支持 |
|------|--------|------|--------|------|
| **Railway** | $5/月 | 按使用计费 | ⭐⭐⭐⭐⭐ | Node.js |
| **Render** | 免费实例 | $7/月 | ⭐⭐⭐⭐ | Node.js |
| **Heroku** | 已收费 | $7+/月 | ⭐⭐⭐ | Node.js |
| **Vercel** | 静态仅 | $0 | ❌ | 不支持后端 |
| **Fly.io** | 免费 | $0-5/月 | ⭐⭐⭐⭐ | Node.js |

### 推荐：Railway 部署

Railway 是目前最学生友好的平台。

#### 步骤 1：创建账户

1. 访问 [railway.app](https://railway.app)
2. 使用 GitHub 账号登录（推荐）

#### 步骤 2：部署项目

**方式 A：从 GitHub 部署（推荐）**

```bash
# 在 Railway 仪表板：
# 1. 点击 "New" → "Project"
# 2. 选择 "Deploy from GitHub repo"
# 3. 授权并选择 mcsextractor 仓库
# 4. 选择主分支
# 5. 设置环境变量（见下文）
# 6. 点击 "Deploy"
```

**方式 B：使用 CLI 部署**

```bash
# 1. 安装 Railway CLI
npm install -g @railway/cli

# 2. 登录
railway login

# 3. 初始化项目
railway init
# 选择 "Create a new project"
# 输入项目名称

# 4. 部署
railway up

# 5. 查看日志
railway logs

# 6. 设置自定义域名
railway domain
```

#### 步骤 3：配置环境

在 Railway 仪表板中设置环境变量：

```env
PORT=3000
NODE_ENV=production
```

#### 步骤 4：访问应用

部署完成后，Railway 会给你一个 URL：
```
https://mcsextractor-xxxx.railway.app
```

---

### 其他云服务

#### Render 部署

```bash
# 1. 访问 https://render.com
# 2. 连接 GitHub
# 3. 选择 "New" → "Web Service"
# 4. 选择 mcsextractor 仓库
# 5. 配置：
#    Build Command: npm install
#    Start Command: npm start
#    Environment: Node
# 6. 创建服务
```

#### Fly.io 部署

```bash
# 1. 安装 Fly CLI
curl -L https://fly.io/install.sh | sh

# 2. 登录
fly auth login

# 3. 初始化
fly launch

# 4. 部署
fly deploy

# 5. 设置域名
fly apps open
```

---

## VPS 自建服务器

### 方案对比

| 提供商 | 最低价格 | 推荐配置 | 说明 |
|--------|--------|--------|------|
| **阿里云** | ¥80/年 | 1核2GB | 国内推荐 |
| **腾讯云** | ¥80/年 | 1核2GB | 国内推荐 |
| **DigitalOcean** | $5/月 | 1核1GB | 国外推荐 |
| **Linode** | $5/月 | 1核1GB | 国外推荐 |
| **Vultr** | $2.5/月 | 1核512MB | 性价比高 |

### 阿里云 ECS 部署（以国内为例）

#### 步骤 1：购买 ECS

1. 访问 [阿里云 ECS](https://ecs.console.aliyun.com/)
2. 购买实例：
   - 地域：根据需要选择
   - 实例规格：1 核 2GB 内存
   - 镜像：Ubuntu 20.04 或 CentOS 7
   - 公网 IP：需要
   - 安全组：开放 22（SSH）、80（HTTP）、443（HTTPS）、3000（应用）

#### 步骤 2：连接服务器

```bash
# 使用 SSH 连接
ssh root@你的公网IP

# 或使用 Putty、VsCode 等工具
```

#### 步骤 3：安装环境

```bash
# 更新系统
apt update && apt upgrade -y          # Ubuntu
# 或
yum update -y                         # CentOS

# 安装 Node.js 和 npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs                # Ubuntu
# 或
yum install -y nodejs npm             # CentOS

# 验证安装
node --version
npm --version
```

#### 步骤 4：部署应用

```bash
# 1. 克隆项目
cd /home
git clone https://github.com/你的用户名/mcsextractor.git
cd mcsextractor

# 2. 安装依赖
npm install

# 3. 启动应用
npm start

# 4. 验证运行
# http://你的公网IP:3000
```

#### 步骤 5：使用 PM2 进程管理

```bash
# 1. 安装 PM2
npm install -g pm2

# 2. 启动应用
pm2 start server.js --name "mcsextractor"

# 3. 设置开机自启
pm2 startup
pm2 save

# 4. 查看日志
pm2 logs mcsextractor

# 5. 监控
pm2 monit
```

#### 步骤 6：配置 Nginx 反向代理

```bash
# 1. 安装 Nginx
apt install -y nginx                 # Ubuntu
# 或
yum install -y nginx                 # CentOS

# 2. 配置文件
sudo nano /etc/nginx/sites-available/default
# 或
sudo nano /etc/nginx/conf.d/default.conf
```

**配置内容：**

```nginx
server {
    listen 80;
    server_name 你的域名.com www.你的域名.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name 你的域名.com www.你的域名.com;

    # SSL 证书（见下文配置 SSL）
    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;

    # 反向代理
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
        
        # 增加超时时间（处理大文件）
        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
        proxy_read_timeout 600s;
    }

    # 文件上传大小限制
    client_max_body_size 500M;
}
```

**重启 Nginx：**

```bash
sudo nginx -t          # 测试配置
sudo systemctl restart nginx
```

#### 步骤 7：配置 SSL 证书

**使用 Let's Encrypt（免费）：**

```bash
# 1. 安装 Certbot
apt install -y certbot python3-certbot-nginx    # Ubuntu
# 或
yum install -y certbot python3-certbot-nginx     # CentOS

# 2. 申请证书
certbot certonly --nginx -d 你的域名.com -d www.你的域名.com

# 3. 自动续期
certbot renew --dry-run
```

---

## Docker 容器部署

### 创建 Dockerfile

已包含在项目中，位置：项目根目录

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制文件
COPY package*.json ./
COPY . .

# 安装依赖
RUN npm install --production

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]
```

### 本地测试

```bash
# 1. 构建镜像
docker build -t mcsextractor:latest .

# 2. 运行容器
docker run -p 3000:3000 mcsextractor:latest

# 3. 访问
# http://localhost:3000
```

### Docker Compose 部署

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
```

**启动：**

```bash
docker-compose up -d
docker-compose logs -f
```

### 推送到 Docker Hub

```bash
# 1. 登录
docker login

# 2. 标记镜像
docker tag mcsextractor:latest 你的用户名/mcsextractor:latest

# 3. 推送
docker push 你的用户名/mcsextractor:latest

# 4. 其他人可以运行
docker run -p 3000:3000 你的用户名/mcsextractor:latest
```

---

## 生产环境优化

### 1. 环境配置

创建 `.env` 文件：

```env
# 服务器
PORT=3000
NODE_ENV=production

# 文件上传
MAX_FILE_SIZE=500000000    # 500MB

# 日志
LOG_LEVEL=info
```

**读取环境变量（编辑 server.js）：**

```javascript
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 3000;
const MAX_FILE_SIZE = process.env.MAX_FILE_SIZE || 500 * 1024 * 1024;
```

### 2. 性能优化

```javascript
// 添加到 server.js
import compression from 'compression';
import helmet from 'helmet';

app.use(compression());           // 启用 gzip 压缩
app.use(helmet());                // 安全头部
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb' }));
```

**安装优化包：**

```bash
npm install compression helmet dotenv
```

### 3. 错误处理

在 server.js 最后添加：

```javascript
// 全局错误处理
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal Server Error' 
            : err.message
    });
});

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('SIGTERM 收到，关闭服务器...');
    server.close(() => {
        console.log('服务器已关闭');
        process.exit(0);
    });
});
```

### 4. 日志记录

```bash
# 安装日志库
npm install winston

# 在 server.js 中
import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

// 使用
logger.info('应用启动');
logger.error('发生错误', { error: err });
```

---

## 故障排除

### 问题 1：端口被占用

```bash
# 查找占用端口的进程
lsof -i :3000              # macOS/Linux
netstat -ano | findstr :3000  # Windows

# 杀死进程
kill -9 <PID>              # macOS/Linux
taskkill /PID <PID> /F     # Windows

# 或使用其他端口
PORT=3001 npm start
```

### 问题 2：内存不足

```bash
# 检查内存
free -h                    # Linux
vm_stat                    # macOS
Get-Process | Sort-Object -Property WorkingSet -Descending | Select-Object -First 10  # Windows

# Node.js 内存限制
node --max-old-space-size=2048 server.js  # 限制 2GB
```

### 问题 3：无法连接到数据库/LevelDB

```bash
# 检查文件权限
ls -la /path/to/db

# 给予读写权限
chmod -R 755 /path/to/db
```

### 问题 4：上传超时

在 Nginx 配置中增加超时：

```nginx
proxy_connect_timeout 600s;
proxy_send_timeout 600s;
proxy_read_timeout 600s;
```

### 问题 5：CORS 错误

```javascript
// server.js 已包含 CORS 配置，如需调整：
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
```

---

## 监控和维护

### 1. 状态检查

添加健康检查端点：

```javascript
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
```

**监控脚本：**

```bash
#!/bin/bash
# 每 5 分钟检查一次
while true; do
    status=$(curl -s http://localhost:3000/health | jq -r '.status')
    if [ "$status" != "ok" ]; then
        echo "服务异常！" | mail -s "告警" admin@example.com
        systemctl restart mcsextractor
    fi
    sleep 300
done
```

### 2. 日志监控

```bash
# 实时查看日志
tail -f /var/log/mcsextractor.log

# 搜索错误
grep ERROR /var/log/mcsextractor.log

# 统计
wc -l /var/log/mcsextractor.log
```

### 3. 性能指标

```bash
# CPU 和内存
top -p $(pgrep node)

# 网络连接
netstat -an | grep :3000 | wc -l

# 磁盘空间
df -h
```

### 4. 自动备份

```bash
#!/bin/bash
# 每天 2:00 AM 备份
0 2 * * * cp -r /app/logs /backup/logs-$(date +%Y%m%d).tar.gz
```

---

## 部署检查清单

部署前确保：

- [ ] Node.js 14+ 已安装
- [ ] npm 依赖已安装 (`npm install`)
- [ ] `.env` 文件已配置
- [ ] 防火墙允许端口 3000（开发）/ 80、443（生产）
- [ ] 有足够的磁盘空间（建议 2GB+）
- [ ] 内存足够（建议 1GB+）
- [ ] SSH 密钥已配置（VPS）
- [ ] SSL 证书已申请（生产）
- [ ] 日志目录可写
- [ ] 定期备份脚本已设置

---

## 快速参考

### 常用命令

```bash
# 开发
npm start                 # 启动开发服务器

# 生产
pm2 start server.js       # 使用 PM2 启动
pm2 logs                  # 查看日志
pm2 stop all              # 停止所有
pm2 restart all           # 重启所有

# Docker
docker build -t app .     # 构建镜像
docker run -p 3000:3000 app  # 运行容器

# 系统
systemctl status nginx    # 检查 Nginx
systemctl restart nginx   # 重启 Nginx
journalctl -u mcsextractor -f  # 查看日志
```

---

**最后更新**: 2026-04-29

有任何部署问题，欢迎提 Issue！🚀
