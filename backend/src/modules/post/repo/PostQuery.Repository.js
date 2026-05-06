const { POST_STATUS, POST_TYPES } = require('../../../core/Constants');
const { POST_STANDARD_INCLUDE } = require('./Post.Inclusions');
const prisma = require('../../../config/Prisma.Client');

/**
 * PostQueryRepository (ABS v14.1 Platinum)
 * Re-engineered for high-granularity query orchestration and strict 40-line compliance.
 */
class PostQueryRepository {
    constructor(model) {
        this.model = model;
        this.prisma = prisma;
    }

    /**
     * Retrieval engine for a single detailed post.
     */
    async findDetailed(uuid, currentUserId = null) {
        const post = await this.model.findFirst({
            where: { uuid, deletedAt: null },
            include: POST_STANDARD_INCLUDE
        });
        if (!post || !currentUserId) return post;

        const [like, bookmark, repost, reaction] = await Promise.all([
            this.prisma.like.findUnique({ where: { userId_postId: { userId: currentUserId, postId: post.uuid } } }),
            this.prisma.bookmark.findUnique({ where: { userId_postId: { userId: currentUserId, postId: post.uuid } } }),
            this.prisma.repost.findUnique({ where: { userId_postId: { userId: currentUserId, postId: post.uuid } } }),
            this.prisma.reaction.findFirst({ 
                where: { userId: currentUserId, postId: post.uuid },
                orderBy: { createdAt: 'desc' }
            })
        ]);

        return { 
            ...post, 
            isLiked: !!like, 
            isBookmarked: !!bookmark, 
            isReposted: !!repost,
            myReaction: reaction?.emoji || null
        };
    }

    /**
     * Main algorithm-driven feed retrieval.
     */
    async findFeed({ userId, page = 1, limit = 20, location, topic, sort, includeGlobal = false, skip: manualSkip }) {
        const skip = manualSkip !== undefined ? manualSkip : (page - 1) * limit;
        const { where, followedUuids } = await this._buildFeedWhere(userId, location, topic, includeGlobal);
        const orderBy = this._resolveFeedOrderBy(sort);

        const [posts, totalPosts] = await Promise.all([
            this.model.findMany({ where, include: POST_STANDARD_INCLUDE, orderBy, take: limit, skip }),
            this.model.count({ where })
        ]);
        
        const { repostedPosts, totalReposts } = await this._fetchFeedReposts(userId, followedUuids, includeGlobal, limit, skip);
        const mergedResults = this._mergeAndSortFeed(posts, repostedPosts, limit);
        const enrichedPosts = await this._enrichInteractions(mergedResults, userId);
        return { posts: enrichedPosts, total: totalPosts + totalReposts };
    }

    /**
     * Retrieval engine for a specific user's posts (Tab-based).
     */
    async findByUserId({ userId, currentUserId = null, page = 1, limit = 20, tab = 'posts' }) {
        if (!userId) return { posts: [], total: 0 };
        const skip = (page - 1) * limit;

        const { posts, total } = await this._dispatchUserQuery(userId, tab, limit, skip);
        const enrichedPosts = await this._enrichInteractions(posts, currentUserId);

        return { posts: enrichedPosts, total };
    }

    /**
     * Retrieval engine for comments/replies.
     */
    async findReplies(postId, currentUserId = null, limit = 20, skip = 0) {
        const [comments, total] = await Promise.all([
            this.model.findMany({
                where: { parentId: postId, deletedAt: null },
                include: POST_STANDARD_INCLUDE,
                orderBy: { createdAt: 'asc' },
                take: limit,
                skip
            }),
            this.model.count({ where: { parentId: postId, deletedAt: null } })
        ]);
        const enrichedComments = await this._enrichInteractions(comments, currentUserId);
        return { comments: enrichedComments, total };
    }

