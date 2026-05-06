const Joi = require('joi');

const AlgorithmSchema = {
  create: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(1000).allow('').optional(),
    weights: Joi.object({
      pipeline: Joi.array().items(Joi.object()).optional(),
      nodes: Joi.array().items(Joi.object()).optional(),
      edges: Joi.array().items(Joi.object()).optional()
    }).or('pipeline', 'nodes').required(),
    isActive: Joi.alternatives().try(Joi.boolean(), Joi.number().valid(0, 1)).optional(),
    isPublic: Joi.alternatives().try(Joi.boolean(), Joi.number().valid(0, 1)).optional(),
    imageUrl: Joi.string().uri().allow('', null).optional()
  }),

  update: Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    description: Joi.string().max(1000).allow('').optional(),
    weights: Joi.object({
      pipeline: Joi.array().items(Joi.object()).optional(),
      nodes: Joi.array().items(Joi.object()).optional(),
      edges: Joi.array().items(Joi.object()).optional()
    }).optional(),
    isActive: Joi.alternatives().try(Joi.boolean(), Joi.number().valid(0, 1)).optional(),
    isPublic: Joi.alternatives().try(Joi.boolean(), Joi.number().valid(0, 1)).optional(),
    imageUrl: Joi.string().uri().allow('', null).optional()
  }),

  bump: Joi.object({
    version: Joi.string().max(20).optional(),
    note: Joi.string().max(255).allow('').optional(),
    weights: Joi.object({
      pipeline: Joi.array().items(Joi.object().required()).min(1).required()
    }).optional()
  })
};

module.exports = AlgorithmSchema;
