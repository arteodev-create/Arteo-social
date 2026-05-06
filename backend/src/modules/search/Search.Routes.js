const express = require('express');
const router = express.Router();
const SearchController = require('./Search.Controller');
const { authenticate, optionalAuth } = require('../../middleware/Auth');
const { searchLimiter } = require('../../middleware/RateLimit');
const { validateSearch } = require('../../middleware/Validation');

/**
 * Search Routes
 * Standardized discovery endpoints for Arteo.
 */

// Global Discovery endpoints
router.get('/trending', optionalAuth, searchLimiter, SearchController.getTrending);
router.get('/recommendations', optionalAuth, searchLimiter, SearchController.getRecommendations);
router.get('/hot-events', optionalAuth, searchLimiter, SearchController.getHotEvents);
router.get('/trend-detail', optionalAuth, searchLimiter, SearchController.getTrendDetail);
router.get('/summary', optionalAuth, searchLimiter, SearchController.getAiSummary);

// Universal Search (Publicly accessible with optional Auth context)
router.get('/posts', optionalAuth, searchLimiter, validateSearch, SearchController.searchPosts);
router.get('/hashtags', optionalAuth, searchLimiter, validateSearch, SearchController.searchHashtags);
router.get('/users', optionalAuth, searchLimiter, validateSearch, SearchController.searchUsers);
router.get('/all', optionalAuth, searchLimiter, validateSearch, SearchController.searchAll);

// Protected routes (Write operations or sensitive telemetry)
router.use(authenticate);
router.use(searchLimiter);

module.exports = router;
