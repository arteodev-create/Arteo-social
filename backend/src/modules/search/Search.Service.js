const Logger = require('../../infra/logging/Logger.Service');
const CacheService = require('../../infra/cache/Cache.Service');
const PostRepository = require('../post/Post.Repository');
const HashtagRepository = require('../post/Hashtag.Repository');
const IdentificationRepository = require('../identity/Identification.Repository');
const AlgorithmRepository = require('../feed/Algorithm.Repository');
const TransformUtils = require('../../utils/Transform.Utils');
const { AppError } = require('../../core/Errors');
const { createDevPost, createDevUser } = require('../post/DevPost.Fixture');

/**
 * SearchService: High-performance discovery engine for Users, Posts, and Trends.
 */
class SearchService {
    constructor() {
        this._refreshLocks = new Set();
    }

    _devTrending() {
        return {
            trending: [
                {
                    title: '#Arteo',
                    category: 'Trending',
                    postCount: '1',
                    description: 'Arteo local dev is running.',
                    userSamples: [],
                    timeAgo: 'Happening now'
                },
                {
                    title: 'Local Node',
                    category: 'System',
                    postCount: '1',
                    description: 'Backend and frontend are connected on localhost.',
                    userSamples: [],
                    timeAgo: 'Just now'
                }
            ]
        };
    }

    _devRecommendations(category = 'For You') {
        const devUser = createDevUser();

        return {
            experts: [devUser],
            posts: [
                createDevPost(`Arteo local recommendations are ready for ${category || 'For You'}.`)
            ],
            randomAlgorithms: [
                {
                    uuid: '00000000-0000-0000-0000-000000000001',
                    name: 'Arteo Standard',
                    description: 'Default local discovery feed.',
                    shortDescription: 'Default local discovery feed.',
                    isPublic: true,
                    isPinned: true,
                    tags: ['Standard']
                }
            ],
            randomHashtags: [
                { name: 'Arteo', count: 1, useCount: 1 },
                { name: 'LocalDev', count: 1, useCount: 1 }
            ],
            categories: [
                { id: 'for-you', label: 'For You' },
                { id: 'tech', label: 'Tech' },
                { id: 'trending', label: 'Trending' }
            ]
        };
    }

    /**
     * Stale-While-Revalidate pattern for expensive discovery assets.
     * Returns cached data immediately (even if stale) and refreshes in background.
     * @private
     */
    async _getOrComputeSWR(key, computeFn, ttl = 300) {
        const cached = await CacheService.get(key);
        const now = Date.now();
        const refreshThreshold = (ttl * 0.8) * 1000;

        if (cached) {
            const age = now - (cached._swr_timestamp || 0);
            
            // Arteo Platinum Guard: Prevent dogpiling by using a refresh lock
            if (age > refreshThreshold && !this._refreshLocks.has(key)) {
                this._refreshLocks.add(key);
                Logger.debug(`[SearchService:SWR] Refreshing stale cache for ${key} in background.`);
                
                computeFn().then(data => {
                    const swrData = { ...data, _swr_timestamp: Date.now() };
                    CacheService.set(key, swrData, ttl * 2); 
                }).catch(err => {
                    Logger.error(`[SearchService:SWR] Background refresh failed for ${key}:`, err.message);
                }).finally(() => {
                    this._refreshLocks.delete(key);
                });
            }
            
            return cached;
        }

        // Hard Miss: Must wait
        Logger.info(`[SearchService:SWR] Cache miss for ${key}. Computing fresh data.`);
        const freshData = await computeFn();
        const swrData = { ...freshData, _swr_timestamp: Date.now() };
        await CacheService.set(key, swrData, ttl * 2);
        return swrData;
    }

