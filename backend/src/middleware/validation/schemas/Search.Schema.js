const Joi = require('joi');

const SearchSchema = Joi.object({
  q: Joi.string().min(1).max(100).required(),
  type: Joi.string().valid('users', 'posts', 'hashtags', 'top', 'latest', 'people', 'media', 'trending', 'tag').default('top').optional(),
  page: Joi.number().integer().min(1).default(1).optional(),
  limit: Joi.number().integer().min(1).max(50).default(20).optional()
});

module.exports = SearchSchema;
