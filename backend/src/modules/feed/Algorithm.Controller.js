const asyncHandler = require('../../middleware/AsyncHandler');
const { NotFoundError, AuthorizationError } = require('../../core/Errors');
const AlgorithmService = require('./Algorithm.Service');
const AlgorithmRepository = require('./Algorithm.Repository');
const TransformUtils = require('../../utils/Transform.Utils');
const SocketService = require('../../infra/socket/Socket.Service');

// Validation
const { createAlgorithmSchema, updateAlgorithmSchema } = require('./Algorithm.Validation');

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
        
        SocketService.emitToUser(req.user.uuid, 'ALGORITHM_UPDATED', { action: 'create' });
        res.created(TransformUtils.formatAlgorithm(result), { message: 'Algorithm established successfully.' });
    });

    /**
     * Updates an existing feed logic configuration.
     */
    update = asyncHandler(async (req, res) => {
        const validated = updateAlgorithmSchema.parse(req.body);
        const { uuid } = req.params;
        const result = await AlgorithmService.update(uuid, req.user.uuid, validated);
        
        SocketService.emitToUser(req.user.uuid, 'ALGORITHM_UPDATED', { action: 'update' });
        res.success(TransformUtils.formatAlgorithm(result), { message: 'Algorithm updated successfully.' });
    });

    /**
     * Toggles the operational status of an algorithm.
     */
    toggleActive = asyncHandler(async (req, res) => {
        const result = await AlgorithmService.toggleActive(req.params.uuid, req.user.uuid);
        res.success(TransformUtils.formatAlgorithm(result), { message: `Algorithm ${result.isActive ? 'activated' : 'deactivated'} successfully.` });
    });

    /**
     * Retrieves a detailed algorithm definition by UUID.
     */
    getAlgorithmById = asyncHandler(async (req, res) => {
        const algorithm = await AlgorithmRepository.findByUuid(req.params.uuid);
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
     * Installs a public discovery algorithm into the user domain.
     */
    install = asyncHandler(async (req, res) => {
        const { uuid } = req.params;
        const result = await AlgorithmService.install(uuid, req.user.uuid);
        res.created(TransformUtils.formatAlgorithm(result), { message: 'Algorithm installed successfully.' });
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
        SocketService.emitToUser(req.user.uuid, 'ALGORITHM_UPDATED', { action: 'delete' });
        res.success(null, { message: 'Algorithm purged successfully.' });
    });

    /**
     * Bumps the version of an algorithm with new logic weights.
     */
    bumpVersion = asyncHandler(async (req, res) => {
        const { uuid } = req.params;
        const { version, weights } = req.body;
        
        const result = await AlgorithmService.bumpVersion(uuid, req.user.uuid, { version, weights });
        res.success(TransformUtils.formatAlgorithm(result), { message: 'Algorithm version bumped successfully.' });
    });

    /**
     * Kích hoạt thuật toán (Hỗ trợ tự động cài đặt nếu là thuật toán công khai).
     */
    activate = asyncHandler(async (req, res) => {
        const { uuid } = req.params;
        const result = await AlgorithmService.activate(uuid, req.user.uuid);
        
        SocketService.emitToUser(req.user.uuid, 'ALGO_ACTIVATED', { uuid: result.uuid });
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
        
        SocketService.emitToUser(req.user.uuid, 'ALGORITHM_UPDATED', { action: 'pin' });
        res.success(TransformUtils.formatAlgorithm(result), { message: 'Đã ghim thuật toán.' });
    });

    /**
     * Bỏ ghim thuật toán.
     */
    unpin = asyncHandler(async (req, res) => {
        const { uuid } = req.params;
        const result = await AlgorithmService.unpin(uuid, req.user.uuid);
        
        SocketService.emitToUser(req.user.uuid, 'ALGORITHM_UPDATED', { action: 'unpin' });
        res.success(TransformUtils.formatAlgorithm(result), { message: 'Đã bỏ ghim thuật toán.' });
    });
}

module.exports = new AlgorithmController();
