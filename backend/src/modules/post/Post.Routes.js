const express = require('express');
const router = express.Router();
const PostController = require('./Post.Controller');
const PollController = require('./Poll.Controller');
const { authenticate, optionalAuth } = require('../../middleware/Auth');
const { validateCreatePost, validateUpdatePost, validatePostFeed, validateCreateComment, validateUuid } = require('../../middleware/Validation');
const { postLimiter, likeLimiter } = require('../../middleware/RateLimit');
const { uploadPostMedia } = require('../../middleware/Upload');

router.get('/', optionalAuth, validatePostFeed, PostController.getFeed);
router.get('/:uuid', optionalAuth, validateUuid, PostController.getPost);
router.get('/:uuid/posts', optionalAuth, validateUuid, PostController.getUserPosts);
// router.get('/:uuid/metadata', optionalAuth, validateUuid, PostController.getMetadata);

// Comments
router.get('/:uuid/comments', optionalAuth, validateUuid, PostController.getComments);
router.post('/:uuid/comments', authenticate, validateUuid, postLimiter, uploadPostMedia, PostController.createComment);
router.post('/:uuid/quote', authenticate, validateUuid, postLimiter, uploadPostMedia, PostController.createQuote);

// Core Creation
router.post('/', authenticate, postLimiter, uploadPostMedia, PostController.createPost);
router.delete('/:uuid', authenticate, validateUuid, PostController.deletePost);

// Interactions
router.post('/:uuid/toggle-repost', authenticate, validateUuid, postLimiter, PostController.toggleRepost);
router.post('/:uuid/repost', authenticate, validateUuid, postLimiter, PostController.repost);
router.delete('/:uuid/repost', authenticate, validateUuid, postLimiter, PostController.unrepost);
router.post('/:uuid/like', authenticate, validateUuid, likeLimiter, PostController.like);
router.delete('/:uuid/like', authenticate, validateUuid, PostController.unlike);
router.post('/:uuid/bookmark', authenticate, validateUuid, PostController.bookmark);
router.delete('/:uuid/bookmark', authenticate, validateUuid, PostController.unbookmark);
router.post('/:uuid/save', authenticate, validateUuid, PostController.bookmark);
router.delete('/:uuid/save', authenticate, validateUuid, PostController.unbookmark);

// Compatibility alias for older clients. Canonical route: /api/polls/options/:optionUuid/vote.
router.post('/:uuid/vote', authenticate, validateUuid, postLimiter, (req, res, next) => {
    req.params.optionUuid = req.body.optionUuid || req.body.optionId || req.body.option_id;
    return PollController.vote(req, res, next);
});

// AI Utilities
router.post('/:uuid/translate', optionalAuth, validateUuid, PostController.translate);

module.exports = router;
