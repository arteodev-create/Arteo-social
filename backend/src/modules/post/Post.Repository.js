const BaseRepository = require('../../core/Base.Repository');
const PostQueryRepository = require('./repo/PostQuery.Repository');
const PostMutationRepository = require('./repo/PostMutation.Repository');
const { POST_STANDARD_INCLUDE } = require('./repo/Post.Inclusions');

/**
 * PostRepository: Modular Facade for Arteo Post data access.
 * Refactored for ABS v14.1 Platinum Hardening.
 * This file acts as a clean proxy to specialized query/mutation sub-repositories.
 */
class PostRepository extends BaseRepository {
    constructor() {
        super('post');
        this.query = new PostQueryRepository(this.model);
        this.mutation = new PostMutationRepository(this.model);
    }

    get _standardInclude() { return POST_STANDARD_INCLUDE; }

    // --- Query Delegations (Facilitating Domain Logic) ---
    async findDetailed(uuid, currentUserId) { return await this.query.findDetailed(uuid, currentUserId); }
    async findFeed(params) { return await this.query.findFeed(params); }
    async findByUserId(params) { return await this.query.findByUserId(params); }
    async searchPosts(query, options) { return await this.query.searchPosts(query, options); }
    async findReplies(postId, currentUserId = null, limit = 20, skip = 0) { return await this.query.findReplies(postId, currentUserId, limit, skip); }
    
    // Hardened helper delegations
    async findByPartialUuid(idOrUuid, options) { return await this.query.findByPartialUuid(idOrUuid, options); }
    async existsByTopicOrHashtag(query) { return await this.query.existsByTopicOrHashtag(query); }
    async findDiscovery(conditions, limit = 10) { return await this.query.findDiscovery(conditions, limit); }
    async findHot(limit = 10) { return await this.query.findHot(limit); }
    async findTrendingDetail(query, limit = 20) { return await this.query.findTrendingDetail(query, limit); }

    // --- Mutation Delegations ---
    async createWithTransaction(postData, mediaData) { return await this.mutation.createWithTransaction(postData, mediaData); }
    async pruneExpired() { return await this.mutation.pruneExpired(); }
}

module.exports = new PostRepository();
