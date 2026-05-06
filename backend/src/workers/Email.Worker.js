require('dotenv').config();

const Logger = require('../infra/logging/Logger.Service');
const EmailQueueWorker = require('../infra/queue/EmailQueue.Worker');

Logger.info('Starting standalone email worker process...');
EmailQueueWorker.start();

const shutdown = (signal) => {
    Logger.warn(`Worker received ${signal}. Shutting down...`);
    EmailQueueWorker.stop();
    process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (err) => {
    Logger.error('Worker unhandled rejection', { error: err?.message, stack: err?.stack });
});
process.on('uncaughtException', (err) => {
    Logger.error('Worker uncaught exception', { error: err?.message, stack: err?.stack });
    process.exit(1);
});