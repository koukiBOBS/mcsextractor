# 🚀 快速部署指南

选择适合你的部署方式，按照步骤操作即可。

## 快速选择

- **想在本地测试？** → [本地开发](#本地开发60秒)
- **想免费部署到云？** → [Railway 部署](#railway-免费部署5分钟)
- **有自己的服务器？** → [VPS 部署](#vps-部署30分钟)
- **想用 Docker？** → [Docker 部署](#docker-部署10分钟)

---

## 本地开发（60秒）

```bash
npm install
npm start
# 访问 http://localhost:3000
```

**完成！** ✅

---

## Railway 免费部署（5分钟）

### 第一步：准备 GitHub

```bash
# 确保代码已推送到 GitHub
git add -A
git commit -m "Ready for deployment"
git push origin main
```

### 第二步：Railway 部署

1. 访问 [railway.app](https://railway.app)
2. 使用 GitHub 账号登录
3. 点击 "New Project" → "Deploy from GitHub repo"
4. 选择 `mcsextractor` 仓库
5. 等待自动部署完成

### 第三步：获取 URL

部署完成后，Railway 会显示你的应用 URL：

```
https://mcsextractor-xxxx.railway.app
```

**完成！** ✅

---

## VPS 部署（30分钟）

### 前置：购买 VPS

推荐：
- 阿里云/腾讯云（国内）- ¥80/年
- DigitalOcean（国外）- $5/月

配置：1 核 2GB 内存，Ubuntu 20.04

### 第一步：连接服务器

```bash
ssh root@你的IP
```

### 第二步：安装环境

```bash
# Ubuntu
apt update && apt install -y nodejs npm nginx

# 验证
node --version
npm --version
```

### 第三步：部署应用

```bash
cd /home
git clone https://github.com/你的用户名/mcsextractor.git
cd mcsextractor

npm install
npm start &
```

### 第四步：配置 Nginx

编辑 `/etc/nginx/sites-available/default`：

```nginx
server {
    listen 80;
    server_name 你的域名.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

重启：

```bash
sudo systemctl restart nginx
```

### 第五步：使用 PM2 保持运行

```bash
npm install -g pm2
pm2 start server.js --name mcsextractor
pm2 startup
pm2 save
```

**完成！** ✅

访问：`http://你的域名.com`

---

## Docker 部署（10分钟）

### 步骤 1：构建镜像

```bash
docker build -t mcsextractor:latest .
```

### 步骤 2：运行容器

```bash
docker run -p 3000:3000 mcsextractor:latest
```

### 步骤 3：访问

```
http://localhost:3000
```

**完成！** ✅

### Docker Compose（推荐）

```bash
docker-compose up -d
```

---

## 部署后检查

部署完成后，检查以下内容：

```bash
# 1. 服务是否运行
curl http://localhost:3000/health

# 2. API 端点是否工作
curl -X POST http://localhost:3000/api/extract

# 3. 查看日志
pm2 logs
# 或
docker logs <container_id>

# 4. 检查内存占用
ps aux | grep node
```

---

## 常见问题

### Q: 如何更新部署？

```bash
# 1. 更新本地代码
git add -A
git commit -m "Update"
git push origin main

# 2. Railway 自动重新部署
# VPS 需手动 pull 和重启：
cd /home/mcsextractor
git pull
pm2 restart mcsextractor
```

### Q: 如何配置自定义域名？

**Railway：** 仪表板 → Domains → Add Custom Domain

**VPS：** 修改 Nginx 配置中的 `server_name`

**Docker：** 使用 Nginx 反向代理

### Q: 上传大文件超时？

增加 Nginx 超时时间：

```nginx
proxy_connect_timeout 600s;
proxy_send_timeout 600s;
proxy_read_timeout 600s;
```

### Q: 如何添加 SSL 证书？

```bash
# 免费 SSL（Let's Encrypt）
certbot --nginx -d 你的域名.com

# 自动续期
certbot renew --dry-run
```

---

## 详细文档

完整的部署指南请查看 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

包含内容：
- 详细步骤截图
- 环境配置
- 性能优化
- 监控和维护
- 故障排除

---

## 需要帮助？

📝 查看 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) 获取详细说明

💬 提交 Issue 获取帮助

🚀 祝部署顺利！
