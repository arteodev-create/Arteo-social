const HashtagRepository = require('./Hashtag.Repository');

/**
 * Hashtag Service
 * Orchestrates content discovery and trend analysis via hashtag extraction and aggregation.
 */
class HashtagService {
    /**
     * Extracts unique hashtags from a raw content string.
     */
    extractHashtags(content) {
        if (!content) return [];
        const regex = /#(\w+)/g;
        const matches = content.match(regex);
        if (!matches) return [];
        // Normalize and deduplicate
        return [...new Set(matches.map(tag => tag.substring(1).toLowerCase()))];
    }

    /**
     * Persists and links hashtags to a specific post.
     */
    async processHashtags(postId, hashtagNames) {
        if (!hashtagNames || hashtagNames.length === 0) return;

        for (const name of hashtagNames) {
            // High-fidelity find or create logic
            let hashtag = await HashtagRepository.findByName(name);
            if (!hashtag) {
                hashtag = await HashtagRepository.create({ name: name.toLowerCase() });
            }
            
            await HashtagRepository.linkToPost(postId, hashtag.uuid);
            await HashtagRepository.incrementUsage(hashtag.uuid);
        }
    }

    /**
     * Retrieves recent trending hashtags for the platform.
     */
    async getTrending(limit = 10) {
        return await HashtagRepository.getTrending(parseInt(limit));
    }
}

module.exports = new HashtagService();
