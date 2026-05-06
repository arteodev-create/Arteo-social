const prisma = require('../../config/Prisma.Client');

/**
 * PluginCategory Repository
 * Handles direct database interactions for extension categories.
 * Standardized for ABS v14.1 Platinum.
 */
class PluginCategoryRepository {
    /**
     * Retrieves all categories ordered by usage or name.
     */
    async findAll() {
        return await prisma.pluginCategory.findMany({
            orderBy: { name: 'asc' }
        });
    }

    /**
     * Finds a specific category by its unique slug.
     */
    async findBySlug(slug) {
        return await prisma.pluginCategory.findUnique({
            where: { slug }
        });
    }

    /**
     * Finds a specific category by its unique name.
     */
    async findByName(name) {
        return await prisma.pluginCategory.findUnique({
            where: { name }
        });
    }

    /**
     * Creates a new category entity.
     */
    async create(data) {
        return await prisma.pluginCategory.create({
            data
        });
    }

    /**
     * Increases usage count of a category.
     */
    async incrementUsage(uuid) {
        return await prisma.pluginCategory.update({
            where: { uuid },
            data: { usageCount: { increment: 1 } }
        });
    }
}

module.exports = new PluginCategoryRepository();
