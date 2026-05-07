const asyncHandler = require('../../middleware/AsyncHandler');
const PluginService = require('./Plugin.Service');
const TransformUtils = require('../../utils/Transform.Utils');
const SocketService = require('../../infra/socket/Socket.Service');

// Validation
const { createPluginSchema, updatePluginSchema } = require('./Plugin.Validation');

const emitPluginChange = ({ userId, action, plugin, previousIsPublic = false }) => {
    const payload = {
        action,
        uuid: plugin?.uuid,
        userId,
        isPublic: Boolean(plugin?.isPublic),
        installedFromId: plugin?.installedFromId || null
    };

    SocketService.emitToUser(userId, 'PLUGIN_UPDATED', payload);
    SocketService.emitToUser(userId, 'plugin_updated', payload);

    if (payload.isPublic || previousIsPublic) {
        SocketService.emitToOthers(userId, 'PLUGIN_UPDATED', payload);
        SocketService.emitToOthers(userId, 'plugin_updated', payload);
    }
};

/**
 * Plugin Controller
 * API Surface for the Arteo Re-Code Extension Engine.
 * Standardized for structural purity per ABS v14.1 Platinum.
 */
class PluginController {
    /**
     * Retrieves all accessible extensions for the current identity scope.
     */
    getAll = asyncHandler(async (req, res) => {
        const userId = req.user?.uuid;
        const plugins = await PluginService.getAllAccessible(userId);
        res.success({ plugins: plugins.map(p => TransformUtils.formatPlugin(p)) });
    });

    getPublic = asyncHandler(async (req, res) => {
        const plugins = await PluginService.getPublic();
        res.success({ plugins: plugins.map(p => TransformUtils.formatPlugin(p)) });
    });

    getOwned = asyncHandler(async (req, res) => {
        const plugins = await PluginService.getOwned(req.user.uuid);
        res.success({ plugins: plugins.map(p => TransformUtils.formatPlugin(p)) });
    });

    /**
     * Retrieves a detailed extension definition by UUID.
     */
    getById = asyncHandler(async (req, res) => {
        const identifier = req.params.identifier || req.params.uuid;
        const plugin = await PluginService.getById(identifier, req.user?.uuid);
        res.success({ plugin: TransformUtils.formatPlugin(plugin) });
    });

    /**
     * Establishes a new primary extension with security validation.
     */
    create = asyncHandler(async (req, res) => {
        const validated = createPluginSchema.parse(req.body);
        const plugin = await PluginService.create(req.user.uuid, validated);
        emitPluginChange({ userId: req.user.uuid, action: 'create', plugin });
        res.created({ plugin: TransformUtils.formatPlugin(plugin) }, { message: 'Extension established successfully.' });
    });

    install = asyncHandler(async (req, res) => {
        const { uuid } = req.params;
        const plugin = await PluginService.install(uuid, req.user.uuid);
        emitPluginChange({ userId: req.user.uuid, action: 'install', plugin });
        res.created({ plugin: TransformUtils.formatPlugin(plugin) }, { message: 'Plugin downloaded to your Arteo Library.' });
    });

    download = asyncHandler(async (req, res) => {
        const identifier = req.params.identifier || req.params.uuid;
        const file = await PluginService.download(identifier, req.user?.uuid);
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
        res.send(file.content);
    });

    uninstall = asyncHandler(async (req, res) => {
        const { uuid } = req.params;
        const plugin = await PluginService.getById(uuid, req.user.uuid);
        await PluginService.uninstall(uuid, req.user.uuid);
        emitPluginChange({ userId: req.user.uuid, action: 'uninstall', plugin, previousIsPublic: Boolean(plugin?.isPublic) });
        res.success(null, { message: 'Plugin removed from your Arteo Library.' });
    });

    /**
     * Strategic update of an existing extension definition.
     */
    update = asyncHandler(async (req, res) => {
        const validated = updatePluginSchema.parse(req.body);
        const { uuid } = req.params;
        const previous = await PluginService.getById(uuid, req.user.uuid);
        const updated = await PluginService.update(uuid, req.user.uuid, validated);
        emitPluginChange({ userId: req.user.uuid, action: 'update', plugin: updated, previousIsPublic: Boolean(previous?.isPublic) });
        res.success({ plugin: TransformUtils.formatPlugin(updated) }, { message: 'Extension definition rotated.' });
    });

    /**
     * Purges an existing extension from the neural node.
     */
    delete = asyncHandler(async (req, res) => {
        const { uuid } = req.params;
        const plugin = await PluginService.getById(uuid, req.user.uuid);
        await PluginService.delete(uuid, req.user.uuid);
        emitPluginChange({ userId: req.user.uuid, action: 'delete', plugin, previousIsPublic: Boolean(plugin?.isPublic) });
        res.success(null, { message: 'Extension purged successfully.' });
    });
}

module.exports = new PluginController();
