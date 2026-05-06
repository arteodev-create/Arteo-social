/**
 * PLATFORM CONSTANTS
 * Centralized registry for all Arteo platform domain identifiers, flags, and TTLs.
 * Standardized for ABS v14.1 Platinum.
 */

const POST_TYPES = {
    POST: 'POST',
    QUOTE: 'QUOTE',
    COMMENT: 'COMMENT',
    THREAD: 'THREAD'
};

const POST_STATUS = {
    PUBLISHED: 'PUBLISHED',
    DELETED: 'DELETED',
    HIDDEN: 'HIDDEN'
};

const MEDIA_TYPES = {
    IMAGE: 'IMAGE',
    VIDEO: 'VIDEO',
    GIF: 'GIF'
};

const VISIBILITY = {
    PUBLIC: 'PUBLIC',
    FOLLOWERS: 'FOLLOWERS',
    PRIVATE: 'PRIVATE'
};

const CACHE_TTL = {
    FEED: 300,        // 5 minutes
    PROFILE: 600,     // 10 minutes
    REPUTATION: 3600, // 1 hour
    IDENTIFICATION: 1800 // 30 minutes
};

const BOT_PROTECTION = {
    INTERACTION_LIMIT_RPM: 30,
    LOCKDOWN_WINDOW_SEC: 1800,
    MAX_AUTH_ATTEMPTS: 10
};

const ALGORITHM_CONSTANTS = {
    TIME_UNIT_MS: 3_600_000, // 1 hour
    FRESHNESS_BASELINE_HOURS: 168, // 1 week
    WEIGHTS: {
        LIKE: 1.0,
        REPOST: 2.0,
        REPLY: 1.5,
        QUOTE: 1.5
    },
    DEFAULT_PIPELINE: {
        FRESHNESS_WEIGHT: 1.2,
        REGIONAL_WEIGHT: 1.5,
        INTERACTIONS_WEIGHT: 1.0,
        BASE_REPOST_BOOST: 2.5,
        BASE_QUOTE_BOOST: 2.0,
        BASE_THREAD_BOOST: 3.0
    }
};

const EPHEMERAL_POST_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

module.exports = {
    POST_TYPES,
    POST_STATUS,
    MEDIA_TYPES,
    VISIBILITY,
    CACHE_TTL,
    BOT_PROTECTION,
    ALGORITHM_CONSTANTS,
    EPHEMERAL_POST_TTL
};
