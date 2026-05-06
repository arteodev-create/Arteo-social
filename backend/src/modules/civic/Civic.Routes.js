const express = require('express');
const CivicController = require('./Civic.Controller');
const { authenticate } = require('../../middleware/Auth');
const { interactionLimiter } = require('../../middleware/RateLimit');

const router = express.Router();

/**
 * [AIS] Social Domain Routes
 * Chuẩn ABS v14.1 Platinum.
 */

// Tất cả các tương tác xã hội đều yêu cầu đã xác thực danh tính
router.use(authenticate);

router.post('/:uuid/toggle-follow', interactionLimiter, CivicController.toggleFollow);
router.get('/:uuid/status', CivicController.getRelationshipStatus);

// Cảm xúc (Reactions)
router.post('/posts/:postId/react', interactionLimiter, CivicController.toggleReaction);

module.exports = router;
