const { z } = require('zod');

/**
 * Admin Validation Schemas
 * Standardized for ABS v14.1 Platinum.
 */

// Schema cho phân trang chung (User, Post)
const paginationSchema = z.object({
    page: z.preprocess((val) => parseInt(val, 10), z.number().int().min(1)).default(1),
    limit: z.preprocess((val) => parseInt(val, 10), z.number().int().min(1).max(100)).default(50),
    query: z.string().optional().default('')
});

// Schema cập nhật User
const updateUserSchema = z.object({
    role: z.enum(['USER', 'MODERATOR', 'ADMIN']).optional(),
    status: z.enum(['ACTIVE', 'SUSPENDED', 'PENDING']).optional(),
    isVerified: z.boolean().optional()
});

// Schema cho Database Management
const dbColumnSchema = z.object({
    oldName: z.string().min(1).optional(),
    newName: z.string().min(1),
    type: z.string().min(1).optional()
});

const dbAddColumnSchema = z.object({
    name: z.string().min(1),
    type: z.string().min(1),
    defaultValue: z.any().optional()
});

module.exports = {
    getPaginatedUsersSchema: paginationSchema,
    getPaginatedPostsSchema: paginationSchema,
    updateUserSchema,
    dbColumnSchema,
    dbAddColumnSchema
};
