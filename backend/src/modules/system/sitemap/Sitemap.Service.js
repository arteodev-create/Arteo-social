const SitemapRepository = require('./Sitemap.Repository');
const { config } = require('../../../config');

const escapeXml = (value = '') => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const getPostRouteId = (uuid) => {
    const compact = uuid.replace(/-/g, '');
    const tail = compact.slice(-8);
    return `p${parseInt(tail, 16).toString(36)}`;
};

class SitemapService {
    /**
     * Generate dynamic sitemap.xml for users and posts
     * Following Arteo Backend Standard (ABS)
     */
    static async generateSitemap() {
        const baseUrl = (config.infra.frontendUrl || config.infra.baseUrl || 'https://arteosocial.com').replace(/\/$/, '');

        // Get public posts
        const posts = await SitemapRepository.getPublicPosts(5000);

        // Get active users (profiles)
        const users = await SitemapRepository.getActiveUsers(5000);
        const algorithms = await SitemapRepository.getPublicAlgorithms(5000);

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

        // Static routes
        const staticRoutes = ['/', '/about', '/privacy', '/terms', '/algorithms'];
        for (const route of staticRoutes) {
            xml += `  <url>\n`;
            xml += `    <loc>${escapeXml(`${baseUrl}${route}`)}</loc>\n`;
            xml += `    <changefreq>weekly</changefreq>\n`;
            xml += `    <priority>1.0</priority>\n`;
            xml += `  </url>\n`;
        }

        // Dynamic user profiles
        for (const user of users) {
            xml += `  <url>\n`;
            xml += `    <loc>${escapeXml(`${baseUrl}/${user.username}`)}</loc>\n`;
            xml += `    <lastmod>${user.updatedAt.toISOString()}</lastmod>\n`;
            xml += `    <changefreq>daily</changefreq>\n`;
            xml += `    <priority>0.8</priority>\n`;
            
            // User Avatar
            if (user.avatar) {
                xml += `    <image:image>\n`;
                xml += `      <image:loc>${escapeXml(user.avatar)}</image:loc>\n`;
                xml += `    </image:image>\n`;
            }
            // User Cover
            if (user.coverPhoto) {
                xml += `    <image:image>\n`;
                xml += `      <image:loc>${escapeXml(user.coverPhoto)}</image:loc>\n`;
                xml += `    </image:image>\n`;
            }
            
            xml += `  </url>\n`;
        }

        // Dynamic posts
        for (const post of posts) {
            const username = post.user?.username || 'post';
            const postRouteId = getPostRouteId(post.uuid);
            xml += `  <url>\n`;
            xml += `    <loc>${escapeXml(`${baseUrl}/${username}/status/${postRouteId}`)}</loc>\n`;
            xml += `    <lastmod>${post.updatedAt.toISOString()}</lastmod>\n`;
            xml += `    <changefreq>weekly</changefreq>\n`;
            xml += `    <priority>0.6</priority>\n`;
            
            // Post Images
            if (post.media && post.media.length > 0) {
                for (const m of post.media) {
                    xml += `    <image:image>\n`;
                    xml += `      <image:loc>${escapeXml(m.url)}</image:loc>\n`;
                    xml += `    </image:image>\n`;
                }
            }
            
            xml += `  </url>\n`;
        }

        for (const algorithm of algorithms) {
            xml += `  <url>\n`;
            xml += `    <loc>${escapeXml(`${baseUrl}/algorithms/${algorithm.uuid}`)}</loc>\n`;
            xml += `    <lastmod>${algorithm.updatedAt.toISOString()}</lastmod>\n`;
            xml += `    <changefreq>weekly</changefreq>\n`;
            xml += `    <priority>0.7</priority>\n`;
            xml += `  </url>\n`;
        }

        xml += `</urlset>`;
        return xml;
    }
}

module.exports = SitemapService;
