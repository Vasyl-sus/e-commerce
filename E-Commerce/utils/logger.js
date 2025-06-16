const { createLogger, format: winstonFormat, transports } = require('winston');
const { combine, timestamp, colorize, printf } = winstonFormat;
const path = require('path');

const consoleLogFormat = combine(
    colorize(),
    timestamp(),
    printf((info) => {
        return `${info.timestamp} - ${info.level}: ${info.message}`;
    })
);

const fileLogFormat = combine(
    timestamp(),
    printf((info) => {
        return `${info.timestamp} - ${info.level}: ${info.message}`;
    })
);

const logger = createLogger({
    transports: [
        new transports.Console({ format: consoleLogFormat }),
        new transports.File({ format: fileLogFormat, filename: path.join(__dirname, '../server.log'), level: 'info' }),
        new transports.File({ format: fileLogFormat, filename: path.join(__dirname, '../server-error.log'), level: 'error' })
    ]
});

module.exports = logger;
