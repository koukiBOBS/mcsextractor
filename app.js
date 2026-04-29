// NBT 数据类型定义
const NBT_TYPES = {
    0x00: 'TAG_End',
    0x01: 'TAG_Byte',
    0x02: 'TAG_Short',
    0x03: 'TAG_Int',
    0x04: 'TAG_Long',
    0x05: 'TAG_Float',
    0x06: 'TAG_Double',
    0x07: 'TAG_Byte_Array',
    0x08: 'TAG_String',
    0x09: 'TAG_List',
    0x0a: 'TAG_Compound',
    0x0b: 'TAG_Int_Array',
    0x0c: 'TAG_Long_Array'
};

class NBTReader {
    constructor(buffer) {
        this.buffer = new DataView(buffer);
        this.offset = 0;
    }

    readByte() {
        const value = this.buffer.getInt8(this.offset);
        this.offset += 1;
        return value;
    }

    readUByte() {
        const value = this.buffer.getUint8(this.offset);
        this.offset += 1;
        return value;
    }

    readShort() {
        const value = this.buffer.getInt16(this.offset, false); // big-endian
        this.offset += 2;
        return value;
    }

    readInt() {
        const value = this.buffer.getInt32(this.offset, false);
        this.offset += 4;
        return value;
    }

    readLong() {
        const high = this.buffer.getInt32(this.offset, false);
        const low = this.buffer.getInt32(this.offset + 4, false);
        this.offset += 8;
        return { high, low };
    }

    readString() {
        const length = this.readShort();
        if (length < 0 || length > 32767) return '';
        const bytes = new Uint8Array(this.buffer.buffer, this.buffer.byteOffset + this.offset, length);
        this.offset += length;
        return new TextDecoder('utf-8').decode(bytes);
    }

    isValid() {
        return this.offset < this.buffer.byteLength;
    }
}

class MCStructureExtractor {
    constructor() {
        this.selectedFile = null;
        this.extractedStructures = [];
        this.zipInstance = null;

        this.setupEventListeners();
    }

    setupEventListeners() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const processBtn = document.getElementById('processBtn');
        const downloadBtn = document.getElementById('downloadBtn');

