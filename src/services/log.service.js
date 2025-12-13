import winston from 'winston';
import cfg from '../config/index.js';

const logFormat = winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});

const logger = winston.createLogger({
    level: cfg.LOG_LEVEL,
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
    ),
    transports: [
        // Console: Colorized
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), logFormat)
        }),
        // File: Error logs
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: winston.format.uncolorize()
        }),
        // File: All logs
        new winston.transports.File({
            filename: 'logs/combined.log',
            format: winston.format.uncolorize()
        })
    ]
});

export default logger;
