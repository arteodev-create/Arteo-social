const express = require('express');
const router = express.Router();
const AdminController = require('./Admin.Controller');
const AdminDatabaseController = require('./Admin.Database.Controller');
const { authenticate, restrictTo } = require('../../middleware/Auth');
const { apiLimiter } = require('../../middleware/RateLimit');

/**
 * Admin Routes
 * Strategic control surface for Arteo platform management.
 * Standardized for structural purity per ABS v14.1 Platinum.
 */

// Critical Infrastructure Protection
router.use(authenticate);
router.use(apiLimiter);
router.use(restrictTo('ADMIN', 'MODERATOR'));

// Platform Telemetry & Management
router.get('/stats', AdminController.getStats);
router.get('/users', AdminController.getUsers);
router.patch('/users/:uuid', AdminController.updateUser);
router.get('/health', AdminController.getSystemHealth);

// Post Moderation
router.get('/posts', AdminController.getPosts);
router.delete('/posts/:uuid', AdminController.deletePost);

// Database Management (PostgreSQL) - Synced with Frontend ADS v1.1
router.get('/db/tables', AdminDatabaseController.listTables);
router.get('/db/schema/:tableName', AdminDatabaseController.getTableSchema);
router.get('/db/data/:tableName', AdminDatabaseController.getTableData);
router.post('/db/data/:tableName', AdminDatabaseController.addRow);
router.delete('/db/data/:tableName', AdminDatabaseController.deleteRow);
router.patch('/db/schema/:tableName/column', AdminDatabaseController.updateColumn);
router.post('/db/schema/:tableName/column', AdminDatabaseController.addColumn);
router.delete('/db/schema/:tableName/column/:columnName', AdminDatabaseController.deleteColumn);

module.exports = router;


