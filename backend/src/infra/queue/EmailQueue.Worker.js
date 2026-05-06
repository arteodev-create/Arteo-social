const Logger = require('../logging/Logger.Service');
const Queue = require('./Queue.Service');
const EmailService = require('../email/Email.Service');

class EmailQueueWorker {
    constructor() {
        this.queueName = 'email';
        this.pollIntervalMs = Number(process.env.EMAIL_QUEUE_POLL_MS || 1000);
        this.batchSize = Number(process.env.EMAIL_QUEUE_BATCH_SIZE || 10);
        this.timer = null;
        this.running = false;
    }

    async processJob(job) {
        if (!job || !job.payload) return;

        const { type, data } = job.payload;
        if (type === 'verification') {
            await EmailService.sendVerificationEmail(data.to, data.otp, data.language);
            return;
        }

        if (type === 'password_reset') {
            await EmailService.sendPasswordResetEmail(data.to, data.token, data.language);
            return;
        }

        throw new Error(`Unknown email job type: ${type}`);
    }

    async handleJob(job) {
        try {
            await this.processJob(job);
        } catch (error) {
            const maxAttempts = Number(job.maxAttempts || process.env.QUEUE_MAX_ATTEMPTS || 3);
            const attempts = Number(job.attempts || 0) + 1;

            if (attempts < maxAttempts) {
                await Queue.requeue(job, { queue: this.queueName, error: error.message });
                Logger.warn('Email job requeued', { jobId: job.id, attempts, maxAttempts, error: error.message });
                return;
            }

            await Queue.moveToDeadLetter({ ...job, attempts }, { queue: this.queueName, error: error.message });
            Logger.error('Email job moved to dead-letter queue', {
                jobId: job.id,
                attempts,
                maxAttempts,
                error: error.message
            });
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
        } catch (error) {
            Logger.error('Email queue worker tick failed', { error: error.message });
        } finally {
            this.running = false;
        }
    }

    start() {
        if (this.timer) return;
        Logger.info('Email queue worker started', {
            queue: this.queueName,
            pollIntervalMs: this.pollIntervalMs,
            batchSize: this.batchSize
        });

        this.timer = setInterval(() => {
            this.tick().catch((error) => {
                Logger.error('Email queue worker fatal tick error', { error: error.message });
            });
        }, this.pollIntervalMs);

        this.timer.unref();
    }

    stop() {
        if (!this.timer) return;
        clearInterval(this.timer);
        this.timer = null;
        Logger.info('Email queue worker stopped');
    }
}

module.exports = new EmailQueueWorker();