    /**
     * Search engine for posts/hashtags.
     */
    async searchPosts(query, options = {}) {
        const { limit = 20, sort = 'newest', hasMedia = false } = options;
        let where = this._buildSearchWhere(query, options.type, hasMedia);
        const orderBy = sort === 'popular' 
            ? [{ stats: { likeCount: 'desc' } }, { stats: { repostCount: 'desc' } }, { createdAt: 'desc' }]
            : { createdAt: 'desc' };

        let results = await this.model.findMany({ where, include: POST_STANDARD_INCLUDE, orderBy, take: limit });
        if (results.length === 0 && query.includes(' ') && options.type !== 'tag') {
            const keywords = query.split(/\s+/).filter(k => k.length > 1);
            where = this._buildSearchWhere(keywords, options.type, hasMedia);
        }
        return await this._enrichInteractions(results, options.currentUserId);
    }

    // --- Identification Helpers (New) ---

    async findByPartialUuid(idOrUuid, options = {}) {
        if (!idOrUuid) return null;
        const pattern = options.mode === 'suffix' ? `%${idOrUuid}` : `${idOrUuid}%`;
        const matches = await this.prisma.$queryRaw`
            SELECT uuid::text AS uuid
            FROM posts
            WHERE replace(uuid::text, '-', '') LIKE ${pattern}
              AND deleted_at IS NULL
            ORDER BY created_at DESC
            LIMIT 2
        `;
        return matches.length === 1 ? matches[0].uuid : null;
    }

    async existsByTopicOrHashtag(query) {
        const count = await this.model.count({
            where: { 
                deletedAt: null, 
                OR: [
                    { topic: { contains: query, mode: 'insensitive' } }, 
                    { content: { contains: query, mode: 'insensitive' } }
                ] 
            }
        });
        return count > 0;
    }

    async findDiscovery(conditions, limit = 10) {
        const where = { 
            deletedAt: null, 
            parentId: null, 
            status: 'PUBLISHED'
        };
        
        if (conditions && Array.isArray(conditions) && conditions.length > 0) {
            where.OR = conditions;
        }

        return await this.model.findMany({ 
            where, 
            include: POST_STANDARD_INCLUDE, 
            orderBy: { createdAt: 'desc' }, 
            take: limit 
        });
    }

    /**
     * Retrieval engine for high-engagement "Hot" posts.
     */
    async findHot(limit = 10) {
        return await this.model.findMany({
            where: { 
                deletedAt: null, 
                status: POST_STATUS.PUBLISHED,
                type: { in: [POST_TYPES.POST, POST_TYPES.QUOTE, POST_TYPES.THREAD] }
            },
            include: POST_STANDARD_INCLUDE,
            orderBy: [
                { trendingScore: 'desc' },
                { stats: { likeCount: 'desc' } },
                { createdAt: 'desc' }
            ],
            take: limit
        });
    }

    /**
     * Specialized engine for trend-specific discovery.
     */
    async findTrendingDetail(query, limit = 20) {
        const cleanQuery = query.replace('#', '').trim();
        return await this.model.findMany({
            where: {
                deletedAt: null,
                status: POST_STATUS.PUBLISHED,
                parentId: null, // Only top-level posts
                OR: [
                    { topic: { contains: cleanQuery, mode: 'insensitive' } },
                    { content: { contains: cleanQuery, mode: 'insensitive' } },
                    { hashtags: { some: { hashtag: { name: { contains: cleanQuery.toLowerCase(), mode: 'insensitive' } } } } }
                ]
            },
            include: POST_STANDARD_INCLUDE,
            orderBy: [
                { trendingScore: 'desc' },
                { createdAt: 'desc' }
            ],
            take: limit
        });
    }

    // --- Private Infrastructure (Granular Methods ≤ 40 lines) ---

