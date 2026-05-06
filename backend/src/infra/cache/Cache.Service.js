const Logger = require('../logging/Logger.Service');
const { redis } = require('../../config');

/**
 * Cache Infrastructure Service
 * Orchestrates high-performance data persistence and volatility management via Redis.
 */
class CacheService {
    constructor() {
        this.DEFAULT_TTL = 300; // 5 minutes (Standard discovery TTL)
    }

    async get(key) {
        try {
            const data = await redis.get(key);
            if (!data) return null;
            return JSON.parse(data);
        } catch (error) {
            Logger.error(`[CacheService] Redis Get failure:`, error.message);
            return null;
        }
    }

    async set(key, value, ttl = this.DEFAULT_TTL) {
        try {
            const data = JSON.stringify(value);
            if (process.env.UPSTASH_REDIS_REST_URL) {
                await redis.set(key, data, { ex: ttl });
            } else {
                await redis.set(key, data, 'EX', ttl);
            }
            return true;
        } catch (error) {
            Logger.error(`[CacheService] Redis Set failure:`, error.message);
            return false;
        }
    }

    async del(key) {
        try {
            await redis.del(key);
            return true;
        } catch (error) {
            Logger.error(`[CacheService] Redis Delete failure:`, error.message);
            return false;
        }
    }

    generateFeedKey(userId, options) {
        const parts = [
            `user:${userId || 'guest'}`,
            `algo:${options.algorithmId || 'default'}`,
            `scope:${options.scope || 'discovery'}`,
            `page:${options.page}`,
            `limit:${options.limit}`
        ];
        return `feed:${parts.join(':')}`;
    }

    /**
     * Behavioral Telemetry: Tracks interaction frequency for bot detection.
     * Window: 60 seconds (1 minute).
     */
    async trackInteractionFrequency(userId) {
        if (!userId) return 0;
        const key = `ratelimit:interactions:${userId}`;
        try {
            const count = await redis.incr(key);
            if (count === 1) {
                // Initialize expiry for the new window
                await redis.expire(key, 60);
            }
            return count;
        } catch (error) {
            Logger.error(`[CacheService] Interaction tracking failed for ${userId}:`, error.message);
            return 0; // Fail-safe: allow interaction if tracking fails
        }
    }

    async invalidateFeedPatterns(userId) {
        try {
            // Invalidate both algorithmic feed and user profile posts cache
            const feedPattern = `feed:user:${userId}:*`;
            const profilePattern = `posts:user:${userId}:*`;
            
            await Promise.all([
                this._clearByPattern(feedPattern),
                this._clearByPattern(profilePattern)
            ]);
            
            return true;
        } catch (error) {
            Logger.error(`[CacheService] Invalidation failure for ${userId}:`, error.message);
            return false;
        }
    }

    /**
     * Post-specific Invalidation: Clears cache for a single post object.
     */
    async invalidatePostCache(postId) {
        try {
            // ABS v14.1 Platinum: Invalidate all user-specific detailed caches for this post
            const pattern = `post:${postId}:*`;
            await Promise.all([
                this.del(`post:${postId}`), // Clear legacy simple key if exists
                this._clearByPattern(pattern) // Clear all post:uuid:userId patterns
            ]);
            return true;
        } catch (error) {
            Logger.error(`[CacheService] Post invalidation failure for ${postId}:`, error.message);
            return false;
        }
    }

    /**
     * Discovery Invalidation: Clears all cached global/discovery feeds.
     * Essential for real-time synchronization when new content is established.
     */
    async invalidateDiscoveryCache() {
        try {
            const matchPattern = `feed:*:scope:discovery:*`;
            return await this._clearByPattern(matchPattern);
        } catch (error) {
            Logger.error(`[CacheService] Global discovery invalidation failure:`, error.message);
            return false;
        }
    }

    /**
     * Identity Invalidation: Clears all identity-related caches for a user.
     * Essential for real-time profile updates and security status changes.
     */
    async invalidateIdentityCache(userId, username) {
        try {
            const patterns = [
                `user:profile:${userId}:*`,
                `id:check:${userId}:*`,
            ];
            
            if (username) {
                patterns.push(`id:check:${username}:*`);
            }
            
            await Promise.all(patterns.map(p => this._clearByPattern(p)));
            await this.del(`user:profile:${userId}`); // Clear exact legacy key
            
            return true;
        } catch (error) {
            Logger.error(`[CacheService] Identity invalidation failure for ${userId}:`, error.message);
            return false;
        }
    }

    /**
     * Internal: Unified pattern-based key removal with Promise-based stream handling.
     */
    async _clearByPattern(matchPattern) {
        if (!matchPattern) return false;
        // Clean up redundant colons at the end of the pattern
        const cleanPattern = matchPattern.replace(/:+$/, '').replace(/\*+$/, '') + '*';
        
        try {
            // Trường hợp chạy Mock Redis (In-Memory)
            if (redis._isMock || typeof redis.scan !== 'function') {
                return new Promise((resolve) => {
                    const stream = redis.scanStream({ match: cleanPattern });
                    stream.on('data', async (keys) => {
                        if (keys.length) await redis.del(...keys);
                    });
                    stream.on('end', () => resolve(true));
                    stream.on('error', (err) => {
                        Logger.warn(`[CacheService:Mock] Pattern sweep failed: ${err.message}`);
                        resolve(false);
                    });
                });
            }

            // Trường hợp chạy Redis Client thật (IORedis/Upstash)
            let cursor = '0';
            do {
                const result = await redis.scan(cursor, 'MATCH', cleanPattern, 'COUNT', 100);
                cursor = result[0];
                const keys = result[1];
                
                if (keys && keys.length > 0) {
                    await redis.del(...keys);
                }
            } while (cursor !== '0');
            
            return true;
        } catch (error) {
            Logger.error(`[CacheService] Pattern clear failure for ${cleanPattern}:`, error.message);
            return false;
        }
    }
}

module.exports = new CacheService();
