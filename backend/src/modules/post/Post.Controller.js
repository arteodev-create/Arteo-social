const AsyncHandler = require('../../middleware/AsyncHandler');
const { NotFoundError } = require('../../core/Errors');
const PostService = require('./Post.Service');
const TransformUtils = require('../../utils/Transform.Utils');
const Logger = require('../../infra/logging/Logger.Service');

// Validation
const { POST_TYPES } = require('../../core/Constants');
const { createPostSchema, translateSchema, getFeedSchema } = require('./Post.Validation');

/**
 * Post Controller
 * Standardized for structural purity per ABS v14.1 Platinum.
 */
class PostController {
    /**
     * Retrieves the main social feed.
     */
    getFeed = AsyncHandler(async (req, res) => {
        const validated = getFeedSchema.parse(req.query);
        const result = await PostService.getFeed(req.user?.uuid, validated);

        if (result.posts) {
            result.posts = result.posts.map(p => TransformUtils.formatPost(p, req.user?.uuid));
        }
        res.success(result);
    });

    /**
     * Retrieves posts for a specific user.
     */
    getUserPosts = AsyncHandler(async (req, res) => {
        const { page, limit, tab } = req.query;
        
        const result = await PostService.getUserPosts(req.params.uuid, req.user?.uuid, { 
            page: parseInt(page) || 1, 
            limit: parseInt(limit) || 20, 
            tab 
        });

        if (result.posts) {
            result.posts = result.posts.map(p => TransformUtils.formatPost(p, req.user?.uuid));
        }
        res.success(result);
    });

    /**
     * Retrieves a single post.
     */
    getPost = AsyncHandler(async (req, res) => {
        const uuid = await PostService.resolveId(req.params.uuid);
        const post = await PostService.getPostWithRelationships(uuid, req.user?.uuid);
        if (!post) throw new NotFoundError('Post');
        
        res.success(TransformUtils.formatPost(post, req.user?.uuid));
    });

    /**
     * Retrieval engine for comments.
     */
    getComments = AsyncHandler(async (req, res) => {
        const uuid = await PostService.resolveId(req.params.uuid);
        const { page, limit } = getFeedSchema.parse(req.query);
        const result = await PostService.getComments(uuid, req.user?.uuid, { page, limit });
        
        res.success({ 
            comments: result.comments.map(p => TransformUtils.formatPost(p, req.user?.uuid)),
            pagination: result.pagination
        });
    });

    /**
     * Creation orchestrator for Posts & Quotes.
     */
    createPost = AsyncHandler(async (req, res) => {
        const normalizedBody = await this._normalizeReferenceIds(req.body);
        const validatedData = createPostSchema.parse(normalizedBody);
        const mediaFiles = this._extractMediaFiles(req.files);

        const post = await PostService.create(req.user.uuid, validatedData, mediaFiles);
        res.created({ post: TransformUtils.formatPost(post, req.user.uuid) }, { message: 'BÃ i viáº¿t cá»§a báº¡n Ä‘Ã£ Ä‘Æ°á»£c Ä‘Äƒng táº£i thÃ nh cÃ´ng.' });
    });

    _normalizeReferenceIds = async (body = {}) => {
        const nextBody = { ...body };
        const parentId = nextBody.parentId || nextBody.parent_id;
        const originalPostId = nextBody.originalPostId || nextBody.original_post_id;

        if (parentId) {
            nextBody.parentId = await PostService.resolveId(String(parentId));
        }

        if (originalPostId) {
            nextBody.originalPostId = await PostService.resolveId(String(originalPostId));
        }

        return nextBody;
    };

    /**
     * Creation orchestrator for Comments.
     */
    createComment = AsyncHandler(async (req, res) => {
        const parentId = await PostService.resolveId(req.params.uuid);
        const validatedData = createPostSchema.parse({ ...req.body, parentId, type: POST_TYPES.COMMENT });
        const mediaFiles = this._extractMediaFiles(req.files);

        const comment = await PostService.create(req.user.uuid, validatedData, mediaFiles);
        res.created({ comment: TransformUtils.formatPost(comment, req.user.uuid) }, { message: 'BÃ¬nh luáº­n cá»§a báº¡n Ä‘Ã£ Ä‘Æ°á»£c ghi nháº­n.' });
    });

