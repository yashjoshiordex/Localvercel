import winston from "winston";
import { format } from 'winston';
import 'winston-daily-rotate-file';

const isProdOnVercel = process.env.VERCEL === '1';
const isLocal = !isProdOnVercel;

const logTransports: winston.transport[] = [];

const customFormat = format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;

}
);
// Log to file only in local/dev/CIAdd commentMore actions
if (isLocal) {
    const fileRotateTransport = new winston.transports.DailyRotateFile({
        filename: 'logs/DonateMe-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
    });
    logTransports.push(fileRotateTransport);
}

// Always log to console (stdout)
logTransports.push(new winston.transports.Console());

var transport = new (winston.transports.DailyRotateFile)({
    filename: '/tmp/logs/DonateMe-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
});


export const logger = winston.createLogger({
    level: 'info',
    format: format.combine(format.timestamp(), customFormat),
    transports: logTransports,
    exceptionHandlers: [
        new winston.transports.File({
            // Use /tmp for exception logs on Vercel
            filename: isProdOnVercel ? '/tmp/exceptions.log' : 'logs/exceptions.log',
            level: 'error',
        }),
    ],
});
