const Joi = require('joi');

const CommentSchema = {
  create: Joi.object({
    content: Joi.string().max(1000).allow('').optional(),
    parentId: Joi.string().uuid().optional(),
    gifUrl: Joi.string().uri().allow('').optional(),
    mediaUrl: Joi.string().uri().allow('').optional(),
    mediaType: Joi.string().valid('image', 'video', 'gif').optional(),
    poll: Joi.object({
      question: Joi.string().max(255).required(),
      options: Joi.array().items(Joi.string().max(255)).min(2).max(4).required(),
      durationHours: Joi.number().valid(24, 72, 168).default(24).optional()
    }).optional(),
    location: Joi.string().max(255).allow('').optional(),
    linkPreview: Joi.any().optional()
  }),

  update: Joi.object({
    content: Joi.string().min(1).max(1000).required(),
  }),

  list: Joi.object({
    page: Joi.number().integer().min(1).default(1).optional(),
    limit: Joi.number().integer().min(1).max(50).default(20).optional(),
    parentId: Joi.string().uuid().optional()
  })
};

module.exports = CommentSchema;
