import express from 'express';
import multer from 'multer';
import JSZip from 'jszip';
import { LevelDB } from '@mcbe/leveldb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// 启用 CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.use(express.json());
app.use(express.static('.'));

/**
 * 从 LevelDB 中提取结构
 * POST /api/extract
 */
app.post('/api/extract', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: '未找到上传的文件' });
        }

        // 解压 .mcworld 文件
        const zip = await JSZip.loadAsync(req.file.buffer);
        const structures = [];

        // 获取所有 .ldb 文件
        const ldbFiles = [];
        zip.forEach((relativePath, file) => {
            if (relativePath.startsWith('db/') && relativePath.endsWith('.ldb')) {
                ldbFiles.push(relativePath);
            }
        });

        // 读取 LevelDB 数据库
        const dbDir = path.join(__dirname, 'temp_db_' + Date.now());
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }

        try {
            // 提取所有 db 文件
            for (const ldbFile of ldbFiles) {
                const fileData = await zip.file(ldbFile).async('nodebuffer');
                const targetPath = path.join(dbDir, path.basename(ldbFile));
                fs.writeFileSync(targetPath, fileData);
            }

            // 复制 MANIFEST 和其他必要文件
            for (const file in zip.files) {
                if (file.startsWith('db/') && !file.endsWith('.ldb')) {
                    const fileData = await zip.file(file).async('nodebuffer');
                    const targetPath = path.join(dbDir, path.basename(file));
                    if (!fs.existsSync(targetPath)) {
                        fs.writeFileSync(targetPath, fileData);
                    }
                }
            }

            // 打开 LevelDB
            const db = new LevelDB(dbDir);

            // 读取所有键值对，查找结构数据
            let count = 0;
            for await (const [key, value] of db.iterate()) {
                const keyStr = key.toString('utf8', 0, Math.min(key.length, 200));

                // 查找 mystructure 标记的结构
                if (keyStr.includes('mystructure:') || keyStr.includes('structure:')) {
                    try {
                        // 提取结构名称
                        const structureMatch = keyStr.match(/(mystructure:|structure:)[a-zA-Z0-9_-]+/);
                        if (structureMatch) {
                            const structureName = structureMatch[0];
                            structures.push({
                                name: structureName,
                                size: value.length,
                                data: value.toString('base64'),
                                valid: value.length > 0
                            });
                            count++;
                        }
                    } catch (error) {
                        console.error('处理结构失败:', error);
                    }
                }
            }

            db.close();

            // 清理临时文件
            fs.rmSync(dbDir, { recursive: true, force: true });

            res.json({
                success: true,
                structureCount: count,
                structures: structures,
                message: `成功提取 ${count} 个结构`
            });

        } catch (error) {
            // 清理临时文件
            if (fs.existsSync(dbDir)) {
                fs.rmSync(dbDir, { recursive: true, force: true });
            }
            throw error;
        }

    } catch (error) {
        console.error('错误:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: `提取失败: ${error.message}`
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
    console.log(`📁 网站访问地址: http://localhost:${PORT}/index.html`);
    console.log(`📤 API 端点: http://localhost:${PORT}/api/extract`);
});
