const BaseRepository = require('../../core/Base.Repository');

/**
 * System Repository
 * Infrastructure data access layer for raw system diagnostics.
 * Standardized as Instance-based per ABS v14.1.
 */
class SystemRepository extends BaseRepository {
    constructor() {
        super(null); // No primary model for system diagnostics
    }

    /**
     * Executes a raw ping to the database to ensure connection readiness.
     */
    async pingDatabase() {
        return await this.prisma.$queryRaw`SELECT 1`;
    }
}

module.exports = new SystemRepository();
