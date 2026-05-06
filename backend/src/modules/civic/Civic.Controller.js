const CivicService = require('./Civic.Service');
const AsyncHandler = require('../../middleware/AsyncHandler');
const { BadRequestError } = require('../../core/Errors');

/**
 * [AIS] CivicController
 * API Surface cho các tương tác dân sự trong hệ thống Arteo.
 * Arteo Platform Edition.
 */
class CivicController {
    
    /**
     * POST /api/civic/:uuid/toggle-follow
     * Chuyển đổi trạng thái theo dõi công dân.
     */
    toggleFollow = AsyncHandler(async (req, res) => {
        const { uuid } = req.params;
        const followerId = req.user.uuid;

        if (!uuid) throw new BadRequestError('Cần cung cấp định danh công dân.');

        const result = await CivicService.toggleFollow(followerId, uuid);
        
        res.status(200).json({
            success: true,
            data: result,
            message: result.action === 'follow' ? 'Đã bắt đầu theo dõi công dân.' : 'Đã bỏ theo dõi công dân.'
        });
    });

    /**
     * GET /api/civic/:uuid/status
     * Kiểm tra trạng thái quan hệ dân sự với công dân khác.
     */
    getRelationshipStatus = AsyncHandler(async (req, res) => {
        const { uuid } = req.params;
        const followerId = req.user.uuid;

        const isFollowing = await CivicService.isFollowing(followerId, uuid);

        res.status(200).json({
            success: true,
            data: { isFollowing }
        });
    });

    /**
     * POST /api/civic/posts/:postId/react
     * Chuyển đổi trạng thái cảm xúc dân sự cho bài viết.
     */
    toggleReaction = AsyncHandler(async (req, res) => {
        const { postId } = req.params;
        const { emoji } = req.body;
        const userId = req.user.uuid;

        if (!postId || !emoji) throw new BadRequestError('Cần cung cấp bài viết và cảm xúc.');

        const result = await CivicService.toggleReaction(userId, postId, emoji);

        res.status(200).json({
            success: true,
            data: result
        });
    });
}

module.exports = new CivicController();
