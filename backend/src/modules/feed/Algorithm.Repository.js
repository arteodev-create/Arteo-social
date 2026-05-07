const BaseRepository = require('../../core/Base.Repository');
const StringUtils = require('../../utils/String.Utils');

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Algorithm Repository
 * Specialized repository for managing user-defined and system feed algorithms.
 * Standardized as Instance-based per ABS v14.1.
 */
class AlgorithmRepository extends BaseRepository {
    constructor() {
        super('userAlgorithm');
    }

    // Mapping offloaded to Platinum TransformUtils layer.
    get _userSelect() {
        return { uuid: true, username: true, identityDomain: true, fullName: true, avatar: true };
    }

    get _standardInclude() {
        return { user: { select: this._userSelect } };
    }


    /**
     * Internal: Ensures identity object integrity during Schema Rift transitions.
     */
    _mapEntity(item) {
        if (!item) return null;
        return {
            ...item,
            // Fallback for potentially missing system columns
            isActive: item.isActive ?? true,
            isPublic: item.isPublic ?? true,
            version: item.version ?? '1.0.0'
        };
    }

    /**
     * Retrieves the active algorithm for a specific user.
     */
    async findActive(userId) {
        try {
            const result = await this.model.findFirst({
                where: { userId, isActive: true },
                select: {
                    uuid: true,
                    name: true,
                    weights: true,
                    pipeline: true,
                    description: true,
                    isPublic: true,
                    isActive: true,
                    version: true,
                    tags: true,
                    installedFromId: true,
                    createdAt: true
                }
            });
            return this._mapEntity(result);
        } catch (error) {
            return null;
        }
    }

    async findActiveDetailed(userId) {
        if (!userId) return null;
        const result = await this.model.findFirst({
            where: { userId, isActive: true, deletedAt: null },
            include: {
                user: { select: this._userSelect }
            },
            orderBy: { updatedAt: 'desc' }
        });
        return this._mapEntity(result);
    }

    /**
     * Finds a unique name for an algorithm by appending a counter if necessary.
     */
    async findUniqueName(userId, baseName) {
        let name = baseName;
        let counter = 1;
        while (await this.model.findFirst({ where: { userId, name, deletedAt: null } })) {
            name = `${baseName} (${counter})`;
            counter++;
        }
        return name;
    }

    /**
     * Deactivate all algorithms for a user.
     */
    async deactivateAll(userId) {
        return await this.model.updateMany({
            where: { userId },
            data: { isActive: false }
        });
    }

    /**
     * Retrieves public algorithms.
     */
    async findPublic() {
        try {
            const results = await this.model.findMany({
                where: { isPublic: true, deletedAt: null },
                include: {
                    user: { select: this._userSelect }
                },
                orderBy: { createdAt: 'desc' }
            });
            return results.map(r => this._mapEntity(r));
        } catch (error) {
            // Passive fallback to empty collection to prevent HTTP 500
            return [];
        }
    }

    async findByIdentifier(identifier, userId) {
        if (!identifier) return null;
        if (UUID_PATTERN.test(identifier)) return this.findByUuid(identifier);

        const readableSlug = StringUtils.slugify(identifier);
        const algorithms = await this.model.findMany({
            where: {
                deletedAt: null,
                OR: userId
                    ? [{ isPublic: true }, { userId }]
                    : [{ isPublic: true }]
            },
            include: {
                user: { select: this._userSelect }
            },
            orderBy: [
                { isPublic: 'desc' },
                { createdAt: 'desc' }
            ]
        });

        return this._mapEntity(algorithms.find((algorithm) => StringUtils.slugify(algorithm.name) === readableSlug));
    }

    /**
     * Retrieves all algorithms belonging to a user.
     */
    async findAllByUser(userId) {
        return await this.model.findMany({
            where: { userId, deletedAt: null },
            include: {
                user: { select: this._userSelect }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Retrieves featured public algorithms for platform recommendations.
     */
    async findFeatured(limit = 10) {
        const allPublic = await this.model.findMany({
            where: { isPublic: true, deletedAt: null },
            include: { user: { select: this._userSelect } }
        });

        // Shuffle and take limit
        return allPublic
            .sort(() => Math.random() - 0.5)
            .slice(0, limit);
    }

    /**
     * Alias for findFeatured to satisfy SearchService contracts. 
     */
    async findRecommended(limit = 10) {
        return this.findFeatured(limit);
    }

    /**
     * Retrieves the complete discovery set for a user:
     * Their own algorithms + all public ones.
     */
    async findDiscoverySet(userId) {
        return await this.model.findMany({
                where: {
                    deletedAt: null,
                    OR: [
                        { userId },
                        { isPublic: true }
                    ]
                },
            include: {
                user: { select: this._userSelect }
            },
            orderBy: [
                { isPublic: 'desc' },
                { createdAt: 'desc' }
            ]
        });
    }

    /**
     * Counts how many algorithms a user has pinned.
     */
    async countPinned(userId) {
        return await this.model.count({
            where: { userId, isPinned: true, deletedAt: null }
        });
    }

    /**
     * Finds all pinned algorithms for a user, ordered by pin order.
     */
    async findPinned(userId) {
        return await this.model.findMany({
            where: { userId, isPinned: true, deletedAt: null },
            orderBy: { pinOrder: 'asc' }
        });
    }

    /**
     * Finds the algorithm with the highest pin order.
     */
    async findLastPin(userId) {
        return await this.model.findFirst({
            where: { userId, isPinned: true, deletedAt: null },
            orderBy: { pinOrder: 'desc' }
        });
    }

    /**
     * Reorders pins after an algorithm is unpinned to maintain sequence (1, 2, 3).
     */
    async reorderPinsAfterUnpin(userId, unpinnedOrder) {
        return await this.model.updateMany({
            where: { 
                userId, 
                isPinned: true, 
                pinOrder: { gt: unpinnedOrder },
                deletedAt: null 
            },
            data: { pinOrder: { decrement: 1 } }
        });
    }

    /**
     * Retrieves all unique categories (tags) from public algorithms.
     */
    async findAllPublicCategories() {
        const algorithms = await this.model.findMany({
            where: { isPublic: true, deletedAt: null },
            select: { tags: true }
        });

        const allTags = algorithms.flatMap(a => a.tags || []);
        return [...new Set(allTags)].filter(t => t && t !== 'Arteo_Standard');
    }
}

module.exports = new AlgorithmRepository();
