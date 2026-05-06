const Logger = require('../../../infra/logging/Logger.Service');
const { POST_STATUS, POST_TYPES } = require('../../../core/Constants');

class UserQueryRepository {
    constructor(model, prisma) {
        this.model = model;
        this.prisma = prisma;
    }

    get _standardSelect() {
        return {
            ...this._mutationSelect,
            _count: {
                select: {
                    followers: true,
                    following: true,
                    posts: {
                        where: {
                            deletedAt: null,
                            status: POST_STATUS.PUBLISHED,
                            type: { in: [POST_TYPES.POST, POST_TYPES.THREAD] }
                        }
                    }
                }
            },
            followers: { take: 3, orderBy: { createdAt: 'desc' }, select: { follower: { select: { avatar: true, username: true } } } }
        };
    }

    get _mutationSelect() {
        return {
            uuid: true, supabaseAuthId: true, username: true, email: true, password: true,
            fullName: true, isVerified: true, role: true, status: true,
            isAdmin: true, avatar: true, language: true, bio: true, location: true,
            coverPhoto: true, website: true, createdAt: true,
            headline: true, professionalCategory: true,
            skills: true, emailVerified: true
        };
    }

    _mapEntity(user) {
        if (!user) return null;
        const { _count, followers, ...userData } = user;
        return {
            ...userData,
            followersCount: _count?.followers || 0,
            followingCount: _count?.following || 0,
            postsCount: _count?.posts || 0,
            followerAvatars: followers?.map(f => f.follower?.avatar).filter(Boolean) || []
        };
    }

    _isMissingOptionalSocialTable(error) {
        const message = String(error?.message || '').toLowerCase();
        return error?.code === 'P2021' && (
            message.includes('public.follows') ||
            message.includes('public.posts')
        );
    }

    async _findBasicByIdentifier(key) {
        return await this.model.findFirst({
            where: { OR: [{ email: { equals: key, mode: 'insensitive' } }, { username: { equals: key, mode: 'insensitive' } }], deletedAt: null },
            select: this._mutationSelect
        });
    }

    async _findBasicByUuid(uuid) {
        return await this.model.findUnique({ where: { uuid }, select: this._mutationSelect });
    }

    async findByIdentifier(key, visitorId = null) {
        try {
            let user;
            try {
                user = await this.model.findFirst({
                    where: { OR: [{ email: { equals: key, mode: 'insensitive' } }, { username: { equals: key, mode: 'insensitive' } }], deletedAt: null },
                    select: this._standardSelect
                });
            } catch (error) {
                if (!this._isMissingOptionalSocialTable(error)) throw error;
                Logger.warn('[UserQueryRepository:findByIdentifier] Social tables unavailable; using identity-only select.');
                user = await this._findBasicByIdentifier(key);
            }
            if (!user) return null;
            const mapped = this._mapEntity(user);
            if (visitorId) {
                try {
                    mapped.isFollowing = !!(await this.findFollowRelationship(visitorId, user.uuid));
                } catch (error) {
                    if (!this._isMissingOptionalSocialTable(error)) throw error;
                    mapped.isFollowing = false;
                }
            }
            return mapped;
        } catch (error) { 
            Logger.error(`[UserQueryRepository:findByIdentifier] Critical Database Error: ${error.message}`, error);
            throw error; // Re-throw to let the controller handle it as 500
        }
    }

    async findByUuid(uuid, visitorId = null) {
        try {
            let user;
            try {
                user = await this.model.findUnique({ where: { uuid }, select: this._standardSelect });
            } catch (error) {
                if (!this._isMissingOptionalSocialTable(error)) throw error;
                Logger.warn('[UserQueryRepository:findByUuid] Social tables unavailable; using identity-only select.');
                user = await this._findBasicByUuid(uuid);
            }
            if (!user) return null;
            const mapped = this._mapEntity(user);
            if (visitorId) {
                try {
                    mapped.isFollowing = !!(await this.findFollowRelationship(visitorId, user.uuid));
                } catch (error) {
                    if (!this._isMissingOptionalSocialTable(error)) throw error;
                    mapped.isFollowing = false;
                }
            }
            return mapped;
        } catch (error) { 
            Logger.error(`[UserQueryRepository:findByUuid] Critical Database Error: ${error.message}`, error);
            throw error;
        }
    }

    async findFollowRelationship(followerId, followingId) {
        return await this.prisma.follow.findUnique({ where: { followerId_followingId: { followerId, followingId } } });
    }

    async searchUsers(query, limit = 20) {
        const users = await this.model.findMany({
            where: { OR: [{ username: { contains: query, mode: 'insensitive' } }, { fullName: { contains: query, mode: 'insensitive' } }], deletedAt: null, status: 'ACTIVE' },
            select: this._standardSelect,
            take: parseInt(limit),
            orderBy: { createdAt: 'desc' }
        });
        return users;
    }

    async findSuggestions(userId, limit = 3) {
        const whereClause = {
            deletedAt: null,
            status: 'ACTIVE'
        };

        // Nếu có userId, loại bỏ chính mình và những người đã theo dõi
        if (userId) {
            whereClause.uuid = { not: userId };
            whereClause.followers = { none: { followerId: userId } };
        }

        const users = await this.model.findMany({
            where: whereClause,
            select: this._standardSelect,
            take: parseInt(limit),
            orderBy: { createdAt: 'desc' }
        });
        return users.map(u => this._mapEntity(u));
    }

}

module.exports = UserQueryRepository;
