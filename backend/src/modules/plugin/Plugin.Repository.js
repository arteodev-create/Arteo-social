const BaseRepository = require('../../core/Base.Repository');
const StringUtils = require('../../utils/String.Utils');

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Plugin Repository
 * Data access layer for Arteo Plugins (Re-Code Extensions).
 * Standardized as Instance-based per ABS v14.1.
 */
class PluginRepository extends BaseRepository {
    constructor() {
        super('plugin');
    }

    get _authorSelect() {
        return { uuid: true, username: true, identityDomain: true, fullName: true, avatar: true, isVerified: true };
    }

    /**
     * Standard mapping for consistency across the plugin domain.
     */
    map(plugin) {
        if (!plugin) return null;
        const mapped = {
            ...plugin,
            // [ABS-SYNC] Handle potential missing columns in high-fidelity mapping
            isActive: plugin.isActive ?? true,
            isPublic: plugin.isPublic ?? true,
            version: plugin.version ?? '1.0.0'
        };
        if (mapped.author) {
            mapped.author.uuid = mapped.author.uuid;
        }
        return mapped;
    }

    /**
     * Retrieves a paginated list of plugins based on visibility logic.
     */
    async findMany(where) {
        try {
            const plugins = await this.model.findMany({
                where: { ...where, deletedAt: null },
                include: {
                    author: { select: this._authorSelect },
                    categoryRel: true
                },
                orderBy: { createdAt: 'desc' }
            });
            return plugins.map(p => this.map(p));
        } catch (error) {
            return [];
        }
    }

    /**
     * Finds a specific plugin by its primary identifier (UUID).
     */
    async findByUuid(uuid) {
        const plugin = await this.model.findUnique({
            where: { uuid },
            include: {
                author: { select: this._authorSelect },
                categoryRel: true
            }
        });
        return plugin?.deletedAt ? null : this.map(plugin);
    }

    async findByIdentifier(identifier, userId) {
        if (!identifier) return null;
        if (UUID_PATTERN.test(identifier)) return this.findByUuid(identifier);

        const readableSlug = StringUtils.slugify(identifier);
        const plugins = await this.model.findMany({
            where: {
                deletedAt: null,
                OR: userId
                    ? [{ isPublic: true }, { authorId: userId }]
                    : [{ isPublic: true }]
            },
            include: {
                author: { select: this._authorSelect },
                categoryRel: true
            },
            orderBy: [
                { isPublic: 'desc' },
                { createdAt: 'desc' }
            ]
        });

        return this.map(plugins.find((plugin) => StringUtils.slugify(plugin.name) === readableSlug));
    }

    async findInstalledCopy(source, userId) {
        if (!source || !userId) return null;
        const plugin = await this.model.findFirst({
            where: {
                authorId: userId,
                deletedAt: null,
                OR: [
                    { installedFromId: source.uuid },
                    { name: source.name },
                    { code: source.code }
                ]
            },
            include: {
                author: { select: this._authorSelect },
                categoryRel: true
            },
            orderBy: { createdAt: 'desc' }
        });
        return this.map(plugin);
    }

    /**
     * Establishes a new plugin extension.
     */
    async create(data) {
        const plugin = await this.model.create({ data });
        return this.map(plugin);
    }

    /**
     * Updates an existing plugin definition.
     */
    async update(uuid, data) {
        const plugin = await this.model.update({
            where: { uuid },
            data
        });
        return this.map(plugin);
    }

    async cloneForUser(source, userId) {
        const plugin = await this.model.create({
            data: {
                authorId: userId,
                name: source.name,
                description: source.description,
                code: source.code,
                category: source.category || 'General',
                categoryId: source.categoryId,
                isPublic: false,
                version: source.version || '1.0.0',
                blocksMetadata: source.blocksMetadata || [],
                installedFromId: source.installedFromId || source.uuid,
                tags: source.tags || []
            },
            include: {
                author: { select: this._authorSelect },
                categoryRel: true
            }
        });
        return this.map(plugin);
    }
}

module.exports = new PluginRepository();
