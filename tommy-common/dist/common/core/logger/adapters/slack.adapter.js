"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlackLoggerAdapter = void 0;
class SlackLoggerAdapter {
    constructor(config) {
        this.buffer = [];
        this.levelColors = {
            debug: '#808080',
            info: '#0099ff',
            warn: '#ffcc00',
            error: '#ff0000',
            fatal: '#990000'
        };
        this.levelEmojis = {
            debug: ':beetle:',
            info: ':information_source:',
            warn: ':warning:',
            error: ':x:',
            fatal: ':rotating_light:'
        };
        this.levelPriority = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3,
            fatal: 4
        };
        this.config = {
            webhookUrl: config.webhookUrl,
            channel: config.channel || '',
            username: config.username || 'Logger Bot',
            iconEmoji: config.iconEmoji || ':robot_face:',
            minLevel: config.minLevel || 'error',
            includeContext: config.includeContext !== false,
            bufferSize: config.bufferSize || 10,
            flushInterval: config.flushInterval || 5000
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
    shouldSendToSlack(level) {
        return this.levelPriority[level] >= this.levelPriority[this.config.minLevel];
    }
    async log(entry) {
        if (!this.shouldSendToSlack(entry.level)) {
            return;
        }
        this.buffer.push(entry);
        // 치명적인 에러는 즉시 전송
        if (entry.level === 'fatal') {
            await this.flush();
        }
        else if (this.buffer.length >= this.config.bufferSize) {
            await this.flush();
        }
    }
    async flush() {
        if (this.buffer.length === 0)
            return;
        const entries = [...this.buffer];
        this.buffer = [];
        try {
            if (entries.length === 1) {
                await this.sendSingleEntry(entries[0]);
            }
            else {
                await this.sendBatchEntries(entries);
            }
        }
        catch (error) {
            console.error('Failed to send logs to Slack:', error);
            // 실패한 엔트리는 버리거나 재시도 로직 구현
        }
    }
    async sendSingleEntry(entry) {
        const payload = {
            channel: this.config.channel,
            username: this.config.username,
            icon_emoji: this.config.iconEmoji,
            attachments: [{
                    color: this.levelColors[entry.level],
                    fallback: `${entry.level.toUpperCase()}: ${entry.message}`,
                    fields: [
                        {
                            title: `${this.levelEmojis[entry.level]} ${entry.level.toUpperCase()}`,
                            value: entry.message,
                            short: false
                        },
                        {
                            title: 'Timestamp',
                            value: entry.timestamp.toISOString(),
                            short: true
                        }
                    ]
                }]
        };
        if (entry.error) {
            payload.attachments[0].fields.push({
                title: 'Error Details',
                value: `\`\`\`${entry.error.message}\n${entry.error.stack}\`\`\``,
                short: false
            });
        }
        if (this.config.includeContext && entry.context) {
            payload.attachments[0].fields.push({
                title: 'Context',
                value: `\`\`\`json\n${JSON.stringify(entry.context, null, 2)}\`\`\``,
                short: false
            });
        }
        await this.sendToSlack(payload);
    }
    async sendBatchEntries(entries) {
        const summary = this.createBatchSummary(entries);
        const payload = {
            channel: this.config.channel,
            username: this.config.username,
            icon_emoji: this.config.iconEmoji,
            text: `📊 Log Summary (${entries.length} entries)`,
            attachments: [
                {
                    color: this.getHighestSeverityColor(entries),
                    fields: [
                        {
                            title: 'Level Distribution',
                            value: summary.levelCounts,
                            short: true
                        },
                        {
                            title: 'Time Range',
                            value: `${summary.startTime} - ${summary.endTime}`,
                            short: true
                        },
                        {
                            title: 'Recent Messages',
                            value: summary.recentMessages,
                            short: false
                        }
                    ]
                }
            ]
        };
        await this.sendToSlack(payload);
    }
    createBatchSummary(entries) {
        const levelCounts = {};
        entries.forEach(entry => {
            levelCounts[entry.level] = (levelCounts[entry.level] || 0) + 1;
        });
        const levelCountsStr = Object.entries(levelCounts)
            .map(([level, count]) => `${this.levelEmojis[level]} ${level}: ${count}`)
            .join('\n');
        const recentMessages = entries
            .slice(-5)
            .map(e => `• [${e.level.toUpperCase()}] ${e.message}`)
            .join('\n');
        return {
            levelCounts: levelCountsStr,
            startTime: entries[0].timestamp.toISOString(),
            endTime: entries[entries.length - 1].timestamp.toISOString(),
            recentMessages
        };
    }
    getHighestSeverityColor(entries) {
        let highestLevel = 'debug';
        for (const entry of entries) {
            if (this.levelPriority[entry.level] > this.levelPriority[highestLevel]) {
                highestLevel = entry.level;
            }
        }
        return this.levelColors[highestLevel];
    }
    async sendToSlack(payload) {
        const response = await fetch(this.config.webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            throw new Error(`Slack API error: ${response.statusText}`);
        }
    }
    async close() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }
        await this.flush();
    }
}
exports.SlackLoggerAdapter = SlackLoggerAdapter;