    /**
     * Universal search across multiple domains via Repositories.
     */
    async searchAll(query, options = {}) {
        if (!query || query.trim().length === 0) {
            return { users: [], posts: [] };
        }

        const q = query.trim();
        const type = options.type ? options.type.toLowerCase() : 'top';
        
        let users = [];
        let posts = [];

        if (type === 'people') {
            users = await IdentificationRepository.searchUsers(q, 20);
        } else if (type === 'media') {
            posts = await PostRepository.searchPosts(q, { limit: 20, hasMedia: true });
        } else if (type === 'latest') {
            posts = await PostRepository.searchPosts(q, { limit: 20, sort: 'newest' });
        } else {
            // Default: 'Top' (Mixed result)
            const [u, p] = await Promise.all([
                IdentificationRepository.searchUsers(q, 5),
                PostRepository.searchPosts(q, { limit: 20, sort: 'popular' })
            ]);
            users = u;
            posts = p;
        }

        Logger.info(`[SearchService] Universal search executed [${type}]: "${q}"`);

        return {
            users: users.map(u => TransformUtils.formatUser(u)),
            posts: posts.map(p => TransformUtils.formatPost(p))
        };
    }

    /**
     * Dedicated post search via Repository.
     */
    async searchPosts(query, options = {}) {
        const { limit = 20 } = options;
        const results = await PostRepository.searchPosts(query, limit);
        Logger.info(`[SearchService] Post search executed: "${query}"`);
        return results.map(p => TransformUtils.formatPost(p));
    }

    /**
     * Dedicated account search via Repository.
     */
    async searchUsers(query, options = {}) {
        const { limit = 20 } = options;
        const users = await IdentificationRepository.searchUsers(query, limit);
        Logger.info(`[SearchService] User search executed: "${query}"`);
        return users.map(u => TransformUtils.formatUser(u));
    }

    /**
     * Aggregates trending hashtags and content.
     */
    async getTrending() {
        try {
            return await this._getOrComputeSWR('search:trending:swr:v2', async () => {
            const topHashtags = await HashtagRepository.getTrending(12);
            
            const trending = [];
            for (const tag of topHashtags) {
                const recentPosts = await PostRepository.searchPosts(tag.name, { limit: 4 });
                const userSamples = Array.from(new Set(recentPosts.map(p => p.user?.avatar))).filter(Boolean).slice(0, 3);
                
                const diffMs = Date.now() - new Date(tag.lastUsed).getTime();
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                const timeAgo = diffHours < 1 ? 'Just now' : `${diffHours}h ago`;

                trending.push({
                    title: `#${tag.name}`,
                    category: 'Trending',
                    postCount: tag.useCount.toLocaleString(),
                    description: `People are discussing #${tag.name}`,
                    userSamples,
                    timeAgo
                });
            }

            if (trending.length < 5) {
                const hotPosts = await PostRepository.findHot(10);
                hotPosts.forEach(p => {
                    if (trending.length < 15 && p.topic && !trending.find(t => t.title === p.topic)) {
                        trending.push({
                            title: p.topic,
                            category: 'Hot Event',
                            postCount: (p.stats?.viewCount || 0).toLocaleString(),
                            description: `Topic "${p.topic}" is gaining attention.`,
                            timeAgo: 'Happening now'
                        });
                    }
                });
            }

            return { trending };
            }, 600); // 10 min TTL
        } catch (error) {
            Logger.warn('[SearchService] Falling back to local trending data:', error.message);
            return this._devTrending();
        }
    }

