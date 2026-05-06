const express = require('express');
const router = express.Router();
const AlgorithmController = require('./Algorithm.Controller');
const { authenticate, optionalAuth } = require('../../middleware/Auth');
const { interactionLimiter } = require('../../middleware/RateLimit');

/**
 * Algorithm Routes
 * API Surface for the Arteo Discovery & Ranking Engine.
 * Standardized for structural purity per ABS v14.1 Platinum.
 */

// Global Discovery Gallery
router.get('/public', optionalAuth, AlgorithmController.getPublicAlgorithms);

// Personal Domain Lifecycle
router.use(authenticate);
router.use(interactionLimiter);

router.post('/', AlgorithmController.create);
router.get('/', AlgorithmController.getUserAlgorithms);
router.get('/:uuid', AlgorithmController.getAlgorithmById);
router.put('/:uuid', AlgorithmController.update);
router.delete('/:uuid', AlgorithmController.delete);

// Operational Sequences
router.post('/:uuid/install', AlgorithmController.install);
router.post('/:uuid/bump', AlgorithmController.bumpVersion);
router.post('/:uuid/sync', AlgorithmController.sync);
router.post('/:uuid/activate', AlgorithmController.activate);
router.post('/:uuid/pin', AlgorithmController.pin);
router.post('/:uuid/unpin', AlgorithmController.unpin);

module.exports = router;
