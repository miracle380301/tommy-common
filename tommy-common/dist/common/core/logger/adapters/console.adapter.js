"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleLoggerAdapter = void 0;
class ConsoleLoggerAdapter {
    constructor() {
        this.colors = {
            debug: '\x1b[36m', // Cyan
            info: '\x1b[32m', // Green
            warn: '\x1b[33m', // Yellow
            error: '\x1b[31m', // Red
            fatal: '\x1b[35m', // Magenta
            reset: '\x1b[0m'
        };
    }
    log(entry) {
        const color = this.colors[entry.level];
        const timestamp = entry.timestamp.toISOString();
        const level = entry.level.toUpperCase().padEnd(5);
        const message = `${color}[${timestamp}] ${level} ${this.colors.reset}${entry.message}`;
        if (entry.level === 'error' || entry.level === 'fatal') {
            console.error(message, entry.context || '');
            if (entry.error) {
                console.error(entry.error);
            }
        }
        else if (entry.level === 'warn') {
            console.warn(message, entry.context || '');
        }
        else {
            console.log(message, entry.context || '');
        }
    }
}
exports.ConsoleLoggerAdapter = ConsoleLoggerAdapter;