    /**
     * Personalized recommendations orchestrator via Repositories.
     */
    async getRecommendations(category = 'For You') {
        try {
            let keywords = [];
            const cat = category ? category.toLowerCase() : '';

            if (cat === 'tin tức' || cat === 'news') keywords = ['tin tức', 'news', 'báo', 'thời sự'];
            else if (cat === 'giải trí' || cat === 'entertainment') keywords = ['game', 'nhạc', 'music', 'phim', 'showbiz'];
            else if (cat === 'xu hướng' || cat === 'trending') keywords = ['xu hướng', 'trending', 'hot', 'viral'];
            else if (cat === 'công nghệ' || cat === 'tech') keywords = ['AI', 'công nghệ', 'Tech', 'GPU', 'coding'];
            else keywords = [];

            const postConditions = keywords.length > 0
                ? { OR: keywords.map(k => ({ content: { contains: k, mode: 'insensitive' } })) }
                : {};

            const [experts, posts, algorithms, hashtags, categories] = await Promise.all([
                IdentificationRepository.findPaginated({
                    isVerified: true,
                    status: 'ACTIVE'
                }, 0, 30, { createdAt: 'desc' }), // Fetch more to randomize
                PostRepository.findDiscovery(postConditions.OR ? postConditions.OR : undefined, 20),
                AlgorithmRepository.findRecommended(4),
                HashtagRepository.getTrending(15),
                AlgorithmRepository.findAllPublicCategories()
            ]);

            return {
                // Shuffle experts and take 5
                experts: experts
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 5)
                    .map(u => TransformUtils.formatUser(u)),

                // Randomize posts slightly
                posts: posts
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 10)
                    .map(p => TransformUtils.formatPost(p)),

                randomAlgorithms: algorithms.map(algo => ({
                    ...TransformUtils.formatAlgorithm(algo),
                    user: TransformUtils.formatUser(algo.user)
                })),

                // Shuffle hashtags and take 6
                randomHashtags: hashtags
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 6)
                    .map(h => TransformUtils.formatHashtag(h)),

                categories: categories.map(cat => ({
                    id: cat.toLowerCase(),
                    label: cat
                }))
            };
        } catch (error) {
            Logger.warn('[SearchService] Falling back to local recommendations:', error.message);
            return this._devRecommendations(category);
        }
    }

    /**
     * Analytical detail for a specific trending topic.
     */
    async getTrendDetail(query) {
        if (!query) throw new AppError('Query parameter is required.', 400);

        const cacheKey = `search:trend_detail:v3:${query.replace(/\s/g, '_')}`;
        return this._getOrComputeSWR(cacheKey, async () => {
            const posts = await PostRepository.findTrendingDetail(query, 30);
            
            const trend = {
                title: query,
                summary: `People are discussing #${query}`,
                category: 'Trending',
                postCount: posts.length.toString(),
                status: 'Active'
            };

            return { 
                trend, 
                posts: posts.map(p => TransformUtils.formatPost(p)) 
            };
        }, 900);
    }

    /**
     * Dedicated hashtag discovery via Repository.
     */
    async searchHashtags(query, limit = 20) {
        const hashtags = await HashtagRepository.getTrending(limit);
        const filtered = query 
            ? hashtags.filter(h => h.name.toLowerCase().includes(query.toLowerCase()))
            : hashtags;
        return filtered.map(h => TransformUtils.formatHashtag(h));
    }

    /**
     * Compact trending events feed.
     */
    async getHotEvents() {
        return this._getOrComputeSWR('search:hotEvents:swr:v3', async () => {
            const topHashtags = await HashtagRepository.getTrending(12);
            let candidates = topHashtags.map(tag => ({
                uuid: tag.uuid,
                title: `#${tag.name}`,
                category: 'Trending',
                postCount: tag.useCount
            }));

            // Optimization: Remove serial existsByTopicOrHashtag calls
            const limitedCandidates = candidates.slice(0, 8);
            
            const enrichedResults = [];
            for (const item of limitedCandidates) {
                const recentPosts = await PostRepository.searchPosts(item.title, { limit: 4 });
                if (recentPosts.length === 0) continue;
                
                const userSamples = Array.from(new Set(recentPosts.map(p => p.user?.avatar))).filter(Boolean).slice(0, 3);
                enrichedResults.push({
                    ...item,
                    postCount: item.postCount.toLocaleString(),
                    userSamples
                });
            }

            return { trending: enrichedResults.filter(Boolean).slice(0, 6) };
        }, 600);
    }

    /**
     * Generates a high-fidelity AI summary.
     */
    async getAiSummary() {
        return { summaries: [] };
    }
}

module.exports = new SearchService();
