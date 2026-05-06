const BaseRepository = require('../../core/Base.Repository');
const UserQueryRepository = require('./repo/UserQuery.Repository');
const UserMutationRepository = require('./repo/UserMutation.Repository');

/**
 * IdentificationRepository: Modular Facade for the Arteo Identity data access.
 * Delegating logic to specialized query and mutation repositories.
 */
class IdentificationRepository extends BaseRepository {
    constructor() {
        super('user');
        this.query = new UserQueryRepository(this.model, this.prisma);
        this.mutation = new UserMutationRepository(this.model, this.prisma);
    }

    get _standardSelect() { return this.query._standardSelect; }

    // --- Query Delegations ---
    async findByIdentifier(key, visitorId) {
        return await this.query.findByIdentifier(key, visitorId);
    }

    async findByUuid(uuid, visitorId) {
        return await this.query.findByUuid(uuid, visitorId);
    }
    async searchUsers(query, limit) { return await this.query.searchUsers(query, limit); }
    async findSuggestions(userId, limit) { return await this.query.findSuggestions(userId, limit); }

    // --- Mutation Delegations ---
    async create(data) { 
        const user = await this.mutation.create(data, this.query._mutationSelect);
        return this.query._mapEntity(user);
    }
    
    async update(uuid, data) {
        const user = await this.mutation.update(uuid, data, this.query._mutationSelect);
        return this.query._mapEntity(user);
    }

    async recordHistory(item) {
        return await this.mutation.recordHistory(item);
    }

    async revokeSession(sid) {
        return await this.mutation.revokeSession(sid);
    }
    async pruneExpiredSessions(days) { return await this.mutation.pruneExpiredSessions(days); }

    // --- Helper Proxies ---
    async getActiveSessions(userId) {
        return await this.prisma.loginHistory.findMany({ where: { userId, isActive: true }, orderBy: { createdAt: 'desc' } });
    }

    async findBySessionId(sessionId) {
        return await this.prisma.loginHistory.findFirst({ where: { sessionId } });
    }
    
    async findByResetToken(token) {
        return await this.model.findFirst({ where: { credentialResetToken: token, deletedAt: null } });
    }

}

module.exports = new IdentificationRepository();
