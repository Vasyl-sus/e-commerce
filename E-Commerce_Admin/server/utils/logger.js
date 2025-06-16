const { createLogger, format, transports } = require('winston');
const { combine, timestamp, colorize, printf } = format;
const path = require('path');
const moment = require('moment-timezone');

const timezone = "Europe/Ljubljana";

fDate = (date, tz) => {
    return moment.tz(new Date(date).toISOString(), tz.toString()).format('YYYY-MM-DD HH:mm:ss.SSS');
}

const consoleLogFormat = combine(
    colorize(),
    timestamp(),
    printf((info) => {
        return `${fDate(info.timestamp, timezone)} - ${info.level}: ${info.message}`;
    })
);

const fileLogFormat = combine(
    timestamp(),
    printf((info) => {
        return `${fDate(info.timestamp, timezone)} - ${info.level}: ${info.message}`;
    })
);

const logger = createLogger({
    transports: [
        new transports.Console({ format: consoleLogFormat, level: 'debug'}),
        new transports.File({ format: fileLogFormat, filename: path.join(__dirname, '../server.log'), level: 'info' }),
        new transports.File({ format: fileLogFormat, filename: path.join(__dirname, '../server-error.log'), level: 'error' })
    ]
});

module.exports = logger;