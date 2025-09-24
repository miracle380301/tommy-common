"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookLoggerAdapter = void 0;
class WebhookLoggerAdapter {
    constructor(config) {
        this.buffer = [];
        this.levelPriority = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3,
            fatal: 4
        };
        this.config = {
            url: config.url,
            method: config.method || 'POST',
            headers: config.headers || { 'Content-Type': 'application/json' },
            minLevel: config.minLevel || 'info',
            batchSize: config.batchSize || 50,
            flushInterval: config.flushInterval || 10000,
            transformEntry: config.transformEntry
        };
        if (this.config.flushInterval > 0) {
            this.startFlushTimer();
        }
    }
    startFlushTimer() {
        this.flushTimer = setInterval(() => {
            this.flush();
        }, this.config.flushInterval);
    }
    shouldLog(level) {
        return this.levelPriority[level] >= this.levelPriority[this.config.minLevel];
    }
    async log(entry) {
        if (!this.shouldLog(entry.level)) {
            return;
        }
        this.buffer.push(entry);
        if (this.buffer.length >= this.config.batchSize) {
            await this.flush();
        }
    }
    async flush() {
        if (this.buffer.length === 0)
            return;
        const entries = [...this.buffer];
        this.buffer = [];
        try {
            const payload = this.preparePayload(entries);
            await this.sendToWebhook(payload);
        }
        catch (error) {
            console.error('Failed to send logs to webhook:', error);
            // 선택적: 재시도 로직 또는 로컬 백업
        }
    }
    preparePayload(entries) {
        if (entries.length === 1 && this.config.transformEntry) {
            return this.config.transformEntry(entries[0]);
        }
        const logs = entries.map(entry => {
            if (this.config.transformEntry) {
                return this.config.transformEntry(entry);
            }
            return {
                timestamp: entry.timestamp.toISOString(),
                level: entry.level,
                message: entry.message,
                context: entry.context,
                error: entry.error ? {
                    message: entry.error.message,
                    stack: entry.error.stack
                } : undefined
            };
        });
        return {
            logs,
            count: logs.length,
            startTime: entries[0].timestamp.toISOString(),
            endTime: entries[entries.length - 1].timestamp.toISOString()
        };
    }
    async sendToWebhook(payload) {
        const response = await fetch(this.config.url, {
            method: this.config.method,
            headers: this.config.headers,
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            throw new Error(`Webhook error: ${response.status} ${response.statusText}`);
        }
    }
    async close() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }
        await this.flush();
    }
}
exports.WebhookLoggerAdapter = WebhookLoggerAdapter;
