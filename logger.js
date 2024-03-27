const winston = require("winston");
const runningLocally = (process.env.ENVIRONMENT === "Local")

// Configure transports based on environment
const transports = [];

if (runningLocally) {
    // Local environment: Log to files
    transports.push(new winston.transports.DailyRotateFile({
        filename: 'logs/application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d'
    }));
} else {
    // Netlify environment: Log to console
    transports.push(new winston.transports.Console());
}

// Initialize Winston logger for secure logging and use dynamic transports
const logger = winston.createLogger({
    level: 'info', // Default logging level
    format: winston.format.combine(winston.format.timestamp(), winston.format.printf(info => `${info.timestamp} - ${info.level}: ${info.message}`)),
    transports: transports,
    exceptionHandlers: runningLocally ? [new winston.transports.File({filename: 'logs/exceptions.log'})] : [new winston.transports.Console()],
    rejectionHandlers: runningLocally ? [new winston.transports.File({filename: 'logs/rejections.log'})] : [new winston.transports.Console()]
});

module.exports = logger;