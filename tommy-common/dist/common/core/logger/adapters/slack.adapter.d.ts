import { LoggerAdapter, LogEntry, LogLevel } from '../logger.interface';
export interface SlackLoggerConfig {
    webhookUrl: string;
    channel?: string;
    username?: string;
    iconEmoji?: string;
    minLevel?: LogLevel;
    includeContext?: boolean;
    bufferSize?: number;
    flushInterval?: number;
}
export declare class SlackLoggerAdapter implements LoggerAdapter {
    private config;
    private buffer;
    private flushTimer?;
    private readonly levelColors;
    private readonly levelEmojis;
    private readonly levelPriority;
    constructor(config: SlackLoggerConfig);
    private startFlushTimer;
    private shouldSendToSlack;
    log(entry: LogEntry): Promise<void>;
    flush(): Promise<void>;
    private sendSingleEntry;
    private sendBatchEntries;
    private createBatchSummary;
    private getHighestSeverityColor;
    private sendToSlack;
    close(): Promise<void>;
}
