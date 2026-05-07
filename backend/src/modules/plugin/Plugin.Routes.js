const express = require('express');
const router = express.Router();
const PluginController = require('./Plugin.Controller');
const PluginCategoryController = require('./PluginCategory.Controller');
const { authenticate, optionalAuth } = require('../../middleware/Auth');

/**
 * Plugin Routes
 * Store/detail routes are public with optional auth; lifecycle mutations require auth.
 */

router.get('/', optionalAuth, PluginController.getAll);
router.get('/public', optionalAuth, PluginController.getPublic);
router.get('/categories', optionalAuth, PluginCategoryController.getAll);

router.get('/my', authenticate, PluginController.getOwned);
router.post('/', authenticate, PluginController.create);
router.post('/categories', authenticate, PluginCategoryController.create);

router.get('/:identifier/download', optionalAuth, PluginController.download);
router.get('/:identifier', optionalAuth, PluginController.getById);

router.post('/:uuid/install', authenticate, PluginController.install);
router.delete('/:uuid/install', authenticate, PluginController.uninstall);
router.put('/:uuid', authenticate, PluginController.update);
router.delete('/:uuid', authenticate, PluginController.delete);

module.exports = router;
