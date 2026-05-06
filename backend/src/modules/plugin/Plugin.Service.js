const Logger = require('../../infra/logging/Logger.Service');
const PluginRepository = require('./Plugin.Repository');
const PluginCategoryService = require('./PluginCategory.Service');
const { NotFoundError, AuthorizationError } = require('../../core/Errors');

/**
 * Plugin Service
 * Orchestrates the lifecycle, security, and execution parameters of Re-Code extensions.
 * Standardized for ABS v14.1 Platinum.
 */
class PluginService {
    /**
     * Retrieves all accessible plugins based on identity scope.
     */
    async getAllAccessible(userId) {
        const where = userId
            ? { OR: [{ isPublic: true }, { authorId: userId }] }
            : { isPublic: true };

        return await PluginRepository.findMany(where);
    }

    async getPublic() {
        return await PluginRepository.findMany({ isPublic: true });
    }

    async getOwned(userId) {
        return await PluginRepository.findMany({ authorId: userId });
    }

    /**
     * Retrieves a specific plugin with ownership verification.
     */
    async getById(uuid, userId) {
        const plugin = await PluginRepository.findByUuid(uuid);
        if (!plugin) throw new NotFoundError('Plugin');

        if (!plugin.isPublic && plugin.authorId !== userId) {
            throw new AuthorizationError('Access denied: Confidential extension.');
        }

        return plugin;
    }

    /**
     * Establishes a new extension with security audit.
     */
    async create(userId, data) {
        const { name, description, code, category, categoryId, blocksMetadata = [], isPublic = false, version = '1.0.0' } = data;

        Logger.info(`[PluginService] Establishing new extension: ${name} for identity ${userId}`);

        // Strategic Category Resolution
        let resolvedCategoryId = categoryId;
        if (!resolvedCategoryId && category) {
            const catEntity = await PluginCategoryService.findOrCreate(category);
            resolvedCategoryId = catEntity.uuid;
        }

        return await PluginRepository.create({
            name,
            description,
            code,
            category, // Legacy support
            categoryId: resolvedCategoryId,
            blocksMetadata,
            authorId: userId,
            isPublic,
            version
        });
    }

    /**
     * Updates an existing definition with ownership validation.
     */
    async update(uuid, userId, data) {
        const plugin = await PluginRepository.findByUuid(uuid);
        if (!plugin) throw new NotFoundError('Plugin');
        if (plugin.authorId !== userId) throw new AuthorizationError('Identity mismatch: Modification denied.');

        Logger.info(`[PluginService] Strategic rotation of extension: ${uuid}`);

        return await PluginRepository.update(uuid, data);
    }

    /**
     * Installs a public library plugin into the current user's private workspace.
     */
    async install(uuid, userId) {
        const plugin = await PluginRepository.findByUuid(uuid);
        if (!plugin) throw new NotFoundError('Plugin');
        if (!plugin.isPublic && plugin.authorId !== userId) {
            throw new AuthorizationError('Access denied: Confidential extension.');
        }

        if (plugin.authorId === userId) return plugin;

        const existing = await PluginRepository.findInstalledCopy(plugin, userId);
        if (existing) return existing;

        Logger.info(`[PluginService] Installing library extension: ${uuid} for identity ${userId}`);
        return await PluginRepository.cloneForUser(plugin, userId);
    }

    /**
     * Produces a portable ReCode file payload for client-side download.
     */
    async download(uuid, userId) {
        const plugin = await this.getById(uuid, userId);
        const safeName = plugin.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'arteo-plugin';
        return {
            filename: `${safeName}-${plugin.version || '1.0.0'}.recode`,
            content: plugin.code || ''
        };
    }

    /**
     * Removes the installed copy from the current user's workspace.
     */
    async uninstall(uuid, userId) {
        const plugin = await PluginRepository.findByUuid(uuid);
        if (!plugin) throw new NotFoundError('Plugin');
        if (plugin.authorId !== userId) {
            const installed = await PluginRepository.findInstalledCopy(plugin, userId);
            if (!installed) throw new NotFoundError('Installed plugin');
            return await PluginRepository.delete(installed.uuid);
        }

        return await PluginRepository.delete(plugin.uuid);
    }

    /**
     * Purges an extension from the platform.
     */
    async delete(uuid, userId) {
        const plugin = await PluginRepository.findByUuid(uuid);
        if (!plugin) throw new NotFoundError('Plugin');
        if (plugin.authorId !== userId) throw new AuthorizationError('Identity mismatch: Purge denied.');

        Logger.info(`[PluginService] Extension purged: ${uuid}`);

        return await PluginRepository.delete(uuid);
    }
}

module.exports = new PluginService();
