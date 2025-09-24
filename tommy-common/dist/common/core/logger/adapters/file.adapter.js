"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileLoggerAdapter = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class FileLoggerAdapter {
    constructor(config = {}) {
        this.currentFileSize = 0;
        this.config = {
            logDir: config.logDir || './logs',
            filename: config.filename || 'app.log',
            maxFileSize: config.maxFileSize || 10 * 1024 * 1024, // 10MB
            maxFiles: config.maxFiles || 5,
            datePattern: config.datePattern !== false
        };
        this.ensureLogDir();
        this.openFileStream();
    }
    ensureLogDir() {
        if (!fs.existsSync(this.config.logDir)) {
            fs.mkdirSync(this.config.logDir, { recursive: true });
        }
    }
    getLogFilePath() {
        if (this.config.datePattern) {
            const date = new Date().toISOString().split('T')[0];
            const name = this.config.filename.replace('.log', '');
            return path.join(this.config.logDir, `${name}-${date}.log`);
        }
        return path.join(this.config.logDir, this.config.filename);
    }
    openFileStream() {
        const filePath = this.getLogFilePath();
        this.fileStream = fs.createWriteStream(filePath, { flags: 'a' });
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            this.currentFileSize = stats.size;
        }
    }
    rotateIfNeeded() {
        if (this.currentFileSize >= this.config.maxFileSize) {
            this.rotate();
        }
    }
    rotate() {
        if (this.fileStream) {
            this.fileStream.end();
        }
        const basePath = this.getLogFilePath();
        // 기존 파일들 이름 변경
        for (let i = this.config.maxFiles - 1; i > 0; i--) {
            const oldPath = i === 1 ? basePath : `${basePath}.${i - 1}`;
            const newPath = `${basePath}.${i}`;
            if (fs.existsSync(oldPath)) {
                fs.renameSync(oldPath, newPath);
            }
        }
        // 현재 파일을 .1로 이동
        if (fs.existsSync(basePath)) {
            fs.renameSync(basePath, `${basePath}.1`);
        }
        // 새 파일 스트림 열기
        this.currentFileSize = 0;
        this.openFileStream();
    }
    async log(entry) {
        const logLine = this.formatLogEntry(entry);
        const bytes = Buffer.byteLength(logLine);
        this.rotateIfNeeded();
        return new Promise((resolve, reject) => {
            if (!this.fileStream) {
                reject(new Error('File stream not initialized'));
                return;
            }
            this.fileStream.write(logLine, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    this.currentFileSize += bytes;
                    resolve();
                }
            });
        });
    }
    formatLogEntry(entry) {
        const timestamp = entry.timestamp.toISOString();
        const level = entry.level.toUpperCase().padEnd(5);
        let line = `[${timestamp}] ${level} ${entry.message}`;
        if (entry.context && Object.keys(entry.context).length > 0) {
            line += ` ${JSON.stringify(entry.context)}`;
        }
        if (entry.error) {
            line += `\n  Error: ${entry.error.message}`;
            if (entry.error.stack) {
                line += `\n  Stack: ${entry.error.stack}`;
            }
        }
        return line + '\n';
    }
    async flush() {
        return new Promise((resolve) => {
            if (this.fileStream) {
                this.fileStream.once('finish', resolve);
                this.fileStream.end();
                this.openFileStream();
            }
            else {
                resolve();
            }
        });
    }
    async close() {
        return new Promise((resolve) => {
            if (this.fileStream) {
                this.fileStream.once('finish', resolve);
                this.fileStream.end();
                this.fileStream = undefined;
            }
            else {
                resolve();
            }
        });
    }
}
exports.FileLoggerAdapter = FileLoggerAdapter;
