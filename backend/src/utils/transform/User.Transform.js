const { DEFAULT_DOMAIN, buildActorUri, buildHandle, buildInboxUrl, buildOutboxUrl } = require('../../modules/identity/IdentityHandle');
const MediaService = require('../../modules/media/Media.Service');

class UserTransform {
    formatUser(user, session = null) {
        if (!user) return null;
        const identityDomain = user.identityDomain || DEFAULT_DOMAIN;
        return {
            uuid: user.uuid,
            username: user.username,
            identityDomain,
            domain: identityDomain,
            handle: buildHandle(user.username, identityDomain),
            actorUri: user.actorUri || buildActorUri(user.username, identityDomain),
            inboxUrl: user.inboxUrl || buildInboxUrl(user.username, identityDomain),
            outboxUrl: user.outboxUrl || buildOutboxUrl(user.username, identityDomain),
            fullName: user.fullName,
            avatar: MediaService.normalizeFileUrl(user.avatar),
            coverPhoto: MediaService.normalizeFileUrl(user.coverPhoto),
            bio: user.bio,
            location: user.location,
            headline: user.headline,
            website: user.website,
            pronouns: user.pronouns,
            socialLinks: user.socialLinks || {},
            professionalCategory: user.professionalCategory,
            skills: user.skills || [],
            language: user.language || 'vi',
            isVerified: user.isVerified || false,
            isEmailVerified: user.emailVerified || false,
            isAdmin: user.isAdmin || false,
            role: user.role || 'USER',
            followersCount: user._count?.followers || user.followersCount || 0,
            followingCount: user._count?.followings || user.followingCount || 0,
            postsCount: user._count?.posts || user.postsCount || 0,
            createdAt: user.createdAt,
            session: session ? this.formatSession(session) : undefined
        };
    }

    formatSession(session) {
        if (!session) return null;
        return {
            uuid: session.uuid,
            device: session.userAgent,
            ip: session.ipAddress,
            lastActive: session.lastActiveAt,
            isCurrent: session.isCurrent || false
        };
    }
}

module.exports = new UserTransform();
