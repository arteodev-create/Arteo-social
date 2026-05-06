const Repository = require('./Civic.Repository');
const { AppError } = require('../../core/Errors');
const { eventEmitter, EVENTS } = require('../../events');
const CacheService = require('../../infra/cache/Cache.Service');
const prisma = require('../../config/Prisma.Client');

/**
 * [AIS] CivicService
 * Trách nhiệm: Xử lý logic nghiệp vụ cho các tương tác dân sự trong Arteo.
 * Chuẩn ABS v14.1 Platinum.
 */
class CivicService {
    
    /**
     * Chuyển đổi trạng thái theo dõi công dân.
     */
    async toggleFollow(followerId, followingId) {
        if (followerId === followingId) {
            throw new AppError('Không thể tự theo dõi chính mình.', 400);
        }

        // Kiểm tra an toàn hạ tầng (tần suất thao tác)
        await this._runInteractionSafeguards(followerId);

        const isFollowing = await Repository.findFollow(followerId, followingId);
        
        if (isFollowing) {
            return await this._unfollow(followerId, followingId);
        } else {
            return await this._follow(followerId, followingId);
        }
    }

    /**
     * Logic: Theo dõi công dân.
     */
    async _follow(followerId, followingId) {
        await Repository.createFollow(followerId, followingId);
        
        // Phát sự kiện để các module khác (như Notification) có thể bắt được
        eventEmitter.emit(EVENTS.USER.FOLLOWED, { followerId, followingId });
        
        return { action: 'follow', status: 'success' };
    }

    /**
     * Logic: Bỏ theo dõi công dân.
     */
    async _unfollow(followerId, followingId) {
        await Repository.deleteFollow(followerId, followingId);
        
        eventEmitter.emit(EVENTS.USER.UNFOLLOWED, { followerId, followingId });
        
        return { action: 'unfollow', status: 'success' };
    }

    /**
     * Chuyển đổi trạng thái cảm xúc dân sự cho bài viết.
     */
    async toggleReaction(userId, postId, emoji) {
        // [ABS-14.1] Đánh thức Bang: Cập nhật logic Time Oxygen Platinum.
        await this._runInteractionSafeguards(userId);
        
        return await prisma.$transaction(async (tx) => {
            // 1. Tìm reaction hiện tại của người dùng trên bài viết này
            const existing = await tx.reaction.findFirst({
                where: { userId, postId },
                orderBy: { createdAt: 'desc' }
            });

            // 2. Xử lý logic Toggle
            if (existing) {
                // Nếu là cùng một loại emoji -> Xóa bỏ hoàn toàn các reaction của user này trên post này
                if (existing.emoji === emoji) {
                    await tx.reaction.deleteMany({ where: { userId, postId } });
                    return { action: 'remove_reaction', status: 'success' };
                } 
                
                // Nếu là emoji khác -> Xóa hết cái cũ để chuẩn bị thêm cái mới
                await tx.reaction.deleteMany({ where: { userId, postId } });
            }

            // 3. Thêm bản ghi cảm xúc mới
            const newReaction = await tx.reaction.create({
                data: { userId, postId, emoji }
            });

            // 4. Phát sự kiện Socket cho những người khác
            eventEmitter.emit(EVENTS.POST.REACTION_ADDED, { userId, postId, emoji });

            // [ABS-14.1 PLATINUM] Tính năng TIME OXYGEN cho bài viết tự hủy
            const post = await tx.post.findUnique({
                where: { uuid: postId },
                select: { isEphemeral: true, expiresAt: true }
            });

            if (post && post.isEphemeral && post.expiresAt) {
                let timeAdjustment = 0;
                if (emoji === '❤️') timeAdjustment = 10; // +10 phút
                if (emoji === '🔥') timeAdjustment = -10; // -10 phút

                if (timeAdjustment !== 0) {
                    const currentExpiresAt = new Date(post.expiresAt);
                    const newExpiresAt = new Date(currentExpiresAt.getTime() + timeAdjustment * 60000);
                    
                    await tx.post.update({
                        where: { uuid: postId },
                        data: { expiresAt: newExpiresAt }
                    });

                    // Phát Socket đặc biệt để cập nhật đồng hồ đếm ngược cho TOÀN BỘ mọi người
                    eventEmitter.emit('post_lifespan_updated', { 
                        postId, 
                        expiresAt: newExpiresAt,
                        adjustment: timeAdjustment 
                    });
                }
            }
            
            return { action: 'add_reaction', status: 'success', emoji: newReaction.emoji };
        });
    }

    /**
     * Kiểm tra trạng thái theo dõi (Dùng cho UI display).
     */
    async isFollowing(followerId, followingId) {
        return await Repository.isFollowing(followerId, followingId);
    }

    /**
     * Các biện pháp bảo vệ tương tác: Chống bot và spam.
     */
    async _runInteractionSafeguards(userId) {
        const frequency = await CacheService.trackInteractionFrequency(userId);
        if (frequency > 30) {
            throw new AppError('Hoạt động quá nhanh. Vui lòng thử lại sau vài giây.', 429);
        }
    }
}

module.exports = new CivicService();
