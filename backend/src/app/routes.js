const express = require('express');

const router = express.Router();

router.use('/users', require('../modules/identity/Identification.Routes'));
router.use('/posts', require('../modules/post/Post.Routes'));
router.use('/comments', require('../modules/post/Comment.Routes'));
router.use('/algorithms', require('../modules/feed/Algorithm.Routes'));
router.use('/search', require('../modules/search/Search.Routes'));
router.use('/plugins', require('../modules/plugin/Plugin.Routes'));
router.use('/admin', require('../modules/admin/Admin.Routes'));
router.use('/civic', require('../modules/civic/Civic.Routes'));

router.use('/polls', require('../modules/post/Poll.Routes'));
router.use('/cdn', require('../core/utils/Cdn.Routes'));

module.exports = router;
