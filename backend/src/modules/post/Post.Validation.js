const { z } = require('zod');
const { VISIBILITY } = require('../../core/Constants');

/**
 * Post Validation Schemas
 * Standardized using Zod for ABS v14.1 Platinum.
 */

const dbUuidSchema = z.string().regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    'Invalid UUID'
);

const createPostSchema = z.preprocess((data) => {
    if (typeof data !== 'object' || data === null) return data;
    const newData = { ...data };
    
    // Field Mapping: Map snake_case from frontend (api.ts) to internal camelCase
    if (newData.parent_id && !newData.parentId) newData.parentId = newData.parent_id;
    if (newData.original_post_id && !newData.originalPostId) newData.originalPostId = newData.original_post_id;
    if (newData.thread_index && !newData.threadIndex) newData.threadIndex = newData.thread_index;
    if (newData.thread_total && !newData.threadTotal) newData.threadTotal = newData.thread_total;
    if (newData.gif_url && !newData.gifUrl) newData.gifUrl = newData.gif_url;
    if (newData.link_preview && !newData.linkPreview) newData.linkPreview = newData.link_preview;
    if (newData.visibility === 'mentioned') newData.visibility = 'private';

    ['poll', 'linkPreview'].forEach((field) => {
        if (typeof newData[field] === 'string') {
            try {
                newData[field] = JSON.parse(newData[field]);
            } catch (_) {
                // Let schema validation report malformed JSON payloads normally.
            }
        }
    });

    if (newData.poll && typeof newData.poll === 'object') {
        if (newData.poll.duration_hours && !newData.poll.durationHours) {
            newData.poll.durationHours = newData.poll.duration_hours;
        }
    }
    
    return newData;
}, z.object({
    content: z.string().max(5000, 'Nội dung quá dài').optional().nullable(),
    type: z.preprocess((val) => {
        if (typeof val !== 'string') return val;
        const upper = val.toUpperCase();
        return upper === 'REPLY' ? 'COMMENT' : upper;
    }, z.enum(['POST', 'QUOTE', 'COMMENT', 'THREAD'])).optional().default('POST'),
    parentId: dbUuidSchema.optional().nullable(),
    originalPostId: dbUuidSchema.optional().nullable(),
    visibility: z.preprocess((val) => {
        if (typeof val !== 'string') return val;
        if (val.toLowerCase() === 'mentioned') return VISIBILITY.PRIVATE;
        return val.toUpperCase();
    }, z.enum([VISIBILITY.PUBLIC, VISIBILITY.FOLLOWERS, VISIBILITY.PRIVATE])).optional().default(VISIBILITY.PUBLIC),
    gifUrl: z.string().url('URL GIF không hợp lệ').optional().nullable(),
    topic: z.string().max(50, 'Chủ đề quá dài').optional().nullable(),
    location: z.string().max(100, 'Địa điểm quá dài').optional().nullable(),
    poll: z.object({
        question: z.string().optional(),
        options: z.array(z.string()).optional(),
        durationHours: z.coerce.number().optional()
    }).optional().nullable(),
    linkPreview: z.any().optional().nullable(),
    isEphemeral: z.preprocess((val) => {
        if (typeof val === 'string') return val === 'true';
        return !!val;
    }, z.boolean()).optional().default(false),
    threadIndex: z.coerce.number().min(1).optional().default(1),
    threadTotal: z.coerce.number().min(1).optional().default(1)
}));

const translateSchema = z.object({
    targetLanguage: z.string().min(2).max(10)
});

const getFeedSchema = z.object({
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(100).optional().default(20),
    location: z.string().optional(),
    topic: z.string().optional(),
    sort: z.enum(['newest', 'popular', 'trending']).optional().default('newest'),
    algorithmId: z.string().uuid().optional().or(z.string().optional()) // Support UUID or special strings
});

module.exports = {
    createPostSchema,
    translateSchema,
    getFeedSchema
};