    async _buildFeedWhere(userId, location, topic, includeGlobal) {
        let where = { deletedAt: null, status: POST_STATUS.PUBLISHED, type: { in: [POST_TYPES.POST, POST_TYPES.QUOTE, POST_TYPES.THREAD] } };
        let followedUuids = [];

        if (topic) {
            where.topic = topic;
        }

        if (location) {
            where.location = { contains: location, mode: 'insensitive' };
        } else if (userId && !includeGlobal) {
            const followed = await this.prisma.follow.findMany({ where: { followerId: userId }, select: { followingId: true } });
            followedUuids = followed.map(f => f.followingId).concat(userId);
            where.userId = { in: followedUuids };
        }
        return { where, followedUuids };
    }

    _resolveFeedOrderBy(sort) {
        if (sort === 'popular') return [{ stats: { likeCount: 'desc' } }, { stats: { repostCount: 'desc' } }, { createdAt: 'desc' }];
        if (sort === 'trending') return { trendingScore: 'desc' };
        return { createdAt: 'desc' };
    }

    async _fetchFeedReposts(userId, followedUuids, includeGlobal, limit, skip = 0) {
        let repostWhere = null;

        if (userId && !includeGlobal) {
            const targets = followedUuids.filter(id => id !== userId);
            if (targets.length > 0) repostWhere = { userId: { in: targets } };
        } else if (includeGlobal) {
            repostWhere = userId ? { userId: { not: userId } } : {};
        }

        if (!repostWhere) return { repostedPosts: [], totalReposts: 0 };

        const [repostRecords, totalReposts] = await Promise.all([
            this.prisma.repost.findMany({
                where: repostWhere,
                include: { post: { include: POST_STANDARD_INCLUDE }, user: { select: { uuid: true, username: true, fullName: true, avatar: true } } },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip
            }),
            this.prisma.repost.count({ where: repostWhere })
        ]);

        return { 
            repostedPosts: repostRecords.map(r => ({ ...r.post, repostUser: r.user, isRepostedDisplay: true, createdAt: r.createdAt })), 
            totalReposts 
        };
    }

