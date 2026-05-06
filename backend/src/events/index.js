const EventEmitter = require('events');
const Logger = require('../infra/logging/Logger.Service');

/**
 * AppEventEmitter
 * High-fidelity platform signal bus for the Arteo ecosystem.
 * Orchestrates cross-domain events with enhanced observability.
 * Standardized for Platinum Architectural Purity (ABS v14.1) in Phase 115.
 */
class AppEventEmitter extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(100);
        this.EVENTS = {
            POST: {
                CREATED: 'postCreated',
                LIKED: 'postLiked',
                UNLIKED: 'postUnliked',
                COMMENTED: 'postCommented',
                REPOSTED: 'postReposted',
                BOOKMARKED: 'postBookmarked',
                REACTION_ADDED: 'postReactionAdded',
                DELETED: 'postDeleted'
            },
            USER: {
                REGISTERED: 'identityRegistered',
                FOLLOWED: 'identityFollowed',
                UNFOLLOWED: 'identityUnfollowed',
                PROFILE_UPDATED: 'identityProfileUpdated',
                MIGRATED: 'identityMigrated'
            },
            POLL: {
                UPDATED: 'pollUpdated'
            },
            SOCKET: {
                // Tín hiệu đồng bộ tối thiểu (nếu có)
                INBOUND: {
                    JOIN_POST: 'joinPost',
                    LEAVE_POST: 'leavePost'
                }
            }
        };
    }

    /**
     * Unified publish method (Terminology bridge).
     */
    publish(eventName, payload) {
        this.emit(eventName, payload);
    }

    /**
     * Unified subscribe method (Terminology bridge).
     */
    subscribe(eventName, handler) {
        this.on(eventName, async (payload) => {
            try {
                await handler(payload);
            } catch (err) {
                Logger.error(`[EventHub] Error in subscriber for "${eventName}":`, err);
            }
        });
    }
}

const eventHub = new AppEventEmitter();

module.exports = {
    eventEmitter: eventHub, // Backward compatibility
    eventHub,               // Modern designation
    EVENTS: eventHub.EVENTS
};

// Orchestrate Listeners Lifecycle
require('./Socket.Listeners');
