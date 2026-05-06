const express = require('express');
const IdentificationController = require('./Identification.Controller');
const PostController = require('../post/Post.Controller');
const { authenticate, optionalAuth } = require('../../middleware/Auth');
const Upload = require('../../middleware/Upload');

const router = express.Router();

// Public identity endpoints.
router.post('/authenticate', IdentificationController.authenticate);
router.post('/establish', IdentificationController.establish);
router.post('/verify', IdentificationController.verify);
router.post('/resend-verify', IdentificationController.resendVerification);
router.post('/recover', IdentificationController.recover);
router.post('/recover/complete', IdentificationController.completeRecovery);
router.get('/check', optionalAuth, IdentificationController.checkIdentifier);
router.post('/refresh-token', IdentificationController.refresh);

// Authenticated identity endpoints.
router.get('/profile', authenticate, IdentificationController.getProfile);
router.put('/profile', authenticate, Upload.uploadAvatar, IdentificationController.updateProfile);
router.put('/rotate-credential', authenticate, IdentificationController.rotate);
router.get('/sessions', authenticate, IdentificationController.getSessions);
router.post('/sessions/revoke', authenticate, IdentificationController.revokeSession);
router.post('/revoke-session', authenticate, IdentificationController.revokeSession);
router.post('/logout', authenticate, IdentificationController.logout);
router.get('/suggestions', optionalAuth, IdentificationController.getSuggestions);

// Public profile endpoints must stay last.
router.get('/:uuid/posts', optionalAuth, PostController.getUserPosts);
router.get('/:uuid', optionalAuth, IdentificationController.getPublicProfile);

module.exports = router;
