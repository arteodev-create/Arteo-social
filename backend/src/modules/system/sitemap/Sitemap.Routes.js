const express = require('express');
const router = express.Router();
const SitemapController = require('./Sitemap.Controller');

// Standard ABS v14.1 Route definition
router.get('/sitemap.xml', SitemapController.getSitemap);
router.get('/robots.txt', SitemapController.getRobots);

module.exports = router;
