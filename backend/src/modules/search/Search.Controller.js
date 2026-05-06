const asyncHandler = require('../../middleware/AsyncHandler');
const SearchService = require('./Search.Service');
const TransformUtils = require('../../utils/Transform.Utils');

/**
 * Search Controller
 * Orchestrates HTTP discovery requests for Arteo.
 */
class SearchController {
    /**
     * Universal global search.
     */
    searchAll = asyncHandler(async (req, res) => {
        const { q, type } = req.query;
        const result = await SearchService.searchAll(q, { type });
        res.success(result);
    });

    /**
     * Dedicated post discovery.
     */
    searchPosts = asyncHandler(async (req, res) => {
        const { q } = req.query;
        const posts = await SearchService.searchPosts(q);
        res.success({ posts });
    });

    /**
     * Dedicated account discovery.
     */
    searchUsers = asyncHandler(async (req, res) => {
        const { q } = req.query;
        const users = await SearchService.searchUsers(q);
        res.success({ users });
    });

    /**
     * Trending hashtags and metrics.
     */
    getTrending = asyncHandler(async (req, res) => {
        const result = await SearchService.getTrending();
        // [ABS-SWR] The service now returns an object containing the 'trending' array
        res.success({ trending: result.trending });
    });

    /**
     * Personalized discovery and expert lists.
     */
    getRecommendations = asyncHandler(async (req, res) => {
        const { category } = req.query;
        const result = await SearchService.getRecommendations(category);
        res.success(result);
    });

    /**
     * Analytical detail for trends (Topic & Posts).
     */
    getTrendDetail = asyncHandler(async (req, res) => {
        const { q } = req.query;
        const result = await SearchService.getTrendDetail(q);
        res.success(result);
    });

    /**
     * Compact trending events feed.
     */
    getHotEvents = asyncHandler(async (req, res) => {
        const result = await SearchService.getHotEvents();
        // [ABS-SWR] Result already contains { trending }
        res.success(result);
    });

    /**
     * AI-Powered personalized discovery summary.
     */
    getAiSummary = asyncHandler(async (req, res) => {
        const result = await SearchService.getAiSummary();
        // [ABS-SWR] Result already contains { summaries }
        res.success(result);
    });

    /**
     * Direct hashtag lookup.
     */
    searchHashtags = asyncHandler(async (req, res) => {
        const { q } = req.query;
        const hashtags = await SearchService.searchHashtags(q);
        res.success({ hashtags: hashtags.map(h => TransformUtils.formatHashtag(h)) });
    });
}

module.exports = new SearchController();
