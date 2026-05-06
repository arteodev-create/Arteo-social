require('dotenv').config();

const Logger = require('../infra/logging/Logger.Service');
const Queue = require('../infra/queue/Queue.Service');
const SocketService = require('../infra/socket/Socket.Service');

class NotificationWorker {
    constructor() {
        this.queueName = 'notification';
        this.pollIntervalMs = Number(process.env.NOTIFICATION_QUEUE_POLL_MS || 1000);
        this.batchSize = Number(process.env.NOTIFICATION_QUEUE_BATCH_SIZE || 20);
        this.timer = null;
        this.running = false;
    }

    async processJob(job) {
        const { data = {} } = job.payload || {};
        const event = data.event || 'notification';
        const payload = data.payload || data;
        const targetType = data.targetType || 'user';

        if (targetType === 'admins') {
            SocketService.emitToAdmins(event, payload);
            return;
        }

        if (targetType === 'all') {
            SocketService.emitToAll(event, payload);
            return;
        }

        if (!data.userId) {
            throw new Error('Notification job missing userId for user target');
        }

        SocketService.emitToUser(data.userId, event, payload);
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
            Logger.error('Notification job moved to dead-letter queue', { jobId: job.id, error: error.message });
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
        Logger.info('Notification worker started', { queue: this.queueName });
        this.timer = setInterval(() => this.tick().catch((error) => Logger.error('Notification worker tick failed', { error: error.message })), this.pollIntervalMs);
        this.timer.unref();
    }

    stop() {
        if (!this.timer) return;
        clearInterval(this.timer);
        this.timer = null;
    }
}

module.exports = new NotificationWorker();