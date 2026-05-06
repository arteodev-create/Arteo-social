const PluginCategoryService = require('./PluginCategory.Service');
const TransformUtils = require('../../utils/Transform.Utils');
const asyncHandler = require('../../middleware/AsyncHandler');

/**
 * PluginCategory Controller
 * API Surface for extension category management.
 * Standardized for ABS v14.1 Platinum.
 */
class PluginCategoryController {
    /**
     * Enumerates all available categories for the platform.
     */
    getAll = asyncHandler(async (req, res) => {
        const categories = await PluginCategoryService.getAll();
        const formatted = categories.map(c => TransformUtils.formatCategory(c));
        
        return res.success(formatted);
    });

    /**
     * Establishes a new category entity based on user specification.
     */
    create = asyncHandler(async (req, res) => {
        const category = await PluginCategoryService.create(req.body);
        const formatted = TransformUtils.formatCategory(category);
        
        return res.created(formatted, {
            message: 'Strategic category entity established successfully.'
        });
    });
}

module.exports = new PluginCategoryController();
