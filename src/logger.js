import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import { name } from '../package.json';
import config from './config';

const logger = winston.createLogger({
  level: config.log.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  defaultMeta: {
    service: name,
    env: process.env.NODE_ENV
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.align(),
        winston.format.printf(info => (
          `${info.timestamp} ${info.level} [${info.scope || 'Server'}]: ${info.message}`
        ))
      )
    }),
    new DailyRotateFile({
      dirname: config.log.dir,
      filename: `${name}-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '7d'
    })
  ]
});

export default logger;