    _mergeAndSortFeed(posts, repostedPosts, limit) {
        if (!repostedPosts.length) return posts;
        const resultsMap = new Map();
        posts.forEach(p => resultsMap.set(p.uuid, p));
        repostedPosts.forEach(rp => resultsMap.set(rp.uuid, rp));
        
        return Array.from(resultsMap.values())
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);
    }

    async _dispatchUserQuery(userId, tab, limit, skip) {
        const queryMap = {
            replies: () => this._queryUserReplies(userId, limit, skip),
            media: () => this._queryUserMedia(userId, limit, skip),
            reposts: () => this._queryUserReposts(userId, limit, skip),
            likes: () => this._queryUserLikes(userId, limit, skip),
            posts: () => this._queryUserBasePosts(userId, limit, skip)
        };
        return await (queryMap[tab] || queryMap.posts)();
    }

    async _queryUserBasePosts(userId, limit, skip) {
        const where = { 
            userId, 
            deletedAt: null, 
            status: POST_STATUS.PUBLISHED,
            type: { in: [POST_TYPES.POST, POST_TYPES.THREAD] } 
        };
        const [posts, total] = await Promise.all([
            this.model.findMany({ where, include: POST_STANDARD_INCLUDE, orderBy: { createdAt: 'desc' }, take: limit, skip }),
            this.model.count({ where })
        ]);

        return { posts, total };
    }

    async _queryUserReplies(userId, limit, skip) {
        const where = { userId, deletedAt: null, status: POST_STATUS.PUBLISHED, type: POST_TYPES.COMMENT };
        const [posts, total] = await Promise.all([
            this.model.findMany({ where, include: POST_STANDARD_INCLUDE, orderBy: { createdAt: 'desc' }, take: limit, skip }),
            this.model.count({ where })
        ]);
        return { posts, total };
    }

    async _queryUserMedia(userId, limit, skip) {
        const where = { userId, deletedAt: null, status: POST_STATUS.PUBLISHED, media: { some: {} }, type: { in: [POST_TYPES.POST, POST_TYPES.QUOTE] } };
        const [posts, total] = await Promise.all([
            this.model.findMany({ where, include: POST_STANDARD_INCLUDE, orderBy: { createdAt: 'desc' }, take: limit, skip }),
            this.model.count({ where })
        ]);
        return { posts, total };
    }

    async _queryUserLikes(userId, limit, skip) {
        const where = { likes: { some: { userId } }, deletedAt: null, status: POST_STATUS.PUBLISHED };
        const [posts, total] = await Promise.all([
            this.model.findMany({ where, include: POST_STANDARD_INCLUDE, orderBy: { createdAt: 'desc' }, take: limit, skip }),
            this.model.count({ where })
        ]);
        return { posts, total };
    }

    async _queryUserReposts(userId, limit, skip) {
        const [reposts, quotes, rCount, qCount] = await Promise.all([
            this.prisma.repost.findMany({
                where: { userId },
                include: { 
                    post: { include: POST_STANDARD_INCLUDE },
                    user: { select: { uuid: true, username: true, fullName: true, avatar: true } }
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip
            }),
            this.model.findMany({
                where: { userId, type: POST_TYPES.QUOTE, deletedAt: null, status: POST_STATUS.PUBLISHED },
                include: POST_STANDARD_INCLUDE,
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip
            }),
            this.prisma.repost.count({ where: { userId } }),
            this.model.count({ where: { userId, type: POST_TYPES.QUOTE, deletedAt: null, status: POST_STATUS.PUBLISHED } })
        ]);
        
        const formattedReposts = reposts.map(r => ({
            ...r.post,
            isRepostedDisplay: true,
            repostUser: r.user,
            repostCreatedAt: r.createdAt
        }));
        
        const merged = [...formattedReposts, ...quotes]
            .sort((a, b) => new Date(b.repostCreatedAt || b.createdAt) - new Date(a.repostCreatedAt || a.createdAt))
            .slice(0, limit);
            
        return { posts: merged, total: rCount + qCount };
    }

    async _enrichInteractions(posts, currentUserId) {
        if (!currentUserId || !posts.length) return posts;
        const postUuids = posts.map(p => p.uuid);

        // Arteo Platinum Optimization: Fetch all user interactions in a single multiplexed query
        const interactions = await this.prisma.post.findMany({
            where: { uuid: { in: postUuids } },
            select: {
                uuid: true,
                likes: { where: { userId: currentUserId }, select: { userId: true } },
                bookmarks: { where: { userId: currentUserId }, select: { userId: true } },
                reposts: { where: { userId: currentUserId }, select: { userId: true } },
                reactions: { where: { userId: currentUserId }, select: { emoji: true } }
            }
        });

        const interactionMap = new Map(interactions.map(i => [i.uuid, i]));

        return posts.map(p => {
            const inter = interactionMap.get(p.uuid);
            return {
                ...p,
                isLiked: !!inter?.likes?.length,
                isBookmarked: !!inter?.bookmarks?.length,
                isReposted: !!inter?.reposts?.length,
                myReaction: inter?.reactions?.[0]?.emoji || null
            };
        });
    }

    _buildSearchWhere(query, type, hasMedia) {
        const cleanQuery = Array.isArray(query) ? query : query.replace('#', '').trim();
        const terms = Array.isArray(cleanQuery) ? cleanQuery : [cleanQuery];
        
        let where = { 
            OR: terms.flatMap(t => [
                { content: { contains: t, mode: 'insensitive' } },
                { topic: { contains: t, mode: 'insensitive' } },
                { hashtags: { some: { hashtag: { name: { contains: t.toLowerCase(), mode: 'insensitive' } } } } }
            ]), 
            deletedAt: null, 
            status: POST_STATUS.PUBLISHED 
        };

        if (type === 'tag') {
            where = { hashtags: { some: { hashtag: { name: { equals: terms[0].toLowerCase(), mode: 'insensitive' } } } }, deletedAt: null, status: POST_STATUS.PUBLISHED };
        }
        if (hasMedia) where.media = { some: {} };
        return where;
    }
}

module.exports = PostQueryRepository;
