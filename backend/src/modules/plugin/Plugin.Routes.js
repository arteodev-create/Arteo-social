const express = require('express');
const router = express.Router();
const PluginController = require('./Plugin.Controller');
const PluginCategoryController = require('./PluginCategory.Controller');
const { authenticate, optionalAuth } = require('../../middleware/Auth');

/**
 * Plugin Routes
 * API Surface for the Arteo Re-Code Extension Engine.
 * Standardized for structural purity per ABS v14.1 Platinum.
 */

// Extension Enumeration (Public/Personal)
router.get('/', optionalAuth, PluginController.getAll);
router.get('/public', optionalAuth, PluginController.getPublic);

// Category Management (True Entities)
router.get('/categories', optionalAuth, PluginCategoryController.getAll);

// Protected Lifecycle
router.use(authenticate);
router.get('/my', PluginController.getOwned);
router.post('/', PluginController.create);
router.post('/:uuid/install', PluginController.install);
router.get('/:uuid/download', PluginController.download);
router.delete('/:uuid/install', PluginController.uninstall);
router.get('/:uuid', PluginController.getById);
router.put('/:uuid', PluginController.update);
router.delete('/:uuid', PluginController.delete);

// Category Establishment (Identity Verified)
router.post('/categories', PluginCategoryController.create);

module.exports = router;
module.exports = router;
