const express = require('express');
const PostController = require('./Post.Controller');
const { authenticate } = require('../../middleware/Auth');
const { validateUuid } = require('../../middleware/Validation');
const { likeLimiter } = require('../../middleware/RateLimit');

const router = express.Router();

// Comments are posts with type COMMENT. These aliases keep older clients compatible.
router.post('/:uuid/like', authenticate, validateUuid, likeLimiter, PostController.like);
router.delete('/:uuid/like', authenticate, validateUuid, PostController.unlike);
router.delete('/:uuid', authenticate, validateUuid, PostController.deletePost);

module.exports = router;
