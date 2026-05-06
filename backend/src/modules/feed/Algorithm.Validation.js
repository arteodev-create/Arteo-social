const { z } = require('zod');

/**
 * Algorithm Validation Schemas
 * Standardized for ABS v14.1 Platinum.
 */

const createAlgorithmSchema = z.object({
    name: z.string().min(1, 'Tên thuật toán không được để trống'),
    description: z.string().optional(),
    weights: z.record(z.any()).optional(),
    pipeline: z.any().optional(),
    tags: z.array(z.string()).optional(),
    version: z.string().optional(),
    isPublic: z.boolean().optional(),
    isActive: z.boolean().optional()
});

const updateAlgorithmSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    weights: z.record(z.any()).optional(),
    pipeline: z.any().optional(),
    tags: z.array(z.string()).optional(),
    version: z.string().optional(),
    isPublic: z.boolean().optional(),
    isActive: z.boolean().optional()
});

const sortContextSchema = z.object({
    userLocation: z.string().optional(),
    interests: z.array(z.string()).optional(),
    limit: z.number().int().min(1).max(500).optional()
});

module.exports = {
    createAlgorithmSchema,
    updateAlgorithmSchema,
    sortContextSchema
};
