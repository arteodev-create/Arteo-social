const asyncHandler = require('../../middleware/AsyncHandler');
const { NotFoundError, AuthorizationError } = require('../../core/Errors');
const AlgorithmService = require('./Algorithm.Service');
const AlgorithmRepository = require('./Algorithm.Repository');
const TransformUtils = require('../../utils/Transform.Utils');
const SocketService = require('../../infra/socket/Socket.Service');

// Validation
const { createAlgorithmSchema, updateAlgorithmSchema } = require('./Algorithm.Validation');

const emitFeedChange = ({ userId, action, algorithm, previousIsPublic = false, extra = {} }) => {
    const payload = {
        action,
        uuid: algorithm?.uuid,
        userId,
        isPublic: Boolean(algorithm?.isPublic),
        installedFromId: algorithm?.installedFromId || null,
        ...extra
    };

    SocketService.emitToUser(userId, 'ALGORITHM_UPDATED', payload);
    SocketService.emitToUser(userId, 'FEED_UPDATED', payload);

    if (payload.isPublic || previousIsPublic) {
        SocketService.emitToOthers(userId, 'ALGORITHM_UPDATED', payload);
        SocketService.emitToOthers(userId, 'FEED_UPDATED', payload);
    }
};

const emitPluginLibraryChange = (userId, action, extra = {}) => {
    const payload = { action, userId, ...extra };
    SocketService.emitToUser(userId, 'PLUGIN_UPDATED', payload);
    SocketService.emitToUser(userId, 'plugin_updated', payload);
};

/**
 * Algorithm Controller
 * Orchestrates Feed Discovery and Algorithm Management.
 * Standardized for structural purity per ABS v14.1 Platinum.
 */
class AlgorithmController {
    /**
     * Establishes a new intelligence feed algorithm.
     */
    create = asyncHandler(async (req, res) => {
        const validated = createAlgorithmSchema.parse(req.body);
        const result = await AlgorithmService.create(req.user.uuid, validated);
        
        emitFeedChange({ userId: req.user.uuid, action: 'create', algorithm: result });
        res.created(TransformUtils.formatAlgorithm(result), { message: 'Algorithm established successfully.' });
    });

    /**
     * Updates an existing feed logic configuration.
     */
    update = asyncHandler(async (req, res) => {
        const validated = updateAlgorithmSchema.parse(req.body);
        const { uuid } = req.params;
        const previous = await AlgorithmRepository.findByUuid(uuid);
        const result = await AlgorithmService.update(uuid, req.user.uuid, validated);
        
        emitFeedChange({ userId: req.user.uuid, action: 'update', algorithm: result, previousIsPublic: Boolean(previous?.isPublic) });
        res.success(TransformUtils.formatAlgorithm(result), { message: 'Algorithm updated successfully.' });
    });

    /**
     * Toggles the operational status of an algorithm.
     */
    toggleActive = asyncHandler(async (req, res) => {
        const result = await AlgorithmService.toggleActive(req.params.uuid, req.user.uuid);
        emitFeedChange({ userId: req.user.uuid, action: result.isActive ? 'activate' : 'deactivate', algorithm: result });
        res.success(TransformUtils.formatAlgorithm(result), { message: `Algorithm ${result.isActive ? 'activated' : 'deactivated'} successfully.` });
    });

    /**
     * Retrieves a detailed algorithm definition by UUID.
     */
    getAlgorithmById = asyncHandler(async (req, res) => {
        const identifier = req.params.identifier || req.params.uuid;
        const algorithm = await AlgorithmRepository.findByIdentifier(identifier, req.user?.uuid);
        if (!algorithm) throw new NotFoundError('Algorithm not found.');
        
        // Ownership / Visibility audit
        if (!algorithm.isPublic && algorithm.userId !== req.user?.uuid) {
            throw new AuthorizationError('Access denied: Confidential algorithm.');
        }

        res.success(TransformUtils.formatAlgorithm(algorithm));
    });

    /**
     * Retrieves all algorithms owned by the current identity.
     */
    getUserAlgorithms = asyncHandler(async (req, res) => {
        const algorithms = await AlgorithmRepository.findAllByUser(req.user.uuid);
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.success(algorithms.map(a => TransformUtils.formatAlgorithm(a)));
    });

    /**
     * Retrieves the gallery of public discovery algorithms.
     */
    getPublicAlgorithms = asyncHandler(async (req, res) => {
        const algorithms = await AlgorithmRepository.findPublic();
        res.success(algorithms.map(a => TransformUtils.formatAlgorithm(a)));
    });

