const express = require('express');
const router = express.Router();
const PollController = require('./Poll.Controller');
const { authenticate } = require('../../middleware/Auth');
const { validateUuid } = require('../../middleware/Validation');
const { voteLimiter } = require('../../middleware/RateLimit');

/**
 * Poll Routes
 * Standardized endpoints for real-time voting and survey interactions.
 */

// All survey interactions require established identity
router.use(authenticate);

router.post('/options/:optionUuid/vote', voteLimiter, validateUuid, PollController.vote);

module.exports = router;
