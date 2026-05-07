const Logger = require('../logging/Logger.Service');
const { redis } = require('../../config/Providers');

class QueueService {
    constructor() {
        this.defaultQueue = 'default';
    }

    queueKey(name = this.defaultQueue) {
        return `queue:${name}`;
    }

    deadLetterKey(name = this.defaultQueue) {
        return `queue:${name}:dead`;
    }

    async _pushLeft(key, serialized) {
        if (typeof redis.lpush === 'function') {
            await redis.lpush(key, serialized);
            return;
        }

        const current = await redis.get(key);
        const list = current ? JSON.parse(current) : [];
        list.unshift(serialized);
        await redis.set(key, JSON.stringify(list));
    }

    async _popRight(key) {
        if (typeof redis.rpop === 'function') {
            return redis.rpop(key);
        }

        const current = await redis.get(key);
        const list = current ? JSON.parse(current) : [];
        const serialized = list.pop();
        await redis.set(key, JSON.stringify(list));
        return serialized || null;
    }

    async enqueue(payload, options = {}) {
        const queueName = options.queue || this.defaultQueue;
        const key = this.queueKey(queueName);
        const job = {
            id: `job-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
            queue: queueName,
            createdAt: new Date().toISOString(),
            attempts: 0,
            maxAttempts: Number(options.maxAttempts || process.env.QUEUE_MAX_ATTEMPTS || 3),
            payload
        };

        try {
            await this._pushLeft(key, JSON.stringify(job));
            return job;
        } catch (error) {
            Logger.error('Queue enqueue failed', { queue: queueName, error: error.message });
            throw error;
        }
    }

    async dequeue(queueName = this.defaultQueue) {
        const key = this.queueKey(queueName);

        try {
            const serialized = await this._popRight(key);
            if (!serialized) return null;
            return JSON.parse(serialized);
        } catch (error) {
            Logger.error('Queue dequeue failed', { queue: queueName, error: error.message });
            return null;
        }
    }

    async requeue(job, options = {}) {
        const queueName = options.queue || job.queue || this.defaultQueue;
        const key = this.queueKey(queueName);
        const nextJob = {
            ...job,
            attempts: Number(job.attempts || 0) + 1,
            lastError: options.error || null,
            updatedAt: new Date().toISOString()
        };

        await this._pushLeft(key, JSON.stringify(nextJob));
        return nextJob;
    }

    async moveToDeadLetter(job, options = {}) {
        const queueName = options.queue || job.queue || this.defaultQueue;
        const key = this.deadLetterKey(queueName);
        const deadJob = {
            ...job,
            deadLetteredAt: new Date().toISOString(),
            lastError: options.error || job.lastError || null
        };

        await this._pushLeft(key, JSON.stringify(deadJob));
        return deadJob;
    }

    async size(queueName = this.defaultQueue) {
        const key = this.queueKey(queueName);

        try {
            if (typeof redis.llen === 'function') {
                return Number(await redis.llen(key));
            }

            const current = await redis.get(key);
            const list = current ? JSON.parse(current) : [];
            return list.length;
        } catch (error) {
            Logger.warn('Queue size check failed', { queue: queueName, error: error.message });
            return 0;
        }
    }

    async deadLetterSize(queueName = this.defaultQueue) {
        const key = this.deadLetterKey(queueName);

        try {
            if (typeof redis.llen === 'function') {
                return Number(await redis.llen(key));
            }

            const current = await redis.get(key);
            const list = current ? JSON.parse(current) : [];
            return list.length;
        } catch (error) {
            Logger.warn('Dead letter size check failed', { queue: queueName, error: error.message });
            return 0;
        }
    }
}

module.exports = new QueueService();
