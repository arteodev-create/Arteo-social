const DEV_USER_UUID = '00000000-0000-0000-0000-000000000781';
const DEV_POST_UUID = '22222222-2222-2222-2222-222222222222';

const createDevUser = () => ({
    uuid: DEV_USER_UUID,
    username: 'DoGiaHuy',
    fullName: 'Do Gia Huy',
    avatar: null,
    isVerified: true,
    verificationType: 'blue',
    bio: 'Arteo creator account.',
    followersCount: 0,
    followingCount: 0
});

const createDevPost = (content = 'Welcome to Arteo local dev. Login, layout, and feed are ready.') => {
    const now = new Date().toISOString();
    const user = createDevUser();

    return {
        uuid: DEV_POST_UUID,
        userId: user.uuid,
        user,
        content,
        type: 'POST',
        visibility: 'PUBLIC',
        status: 'PUBLISHED',
        topic: 'Arteo',
        media: [],
        likes: [],
        reposts: [],
        bookmarks: [],
        reactions: [],
        stats: {
            likeCount: 0,
            repostCount: 0,
            replyCount: 0,
            quoteCount: 0,
            bookmarkCount: 0,
            viewCount: 1
        },
        createdAt: now,
        updatedAt: now
    };
};

const isDevPostUuid = (uuid) => uuid === DEV_POST_UUID;

module.exports = {
    DEV_POST_UUID,
    DEV_USER_UUID,
    createDevPost,
    createDevUser,
    isDevPostUuid
};
