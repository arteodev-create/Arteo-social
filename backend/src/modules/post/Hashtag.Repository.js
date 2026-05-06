const BaseRepository = require('../../core/Base.Repository');

/**
 * Hashtag Repository
 * Data access layer for Arteo trend tracking and tag management.
 * Standardized as Instance-based per ABS v14.1.
 */
class HashtagRepository extends BaseRepository {
    constructor() {
        super('hashtag');
    }

    // Mapping offloaded to Platinum TransformUtils layer.

    /**
     * Finds a hashtag by its unique name (normalized to lowercase).
     */
    async findByName(name) {
        return await this.model.findUnique({
            where: { name: name.toLowerCase() }
        });
    }

    /**
     * Links a hashtag to a post, establishing a discovery relationship.
     */
    async linkToPost(postId, hashtagId) {
        return await this.prisma.postHashtag.upsert({
            where: {
                postId_hashtagId: {
                    postId,
                    hashtagId
                }
            },
            update: {},
            create: {
                postId,
                hashtagId
            }
        });
    }

    /**
     * Increments analytical usage metrics for a specific hashtag.
     */
    async incrementUsage(uuid) {
        return await this.model.update({
            where: { uuid },
            data: {
                useCount: { increment: 1 },
                lastUsed: new Date()
            }
        });
    }

    /**
     * Aggregates trending hashtags based on recent usage frequency.
     */
    async getTrending(limit = 10) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        return await this.model.findMany({
            where: {
                lastUsed: { gte: sevenDaysAgo }
            },
            orderBy: {
                useCount: 'desc'
            },
            take: limit
        });
    }
}

module.exports = new HashtagRepository();
