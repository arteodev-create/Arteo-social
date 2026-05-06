const Queue = require('./Queue.Service');

class DomainQueueService {
    async enqueueNotification(payload, options = {}) {
        return Queue.enqueue({ type: 'notification', data: payload }, {
            queue: options.queue || 'notification',
            maxAttempts: options.maxAttempts
        });
    }

    async enqueueNotifyUser(userId, event, payload = {}, options = {}) {
        return this.enqueueNotification({ targetType: 'user', userId, event, payload }, options);
    }

    async enqueueNotifyAdmins(event, payload = {}, options = {}) {
        return this.enqueueNotification({ targetType: 'admins', event, payload }, options);
    }

    async enqueueNotifyAll(event, payload = {}, options = {}) {
        return this.enqueueNotification({ targetType: 'all', event, payload }, options);
    }

    async enqueueFeedFanout(payload, options = {}) {
        return Queue.enqueue({ type: 'feed_fanout', data: payload }, {
            queue: options.queue || 'feed',
            maxAttempts: options.maxAttempts
        });
    }

    async enqueueInvalidateUserFeed(userId, options = {}) {
        return this.enqueueFeedFanout({ action: 'invalidate_user_feed', userId }, options);
    }

    async enqueueInvalidateDiscoveryFeed(options = {}) {
        return this.enqueueFeedFanout({ action: 'invalidate_discovery_feed' }, options);
    }

    async enqueueInvalidatePostCache(postId, options = {}) {
        return this.enqueueFeedFanout({ action: 'invalidate_post_cache', postId }, options);
    }
}

module.exports = new DomainQueueService();