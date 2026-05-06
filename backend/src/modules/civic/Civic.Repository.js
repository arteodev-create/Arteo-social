const BaseRepository = require('../../core/Base.Repository');

/**
 * [AIS] CivicRepository
 * Trách nhiệm: Quản lý các mối quan hệ dân sự (Theo dõi, Chặn, v.v.).
 * Arteo Platform Edition.
 */
class CivicRepository extends BaseRepository {
    constructor() {
        super('follow');
    }

    /**
     * Maps a follow record to a standardized DTO.
     */
    _mapFollow(follow) {
        if (!follow) return null;
        return {
            uuid: follow.uuid,
            followerId: follow.followerId,
            followingId: follow.followingId,
            createdAt: follow.createdAt
        };
    }

    /**
     * Tìm kiếm mối quan hệ theo dõi giữa 2 công dân.
     */
    async findFollow(followerId, followingId) {
        const follow = await this.prisma.follow.findUnique({
            where: { followerId_followingId: { followerId, followingId } }
        });
        return this._mapFollow(follow);
    }

    /**
     * Tạo mối quan hệ theo dõi mới.
     */
    async createFollow(followerId, followingId) {
        return await this.prisma.follow.create({
            data: { followerId, followingId }
        });
    }

    /**
     * Xóa mối quan hệ theo dõi.
     */
    async deleteFollow(followerId, followingId) {
        return await this.prisma.follow.delete({
            where: { followerId_followingId: { followerId, followingId } }
        });
    }

    async isFollowing(followerId, followingId) {
        const follow = await this.findFollow(followerId, followingId);
        return !!follow;
    }

    async findReaction(userId, postId, emoji) {
        return await this.prisma.reaction.findUnique({
            where: { userId_postId_emoji: { userId, postId, emoji } }
        });
    }

    async createReaction(userId, postId, emoji) {
        return await this.prisma.reaction.create({
            data: { userId, postId, emoji }
        });
    }

    async deleteReaction(userId, postId, emoji) {
        return await this.prisma.reaction.delete({
            where: { userId_postId_emoji: { userId, postId, emoji } }
        });
    }

    async findUserReactionOnPost(userId, postId) {
        return await this.prisma.reaction.findFirst({
            where: { userId, postId }
        });
    }

    /**
     * Đếm số lượng người theo dõi và đang theo dõi.
     */
    async getFollowStats(userId) {
        const [followersCount, followingCount] = await Promise.all([
            this.prisma.follow.count({ where: { followingId: userId } }),
            this.prisma.follow.count({ where: { followerId: userId } })
        ]);
        return { followersCount, followingCount };
    }
}

module.exports = new CivicRepository();
