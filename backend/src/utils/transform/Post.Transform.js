const UserTransform = require('./User.Transform');

class PostTransform {
    formatPost(post, currentUserId = null) {
        if (!post) return null;
        return {
            uuid: post.uuid,
            shortId: post.shortId,
            userId: post.userId,
            content: post.content,
            type: post.type,
            status: post.status,
            parentId: post.parentId,
            originalPostId: post.originalPostId,
            visibility: post.visibility,
            createdAt: post.createdAt,
            user: UserTransform.formatUser(post.user),
            media: post.media || [],
            stats: post.stats || { likeCount: 0, replyCount: 0, repostCount: 0, quoteCount: 0 },
            isLiked: Array.isArray(post.likes) ? post.likes.length > 0 : !!post.isLiked,
            isReposted: post.isRepostedDisplay || (Array.isArray(post.reposts) ? post.reposts.length > 0 : !!post.isReposted),
            isBookmarked: Array.isArray(post.bookmarks) ? post.bookmarks.length > 0 : !!post.isBookmarked,
            
            // Majestic Extensions
            originalPost: post.originalPost ? this.formatPost(post.originalPost, currentUserId) : null,
            repostUser: post.repostUser ? UserTransform.formatUser(post.repostUser) : null,
            isRepostedDisplay: !!post.isRepostedDisplay,
            repostCreatedAt: post.repostCreatedAt,
            poll: post.poll || null,
            gifUrl: post.gifUrl,
            threadIndex: post.threadIndex,
            threadTotal: post.threadTotal,
            isEphemeral: !!post.isEphemeral,
            expiresAt: post.expiresAt,
            reactions: post.reactions || [],
            myReaction: post.myReaction || null,
            _whiteBoxExplanation: post._whiteBoxExplanation || null
        };
    }

    formatAlgorithm(algo) {
        if (!algo) return null;
        return {
            uuid: algo.uuid,
            userId: algo.userId,
            name: algo.name,
            description: algo.description,
            imageUrl: algo.imageUrl,
            isActive: algo.isActive,
            isPublic: algo.isPublic,
            isPinned: algo.isPinned,
            pinOrder: algo.pinOrder,
            installedFromId: algo.installedFromId,
            owner: algo.user ? UserTransform.formatUser(algo.user) : null,
            version: algo.version,
            pipeline: algo.pipeline || [],
            weights: algo.weights || {},
            tags: algo.tags || [],
            updatedAt: algo.updatedAt
        };
    }

    formatHashtag(hashtag) {
        if (!hashtag) return null;
        return {
            uuid: hashtag.uuid,
            name: hashtag.name,
            useCount: hashtag.useCount || 0,
            lastUsed: hashtag.lastUsed
        };
    }
}

module.exports = new PostTransform();
