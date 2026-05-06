const SystemRepository = require('./System.Repository');
const { redis } = require('../../config');
const QueueService = require('../queue/Queue.Service');

class HealthService {
    constructor() {
        this.READINESS_TIMEOUT_MS = 5000;
        this.READINESS_CACHE_TTL_MS = 30000;
        this.readinessCache = { expiresAt: 0, value: null };
        this.metrics = {
            totalChecks: 0,
            cacheHits: 0,
            cacheMisses: 0,
            lastDurationMs: null,
            lastStatus: 'UNKNOWN',
            lastObservedAt: null
        };
    }

    async _withTimeout(promise, ms) {
        const timeout = new Promise((_, reject) => {
            const id = setTimeout(() => {
                clearTimeout(id);
                reject(new Error('Operation timed out'));
            }, ms);
        });
        return Promise.race([promise, timeout]);
    }

    async checkDatabase() {
        try {
            return await this._withTimeout(
                SystemRepository.pingDatabase().then(() => true).catch(() => false),
                this.READINESS_TIMEOUT_MS
            );
        } catch (error) {
            return false;
        }
    }

    async checkRedis() {
        try {
            return await this._withTimeout(
                (async () => {
                    if (typeof redis.ping === 'function') await redis.ping();
                    return true;
                })().catch(() => false),
                this.READINESS_TIMEOUT_MS
            );
        } catch (error) {
            return false;
        }
    }

    async getQueueMetrics() {
        const queues = ['email', 'notification', 'feed'];
        const output = {};

        await Promise.all(queues.map(async (queueName) => {
            const [size, deadLetter] = await Promise.all([
                QueueService.size(queueName),
                QueueService.deadLetterSize(queueName)
            ]);

            output[queueName] = { size, deadLetter };
        }));

        return output;
    }

    async getReadinessChecks() {
        const now = Date.now();
        if (this.readinessCache.value && this.readinessCache.expiresAt > now) {
            this.metrics.totalChecks += 1;
            this.metrics.cacheHits += 1;
            return { ...this.readinessCache.value, source: 'CACHE' };
        }

        const startedAt = Date.now();
        this.metrics.totalChecks += 1;
        this.metrics.cacheMisses += 1;

        const [db, cache] = await Promise.all([this.checkDatabase(), this.checkRedis()]);

        const computed = {
            db,
            redis: cache,
            observedAt: new Date().toISOString(),
            source: 'LIVE'
        };

        this.readinessCache = { value: computed, expiresAt: now + this.READINESS_CACHE_TTL_MS };
        this.metrics.lastDurationMs = Date.now() - startedAt;
        this.metrics.lastStatus = db && cache ? 'READY' : 'NOT_READY';
        this.metrics.lastObservedAt = computed.observedAt;

        return computed;
    }

    resetMetrics() {
        this.readinessCache = { expiresAt: 0, value: null };
        this.metrics = {
            totalChecks: 0,
            cacheHits: 0,
            cacheMisses: 0,
            lastDurationMs: null,
            lastStatus: 'UNKNOWN',
            lastObservedAt: null
        };
    }

    getMetrics() {
        return {
            ...this.metrics,
            cacheHitRatio: this.metrics.totalChecks > 0
                ? Number((this.metrics.cacheHits / this.metrics.totalChecks).toFixed(4))
                : 0
        };
    }
}

module.exports = new HealthService();