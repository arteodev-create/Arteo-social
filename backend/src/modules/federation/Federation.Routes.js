const express = require('express');
const FederationController = require('./Federation.Controller');

const router = express.Router();

router.get('/.well-known/webfinger', FederationController.webFinger);
router.get('/users/:username', FederationController.actor);
router.get('/users/:username/outbox', FederationController.outbox);
router.post('/users/:username/inbox', FederationController.inbox);

module.exports = router;
