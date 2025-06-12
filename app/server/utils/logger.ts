import winston from "winston";
import { format } from 'winston';
import 'winston-daily-rotate-file';

var transport = new (winston.transports.DailyRotateFile)({
    filename: '/tmp/logs/DonateMe-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
});

const customFormat = format.printf(({ timestamp, level, message, shop }) => {
    return `${timestamp} [${level}]: shop:[${shop}] ${message} `;
});

export const logger = winston.createLogger({
    format: format.combine(
        format.timestamp(),
        customFormat
    ),
    transports: [
        transport
    ],
    exceptionHandlers: [
        new winston.transports.File({
            filename: 'logs/exceptions.log',
            level: 'error'
        })
    ]
});