const cron = require('node-cron');
const Logger = require('../../infra/logging/Logger.Service');
const PostRepository = require('../../modules/post/Post.Repository');

/**
 * CronService
 * Orchestrates the Arteo Platform Automation (APA) layer.
 * Manages background task scheduling, lifecycle, and graceful termination.
 * Standardized for Phase 25 (Autonomous Infrastructure Maintenance).
 */
class CronService {
    constructor() {
        this.jobs = [];
    }

    /**
     * Initializes and schedules all platform background tasks.
     */
    startAll() {
        Logger.info('⏰ Cron: Initializing Arteo Platform Automation (APA)...');

        // Job 1: Prune Expired Ephemeral Posts (Every 6 hours)
        const prunePostsJob = cron.schedule('0 */6 * * *', async () => {
            await this._pruneEphemeralPosts();
        });
        
        // Job 2: Prune Expired Sessions & Login Logs (Daily at 03:00 AM)
        const pruneSessionsJob = cron.schedule('0 3 * * *', async () => {
            await this._pruneExpiredSessions();
        });

        this.jobs.push(prunePostsJob, pruneSessionsJob);

        Logger.info(`✅ Cron: APA lifecycle successfully scheduled with ${this.jobs.length} active sequences.`);
    }

    /**
     * Internal: Hardware-level pruning sequence for expired content.
     */
    async _pruneEphemeralPosts() {
        try {
            Logger.info('[CronService:Pruning] Commencing ephemeral content maintenance...');
            const result = await PostRepository.pruneExpired();
            Logger.info(`[CronService:Pruning] Successfully purged ${result.count} expired entities.`);
        } catch (error) {
            Logger.error('[CronService:Pruning] Failed to execute maintenance sequence:', error.message);
        }
    }

    /**
     * Internal: Hardware-level pruning sequence for expired sessions.
     */
    async _pruneExpiredSessions() {
        try {
            Logger.info('[CronService:Pruning] Commencing session domain maintenance...');
            const IdentificationRepository = require('../../modules/identity/Identification.Repository');
            const result = await IdentificationRepository.pruneExpiredSessions(30); // Keep 30 days
            Logger.info(`[CronService:Pruning] Successfully purged ${result.count} inactive session entities.`);
        } catch (error) {
            Logger.error('[CronService:Pruning] Failed to execute session domain maintenance:', error.message);
        }
    }

    /**
     * Terminates all active background tasks gracefully.
     */
    stopAll() {
        if (this.jobs.length === 0) return;
        Logger.warn(`⏰ Cron: Commencing termination of ${this.jobs.length} APA sequences.`);
        this.jobs.forEach(job => job.stop());
        this.jobs = [];
        Logger.info('✅ Cron: APA termination sequence complete.');
    }
}

module.exports = new CronService();
