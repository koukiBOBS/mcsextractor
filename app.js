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

        // 方法 1: 尝试从 db/ 文件夹中查找结构
        // LevelDB 数据库通常存储在 db/ 文件夹中
        const dbFiles = Object.keys(this.zipInstance.files).filter(f => f.startsWith('db/') && !f.endsWith('/'));

        if (dbFiles.length > 0) {
            this.log(`发现 LevelDB 数据库文件 (${dbFiles.length} 个)`, 'info');
            await this.extractFromLevelDB(dbFiles);
        }

        // 方法 2: 尝试从根目录查找 .mcstructure 文件
        const structureFiles = Object.keys(this.zipInstance.files).filter(f =>
            (f.endsWith('.mcstructure') || f.includes('mystructure')) && !f.endsWith('/')
        );

        if (structureFiles.length > 0) {
            this.log(`发现 ${structureFiles.length} 个 .mcstructure 文件`, 'success');
            for (const file of structureFiles) {
                try {
                    const data = await this.zipInstance.file(file).async('arraybuffer');
                    const structure = {
                        name: file,
                        data: data,
                        size: data.byteLength,
                        valid: this.validateNBT(new DataView(data)),
                        source: 'direct'
                    };
                    this.extractedStructures.push(structure);
                    this.log(`✓ 提取结构: ${file} (${this.formatFileSize(data.byteLength)})`, 'success');
                } catch (error) {
                    this.log(`✗ 无法提取 ${file}: ${error.message}`, 'warning');
                }
            }
        }

        // 方法 3: 尝试从 level.dat 中提取
        try {
            if (this.zipInstance.files['level.dat']) {
                this.log('检测到 level.dat，尝试解析...', 'info');
                const levelData = await this.zipInstance.file('level.dat').async('arraybuffer');
                await this.extractFromLevelDat(levelData);
            }
        } catch (error) {
            this.log(`无法解析 level.dat: ${error.message}`, 'warning');
        }

        // 方法 4: 扫描所有二进制文件查找结构数据
        if (this.extractedStructures.length === 0) {
            this.log('没有找到直接的结构文件，进行深扫描...', 'warning');
            await this.deepScanStructures();
        }
    }

    async extractFromLevelDB(dbFiles) {
        // LevelDB 文件格式解析
        // 主要尝试读取 LevelDB chunk 数据
        try {
            for (const file of dbFiles) {
                // 尝试从每个 LevelDB 文件读取数据
                if (file.match(/\.ldb$/) || file.match(/\.sst$/)) {
                    try {
                        const data = await this.zipInstance.file(file).async('arraybuffer');
                        // 在数据中查找 mystructure 关键字标记
                        const structures = this.searchStructuresInBinary(data, file);
                        this.extractedStructures.push(...structures);
                    } catch (error) {
                        // 继续处理下一个文件
                    }
                }
            }
        } catch (error) {
            this.log(`LevelDB 解析错误: ${error.message}`, 'warning');
        }
    }

    searchStructuresInBinary(arrayBuffer, filename) {
        const structures = [];
        const view = new Uint8Array(arrayBuffer);
        const decoder = new TextDecoder('utf-8', { fatal: false });

        // 查找 mystructure 关键字
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
                // 找到关键字，提取结构名称
                let nameEnd = i + keywordBytes.length;
                while (nameEnd < view.length && view[nameEnd] !== 0 && nameEnd - i < 256) {
                    nameEnd++;
                }

                const nameBytes = view.slice(i, nameEnd);
                const name = decoder.decode(nameBytes).split('\0')[0];

                this.log(`🔍 在 ${filename} 中发现: ${name}`, 'info');
            }
        }

        return structures;
    }

    async extractFromLevelDat(data) {
        // level.dat 是 NBT 格式，可以尝试解析
        // NBT 格式以标签类型开头 (1 字节) + 名称长度 (2 字节) + 名称 + 数据
        try {
            const structures = this.parseNBTForStructures(new DataView(data));
            this.extractedStructures.push(...structures);
        } catch (error) {
            this.log(`level.dat 解析失败: ${error.message}`, 'warning');
        }
    }

    parseNBTForStructures(dataView) {
        const structures = [];
        // 基础 NBT 解析逻辑
        // 这是一个简化版本，完整的 NBT 解析需要递归处理

        try {
            const bytes = new Uint8Array(dataView.buffer, dataView.byteOffset, dataView.byteLength);
            const decoder = new TextDecoder();

            // 在整个数据中搜索 mystructure: 标记
            let offset = 0;
            while (offset < bytes.length - 10) {
                // 查找 mystructure: string markers
                if (bytes[offset] === 0x08) { // STRING tag
                    const lengthBE = bytes[offset + 1] << 8 | bytes[offset + 2];
                    if (lengthBE > 0 && lengthBE < 1000 && offset + 3 + lengthBE < bytes.length) {
                        const str = decoder.decode(bytes.slice(offset + 3, offset + 3 + lengthBE));
                        if (str.includes('mystructure:')) {
                            this.log(`✓ 在 level.dat 中找到: ${str}`, 'success');
                        }
                    }
                }
                offset++;
            }
        } catch (error) {
            // 忽略解析错误
        }

        return structures;
    }

    validateNBT(dataView) {
        // 基础 NBT 验证
        // NBT 文件应该以特定的字节开头
        if (dataView.byteLength < 2) return false;

        const firstByte = dataView.getUint8(0);
        // 0x0a = TAG_Compound，0x09 = TAG_List 等
        return firstByte >= 0x01 && firstByte <= 0x0c;
    }

    async deepScanStructures() {
        // 深度扫描所有文件查找结构数据
        const files = Object.keys(this.zipInstance.files);
        let scanCount = 0;

        for (const file of files) {
            // 跳过目录和已知不相关的文件
            if (file.endsWith('/') || file === 'level.dat' || file.match(/^db\//)) {
                continue;
            }

            try {
                const data = await this.zipInstance.file(file).async('arraybuffer');

                // 检查文件大小是否合理(结构通常不会太小或太大)
                if (data.byteLength < 100 || data.byteLength > 50 * 1024 * 1024) {
                    continue;
                }

                // 尝试验证 NBT 格式
                if (this.validateNBT(new DataView(data))) {
                    const structure = {
                        name: file,
                        data: data,
                        size: data.byteLength,
                        valid: true,
                        source: 'deep_scan'
                    };
                    this.extractedStructures.push(structure);
                    this.log(`✓ 深扫描发现结构: ${file} (${this.formatFileSize(data.byteLength)})`, 'success');
                    scanCount++;
                }
            } catch (error) {
                // 继续扫描下一个文件
            }
        }

        if (scanCount > 0) {
            this.log(`深扫描完成，找到 ${scanCount} 个潜在的结构文件`, 'success');
        } else {
            this.log('深扫描未发现任何结构数据', 'warning');
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
