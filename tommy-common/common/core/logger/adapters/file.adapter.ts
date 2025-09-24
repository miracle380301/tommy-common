import { LoggerAdapter, LogEntry } from '../logger.interface';
import * as fs from 'fs';
import * as path from 'path';

export interface FileLoggerConfig {
  logDir?: string;
  filename?: string;
  maxFileSize?: number; // bytes
  maxFiles?: number;
  datePattern?: boolean;
}

export class FileLoggerAdapter implements LoggerAdapter {
  private config: Required<FileLoggerConfig>;
  private currentFileSize: number = 0;
  private fileStream?: fs.WriteStream;

  constructor(config: FileLoggerConfig = {}) {
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

  private ensureLogDir(): void {
    if (!fs.existsSync(this.config.logDir)) {
      fs.mkdirSync(this.config.logDir, { recursive: true });
    }
  }

  private getLogFilePath(): string {
    if (this.config.datePattern) {
      const date = new Date().toISOString().split('T')[0];
      const name = this.config.filename.replace('.log', '');
      return path.join(this.config.logDir, `${name}-${date}.log`);
    }
    return path.join(this.config.logDir, this.config.filename);
  }

  private openFileStream(): void {
    const filePath = this.getLogFilePath();
    this.fileStream = fs.createWriteStream(filePath, { flags: 'a' });

    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      this.currentFileSize = stats.size;
    }
  }

  private rotateIfNeeded(): void {
    if (this.currentFileSize >= this.config.maxFileSize) {
      this.rotate();
    }
  }

  private rotate(): void {
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

  async log(entry: LogEntry): Promise<void> {
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
        } else {
          this.currentFileSize += bytes;
          resolve();
        }
      });
    });
  }

  private formatLogEntry(entry: LogEntry): string {
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

  async flush(): Promise<void> {
    return new Promise((resolve) => {
      if (this.fileStream) {
        this.fileStream.once('finish', resolve);
        this.fileStream.end();
        this.openFileStream();
      } else {
        resolve();
      }
    });
  }

  async close(): Promise<void> {
    return new Promise((resolve) => {
      if (this.fileStream) {
        this.fileStream.once('finish', resolve);
        this.fileStream.end();
        this.fileStream = undefined;
      } else {
        resolve();
      }
    });
  }
}