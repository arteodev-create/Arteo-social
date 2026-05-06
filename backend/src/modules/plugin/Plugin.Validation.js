const { z } = require('zod');

/**
 * Plugin (Re-Code Extension) Validation Schemas
 * Standardized for ABS v14.1 Platinum.
 */

const createPluginSchema = z.object({
    name: z.string().min(3).max(50),
    description: z.string().max(200).optional(),
    code: z.string().min(10).max(50000).refine(val => {
        // Basic security scan for dangerous keywords
        const dangerous = ['process.', 'require(', 'eval(', 'child_process', 'fs.', 'os.'];
        return !dangerous.some(d => val.includes(d));
    }, { message: 'Mã nguồn plugin chứa từ khóa bị cấm vì lý do bảo mật.' }),
    version: z.string().regex(/^\d+\.\d+\.\d+$/).default('1.0.0'),
    isPublic: z.boolean().default(false)
});

const updatePluginSchema = z.object({
    name: z.string().min(3).max(50).optional(),
    description: z.string().max(200).optional(),
    code: z.string().min(10).max(50000).refine(val => {
        const dangerous = ['process.', 'require(', 'eval(', 'child_process', 'fs.', 'os.'];
        return !dangerous.some(d => val.includes(d));
    }, { message: 'Mã nguồn plugin chứa từ khóa bị cấm.' }).optional(),
    isActive: z.boolean().optional(),
    isPublic: z.boolean().optional()
});

module.exports = {
    createPluginSchema,
    updatePluginSchema
};
