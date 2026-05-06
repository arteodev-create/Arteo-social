const winston = require('winston');

/**
 * LoggerService: Diagnostic engine for Arteo platform with Correlation ID support.
 */
class LoggerService {
    constructor() {
        // Late require to avoid circular dependency
        const TraceMiddleware = require('../../middleware/Trace');

        this.logger = winston.createLogger({
            level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.errors({ stack: true }),
                // Correlation Formatting
                winston.format((info) => {
                    const correlationId = TraceMiddleware.getCorrelationId();
                    if (correlationId) info.correlationId = correlationId;
                    return info;
                })(),
                winston.format.splat(),
                winston.format.json()
            ),
            defaultMeta: { service: 'arteo-backend' },
            transports: [
                new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
                new winston.transports.File({ filename: 'logs/combined.log' }),
            ],
        });

        // Console Output for Development
        if (process.env.NODE_ENV !== 'production') {
            this.logger.add(new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.printf(
                        ({ level, message, timestamp, stack, correlationId }) => {
                            const cid = correlationId ? ` [CID:${correlationId}]` : '';
                            if (stack) return `${timestamp}${cid} [${level}]: ${message}\n${stack}`;
                            return `${timestamp}${cid} [${level}]: ${message}`;
                        }
                    )
                )
            }));
        }
    }

    info(message, meta = {}) {
        this.logger.info(message, meta);
    }

    error(message, meta = {}) {
        this.logger.error(message, meta);
    }

    warn(message, meta = {}) {
        this.logger.warn(message, meta);
    }

    debug(message, meta = {}) {
        this.logger.debug(message, meta);
    }
}

module.exports = new LoggerService();
