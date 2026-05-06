require('dotenv').config();
const http = require('http');

const app = require('./src/app/App');
const Logger = require('./src/infra/logging/Logger.Service');
const { config, prisma } = require('./src/config');
const EmailQueueWorker = require('./src/infra/queue/EmailQueue.Worker');
const PostService = require('./src/modules/post/Post.Service');

const port = config.infra.port || 5000;
const server = http.createServer(app);

const warmupRuntime = async () => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        await PostService.getFeed(null, { page: 1, limit: 20 });
        Logger.info('Runtime warmup completed.');
    } catch (error) {
        Logger.warn('Runtime warmup skipped.', { error: error.message });
    }
};

const shutdown = (signal) => {
    Logger.warn(`Received ${signal}. Starting graceful shutdown...`);
    EmailQueueWorker.stop();

    server.close(() => {
        Logger.info('HTTP server stopped.');
        process.exit(0);
    });

    setTimeout(() => {
        Logger.error('Force exiting after shutdown timeout.');
        process.exit(1);
    }, 10000).unref();
};

server.listen(port, '0.0.0.0', () => {
    Logger.info(`Arteo backend listening on port ${port}`, {
        node: config.infra.nodeName,
        env: config.infra.env,
        version: config.infra.appVersion
    });

    if (process.env.EMAIL_QUEUE_WORKER !== 'false') {
        EmailQueueWorker.start();
    }

    warmupRuntime();
});

process.on('unhandledRejection', (err) => {
    Logger.error('Unhandled rejection. Shutting down.', {
        error: err?.message,
        stack: err?.stack
    });
    shutdown('unhandledRejection');
});

process.on('uncaughtException', (err) => {
    Logger.error('Uncaught exception. Shutting down.', {
        error: err?.message,
        stack: err?.stack
    });
    process.exit(1);
});

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
