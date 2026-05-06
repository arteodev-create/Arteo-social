const Joi = require('joi');

const PostSchema = {
  create: Joi.object({
    content: Joi.string().max(10000).allow('').optional(),
    visibility: Joi.string().valid('public', 'followers', 'private', 'friends').default('public').optional(),
    location: Joi.string().max(255).allow('').optional(),
    gifUrl: Joi.string().uri().allow('').optional(),
    type: Joi.string().valid('post', 'quote', 'comment', 'reply').default('post').optional(),
    originalPostId: Joi.string().uuid().allow(null).optional(),
    parentId: Joi.string().uuid().allow(null).optional(),
    isEphemeral: Joi.boolean().optional(),
    scheduledAt: Joi.string().allow('', null).optional(),
    replySettings: Joi.string().allow('', null).optional(),
    hashtags: Joi.array().items(Joi.string().max(50)).max(10).optional(),
    mentions: Joi.array().items(Joi.string().max(50)).max(20).optional(),
    poll: Joi.object({
      question: Joi.string().max(255).required(),
      options: Joi.array().items(Joi.string().max(255)).min(2).max(4).required(),
      durationHours: Joi.number().integer().min(1).max(168).default(24).optional()
    }).optional(),
    linkPreview: Joi.any().optional(),
    topic: Joi.string().max(255).allow('').optional()
  }),

  update: Joi.object({
    content: Joi.string().max(10000).allow('').optional(),
    visibility: Joi.string().valid('public', 'followers', 'private').optional(),
    location: Joi.string().max(255).allow('').optional()
  }),

  feed: Joi.object({
    page: Joi.number().integer().min(1).default(1).optional(),
    limit: Joi.number().integer().min(1).max(100).default(20).optional(),
    algorithmId: Joi.string().uuid().optional(),
    scope: Joi.string().valid('discovery', 'following', 'algorithm', 'custom', 'arteo_smart').default('discovery').optional(),
    q: Joi.string().allow('').optional(),
    sort: Joi.string().valid('newest', 'oldest', 'top', 'trending').optional()
  })
};

module.exports = PostSchema;
