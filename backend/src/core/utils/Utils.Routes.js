const express = require('express');
const router = express.Router();
const UtilsController = require('./Utils.Controller');
const ShortLinkController = require('./ShortLink.Controller');
const { uploadLimiter, utilityLimiter } = require('../../middleware/RateLimit');
const { validateUrl, validateUrlQuery } = require('../../middleware/Validation');
const Auth = require('../../middleware/Auth');
const Upload = require('../../middleware/Upload');

/**
 * Utility Routes
 * High-fidelity delivery routes for auxiliary system operations.
 */

// Link Intelligence
router.get('/link-preview', Auth.authenticate, utilityLimiter, validateUrlQuery, UtilsController.getLinkPreview);

// Media Orchestration
router.post('/upload', Auth.authenticate, uploadLimiter, Upload.uploadSingleFile('image'), UtilsController.uploadFile);

// Redirection & Shortening
router.post('/shorten-url', Auth.authenticate, utilityLimiter, validateUrl, ShortLinkController.shortenUrl);

module.exports = router;