        uploadArea.addEventListener('click', () => fileInput.click());

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelect(e.target.files[0]);
            }
        });

        processBtn.addEventListener('click', () => this.processFile());
        downloadBtn.addEventListener('click', () => this.downloadZip());
    }

    handleFileSelect(file) {
        // 验证文件类型
        if (!file.name.endsWith('.mcworld')) {
            this.showError('请选择 .mcworld 文件');
            return;
        }

        if (file.size > 500 * 1024 * 1024) {
            this.showError('文件大小超过 500MB 限制');
            return;
        }

        this.selectedFile = file;
        this.updateFileInfo();
        this.log(`✓ 已选择文件: ${file.name} (${this.formatFileSize(file.size)})`, 'success');
        document.getElementById('processBtn').disabled = false;
    }

    updateFileInfo() {
        const fileInfo = document.getElementById('fileInfo');
        document.getElementById('fileName').textContent = this.selectedFile.name;
        document.getElementById('fileSize').textContent = this.formatFileSize(this.selectedFile.size);
        document.getElementById('fileStatus').textContent = '已就绪';
        fileInfo.classList.add('show');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    log(message, type = 'info') {
        const logContent = document.getElementById('logContent');
        if (logContent.innerHTML === '<div class="empty-state"><p>等待操作...</p></div>') {
            logContent.innerHTML = '';
        }

        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        logContent.appendChild(entry);
        logContent.scrollTop = logContent.scrollHeight;
    }

    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
        this.log(message, 'error');
        setTimeout(() => {
            errorDiv.classList.remove('show');
        }, 5000);
    }

    async processFile() {
        if (!this.selectedFile) {
            this.showError('请先选择文件');
            return;
        }

        const processBtn = document.getElementById('processBtn');
        processBtn.disabled = true;

        try {
            this.log('开始解析 .mcworld 文件...', 'info');
            this.showProgress(10);

            const arrayBuffer = await this.selectedFile.arrayBuffer();
            this.log('文件加载完成，开始解压 ZIP...', 'info');
            this.showProgress(25);

            this.zipInstance = await JSZip.loadAsync(arrayBuffer);
            this.log(`✓ ZIP 解压成功，找到 ${Object.keys(this.zipInstance.files).length} 个文件`, 'success');
            this.showProgress(40);

            // 列出所有文件用于调试
            this.log('扫描文件结构...', 'info');
            const files = Object.keys(this.zipInstance.files);
            files.forEach(file => {
                if (!file.endsWith('/')) {
                    this.log(`  📄 ${file}`, 'info');
                }
            });

            this.showProgress(50);

            // 尝试从不同位置提取结构
            await this.extractStructures();
            this.showProgress(85);

            this.log(`✓ 提取完成！找到 ${this.extractedStructures.length} 个结构`, 'success');
            this.showProgress(100);

            this.displayResults();
            document.getElementById('downloadBtn').disabled = false;

        } catch (error) {
            this.log(`❌ 错误: ${error.message}`, 'error');
            this.showError(`处理失败: ${error.message}`);
            console.error(error);
        } finally {
            processBtn.disabled = false;
            this.hideProgress();
        }
    }

    showProgress(percent) {
        const progressBar = document.getElementById('progressBar');
        const progressFill = document.getElementById('progressFill');
        progressBar.classList.add('show');
        progressFill.style.width = percent + '%';
    }

    hideProgress() {
        const progressBar = document.getElementById('progressBar');
        progressBar.classList.remove('show');
    }

    async extractStructures() {
        this.extractedStructures = [];

        // 方法 1: 从 LevelDB 数据库中提取结构（优先级最高）
        const dbFiles = Object.keys(this.zipInstance.files).filter(f =>
            f.startsWith('db/') && !f.endsWith('/') && (f.endsWith('.ldb') || f.endsWith('.log'))
        );

        if (dbFiles.length > 0) {
            this.log(`🔎 发现 LevelDB 数据库 (${dbFiles.filter(f => f.endsWith('.ldb')).length} 个 .ldb 文件)，开始深度扫描...`, 'info');
            await this.extractFromLevelDB(dbFiles);
        }

        // 方法 2: 解析 level.dat 文件查找结构元数据
        if (this.extractedStructures.length === 0 && this.zipInstance.files['level.dat']) {
            this.log('正在分析 level.dat 文件...', 'info');
            try {
                const levelData = await this.zipInstance.file('level.dat').async('arraybuffer');
                await this.extractFromLevelDat(levelData);
            } catch (error) {
                this.log(`无法解析 level.dat: ${error.message}`, 'warning');
            }
        }

        // 方法 3: 直接查找 .mcstructure 文件
        const structureFiles = Object.keys(this.zipInstance.files).filter(f =>
            f.endsWith('.mcstructure') && !f.endsWith('/')
        );

        if (structureFiles.length > 0) {
            this.log(`🔎 发现 ${structureFiles.length} 个 .mcstructure 文件`, 'success');
            for (const file of structureFiles) {
                try {
                    const data = await this.zipInstance.file(file).async('arraybuffer');
                    const structure = {
                        name: file.split('/').pop(),
                        data: data,
                        size: data.byteLength,
                        valid: this.validateStructureNBT(new DataView(data)),
                        source: 'direct_file'
                    };
                    this.extractedStructures.push(structure);
                    this.log(`✓ 提取结构: ${structure.name} (${this.formatFileSize(data.byteLength)})`, 'success');
                } catch (error) {
                    this.log(`✗ 无法提取 ${file}: ${error.message}`, 'warning');
                }
            }
        }

        if (this.extractedStructures.length === 0) {
            this.log('⚠️ 未找到任何结构数据。可能原因：', 'warning');
            this.log('  1. 此世界中没有用结构方块保存的结构', 'warning');
            this.log('  2. 结构未以 "mystructure:" 命名空间保存', 'warning');
            this.log('  3. 存档文件可能不完整或格式不兼容', 'warning');
        }
    }

    async extractFromLevelDB(dbFiles) {
        // LevelDB 文件格式解析
        // 目标: 从 LevelDB blocks 中提取结构块数据
        try {
            let structureCount = 0;
            let filesScanned = 0;

            for (const file of dbFiles) {
                try {
                    if (!file.endsWith('.ldb')) continue;

                    filesScanned++;
                    this.log(`[${filesScanned}/${dbFiles.filter(f => f.endsWith('.ldb')).length}] 扫描: ${file.split('/').pop()}`, 'info');

                    const data = await this.zipInstance.file(file).async('arraybuffer');
                    const view = new Uint8Array(data);

                    // 在 LevelDB 数据中查找 mystructure: 标记
                    const structures = this.searchStructureKeysInLevelDB(view, file);
                    structureCount += structures.length;
                    this.extractedStructures.push(...structures);

                } catch (error) {
                    this.log(`跳过 ${file}: ${error.message}`, 'warning');
                }
            }

            if (structureCount > 0) {
                this.log(`✓ 从 LevelDB 中成功提取 ${structureCount} 个结构`, 'success');
            } else {
                this.log('在 LevelDB 中未找到结构关键字，继续检查其他来源...', 'info');
            }
        } catch (error) {
            this.log(`LevelDB 扫描出错: ${error.message}`, 'warning');
        }
    }

    searchStructureKeysInLevelDB(data, filename) {
        const structures = [];
        const decoder = new TextDecoder('utf-8', { fatal: false });

        // 查找关键字: mystructure:, structure, StructureData 等
        const keywords = ['mystructure:', 'structure:', 'StructureData'];
        const foundStructures = new Map(); // 防止重复

        for (const keyword of keywords) {
            const keywordBytes = new TextEncoder().encode(keyword);

            for (let i = 0; i < data.length - keywordBytes.length; i++) {
                let match = true;
                for (let j = 0; j < keywordBytes.length; j++) {
                    if (data[i + j] !== keywordBytes[j]) {
                        match = false;
                        break;
                    }
                }

                if (match) {
                    // 找到关键字，尝试提取结构名称
                    let nameEnd = i + keywordBytes.length;
                    const nameStart = i;

                    // 读取直到遇到空字符或非可打印字符
                    while (nameEnd < data.length && nameEnd - i < 200) {
                        const byte = data[nameEnd];
                        if (byte < 32 || byte > 126) break;
                        nameEnd++;
                    }

                    const name = decoder.decode(data.slice(nameStart, nameEnd));

                    // 如果找到有效的结构名称
                    if (name.length > keyword.length + 1 && !foundStructures.has(name)) {
                        foundStructures.set(name, true);

                        // 尝试提取结构数据块（关键字之后的数据）
                        let dataEnd = Math.min(nameEnd + 50000, data.length); // 最多提取 50KB
                        const structureData = data.slice(nameStart, dataEnd);

                        // 验证提取的数据是否看起来像 NBT 格式
                        if (structureData.length > 100) {
                            const structure = {
                                name: name.substring(0, 100),
                                data: structureData.buffer.slice(
                                    structureData.byteOffset,
                                    structureData.byteOffset + structureData.byteLength
                                ),
                                size: structureData.byteLength,
                                valid: this.validateStructureNBT(new DataView(structureData.buffer, structureData.byteOffset, structureData.byteLength)),
                                source: 'leveldb'
                            };

                            structures.push(structure);
                            this.log(`✓ 从 LevelDB 提取: ${name.substring(0, 50)} (${this.formatFileSize(structureData.byteLength)})`, 'success');
                        }
                    }
                }
            }
        }

        return structures;
    }

    async extractFromLevelDat(data) {
        // level.dat 是 gzip 压缩的 NBT 数据
        // 首先尝试解压缩
        try {
            // 检查 gzip 魔数 (1f 8b)
            const view = new Uint8Array(data);
            if (view[0] === 0x1f && view[1] === 0x8b) {
                this.log('level.dat 已压缩，尝试解压...', 'info');
                try {
                    const decompressed = pako.inflate(data);
                    this.parseStructureDataFromNBT(new DataView(decompressed));
                } catch (error) {
                    this.log(`解压 level.dat 失败: ${error.message}`, 'warning');
                }
            } else {
                // 未压缩的 NBT 数据
                this.parseStructureDataFromNBT(new DataView(data));
            }
        } catch (error) {
            this.log(`解析 level.dat 异常: ${error.message}`, 'warning');
        }
    }

    parseStructureDataFromNBT(dataView) {
        // 解析 NBT 数据查找结构信息
        try {
            const view = new Uint8Array(dataView.buffer, dataView.byteOffset, dataView.byteLength);
            const decoder = new TextDecoder('utf-8', { fatal: false });

            // 查找 "mystructure:" 标记
            const keyword = 'mystructure:';
            const keywordBytes = new TextEncoder().encode(keyword);

            for (let i = 0; i < view.length - keywordBytes.length; i++) {
                let match = true;
                for (let j = 0; j < keywordBytes.length; j++) {
                    if (view[i + j] !== keywordBytes[j]) {
                        match = false;
                        break;
                    }
                }

                if (match) {
                    // 提取结构名称
                    let nameEnd = i + keywordBytes.length;
                    while (nameEnd < view.length && view[nameEnd] > 32 && view[nameEnd] < 127 && nameEnd - i < 200) {
                        nameEnd++;
                    }

                    const structureName = decoder.decode(view.slice(i, nameEnd));
                    if (structureName.length > keyword.length) {
                        this.log(`✓ 在 level.dat 中发现结构: ${structureName}`, 'success');
                    }
                }
            }
        } catch (error) {
            // 忽略解析错误
        }
    }

    validateNBT(dataView) {
        // 过于宽松的 NBT 验证，移除此方法
        // 改用更严格的结构特定验证
        return false;
    }

    validateStructureNBT(dataView) {
        // 严格的 NBT 结构文件验证
        // .mcstructure 文件应该满足以下条件：
        if (dataView.byteLength < 100) return false;

        try {
            const firstByte = dataView.getUint8(0);

            // .mcstructure 文件通常以 0x0a (TAG_Compound) 开头
            if (firstByte !== 0x0a) {
                return false;
            }

            // 读取结构名称长度（跟在 TAG_Compound 后的 Short）
            const nameLength = dataView.getInt16(1, false);

            // 结构名称长度应该合理（1-100字节）
            if (nameLength < 1 || nameLength > 100) {
                return false;
            }

            // 检查是否有足够的数据
            if (dataView.byteLength < 3 + nameLength + 10) {
                return false;
            }

            // 读取结构名称
            const nameBytes = new Uint8Array(
                dataView.buffer,
                dataView.byteOffset + 3,
                nameLength
            );
            const name = new TextDecoder().decode(nameBytes);

            // 结构名称应该是可打印的 ASCII
            if (!/^[\x20-\x7E]+$/.test(name)) {
                return false;
            }

            // 结构名称不应该包含 JSON 或 XML 标记（用于排除配置文件）
            if (name.includes('{') || name.includes('[') || name.includes('<')) {
                return false;
            }

            return true;
        } catch (error) {
            return false;
        }
    }

    displayResults() {
        const resultsSection = document.getElementById('resultsSection');
        const resultsCount = document.getElementById('resultsCount');
        const structuresGrid = document.getElementById('structuresGrid');
        const statsGrid = document.getElementById('statsGrid');

        resultsSection.classList.add('show');
        resultsCount.textContent = `${this.extractedStructures.length} 个结构`;

        // 统计信息
        let validCount = 0;
        let totalSize = 0;

        this.extractedStructures.forEach(s => {
            if (s.valid) validCount++;
            totalSize += s.size;
        });

        statsGrid.innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${this.extractedStructures.length}</div>
                <div class="stat-label">发现结构数</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${validCount}</div>
                <div class="stat-label">有效结构</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${this.formatFileSize(totalSize)}</div>
                <div class="stat-label">总大小</div>
            </div>
        `;

        // 结构卡片
        if (this.extractedStructures.length === 0) {
            structuresGrid.innerHTML = '<div class="empty-state"><p>未发现任何结构数据</p></div>';
            return;
        }

        structuresGrid.innerHTML = this.extractedStructures.map((structure, index) => `
            <div class="structure-card">
                <div class="structure-name">#${index + 1} ${structure.name}</div>
                <div class="structure-info">
                    <span>大小: ${this.formatFileSize(structure.size)}</span>
                </div>
                <div class="structure-info">
                    <span>来源: ${structure.source}</span>
                </div>
                <div class="structure-status ${structure.valid ? 'status-valid' : 'status-invalid'}">
                    ${structure.valid ? '✓ 有效' : '⚠ 可能无效'}
                </div>
            </div>
        `).join('');
    }

    async downloadZip() {
        if (this.extractedStructures.length === 0) {
            this.showError('没有结构可以下载');
            return;
        }

        const downloadBtn = document.getElementById('downloadBtn');
        downloadBtn.disabled = true;
        this.log('开始打包 ZIP...', 'info');

        try {
            const zip = new JSZip();
            const structuresFolder = zip.folder('structures');

            this.extractedStructures.forEach((structure, index) => {
                const filename = structure.name || `structure_${index}.mcstructure`;
                const cleanFilename = filename
                    .replace(/mystructure:/g, '')
                    .replace(/[^a-zA-Z0-9._-]/g, '_')
                    || `structure_${index}`;

                structuresFolder.file(cleanFilename, structure.data);
            });

            // 添加信息文件
            const info = `Minecraft 基岩版结构提取报告
========================================
提取时间: ${new Date().toLocaleString()}
源文件: ${this.selectedFile.name}
源文件大小: ${this.formatFileSize(this.selectedFile.size)}

提取结果:
- 总结构数: ${this.extractedStructures.length}
- 有效结构: ${this.extractedStructures.filter(s => s.valid).length}
- 总大小: ${this.formatFileSize(this.extractedStructures.reduce((sum, s) => sum + s.size, 0))}

结构列表:
${this.extractedStructures.map((s, i) => `${i + 1}. ${s.name} (${this.formatFileSize(s.size)})`).join('\n')}
`;

            zip.file('README.txt', info);

            this.log('正在生成 ZIP 文件...', 'info');
            const blob = await zip.generateAsync({ type: 'blob' });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `mc_structures_${Date.now()}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            this.log(`✓ ZIP 下载成功 (${this.formatFileSize(blob.size)})`, 'success');

        } catch (error) {
            this.log(`❌ 打包失败: ${error.message}`, 'error');
            this.showError(`打包失败: ${error.message}`);
        } finally {
            downloadBtn.disabled = false;
        }
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.extractor = new MCStructureExtractor();
});
