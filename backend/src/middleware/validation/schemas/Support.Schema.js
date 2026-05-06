const Joi = require('joi');

const SupportSchema = {
  createTicket: Joi.object({
    subject: Joi.string().max(255).required(),
    category: Joi.string().valid('Account', 'Billing', 'Post', 'Report', 'Technical', 'General').required(),
    description: Joi.string().max(2000).required(),
    email: Joi.string().email().allow(null, '').optional()
  })
};

module.exports = SupportSchema;
