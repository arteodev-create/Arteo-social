const Logger = require('../../infra/logging/Logger.Service');
const CacheService = require('../../infra/cache/Cache.Service');
const PostRepository = require('./Post.Repository');
const PostInteractionRepository = require('./PostInteraction.Repository');
const { AppError, NotFoundError, AuthorizationError } = require('../../core/Errors');
const { eventEmitter, EVENTS } = require('../../events');
const { POST_TYPES, EPHEMERAL_POST_TTL, MEDIA_TYPES } = require('../../core/Constants');

// Platform Engines
const HashtagService = require('./Hashtag.Service');
const AlgorithmService = require('../feed/Algorithm.Service');
const IdentificationService = require('../identity/Identification.Service');
const IdentificationRepository = require('../identity/Identification.Repository');
const MediaService = require('../media/Media.Service');
const { createDevPost, isDevPostUuid } = require('./DevPost.Fixture');
const PollService = require('./Poll.Service');
const { decodePostRouteId } = require('../../utils/PostRouteId');

/**
 * PostService: Central Hub for Post-related business logic.
 * Refactored for ABS v14.1 Platinum Compliance (Human Core).
 */
class PostService {
    /**
     * Resolves a flexible identifier (partial or full) to a canonical UUID.
     */
    async resolveId(idOrUuid) {
        if (!idOrUuid) return null;
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrUuid);
        if (isUuid) return idOrUuid;
        const decodedRouteUuid = decodePostRouteId(idOrUuid);
        if (decodedRouteUuid) return decodedRouteUuid;
        const compactMatch = /^p([0-9a-z]+)$/i.exec(idOrUuid);
        if (compactMatch) {
            const suffix = parseInt(compactMatch[1], 36).toString(16).padStart(8, '0');
            return await PostRepository.findByPartialUuid(suffix, { mode: 'suffix', preferTopLevel: true });
        }
        
