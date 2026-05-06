const { prisma } = require('../config');
const { AppError } = require('./Errors');
const Logger = require('../infra/logging/Logger.Service');

/**
 * BaseRepository: Common data access patterns for all Domain Repositories.
 */
class BaseRepository {
    constructor(modelName = null) {
        this.prisma = prisma;
        this.modelName = modelName;
    }

    /**
     * Lazy-loaded model instance.
     * Resolves circular dependency rifts during system startup.
     */
    get model() {
        if (!this.modelName) return null;
        
        const modelInstance = this.prisma[this.modelName];
        if (!modelInstance) {
            Logger.error(`[BaseRepository] Model Detection Failure: '${this.modelName}'.`);
            throw new AppError(`Prisma model '${this.modelName}' is not registered in the schema.`, 500);
        }
        return modelInstance;
    }

    async create(data) {
        this._ensureModelProvisioned();
        const { 
            credentialResetToken, 
            credentialResetExpires, 
            sessionSalt,
            ...safeData 
        } = data;
        return this.model.create({ data: safeData });
    }

    async update(uuid, data) {
        this._ensureModelProvisioned();
        if (!uuid) throw new AppError('UUID is required for update.', 400);

        const { 
            credentialResetToken, 
            credentialResetExpires, 
            sessionSalt,
            ...safeData 
        } = data;

        return this.model.update({
            where: { uuid },
            data: safeData
        });
    }

    async delete(uuid) {
        this._ensureModelProvisioned();
        return this.softDelete(uuid);
    }

    _ensureModelProvisioned() {
        if (!this.model) {
            throw new AppError('Repository model not provisioned.', 500);
        }
    }

    /**
     * Record mapping: Ensures entity integrity.
     */
    _mapEntity(data) {
        return data; // Default identifies as pass-through
    }

    /**
     * Primary Identifier Lookup: Finds a record by its unique UUID.
     */
    async findByUuid(uuid) {
        if (!uuid) return null;
        
        try {
            const params = {
                where: { uuid, deletedAt: null }
            };

            // Dynamic schema mapping
            if (this._standardSelect) {
                params.select = this._standardSelect;
            } else if (this._standardInclude) {
                params.include = this._standardInclude;
            }

            const record = await this.model.findFirst(params);
            return this._mapEntity(record);
        } catch (error) {
            // Resilient retry for Schema Rifts
            const errorMsg = error.message || '';
            if (errorMsg.includes('deletedAt') || errorMsg.includes('deleted_at') || errorMsg.includes('Unknown field')) {
                try {
                    const fallbackParams = { where: { uuid } };
                    if (this._standardSelect) fallbackParams.select = this._standardSelect;
                    else if (this._standardInclude) fallbackParams.include = this._standardInclude;
                    
                    const record = await this.model.findFirst(fallbackParams);
                    return this._mapEntity(record);
                } catch (retryError) {
                    Logger.error(`[BaseRepository:findByUuid] Critical Retry Failure:`, { error: retryError.message });
                }
            }

            Logger.error(`[BaseRepository:findByUuid] Error:`, { error: error.message });
            return null;
        }
    }

    /**
     * Alias for Primary Lookup (UUID-pure).
     */
    async findById(uuid) {
        return this.findByUuid(uuid);
    }

    /**
     * RESTRICTED: Finds a record by its internal legacy integer ID.
     * Only for maintenance or background pruning. Never for public identity propagation.
     */
    async _findInternalById(id) {
        if (!id) return null;
        const parsedId = parseInt(id);
        if (isNaN(parsedId)) return null;
        
        return this.model.findFirst({
            where: { id: parsedId, deletedAt: null }
        });
    }

    /**
     * Retrieves all active records (not soft-deleted) based on an optional filter.
     */
    async findActive(where = {}, otherParams = {}) {
        return this.model.findMany({
            where: { ...where, deletedAt: null },
            ...otherParams
        });
    }

    /**
     * Standardized pagination orchestrator.
     * Enforces Arteo Platinum telemetry (deletedAt filter) and skip/take boundaries.
     */
    async findPaginated(where = {}, skip = 0, take = 20, orderBy = { createdAt: 'desc' }) {
        this._ensureModelProvisioned();
        
        const params = {
            where: { ...where, deletedAt: null },
            skip: parseInt(skip) || 0,
            take: parseInt(take) || 20,
            orderBy
        };

        if (this._standardSelect) params.select = this._standardSelect;
        else if (this._standardInclude) params.include = this._standardInclude;

        return this.model.findMany(params);
    }

    /**
     * Performs a non-destructive soft-delete.
     */
    async softDelete(uuid) {
        if (!uuid) throw new AppError('UUID is required for soft-delete orchestration.', 400);
        return this.model.update({
            where: { uuid },
            data: { deletedAt: new Date() }
        });
    }

    /**
     * Hardware-level deletion (Force Delete).
     */
    async forceDelete(uuid) {
        return this.model.delete({
            where: { uuid }
        });
    }

    /**
     * Counts active records based on a filter.
     */
    async count(where = {}) {
        return this.model.count({
            where: { ...where, deletedAt: null }
        });
    }
}

module.exports = BaseRepository;
