const Logger = require('../infra/logging/Logger.Service');
const fs = require('fs');
const path = require('path');

/**
 * Content Utilities
 * Orchestrates platform taxonomy, topic discovery, and NLP-based categorization logic.
 */
class ContentUtils {
    constructor() {
        this.LEARNED_FILE = path.join(__dirname, '../data/learnedKeywords.json');
        this.TOPICS = {
            'Technology': ['code', 'coding', 'programming', 'javascript', 'python', 'react', 'node', 'backend', 'frontend', 'database', 'api', 'cloud', 'ai', 'llm', 'cybersecurity'],
            'Crypto': ['btc', 'bitcoin', 'eth', 'ethereum', 'solana', 'blockchain', 'web3', 'nft', 'defi', 'token', 'pump', 'bull run'],
            'Science': ['physics', 'chemistry', 'biology', 'astronomy', 'space', 'nasa', 'spacex', 'evolution', 'quantum', 'research'],
            'Business': ['entrepreneur', 'startup', 'founder', 'ceo', 'management', 'leadership', 'marketing', 'revenue', 'scale', 'linkedin'],
            'Finance': ['finance', 'invest', 'stock', 'market', 'nasdaq', 'portfolio', 'asset', 'debt', 'economy', 'tax', 'wealth'],
            'Gaming': ['game', 'gaming', 'gamer', 'playstation', 'xbox', 'nintendo', 'steam', 'esports', 'twitch', 'streamer', 'gameplay'],
            'Music': ['music', 'song', 'singer', 'band', 'album', 'track', 'spotify', 'concert', 'festival', 'lyrics', 'producer', 'dj'],
            'Movies & TV': ['movie', 'film', 'cinema', 'actor', 'director', 'hollywood', 'netflix', 'series', 'tv show', 'anime', 'manga'],
            'Art & Design': ['art', 'artist', 'painting', 'sketch', 'illustration', 'photoshop', 'design', 'ui/ux', 'creative', 'photography'],
            'Sports': ['football', 'soccer', 'basketball', 'nba', 'tennis', 'fitness', 'workout', 'athlete', 'team', 'match', 'olympics'],
            'Health': ['health', 'doctor', 'hospital', 'medical', 'vaccine', 'mental health', 'meditation', 'nutrition', 'skincare'],
            'Food': ['food', 'cook', 'chef', 'recipe', 'restaurant', 'cafe', 'pizza', 'burger', 'sushi', 'coffee', 'wine', 'dinner'],
            'Travel': ['travel', 'trip', 'vacation', 'tourism', 'destination', 'passport', 'flight', 'hotel', 'airbnb', 'beach', 'mountain'],
            'Fashion': ['fashion', 'style', 'outfit', 'clothing', 'shoes', 'accessories', 'makeup', 'beauty', 'model', 'designer', 'brand'],
            'Books': ['book', 'read', 'novel', 'story', 'fiction', 'literature', 'author', 'writer', 'library', 'chapter', 'bestseller'],
            'Politics': ['politics', 'government', 'president', 'law', 'legal', 'vote', 'election', 'campaign', 'democracy', 'news'],
            'Writing': ['write', 'writing', 'blog', 'blogger', 'journal', 'essay', 'article', 'content', 'copywriting', 'storytelling']
        };

        this._loadLearnedKeywords();
    }

    /**
     * Internal: Bootstraps the topic dictionary with persisted learned keywords.
     */
    _loadLearnedKeywords() {
        try {
            if (fs.existsSync(this.LEARNED_FILE)) {
                const learned = JSON.parse(fs.readFileSync(this.LEARNED_FILE, 'utf8'));
                Object.entries(learned).forEach(([topic, keywords]) => {
                    if (!this.TOPICS[topic]) this.TOPICS[topic] = [];
                    keywords.forEach(k => {
                        const low = k.toLowerCase();
                        if (!this.TOPICS[topic].includes(low)) this.TOPICS[topic].push(low);
                    });
                });
                Logger.info('[ContentUtils] High-fidelity taxonomy updated with learned keywords.');
            }
        } catch (e) {
            Logger.error('[ContentUtils] Initialization failure:', e.message);
        }
    }

    /**
     * Diagnostic: Identifies the primary topic from a raw content string.
     */
    detectTopic(content) {
        if (!content) return null;
        const lowContent = content.toLowerCase();
        
        for (const [topic, keywords] of Object.entries(this.TOPICS)) {
            for (const keyword of keywords) {
                if (lowContent.includes(keyword)) return topic;
            }
        }
        return null;
    }

    /**
     * Expansion: Persists a new discovery path into the platform taxonomy.
     */
    learnTopic(topic) {
        if (!topic) return;
        const cleanTopic = topic.trim();
        const keyword = cleanTopic.toLowerCase();

        if (!this.TOPICS[cleanTopic]) this.TOPICS[cleanTopic] = [];

        if (!this.TOPICS[cleanTopic].includes(keyword)) {
            this.TOPICS[cleanTopic].push(keyword);
            Logger.info(`[ContentUtils] Expansion: Learned new topic "${cleanTopic}"`);
            
            this._persistLearnedKeyword(cleanTopic, keyword);
        }
    }

    _persistLearnedKeyword(topic, keyword) {
        try {
            let learned = {};
            if (fs.existsSync(this.LEARNED_FILE)) {
                learned = JSON.parse(fs.readFileSync(this.LEARNED_FILE, 'utf8'));
            }
            if (!learned[topic]) learned[topic] = [];
            if (!learned[topic].includes(keyword)) {
                learned[topic].push(keyword);
                fs.writeFileSync(this.LEARNED_FILE, JSON.stringify(learned, null, 2));
            }
        } catch (e) {
            Logger.error('[ContentUtils] Persistence failure:', e.message);
        }
    }
}

module.exports = new ContentUtils();


