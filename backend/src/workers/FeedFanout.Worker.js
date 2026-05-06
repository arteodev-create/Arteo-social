require('dotenv').config();

const Logger = require('../infra/logging/Logger.Service');
const Queue = require('../infra/queue/Queue.Service');
const CacheService = require('../infra/cache/Cache.Service');

class FeedFanoutWorker {
    constructor() {
        this.queueName = 'feed';
        this.pollIntervalMs = Number(process.env.FEED_QUEUE_POLL_MS || 1000);
        this.batchSize = Number(process.env.FEED_QUEUE_BATCH_SIZE || 20);
        this.timer = null;
        this.running = false;
    }

    async processJob(job) {
        const { data = {}, type } = job.payload || {};
        const action = data.action || type || 'feed_fanout';

        if (action === 'invalidate_user_feed') {
            if (!data.userId) throw new Error('Feed job missing userId');
            await CacheService.invalidateFeedPatterns(data.userId);
            return;
        }

        if (action === 'invalidate_discovery_feed') {
            await CacheService.invalidateDiscoveryCache();
            return;
        }

        if (action === 'invalidate_post_cache') {
            if (!data.postId) throw new Error('Feed job missing postId');
            await CacheService.invalidatePostCache(data.postId);
            return;
        }

        throw new Error(`Unknown feed job action: ${action}`);
    }

    async handleJob(job) {
        try {
            await this.processJob(job);
        } catch (error) {
            const maxAttempts = Number(job.maxAttempts || process.env.QUEUE_MAX_ATTEMPTS || 3);
            const attempts = Number(job.attempts || 0) + 1;
            if (attempts < maxAttempts) {
                await Queue.requeue(job, { queue: this.queueName, error: error.message });
                return;
            }
            await Queue.moveToDeadLetter({ ...job, attempts }, { queue: this.queueName, error: error.message });
            Logger.error('Feed job moved to dead-letter queue', { jobId: job.id, error: error.message });
        }
    }

    async tick() {
        if (this.running) return;
        this.running = true;
        try {
            for (let i = 0; i < this.batchSize; i += 1) {
                const job = await Queue.dequeue(this.queueName);
                if (!job) break;
                await this.handleJob(job);
            }
        } finally {
            this.running = false;
        }
    }

    start() {
        if (this.timer) return;
        Logger.info('Feed fanout worker started', { queue: this.queueName });
        this.timer = setInterval(() => this.tick().catch((error) => Logger.error('Feed fanout worker tick failed', { error: error.message })), this.pollIntervalMs);
        this.timer.unref();
    }

    stop() {
        if (!this.timer) return;
        clearInterval(this.timer);
        this.timer = null;
    }
}

module.exports = new FeedFanoutWorker();