import { LoggerAdapter, LogEntry, LogLevel } from '../logger.interface';

export interface SlackLoggerConfig {
  webhookUrl: string;
  channel?: string;
  username?: string;
  iconEmoji?: string;
  minLevel?: LogLevel;
  includeContext?: boolean;
  bufferSize?: number;
  flushInterval?: number; // ms
}

export class SlackLoggerAdapter implements LoggerAdapter {
  private config: Required<SlackLoggerConfig>;
  private buffer: LogEntry[] = [];
  private flushTimer?: NodeJS.Timeout;
  private readonly levelColors: Record<LogLevel, string> = {
    debug: '#808080',
    info: '#0099ff',
    warn: '#ffcc00',
    error: '#ff0000',
    fatal: '#990000'
  };
  private readonly levelEmojis: Record<LogLevel, string> = {
    debug: ':beetle:',
    info: ':information_source:',
    warn: ':warning:',
    error: ':x:',
    fatal: ':rotating_light:'
  };
  private readonly levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    fatal: 4
  };

  constructor(config: SlackLoggerConfig) {
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

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  private shouldSendToSlack(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.config.minLevel];
  }

  async log(entry: LogEntry): Promise<void> {
    if (!this.shouldSendToSlack(entry.level)) {
      return;
    }

    this.buffer.push(entry);

    // 치명적인 에러는 즉시 전송
    if (entry.level === 'fatal') {
      await this.flush();
    } else if (this.buffer.length >= this.config.bufferSize) {
      await this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const entries = [...this.buffer];
    this.buffer = [];

    try {
      if (entries.length === 1) {
        await this.sendSingleEntry(entries[0]);
      } else {
        await this.sendBatchEntries(entries);
      }
    } catch (error) {
      console.error('Failed to send logs to Slack:', error);
      // 실패한 엔트리는 버리거나 재시도 로직 구현
    }
  }

  private async sendSingleEntry(entry: LogEntry): Promise<void> {
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

  private async sendBatchEntries(entries: LogEntry[]): Promise<void> {
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

  private createBatchSummary(entries: LogEntry[]) {
    const levelCounts: Record<string, number> = {};

    entries.forEach(entry => {
      levelCounts[entry.level] = (levelCounts[entry.level] || 0) + 1;
    });

    const levelCountsStr = Object.entries(levelCounts)
      .map(([level, count]) => `${this.levelEmojis[level as LogLevel]} ${level}: ${count}`)
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

  private getHighestSeverityColor(entries: LogEntry[]): string {
    let highestLevel: LogLevel = 'debug';

    for (const entry of entries) {
      if (this.levelPriority[entry.level] > this.levelPriority[highestLevel]) {
        highestLevel = entry.level;
      }
    }

    return this.levelColors[highestLevel];
  }

  private async sendToSlack(payload: any): Promise<void> {
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

  async close(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    await this.flush();
  }
}