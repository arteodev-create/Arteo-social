const Logger = require('../infra/logging/Logger.Service');
const ogs = require('open-graph-scraper');
const axios = require('axios');
const { AppError } = require('../core/Errors');

/**
 * Media Utilities
 * Orchestrates content parsing, link metadata extraction (OpenGraph), and third-party media integration.
 * Optimized for version 14.1 (Integrated Intelligence).
 */
class MediaUtils {
    /**
     * Aggregates high-fidelity preview metadata for a specific URL.
     */
    async fetchLinkPreview(url) {
        try {
            const urlObj = new URL(url);
            const hostname = urlObj.hostname.toLowerCase();
            const pathname = urlObj.pathname.toLowerCase();

            // Specialized handling for high-priority social domains (X/Twitter)
            if (hostname.includes('x.com') || hostname.includes('twitter.com')) {
                if (pathname.includes('/status/')) {
                    try {
                        const oembed = await this._fetchTwitterOembed(url);
                        if (oembed) return oembed;
                    } catch (e) {
                        Logger.warn('[MediaUtils] Twitter oEmbed failure, falling back to scraper.');
                    }
                }
                return await this._fetchScrapedMetadata(url, {
                    'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
                });
            }

            return await this._fetchScrapedMetadata(url);

        } catch (error) {
            Logger.error('[MediaUtils] Scraper orchestration error:', error.message);
            return null;
        }
    }

    /**
     * Internal: Fetches Tweet metadata via official oEmbed endpoints.
     */
    async _fetchTwitterOembed(targetUrl) {
        const embedTarget = targetUrl.replace('x.com', 'twitter.com');
        const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(embedTarget)}&theme=dark`;

        const response = await axios.get(oembedUrl);
        const data = response.data;

        return {
            title: data.author_name ? `Tweet by ${data.author_name}` : 'X.com Content',
            description: 'Interactive social content linked via Arteo.',
            image: '',
            siteName: 'X (formerly Twitter)',
            url: targetUrl,
            html: data.html,
        };
    }

    /**
     * Internal: Scrapes general OpenGraph and Meta tags.
     */
    async _fetchScrapedMetadata(url, headers) {
        const options = {
            url,
            headers: headers || {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        };

        const { error, result } = await ogs(options);

        if (error) throw new AppError('OGS engine failure.', 502);

        return {
            title: result.ogTitle || result.twitterTitle || '',
            description: result.ogDescription || result.twitterDescription || '',
            image: result.ogImage?.[0]?.url || result.twitterImage?.[0]?.url || result.ogImage?.url || result.twitterImage?.url || '',
            siteName: result.ogSiteName || '',
            url: result.ogUrl || url
        };
    }
}

module.exports = new MediaUtils();
