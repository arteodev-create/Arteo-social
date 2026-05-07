/**
 * Standardized inclusion schema for Post-related queries.
 * Hợp chủng quốc Arteo Edition.
 */
const POST_STANDARD_INCLUDE = {
    user: { 
        select: { 
            uuid: true, username: true, identityDomain: true, fullName: true, avatar: true, 
            isVerified: true
        } 
    },
    media: true,
    stats: true,
    reactions: {
        select: { emoji: true, userId: true }
    },
    originalPost: {
        select: {
            uuid: true,
            userId: true,
            type: true,
            content: true,
            visibility: true,
            status: true,
            createdAt: true,
            media: true,
            stats: true,
            user: {
                select: {
                    uuid: true, username: true, identityDomain: true, fullName: true, avatar: true,
                    isVerified: true
                }
            }
        }
    },
    poll: {
        include: {
            options: { orderBy: { optionOrder: 'asc' } }
        }
    }
};

module.exports = { POST_STANDARD_INCLUDE };
