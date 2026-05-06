const SitemapService = require('./Sitemap.Service');
const Logger = require('../../../infra/logging/Logger.Service');
const { config } = require('../../../config');

class SitemapController {
    /**
     * Handle HTTP GET for sitemap.xml
     */
    static async getSitemap(req, res, next) {
        try {
            const xml = await SitemapService.generateSitemap();
            
            res.header('Content-Type', 'application/xml');
            res.header('Cache-Control', 'public, max-age=900, s-maxage=3600');
            res.status(200).send(xml);
        } catch (error) {
            Logger.error('[SitemapController] Failed to generate sitemap', { error: error.message });
            next(error);
        }
    }

    static getRobots(req, res) {
        const origin = (config.infra.frontendUrl || config.infra.baseUrl || 'https://arteosocial.com').replace(/\/$/, '');
        res.type('text/plain');
        res.header('Cache-Control', 'public, max-age=3600');
        res.send([
            'User-agent: *',
            'Allow: /',
            'Disallow: /admin',
            'Disallow: /flow/',
            'Disallow: /api/',
            `Sitemap: ${origin}/sitemap.xml`,
            ''
        ].join('\n'));
    }
}

module.exports = SitemapController;