    /**
     * Retrieves the feed currently used to rank Home.
     */
    getActiveAlgorithm = asyncHandler(async (req, res) => {
        const algorithm = await AlgorithmRepository.findActiveDetailed(req.user.uuid);
        res.success(algorithm ? TransformUtils.formatAlgorithm(algorithm) : null);
    });

    /**
     * Installs a public discovery algorithm into the user domain.
     */
    install = asyncHandler(async (req, res) => {
        const { uuid } = req.params;
        const result = await AlgorithmService.install(uuid, req.user.uuid);
        const downloadedCount = result.dependencySummary?.downloaded || 0;
        const message = downloadedCount > 0
            ? `Algorithm downloaded with ${downloadedCount} required plugin${downloadedCount > 1 ? 's' : ''}.`
            : 'Algorithm downloaded successfully.';
        emitFeedChange({ userId: req.user.uuid, action: 'install', algorithm: result.algorithm });
        if ((result.dependencySummary?.total || 0) > 0) {
            emitPluginLibraryChange(req.user.uuid, 'dependency_install', {
                dependencies: result.dependencies || [],
                downloadedDependencies: result.downloadedDependencies || [],
                dependencySummary: result.dependencySummary
            });
        }
        res.created(TransformUtils.formatAlgorithm(result.algorithm), {
            message,
            dependencies: result.dependencies || [],
            downloadedDependencies: result.downloadedDependencies || [],
            dependencySummary: result.dependencySummary || { total: 0, downloaded: 0 }
        });
    });

    /**
     * Deletes an algorithm from the platform.
     */
    delete = asyncHandler(async (req, res) => {
        const { uuid } = req.params;
        const algorithm = await AlgorithmRepository.findByUuid(uuid);

        if (!algorithm) {
            // Nếu không tìm thấy, coi như đã xóa thành công để tránh lỗi UI (Idempotent)
            return res.success(null, { message: 'Algorithm removed successfully.' });
        }

        if (algorithm.userId !== req.user.uuid) {
            throw new AuthorizationError('Identity mismatch: Cannot purge external algorithm.');
        }

        await AlgorithmRepository.delete(uuid);
        emitFeedChange({ userId: req.user.uuid, action: 'delete', algorithm, previousIsPublic: Boolean(algorithm.isPublic) });
        res.success(null, { message: 'Algorithm purged successfully.' });
    });

    /**
     * Bumps the version of an algorithm with new logic weights.
     */
    bumpVersion = asyncHandler(async (req, res) => {
        const { uuid } = req.params;
        const { version, weights } = req.body;
        
        const result = await AlgorithmService.bumpVersion(uuid, req.user.uuid, { version, weights });
        emitFeedChange({ userId: req.user.uuid, action: 'version', algorithm: result });
        res.success(TransformUtils.formatAlgorithm(result), { message: 'Algorithm version bumped successfully.' });
    });

    /**
     * Kích hoạt thuật toán (Hỗ trợ tự động cài đặt nếu là thuật toán công khai).
     */
    activate = asyncHandler(async (req, res) => {
        const { uuid } = req.params;
        const result = await AlgorithmService.activate(uuid, req.user.uuid);
        
        SocketService.emitToUser(req.user.uuid, 'ALGO_ACTIVATED', { uuid: result.uuid });
        emitFeedChange({ userId: req.user.uuid, action: 'activate', algorithm: result });
        res.success(TransformUtils.formatAlgorithm(result), { 
            message: `Algorithm ${result.name} activated successfully.` 
        });
    });

    /**
     * Synchronizes local state with the global neural node.
     */
    sync = asyncHandler(async (req, res) => {
        const algorithm = await AlgorithmRepository.findByUuid(req.params.uuid);
        if (!algorithm) throw new NotFoundError('Algorithm not found.');
        res.success(TransformUtils.formatAlgorithm(algorithm), { message: 'Algorithm state synchronized.' });
    });

    /**
     * Ghim thuật toán yêu thích.
     */
    pin = asyncHandler(async (req, res) => {
        const { uuid } = req.params;
        const result = await AlgorithmService.pin(uuid, req.user.uuid);
        
        emitFeedChange({ userId: req.user.uuid, action: 'pin', algorithm: result });
        res.success(TransformUtils.formatAlgorithm(result), { message: 'Đã ghim thuật toán.' });
    });

    /**
     * Bỏ ghim thuật toán.
     */
    unpin = asyncHandler(async (req, res) => {
        const { uuid } = req.params;
        const result = await AlgorithmService.unpin(uuid, req.user.uuid);
        
        emitFeedChange({ userId: req.user.uuid, action: 'unpin', algorithm: result });
        res.success(TransformUtils.formatAlgorithm(result), { message: 'Đã bỏ ghim thuật toán.' });
    });
}

module.exports = new AlgorithmController();
