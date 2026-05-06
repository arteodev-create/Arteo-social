const BaseRepository = require('../../core/Base.Repository');

/**
 * PostInteractionRepository: Data access layer for Post interactions (Likes, Bookmarks, Reposts).
 * Refactored to consolidate interactions into the Post domain (Platinum Convergence).
 */
class PostInteractionRepository extends BaseRepository {
    constructor() {
        super('like');
    }

    async _adjustStat(tx, postId, field, delta) {
        const increment = delta > 0 ? { increment: delta } : { decrement: Math.abs(delta) };
        return tx.postStat.upsert({
            where: { postId },
            create: {
                postId,
                [field]: delta > 0 ? delta : 0
            },
            update: {
                [field]: increment
            }
        });
    }

    /**
     * Atomic Like Establishment (Idempotent).
     */
    async createLike(userId, postId) {
        return await this.prisma.$transaction(async (tx) => {
            // 1. Check if already exists to prevent unique constraint error
            const existing = await tx.like.findUnique({
                where: { userId_postId: { userId, postId } }
            });

            if (existing) return existing;

            // 2. Create and increment
            const like = await tx.like.create({
                data: { userId, postId }
            });

            await this._adjustStat(tx, postId, 'likeCount', 1);

            return like;
        });
    }

    /**
     * Atomic Like Removal (Idempotent).
     */
    async deleteLike(userId, postId) {
        return await this.prisma.$transaction(async (tx) => {
            // Use deleteMany to avoid "Record to delete does not exist" error
            const { count } = await tx.like.deleteMany({
                where: { userId, postId }
            });

            // Only decrement if a record was actually removed
            if (count > 0) {
                await this._adjustStat(tx, postId, 'likeCount', -1);
            }

            return { success: true, count };
        });
    }

    /**
     * Atomic Bookmark Establishment (Idempotent).
     */
    async createBookmark(userId, postId) {
        return await this.prisma.$transaction(async (tx) => {
            const existing = await tx.bookmark.findUnique({
                where: { userId_postId: { userId, postId } }
            });

            if (existing) return existing;

            const bookmark = await tx.bookmark.create({
                data: { userId, postId }
            });

            await this._adjustStat(tx, postId, 'bookmarkCount', 1);

            return bookmark;
        });
    }

    /**
     * Atomic Bookmark Removal (Idempotent).
     */
    async deleteBookmark(userId, postId) {
        return await this.prisma.$transaction(async (tx) => {
            const { count } = await tx.bookmark.deleteMany({
                where: { userId, postId }
            });

            if (count > 0) {
                await this._adjustStat(tx, postId, 'bookmarkCount', -1);
            }

            return { success: true, count };
        });
    }

    /**
     * Atomic Repost Establishment (Idempotent).
     */
    async createRepost(userId, postId) {
        return await this.prisma.$transaction(async (tx) => {
            const existing = await tx.repost.findUnique({
                where: { userId_postId: { userId, postId } }
            });

            if (existing) return existing;

            const repost = await tx.repost.create({
                data: { userId, postId }
            });

            await this._adjustStat(tx, postId, 'repostCount', 1);

            return repost;
        });
    }

    /**
     * Atomic Repost Removal (Idempotent).
     */
    async deleteRepost(userId, postId) {
        return await this.prisma.$transaction(async (tx) => {
            const { count } = await tx.repost.deleteMany({
                where: { userId, postId }
            });

            if (count > 0) {
                await this._adjustStat(tx, postId, 'repostCount', -1);
            }

            return { success: true, count };
        });
    }

    /**
     * Existence checks.
     */
    async hasLiked(userId, postId) {
        const result = await this.prisma.like.findUnique({ where: { userId_postId: { userId, postId } } });
        return !!result;
    }

    async hasBookmarked(userId, postId) {
        const result = await this.prisma.bookmark.findUnique({ where: { userId_postId: { userId, postId } } });
        return !!result;
    }

    async hasReposted(userId, postId) {
        const result = await this.prisma.repost.findUnique({ where: { userId_postId: { userId, postId } } });
        return !!result;
    }

    /**
     * Statistics: Global counters for Admin use.
     */
    async countLikes(where = {}) {
        return await this.prisma.like.count({ where });
    }

    async countBookmarks(where = {}) {
        return await this.prisma.bookmark.count({ where });
    }

    async countReposts(where = {}) {
        return await this.prisma.repost.count({ where });
    }
}

module.exports = new PostInteractionRepository();
