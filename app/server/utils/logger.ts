import winston from "winston";
import { format } from "winston";
import 'winston-daily-rotate-file';

const logDir = true ? '/tmp/logs' : 'logs';

const customFormat = format.printf(({ timestamp, level, message, shop }) => {
    return `${timestamp} [${level}]: shop:[${shop}] ${message}`;
});

const transports: winston.transport[] = [];

if (false) {
    // Use console logging in Vercel to avoid file system issues
    transports.push(new winston.transports.Console());
} else {
    // Local file logging
    const fileRotateTransport = new winston.transports.DailyRotateFile({
        filename: `${logDir}/DonateMe-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d'
    });

    transports.push(fileRotateTransport);
}

export const logger = winston.createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        customFormat
    ),
    transports,
    exceptionHandlers: isVercel
        ? [new winston.transports.Console()]
        : [new winston.transports.File({ filename: `${logDir}/exceptions.log`, level: 'error' })],
});
