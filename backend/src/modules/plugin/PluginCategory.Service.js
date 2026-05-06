const PluginCategoryRepository = require('./PluginCategory.Repository');
const StringUtils = require('../../utils/String.Utils');
const { ConflictError } = require('../../core/Errors');
const Logger = require('../../infra/logging/Logger.Service');

/**
 * PluginCategory Service
 * Orchestrates the management and validation logic for extension categories.
 * Standardized for ABS v14.1 Platinum.
 */
class PluginCategoryService {
    /**
     * Retrieves all categories for platform enumeration.
     */
    async getAll() {
        Logger.info('[PluginCategoryService] Enumerating extension categories.');
        return await PluginCategoryRepository.findAll();
    }

    /**
     * Establishes a new category entity with slug integrity.
     */
    async create(data) {
        const { name, description = '' } = data;
        const slug = StringUtils.slugify(name);

        // Idempotency check: Ensure slug uniqueness
        const existing = await PluginCategoryRepository.findBySlug(slug);
        if (existing) {
            throw new ConflictError(`Category identity "${name}" (slug: ${slug}) already exists.`);
        }

        Logger.info(`[PluginCategoryService] Establishing new category entity: ${name} (${slug})`);

        return await PluginCategoryRepository.create({
            name,
            slug,
            description,
            isSystem: false
        });
    }

    /**
     * Strategic Resolution: Finds or creates a category based on name.
     * Essential for the "Create for Real" flow in Plugin Studio.
     */
    async findOrCreate(name) {
        const slug = StringUtils.slugify(name);
        const existing = await PluginCategoryRepository.findBySlug(slug);
        
        if (existing) return existing;

        return await this.create({ name });
    }
}

module.exports = new PluginCategoryService();
