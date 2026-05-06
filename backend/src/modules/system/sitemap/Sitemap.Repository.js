const prisma = require('../../../config/Prisma.Client');

class SitemapRepository {
    /**
     * Get all public published posts for sitemap
     */
    static async getPublicPosts(limit = 5000) {
        return await prisma.post.findMany({
            where: {
                status: 'PUBLISHED',
                visibility: 'PUBLIC',
                deletedAt: null
            },
            select: {
                uuid: true,
                updatedAt: true,
                user: {
                    select: { username: true }
                },
                media: {
                    where: { type: 'IMAGE' },
                    select: { url: true }
                }
            },
            take: limit,
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Get all active users for sitemap
     */
    static async getActiveUsers(limit = 5000) {
        return await prisma.user.findMany({
            where: {
                status: 'ACTIVE',
                deletedAt: null
            },
            select: {
                username: true,
                updatedAt: true,
                avatar: true,
                coverPhoto: true
            },
            take: limit,
            orderBy: { createdAt: 'desc' }
        });
    }

    static async getPublicAlgorithms(limit = 5000) {
        return await prisma.userAlgorithm.findMany({
            where: {
                isPublic: true,
                deletedAt: null
            },
            select: {
                uuid: true,
                updatedAt: true
            },
            take: limit,
            orderBy: { updatedAt: 'desc' }
        });
    }
}

module.exports = SitemapRepository;
