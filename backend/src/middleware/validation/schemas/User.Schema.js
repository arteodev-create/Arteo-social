const Joi = require('joi');

const UserSchema = {
  register: Joi.object({
    username: Joi.string()
      .min(3)
      .max(50)
      .pattern(/^[a-zA-Z0-9_]+$/)
      .required(),
    email: Joi.string().email().required(),
    credential: Joi.string().min(6).max(255).required(),
    fullName: Joi.string().max(100).allow('').optional(),
    bio: Joi.string().max(500).allow('').optional(),
    website: Joi.string().uri().allow('').optional(),
    location: Joi.string().max(100).allow('').optional(),
    language: Joi.string().max(10).allow('').optional(),
    turnstileToken: Joi.string().optional()
  }),

  login: Joi.object({
    identifier: Joi.string().optional(),
    email: Joi.string().optional(),
    username: Joi.string().optional(),
    credential: Joi.string().required(),
    turnstileToken: Joi.string().optional()
  }).or('identifier', 'email', 'username'),

  updateProfile: Joi.object({
    username: Joi.string()
      .min(3)
      .max(50)
      .pattern(/^[a-zA-Z0-9_]+$/)
      .optional(),
    fullName: Joi.string().max(100).allow('', null).optional(),
    bio: Joi.string().max(500).allow('', null).optional(),
    avatar: Joi.any().optional(),
    website: Joi.string().uri().allow('', null).optional(),
    location: Joi.string().max(100).allow('', null).optional(),
    isPrivate: Joi.alternatives().try(Joi.boolean(), Joi.string().valid('true', 'false', '0', '1')).optional(),
    is3dEnabled: Joi.alternatives().try(Joi.boolean(), Joi.string().valid('0', '1', 'true', 'false', '')).optional(),
    isBetaTester: Joi.alternatives().try(Joi.boolean(), Joi.string().valid('0', '1', 'true', 'false', '')).optional(),
    pronouns: Joi.string().max(20).allow('', null).optional(),
    professionalCategory: Joi.string().max(100).allow('', null).optional(),
    headline: Joi.string().max(255).allow('', null).optional(),
    company: Joi.string().max(100).allow('', null).optional(),
    githubHandle: Joi.string().max(50).allow('', null).optional(),
    twitterHandle: Joi.string().max(50).allow('', null).optional(),
    birthday: Joi.alternatives().try(Joi.date(), Joi.string().allow('', null)).optional(),
    birthdayPrivacy: Joi.any().optional(),
    socialLinks: Joi.any().optional(),
    affiliateId: Joi.string().uuid().allow('', null).optional(),
    skills: Joi.any().optional(),
    coverImage: Joi.any().optional()
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required(),
    language: Joi.string().max(10).allow('').optional()
  }),

  resetPassword: Joi.object({
    token: Joi.string().required(),
    credential: Joi.string().min(6).required()
  }),

  verifyEmail: Joi.object({
    email: Joi.string().email().required(),
    code: Joi.string().length(6).required(),
    language: Joi.string().max(10).allow('').optional()
  }),

  resendVerification: Joi.object({
    email: Joi.string().email().required(),
    language: Joi.string().max(10).allow('').optional()
  }),

  rotateCredential: Joi.object({
    oldCredential: Joi.string().required(),
    newCredential: Joi.string().min(6).max(255).required()
  }),

  revokeSession: Joi.object({
    sessionId: Joi.string().required()
  })
};

module.exports = UserSchema;
