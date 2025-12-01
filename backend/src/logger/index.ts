/**
 * Logging System
 * Winston-based structured logging
 */

import winston from 'winston';
import { config } from '../config';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
  })
);

export const logger = winston.createLogger({
  level: config.logging.level,
  format: config.nodeEnv === 'production' ? logFormat : consoleFormat,
  defaultMeta: { service: 'reading-trainer-api' },
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error'],
    }),
    // Add file transports for production
    ...(config.nodeEnv === 'production'
      ? [
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
          }),
          new winston.transports.File({
            filename: 'logs/combined.log',
          }),
        ]
      : []),
  ],
});

// Handle uncaught exceptions and unhandled rejections
if (config.nodeEnv === 'production') {
  logger.exceptions.handle(
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  );
  logger.rejections.handle(
    new winston.transports.File({ filename: 'logs/rejections.log' })
  );
}

