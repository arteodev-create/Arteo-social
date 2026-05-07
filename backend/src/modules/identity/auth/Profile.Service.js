const Logger = require('../../../infra/logging/Logger.Service');
const Repository = require('../Identification.Repository');
const CacheService = require('../../../infra/cache/Cache.Service');
const TransformUtils = require('../../../utils/Transform.Utils');
const { NotFoundError } = require('../../../core/Errors');

class ProfileService {
    async _getOrComputeSWR(key, computeFn, ttl = 300) {
        const cached = await CacheService.get(key);
        const now = Date.now();
        const refreshThreshold = (ttl * 0.8) * 1000;

        if (cached) {
            const age = now - (cached._swr_timestamp || 0);
            if (age > refreshThreshold) {
                computeFn().then(data => {
                    CacheService.set(key, { ...data, _swr_timestamp: Date.now() }, ttl * 2);
                }).catch(() => {});
            }
            return cached;
        }

        const freshData = await computeFn();
        if (!freshData) return null;
        const swrData = { ...freshData, _swr_timestamp: Date.now() };
        await CacheService.set(key, swrData, ttl * 2);
        return swrData;
    }

    async checkExists(identifier, visitorId = null) {
        if (!identifier) return null;

        let user;
        if (identifier.length === 36 && identifier.includes('-')) {
            user = await Repository.findByUuid(identifier, visitorId);
        } else {
            user = await Repository.findByIdentifier(identifier, visitorId);
        }

        if (user) return user;

        return null;
    }

    async updateProfile(userId, data) {
        const user = await Repository.findByUuid(userId);
        if (!user) throw new NotFoundError('Identity not found.');

        const updateData = {
            fullName: data.fullName !== undefined ? data.fullName : user.fullName,
            username: data.username !== undefined ? data.username : user.username,
            bio: data.bio !== undefined ? data.bio : user.bio,
            location: data.location !== undefined ? data.location : user.location,
            avatar: data.avatar !== undefined ? data.avatar : user.avatar,
            headline: data.headline !== undefined ? data.headline : user.headline,
            website: data.website !== undefined ? data.website : user.website,
            pronouns: data.pronouns !== undefined ? data.pronouns : user.pronouns,
            socialLinks: data.socialLinks !== undefined ? data.socialLinks : user.socialLinks,
            language: data.language !== undefined ? data.language : user.language
        };

        const updatedUser = await Repository.update(userId, updateData);

        const freshUser = await Repository.findByUuid(userId).catch((error) => {
            Logger.warn('[ProfileService:updateProfile] Fresh profile reload failed after update.', { error: error.message });
            return null;
        });

        // Clear identity caches in the background; the response already returns the fresh profile projection.
        CacheService.invalidateIdentityCache(userId, user.username).catch((error) => {
            Logger.warn('[ProfileService:updateProfile] Cache invalidation failed after update.', { error: error.message });
        });
        
        return TransformUtils.formatUser(freshUser || updatedUser);
    }
}

module.exports = new ProfileService();
