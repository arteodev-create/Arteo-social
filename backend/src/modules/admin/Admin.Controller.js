const asyncHandler = require('../../middleware/AsyncHandler');
const { AppError } = require('../../core/Errors');
const AdminService = require('./Admin.Service');

// Validation
const { 
    getPaginatedUsersSchema, 
    getPaginatedPostsSchema, 
    updateUserSchema 
} = require('./Admin.Validation');

/**
 * Admin Controller
 * Strategic control surface for Arteo platform management.
 * Standardized for structural purity per ABS v14.1 Platinum.
 */
class AdminController {
    /**
     * Aggregates global system health and metric signals.
     */
    getStats = asyncHandler(async (req, res) => {
        const stats = await AdminService.getGlobalStats();
        res.success(stats, { message: 'Đã truy xuất tín hiệu sức khỏe hệ thống.' });
    });

    /**
     * Managed user enumeration with strictly validated pagination.
     */
    getUsers = asyncHandler(async (req, res) => {
        const validated = getPaginatedUsersSchema.parse(req.query);
        const result = await AdminService.getPaginatedUsers(validated);
        
        res.success(result, { message: 'Đã liệt kê danh sách cư dân thành công.' });
    });

    /**
     * Executes administrative overrides on a specific user identity.
     */
    updateUser = asyncHandler(async (req, res) => {
        const { uuid } = req.params;
        const data = updateUserSchema.parse(req.body);

        // Security: Không được tự khóa chính mình
        if (uuid === req.user.uuid) {
            throw new AppError('Giao thức bảo mật: Không thể tự thay đổi trạng thái của chính mình.', 403);
        }

        const updated = await AdminService.updateUser(uuid, data);
        res.success(updated, { message: 'Đã cập nhật trạng thái cư dân thành công.' });
    });

    /**
     * Retrieves health status for various infrastructure integrations.
     */
    getSystemHealth = asyncHandler(async (req, res) => {
        const health = await AdminService.getSystemHealth();
        res.success(health, { message: 'Toàn vẹn hạ tầng đã được xác thực.' });
    });

    /**
     * Managed post enumeration for moderation.
     */
    getPosts = asyncHandler(async (req, res) => {
        const validated = getPaginatedPostsSchema.parse(req.query);
        const result = await AdminService.getPaginatedPosts(validated);
        res.success(result, { message: 'Đã truy xuất danh sách bài viết kiểm duyệt.' });
    });

    /**
     * Administrative removal of a post.
     */
    deletePost = asyncHandler(async (req, res) => {
        const { uuid } = req.params;
        await AdminService.deletePost(uuid);
        res.success(null, { message: 'Đã xóa bài viết vi phạm thành công.' });
    });
}

module.exports = new AdminController();
