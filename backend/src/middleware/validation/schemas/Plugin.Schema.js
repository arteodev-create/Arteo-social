const Joi = require('joi');

const PluginSchema = {
  create: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(1000).allow('').optional(),
    code: Joi.string().required(),
    category: Joi.string().max(50).default('General').optional(),
    blocksMetadata: Joi.array().items(Joi.object()).optional(),
    isPublic: Joi.boolean().default(false).optional()
  }),
  update: Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    description: Joi.string().max(1000).allow('').optional(),
    code: Joi.string().optional(),
    category: Joi.string().max(50).optional(),
    blocksMetadata: Joi.array().items(Joi.object()).optional(),
    isPublic: Joi.boolean().optional()
  })
};

module.exports = PluginSchema;