    /**
     * Creation orchestrator for Quotes.
     */
    createQuote = AsyncHandler(async (req, res) => {
        const originalPostId = await PostService.resolveId(req.params.uuid);
        const validatedData = createPostSchema.parse({ ...req.body, originalPostId, type: POST_TYPES.QUOTE });
        const mediaFiles = this._extractMediaFiles(req.files);

        const post = await PostService.create(req.user.uuid, validatedData, mediaFiles);
        res.created({ post: TransformUtils.formatPost(post, req.user.uuid) }, { message: 'ÄÃ£ trÃ­ch dáº«n bÃ i viáº¿t thÃ nh cÃ´ng.' });
    });

    /**
     * Deletion orchestrator (Soft-Purge).
     */
    deletePost = AsyncHandler(async (req, res) => {
        const uuid = await PostService.resolveId(req.params.uuid);
        await PostService.softDelete(uuid, req.user.uuid);
        res.success({ uuid }, { message: 'BÃ i viáº¿t Ä‘Ã£ Ä‘Æ°á»£c gá»¡ bá» khá»i máº¡ng lÆ°á»›i.' });
    });

    /**
     * Interaction bridge: Repost/Undo.
     */
    toggleRepost = AsyncHandler(async (req, res) => {
        const uuid = await PostService.resolveId(req.params.uuid);
        const result = await PostService.toggleRepost(uuid, req.user.uuid);
        const actionText = result.action === 'repost' ? 'ÄÃ£ chia sáº» láº¡i bÃ i viáº¿t' : 'ÄÃ£ hoÃ n tÃ¡c chia sáº»';
        res.success(result, { message: `${actionText} thÃ nh cÃ´ng.` });
    });

    /**
     * Interaction bridges: Likes & Bookmarks.
     */
    like = AsyncHandler(async (req, res) => {
        const uuid = await PostService.resolveId(req.params.uuid);
        res.success(await PostService.setLike(uuid, req.user.uuid, true), { message: 'ÄÃ£ bÃ y tá» cáº£m xÃºc.' });
    });

    /**
     * Interaction bridges: Likes & Bookmarks.
     */
    unlike = AsyncHandler(async (req, res) => {
        const uuid = await PostService.resolveId(req.params.uuid);
        res.success(await PostService.setLike(uuid, req.user.uuid, false), { message: 'ÄÃ£ hoÃ n tÃ¡c bÃ y tá» cáº£m xÃºc.' });
    });

    bookmark = AsyncHandler(async (req, res) => {
        const uuid = await PostService.resolveId(req.params.uuid);
        res.success(await PostService.setBookmark(uuid, req.user.uuid, true), { message: 'ÄÃ£ lÆ°u vÃ o bá»™ sÆ°u táº­p.' });
    });

    unbookmark = AsyncHandler(async (req, res) => {
        const uuid = await PostService.resolveId(req.params.uuid);
        res.success(await PostService.setBookmark(uuid, req.user.uuid, false), { message: 'ÄÃ£ gá»¡ khá»i bá»™ sÆ°u táº­p.' });
    });
    repost = AsyncHandler(async (req, res) => {
        const uuid = await PostService.resolveId(req.params.uuid);
        res.success(await PostService.setRepost(uuid, req.user.uuid, true), { message: 'Reposted successfully.' });
    });

    unrepost = AsyncHandler(async (req, res) => {
        const uuid = await PostService.resolveId(req.params.uuid);
        res.success(await PostService.setRepost(uuid, req.user.uuid, false), { message: 'Repost removed successfully.' });
    });

    /**
     * AI Translation - Disabled per Majestic Standard.
     */
    translate = AsyncHandler(async (req, res) => {
        res.error('TÃ­nh nÄƒng dá»‹ch thuáº­t AI hiá»‡n khÃ´ng kháº£ dá»¥ng trÃªn phiÃªn báº£n Arteo Majestic.', 410);
    });

    /**
     * Private helper to extract media files from request.
     * @private
     */
    _extractMediaFiles = (files) => {
        if (!files) return [];
        return Array.isArray(files) ? files : Object.values(files).flat();
    };
}

module.exports = new PostController();

