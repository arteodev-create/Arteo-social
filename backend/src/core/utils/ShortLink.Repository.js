const BaseRepository = require('../../core/Base.Repository');

/**
 * ShortLinkRepository
 * Specialized data access layer for the Arteo ShortLink (ASL) system.
 * Standardized as Instance-based per ABS v14.1.
 */
class ShortLinkRepository extends BaseRepository {
    constructor() {
        super('shortLink');
    }

    /**
     * Resolves a slug to its original identity.
     */
    async findBySlug(slug) {
        return await this.model.findUnique({
            where: { slug },
            include: { creator: true }
        });
    }

    /**
     * Establishes a new shortened connection.
     */
    async create(data) {
        return await this.model.create({
            data,
            include: { creator: true }
        });
    }

    /**
     * Performs an atomic increment of the click telemetry count.
     */
    async incrementClicks(uuid) {
        return await this.model.update({
            where: { uuid },
            data: { clicks: { increment: 1 } }
        });
    }
}

module.exports = new ShortLinkRepository();