        return await PostRepository.findByPartialUuid(idOrUuid);
    }

    /**
     * Main algorithm-driven feed retrieval.
     */
    async getFeed(currentUserId, options = {}) {
        const { page = 1, limit = 20, location, sort } = options;
        let activeAlgo = null;
        const bypassAlgorithm = options.algorithmId === '-1';
        
        if (options.algorithmId && !bypassAlgorithm) {
            activeAlgo = await AlgorithmService.getAlgorithmForFeed(options.algorithmId, currentUserId);
        }

        if (!activeAlgo && !options.algorithmId && !bypassAlgorithm && currentUserId) {
            activeAlgo = await AlgorithmService.getActiveAlgorithm(currentUserId);
            if (activeAlgo) options.algorithmId = activeAlgo.uuid || activeAlgo.name;
        }

        // ABS v14.1 Platinum: Khi chọn thuật toán hoặc Topic cụ thể (Forum), 
        // ưu tiên phạm vi Discovery (Global) để người dùng thấy được toàn bộ nội dung.
        if ((options.algorithmId && !bypassAlgorithm) || options.topic) {
            options.includeGlobal = true;
        }

        if (bypassAlgorithm) {
            options.includeGlobal = true;
        }

        const cacheUserId = bypassAlgorithm ? null : currentUserId;
        const cacheKey = CacheService.generateFeedKey(cacheUserId, options);
        // Tối ưu: Sử dụng SWR để đảm bảo tốc độ phản hồi tối đa
        try {
            return await this._getOrComputeSWR(cacheKey, async () => {
            // ABS v15.0 Platinum: Fetch a larger buffer (3x limit) to ensure 
            // the algorithm has enough variety to return a full page after diversification.
            const fetchLimit = activeAlgo ? limit * 2 : limit;
            const skip = (page - 1) * limit; // Correct chronological anchor

            const { posts, total } = await PostRepository.findFeed({
                userId: bypassAlgorithm ? null : currentUserId,
                page,
                limit: fetchLimit,
                skip,
                location,
                topic: options.topic,
                sort,
                includeGlobal: !!options.includeGlobal
            });

            const sortedPosts = bypassAlgorithm
                ? posts
                : await AlgorithmService.sortPostsByAlgorithm(posts, currentUserId, { userLocation: location, algorithm: activeAlgo });
            
            // Return only the requested 'limit' amount to the frontend
            const finalPosts = sortedPosts.slice(0, limit);

            return {
                posts: finalPosts,
                pagination: { total, pages: Math.ceil(total / limit), page, limit }
            };
        }, 30);
        } catch (error) {
            Logger.warn('[PostService:getFeed] Falling back to local dev post:', error.message);
            return {
                posts: [createDevPost()],
                pagination: { total: 1, pages: 1, page, limit, hasNext: false, hasPrev: false }
            };
        }
    }

    /**
     * Retrieval engine for a specific user's posts.
     */
    async getUserPosts(identifier, currentUserId = null, options = {}) {
        const { page = 1, limit = 20, tab = 'posts' } = options;
        
        // Identity Resolution: Resolve username (@) or partial ID to full UUID
        const targetUuid = await this._resolveUserUuid(identifier);
        if (!targetUuid) return { posts: [], pagination: { total: 0, page, limit } };

        const cacheKey = `posts:user:${targetUuid}:tab:${tab}:p:${page}:${currentUserId || 'anon'}`;
        return this._getOrComputeSWR(cacheKey, async () => {
            const result = await PostRepository.findByUserId({ userId: targetUuid, currentUserId, page, limit, tab });
            return { posts: result.posts, pagination: { total: result.total, page, limit } };
        }, 60);
    }

    /**
     * Creation engine for all post types.
     */
    async create(userId, data, mediaFiles = []) {
        // 1. Content Safety & Metadata

        const topic = data.topic || null;
        
        // 2. Classify Post Type & Expiry
        const finalType = this._resolveFinalType(data);
        const expiresAt = data.isEphemeral ? new Date(Date.now() + EPHEMERAL_POST_TTL) : null;
        
        // 3. Normalize Media
        const mediaData = this._normalizeMedia(mediaFiles, data.gifUrl);

        // 4. Persistence
        const post = await PostRepository.createWithTransaction({
            userId, content: data.content, type: finalType, visibility: data.visibility, 
            parentId: data.parentId, originalPostId: data.originalPostId, 
            topic, location: data.location, isEphemeral: !!expiresAt, expiresAt,
            threadIndex: data.threadIndex, threadTotal: data.threadTotal
        }, mediaData);

        if (data.poll) {
            await PollService.createPoll(post.uuid, data.poll);
        }

        // 5. Lifecycle Orchestration
        this._processPostLifecycle(userId, post, data.content).catch(e => Logger.error('[PostService:Lifecycle] Error:', e));

        return await PostRepository.findDetailed(post.uuid, userId);
    }

    /**
     * Retrieval engine for comments.
     */
    async getComments(postId, currentUserId = null, options = {}) {
        const page = Number(options.page) || 1;
        const limit = Number(options.limit) || 20;
        const { comments, total } = await PostRepository.findReplies(postId, currentUserId, limit, (page - 1) * limit);
        
        return { comments, pagination: { total, page, limit } };
    }

    /**
     * Retrieval helper for detailed post data.
     */
    async getPostWithRelationships(uuid, currentUserId = null) {
        if (!uuid) throw new NotFoundError('Post reference missing');
        if (isDevPostUuid(uuid)) return createDevPost();
        
        const activeAlgo = currentUserId
            ? await AlgorithmService.getActiveAlgorithm(currentUserId).catch(() => null)
            : null;
        const cacheKey = `post:${uuid}:${currentUserId || 'anon'}:${activeAlgo?.uuid || 'standard'}`;
        const cached = await CacheService.get(cacheKey);
        if (cached) return cached;

        const post = await PostRepository.findDetailed(uuid, currentUserId);
        if (!post) throw new NotFoundError('Post');

        // Cache ngắn hạn cho chi tiết bài viết (1 phút)
        const explainedPost = await this._attachFeedExplanation(post, currentUserId, activeAlgo);
        CacheService.set(cacheKey, explainedPost, 60).catch(() => {});
        return explainedPost;
    }

    /**
     * Professional removal (Soft-Delete).
     */
    async softDelete(uuid, userId) {
        const post = await PostRepository.findDetailed(uuid);
        if (!post) throw new NotFoundError('Post');
        if (post.userId !== userId) throw new AuthorizationError();

        await PostRepository.softDelete(uuid);
        
        // Comprehensive Cache Invalidation
        Promise.all([
            CacheService.invalidatePostCache(uuid),
            CacheService.invalidateFeedPatterns(userId),
            CacheService.invalidateDiscoveryCache()
        ]).catch(e => Logger.error('[PostService:PurgeCache] Error:', e));

        eventEmitter.emit(EVENTS.POST.DELETED, { postId: uuid, userId });
        Logger.info(`[PostService:Purged] Post ${uuid} by author ${userId}`);
    }

    /**
     * Toggles 'Like' state on a post.
     */
    async toggleLike(postId, userId) {
        if (isDevPostUuid(postId)) {
            return { action: 'like', likeCount: 0 };
        }

        await this._runInteractionSafeguards(userId);
        
        const post = await PostRepository.findByUuid(postId);
        if (!post) throw new NotFoundError('Post');

        const hasLiked = await PostInteractionRepository.hasLiked(userId, postId);
        let action = 'like';

        try {
            if (hasLiked) {
                await PostInteractionRepository.deleteLike(userId, postId);
                action = 'unlike';
            } else {
                await PostInteractionRepository.createLike(userId, postId);
                action = 'like';
            }
        } catch (error) {
            // If a race condition occurs, we just refresh the status and return successfully
            Logger.warn(`[PostService:ToggleLike] Race condition handled for user ${userId} on post ${postId}`);
            const currentStatus = await PostInteractionRepository.hasLiked(userId, postId);
            action = currentStatus ? 'like' : 'unlike';
        }

        const updated = await PostRepository.findByUuid(postId);
        const stats = { 
            action, userId, 
            likeCount: updated.stats.likeCount,
            authorId: post.userId 
        };

        if (action === 'unlike') {
            eventEmitter.emit(EVENTS.POST.UNLIKED, { postId, stats });
        } else {
            eventEmitter.emit(EVENTS.POST.LIKED, { postId, stats });
        }

        // Tối ưu hiệu năng: Invalidate cache để UI cập nhật số liệu mới nhất
        CacheService.invalidatePostCache(postId).catch(() => {});
        CacheService.invalidateFeedPatterns(userId).catch(() => {});

        return { action, likeCount: stats.likeCount };
    }

    async setLike(postId, userId, shouldLike) {
        if (isDevPostUuid(postId)) {
            return { action: shouldLike ? 'like' : 'unlike', likeCount: 0, isLiked: shouldLike };
        }

        await this._runInteractionSafeguards(userId);

        const post = await PostRepository.findByUuid(postId);
        if (!post) throw new NotFoundError('Post');

        if (shouldLike) {
            await PostInteractionRepository.createLike(userId, postId);
        } else {
            await PostInteractionRepository.deleteLike(userId, postId);
        }

        const updated = await PostRepository.findByUuid(postId);
        const likeCount = updated?.stats?.likeCount || 0;
        const action = shouldLike ? 'like' : 'unlike';
        const stats = { action, userId, likeCount, authorId: post.userId };

        eventEmitter.emit(shouldLike ? EVENTS.POST.LIKED : EVENTS.POST.UNLIKED, { postId, stats });
        CacheService.invalidatePostCache(postId).catch(() => {});
        CacheService.invalidateFeedPatterns(userId).catch(() => {});

        return { action, likeCount, isLiked: shouldLike };
    }

    /**
     * Toggles 'Bookmark' state.
     */
    async toggleBookmark(postId, userId) {
        if (isDevPostUuid(postId)) {
            return { action: 'bookmark', bookmarkCount: 0 };
        }

        const post = await PostRepository.findByUuid(postId);
        if (!post) throw new NotFoundError('Post');

        const hasBookmarked = await PostInteractionRepository.hasBookmarked(userId, postId);
        let action = 'bookmark';

        try {
            if (hasBookmarked) {
                await PostInteractionRepository.deleteBookmark(userId, postId);
                action = 'unbookmark';
            } else {
                await PostInteractionRepository.createBookmark(userId, postId);
                action = 'bookmark';
                eventEmitter.emit(EVENTS.POST.BOOKMARKED, { postId, userId });
            }
        } catch (error) {
            Logger.warn(`[PostService:ToggleBookmark] Race condition handled for user ${userId} on post ${postId}`);
            const currentStatus = await PostInteractionRepository.hasBookmarked(userId, postId);
            action = currentStatus ? 'bookmark' : 'unbookmark';
        }

        const updated = await PostRepository.findByUuid(postId);
        CacheService.invalidatePostCache(postId).catch(() => {});
        CacheService.invalidateFeedPatterns(userId).catch(() => {});
        return { action, bookmarkCount: updated?.stats?.bookmarkCount || 0 };
    }

    async setBookmark(postId, userId, shouldBookmark) {
        if (isDevPostUuid(postId)) {
            return { action: shouldBookmark ? 'bookmark' : 'unbookmark', bookmarkCount: 0, isBookmarked: shouldBookmark };
        }

        const post = await PostRepository.findByUuid(postId);
        if (!post) throw new NotFoundError('Post');

        if (shouldBookmark) {
            await PostInteractionRepository.createBookmark(userId, postId);
            eventEmitter.emit(EVENTS.POST.BOOKMARKED, { postId, userId });
        } else {
            await PostInteractionRepository.deleteBookmark(userId, postId);
        }

        const updated = await PostRepository.findByUuid(postId);
        const bookmarkCount = updated?.stats?.bookmarkCount || 0;

        CacheService.invalidatePostCache(postId).catch(() => {});
        CacheService.invalidateFeedPatterns(userId).catch(() => {});

        return {
            action: shouldBookmark ? 'bookmark' : 'unbookmark',
            bookmarkCount,
            isBookmarked: shouldBookmark
        };
    }

    /**
     * Toggles 'Repost' state.
     */
    async toggleRepost(postId, userId) {
        if (isDevPostUuid(postId)) {
            return { action: 'repost', repostCount: 0 };
        }

        await this._runInteractionSafeguards(userId);
        
        const post = await PostRepository.findByUuid(postId);
        if (!post) throw new NotFoundError('Post');

        const hasReposted = await PostInteractionRepository.hasReposted(userId, postId);
        let action = 'repost';

        try {
            if (hasReposted) {
                await PostInteractionRepository.deleteRepost(userId, postId);
                action = 'unrepost';
            } else {
                await PostInteractionRepository.createRepost(userId, postId);
                action = 'repost';
            }
        } catch (error) {
            Logger.warn(`[PostService:ToggleRepost] Race condition handled for user ${userId} on post ${postId}`);
            const currentStatus = await PostInteractionRepository.hasReposted(userId, postId);
            action = currentStatus ? 'repost' : 'unrepost';
        }

        const updated = await PostRepository.findByUuid(postId);
        const stats = { 
            action, userId, 
            repostCount: updated.stats.repostCount,
            authorId: post.userId 
        };

        eventEmitter.emit(EVENTS.POST.REPOSTED, { postId, stats });

        // Invalidate both local and global caches for reposts
        CacheService.invalidatePostCache(postId).catch(() => {});
        CacheService.invalidateFeedPatterns(userId).catch(() => {});
        CacheService.invalidateDiscoveryCache().catch(() => {});

        return { action, repostCount: stats.repostCount };
    }

    async setRepost(postId, userId, shouldRepost) {
        if (isDevPostUuid(postId)) {
            return { action: shouldRepost ? 'repost' : 'unrepost', repostCount: 0, isReposted: shouldRepost };
        }

        await this._runInteractionSafeguards(userId);

        const post = await PostRepository.findByUuid(postId);
        if (!post) throw new NotFoundError('Post');

        if (shouldRepost) {
            await PostInteractionRepository.createRepost(userId, postId);
        } else {
            await PostInteractionRepository.deleteRepost(userId, postId);
        }

        const updated = await PostRepository.findByUuid(postId);
        const repostCount = updated?.stats?.repostCount || 0;
        const action = shouldRepost ? 'repost' : 'unrepost';

        eventEmitter.emit(EVENTS.POST.REPOSTED, { postId, stats: { action, userId, repostCount, authorId: post.userId } });
        CacheService.invalidatePostCache(postId).catch(() => {});
        CacheService.invalidateFeedPatterns(userId).catch(() => {});
        CacheService.invalidateDiscoveryCache().catch(() => {});

        return { action, repostCount, isReposted: shouldRepost };
    }

    // --- Private Infrastructure ---

    /**
     * Behavioral and identity safeguards for interactions.
     */
    async _runInteractionSafeguards(userId) {
        const frequency = await CacheService.trackInteractionFrequency(userId);
        if (frequency > 150) {
            throw new AppError('Hoạt động quá nhanh. Vui lòng chậm lại một chút.', 429);
        }

        const user = await IdentificationRepository.findByUuid(userId);
        if (!user) throw new NotFoundError('User');
    }

    async _resolveUserUuid(identifier) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
        if (isUuid) return identifier;

        const cleanId = identifier.startsWith('@') ? identifier.slice(1) : identifier;
        const user = await IdentificationService.checkExists(cleanId);
        return user?.uuid || null;
    }



    _resolveFinalType(data) {
        const { type = POST_TYPES.POST, threadIndex, threadTotal } = data;
        if (threadIndex === 1 && threadTotal > 1 && type === POST_TYPES.POST) return POST_TYPES.THREAD;
        return type;
    }

    _normalizeMedia(files, gifUrl) {
        const media = files.map(m => {
            const url = MediaService.resolveFileUrl(m);
            if (!url) return null;

            return {
                type: m.mimetype?.startsWith('video') ? MEDIA_TYPES.VIDEO :
                      m.mimetype?.startsWith('image/gif') ? MEDIA_TYPES.GIF : MEDIA_TYPES.IMAGE,
                url, mimeType: m.mimetype, size: m.size || 0, width: m.width, height: m.height
            };
        }).filter(Boolean);

        if (gifUrl) media.push({ type: MEDIA_TYPES.GIF, url: gifUrl, mimeType: 'image/gif' });
        return media;
    }

    async _processPostLifecycle(userId, post, content) {
        CacheService.invalidateFeedPatterns(userId).catch(() => {});
        if (post.visibility === 'PUBLIC') CacheService.invalidateDiscoveryCache().catch(() => {});
        
        const hashtags = HashtagService.extractHashtags(content);
        if (hashtags.length > 0) await HashtagService.processHashtags(post.uuid, hashtags).catch(() => {});

        // Phát sự kiện chuyên biệt cho Bình luận hoặc Bài viết mới
        if (post.parentId || post.type === 'COMMENT') {
            eventEmitter.emit(EVENTS.POST.COMMENTED, { userId, postId: post.parentId, comment: post });
        } else {
            eventEmitter.emit(EVENTS.POST.CREATED, { post });
        }
    }

    async _attachFeedExplanation(post, currentUserId, activeAlgo = null) {
        if (!currentUserId || !post) return post;
        try {
            const rankedPosts = await AlgorithmService.sortPostsByAlgorithm([post], currentUserId, { algorithm: activeAlgo });
            const explained = rankedPosts.find(item => item.uuid === post.uuid);
            if (explained?._whiteBoxExplanation) return explained;

            if (!activeAlgo) return post;
            return {
                ...post,
                _whiteBoxExplanation: {
                    totalScore: '0.0000',
                    steps: [],
                    path: [{
                        step: 'Active feed filter',
                        reasoning: 'This post was opened directly and did not pass one or more active feed filters.',
                        timestamp: new Date()
                    }],
                    algorithm: {
                        uuid: activeAlgo.uuid,
                        name: activeAlgo.name,
                        version: activeAlgo.version,
                        installedFromId: activeAlgo.installedFromId
                    },
                    pluginDependencies: Array.isArray(activeAlgo.pluginDependencies) ? activeAlgo.pluginDependencies : []
                }
            };
        } catch (error) {
            Logger.warn(`[PostService:FeedExplanation] Unable to explain post ${post.uuid}: ${error.message}`);
            return post;
        }
    }

    async _getOrComputeSWR(key, computeFn, ttl = 300) {
        const cached = await CacheService.get(key);
        if (cached) {
            const age = Date.now() - (cached._swr_timestamp || 0);
            if (age > (ttl * 0.8) * 1000) {
                computeFn().then(d => CacheService.set(key, { ...d, _swr_timestamp: Date.now() }, ttl * 2)).catch(() => {});
            }
            return cached;
        }
        const data = await computeFn();
        const swrData = { ...data, _swr_timestamp: Date.now() };
        await CacheService.set(key, swrData, ttl * 2);
        return swrData;
    }
}

module.exports = new PostService();
