const Joi = require('joi');

const CommonSchema = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1).optional(),
    limit: Joi.number().integer().min(1).max(100).default(20).optional(),
    sort: Joi.string().valid('createdAt', 'updatedAt', 'name', 'username').default('createdAt').optional(),
    order: Joi.string().valid('asc', 'desc').default('desc').optional()
  }),

  uuid: Joi.object({
    id: Joi.string().min(1).max(50).optional(),
    uuid: Joi.string().min(1).max(50).optional(),
    optionUuid: Joi.string().min(1).max(50).optional()
  }).or('id', 'uuid', 'optionUuid'),

  utils: {
    url: Joi.object({
      url: Joi.string().uri({ scheme: ['http', 'https'] }).required()
    })
  }
};

module.exports = CommonSchema;
