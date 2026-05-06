class UserTransform {
    formatUser(user, session = null) {
        if (!user) return null;
        return {
            uuid: user.uuid,
            username: user.username,
            fullName: user.fullName,
            avatar: user.avatar,
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
