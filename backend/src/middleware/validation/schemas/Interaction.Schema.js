const Joi = require('joi');

/**
 * Interaction Validation Schemas
 * Standardized for ABS v14.1 Platinum.
 */

const toggleLike = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required()
});

const toggleRepost = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required()
});

const toggleFollow = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required()
});

const listInteractions = Joi.object({
  type: Joi.string().valid('LIKE', 'REPOST', 'FOLLOW').required(),
  targetId: Joi.string().guid({ version: 'uuidv4' }).required(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

module.exports = {
  toggleLike,
  toggleRepost,
  toggleFollow,
  listInteractions
};
