import type { Post } from '@entities/post/model';

/**
 * GlobalCacheManager: centralized cache management for Arteo posts.
 * Keeps feed, hot-event, and profile data synchronized across screens.
 */

const CACHE_KEY = 'arteo_global_posts_v1';
const MAX_CACHE_SIZE = 200; // Limit stored posts to avoid overflowing localStorage

interface GlobalCache {
    posts: Record<string, Post>;
    lastUpdated: number;
}

const getStoredCache = (): GlobalCache => {
    try {
        const stored = localStorage.getItem(CACHE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('Failed to parse global cache', e);
    }
    return { posts: {}, lastUpdated: Date.now() };
};

const saveCache = (cache: GlobalCache) => {
    try {
        // Keep the newest posts when the cache exceeds the maximum size.
        const postIds = Object.keys(cache.posts);
        if (postIds.length > MAX_CACHE_SIZE) {
            const sortedIds = postIds.slice(-MAX_CACHE_SIZE);
            const newPosts: Record<string, Post> = {};
            sortedIds.forEach(id => {
                newPosts[id] = cache.posts[id];
            });
            cache.posts = newPosts;
        }

        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
        console.warn('Failed to save global cache (storage full?)', e);
    }
};

const FEED_CACHE_KEY = 'arteo_feed_posts_cache';

export const cacheManager = {
    /**
     * Save the full feed post list in a dedicated cache, similar to hot events.
     */
    setFeedCache: (posts: Post[]) => {
        try {
            localStorage.setItem(FEED_CACHE_KEY, JSON.stringify(posts));
        } catch (e) {
            console.warn('Failed to save feed cache', e);
        }
    },

    /**
     * Read the saved feed post list.
     */
    getFeedCache: (): Post[] => {
        try {
            const stored = localStorage.getItem(FEED_CACHE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    },

    /**
     * Update or add posts in the shared cache using ID and UUID keys.
     */
    upsertPosts: (posts: Post[]) => {
        if (!posts || posts.length === 0) return;

        const cache = getStoredCache();
        posts.forEach(post => {
            if (post) {
                // Merge old and new data, preferring fresh values.
                const data = {
                    ...(cache.posts[post.uuid || ''] || {}),
                    ...post,
                    _cachedAt: Date.now() // Mark cache timestamp
                } as any;

                if (post.uuid) cache.posts[post.uuid] = data;
            }
        });

        cache.lastUpdated = Date.now();
        saveCache(cache);
    },

    /**
     * Get a post by UUID.
     */
    getPost: (uuid: string): Post | null => {
        const cache = getStoredCache();
        return cache.posts[uuid] || null;
    },

    /**
     * Get posts by a set of UUIDs.
     */
    getPostsByIds: (uuids: string[]): Post[] => {
        const cache = getStoredCache();
        return uuids
            .map(uuid => cache.posts[uuid])
            .filter(post => !!post);
    },

    /**
     * Get every post currently stored in cache.
     */
    getAllPosts: (): Post[] => {
        const cache = getStoredCache();
        return Object.values(cache.posts);
    },

    /**
     * Clear the cache.
     */
    clearCache: () => {
        localStorage.removeItem(CACHE_KEY);
    }
};
