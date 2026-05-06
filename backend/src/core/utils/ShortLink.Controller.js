const Logger = require('../../infra/logging/Logger.Service');
const AsyncHandler = require('../../middleware/AsyncHandler');
const ShortLinkRepository = require('./ShortLink.Repository');
const SecurityUtils = require('../../utils/Security.Utils');

/**
 * ShortLinkController
 * Orchestrates the Arteo ShortLink (ASL) system for redirection and analytics.
 */
class ShortLinkController {
    /**
     * Establishes a new shortened link with an optimized slug.
     */
    shortenUrl = AsyncHandler(async (req, res) => {
        const { originalUrl } = req.body;
        const creatorId = req.user ? req.user.uuid : null;

        if (!originalUrl) {
            return res.badRequest({ message: 'Target URL is required for shortening.' });
        }

        // Generate high-entropy slug
        let slug = SecurityUtils.generateShortId(6);
        let exists = await ShortLinkRepository.findBySlug(slug);

        let attempts = 0;
        while (exists && attempts < 5) {
            slug = SecurityUtils.generateShortId(6);
            exists = await ShortLinkRepository.findBySlug(slug);
            attempts++;
        }

        const shortLink = await ShortLinkRepository.create({
            originalUrl,
            slug,
            creatorId
        });

        const baseUrl = process.env.BACKEND_URL || process.env.BASE_URL || 'https://arteosocial.com';
        const shortUrl = `${baseUrl}/s/${slug}`;

        res.created({
            originalUrl: shortLink.originalUrl,
            shortUrl: shortUrl,
            slug: shortLink.slug
        }, { message: 'Shortened identification established.' });
    });

    /**
     * Resolves a slug and redirects to the original destination with telemetry tracking.
     */
    redirect = AsyncHandler(async (req, res) => {
        const { slug } = req.params;
        const shortLink = await ShortLinkRepository.findBySlug(slug);

        if (!shortLink) {
            return res.notFound({ message: 'The requested short link could not be identified.' });
        }

        // Atomic telemetry update via Repository
        ShortLinkRepository.incrementClicks(shortLink.uuid).catch(err => 
            Logger.error('[ASL Telemetry Error]:', err.message)
        );

        res.redirect(shortLink.originalUrl);
    });
}

module.exports = new ShortLinkController();
