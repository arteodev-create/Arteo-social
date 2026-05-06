const Logger = require('../infra/logging/Logger.Service');
const { PrismaClient } = require('@prisma/client');
const config = require('./Registry');

/**
 * Prisma Client Orchestrator: Singleton data access client for Arteo.
 */
class PrismaClientOrchestrator {
    constructor() {
        this.client = new PrismaClient({
            datasources: {
                db: {
                    url: config.db.url
                }
            },
            log: process.env.PRISMA_QUERY_LOG === 'true'
                ? ['query', 'info', 'warn', 'error']
                : ['warn', 'error'],
            errorFormat: 'minimal',
        });

        this._setupDiagnostics();
    }


    _setupDiagnostics() {
        // Native Node.js Handlers for graceful exit
        const cleanup = async () => {
            Logger.info('📦 Prisma Client: Finalizing data connections (Graceful Shutdown).');
            await this.client.$disconnect();
            process.exit(0);
        };

        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);
    }

    getInstance() {
        return this.client;
    }
}

module.exports = new PrismaClientOrchestrator().getInstance();


