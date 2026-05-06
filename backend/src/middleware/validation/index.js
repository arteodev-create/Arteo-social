const Logger = require('../../infra/logging/Logger.Service');
const { AppError } = require('../../core/Errors');
const xss = require('xss');

// Import schemas
const UserSchema = require('./schemas/User.Schema');
const PostSchema = require('./schemas/Post.Schema');
const CommentSchema = require('./schemas/Comment.Schema');
const SearchSchema = require('./schemas/Search.Schema');
const AlgorithmSchema = require('./schemas/Algorithm.Schema');
const InteractionSchema = require('./schemas/Interaction.Schema');
const PluginSchema = require('./schemas/Plugin.Schema');
const SupportSchema = require('./schemas/Support.Schema');
const CommonSchema = require('./schemas/Common.Schema');

const schemas = {
  user: UserSchema,
  post: PostSchema,
  comment: CommentSchema,
  search: SearchSchema,
  algorithm: AlgorithmSchema,
  interaction: InteractionSchema,
  plugin: PluginSchema,
  support: SupportSchema,
  pagination: CommonSchema.pagination,
  uuid: CommonSchema.uuid,
  utils: CommonSchema.utils
};

/**
 * Core validation middleware.
 */
const validate = (schemaType, schemaName, source = 'body') => {
  return (req, res, next) => {
    let schema;
    if (schemaName == null) {
      schema = schemas[schemaType];
    } else {
      schema = schemas[schemaType]?.[schemaName];
    }

    if (!schema) {
      Logger.error(`[Validation] Schema not found: ${schemaType}.${schemaName}`);
      return next(new AppError('Internal platform exception', 500));
    }

    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      Logger.error(`[Validation Error] ${schemaType}.${schemaName}:`, JSON.stringify(errors, null, 2));
      return res.badRequest({
        code: 'VALIDATION_FAILED',
        message: 'Input validation failed',
        details: errors
      });
    }

    req[source] = value;
    next();
  };
};

/**
 * File upload validation middleware.
 */
const validateFileUpload = (allowedTypes = ['image/jpeg', 'image/png', 'image/gif'], maxSize = 10 * 1024 * 1024) => {
  return (req, res, next) => {
    if (!req.files || req.files.length === 0) return next();

    for (const file of req.files) {
      if (!allowedTypes.includes(file.mimetype)) {
        return res.badRequest({
          code: 'INVALID_FILE_TYPE',
          message: `File type ${file.mimetype} not allowed.`,
          field: 'files'
        });
      }

      if (file.size > maxSize) {
        return res.badRequest({
          code: 'FILE_TOO_LARGE',
          message: `File size exceeds maximum limit.`,
          field: 'files'
        });
      }
    }
    next();
  };
};

/**
 * Input sanitization middleware (XSS protection).
 */
const sanitizeInput = (fields = ['content', 'bio', 'fullName']) => {
  return (req, res, next) => {
    const sanitizeString = (str) => {
      if (typeof str !== 'string') return str;
      return xss(str, {
        whiteList: {},
        stripIgnoreTag: true,
        stripIgnoreTagBody: ['script']
      }).trim();
    };

    fields.forEach(field => {
      if (req.body[field]) {
        if (typeof req.body[field] === 'string') {
          req.body[field] = sanitizeString(req.body[field]);
        } else if (Array.isArray(req.body[field])) {
          req.body[field] = req.body[field].map(item =>
            typeof item === 'string' ? sanitizeString(item) : item
          );
        }
      }
    });
    next();
  };
};

module.exports = {
  validate,
  validateFileUpload,
  sanitizeInput,
  schemas,

  validateRegister: validate('user', 'register'),
  validateLogin: validate('user', 'login'),
  validateUpdateProfile: validate('user', 'updateProfile'),
  validateForgotPassword: validate('user', 'forgotPassword'),
  validateResetPassword: validate('user', 'resetPassword'),
  validateVerifyEmail: validate('user', 'verifyEmail'),
  validateResendVerification: validate('user', 'resendVerification'),
  validateCreatePost: validate('post', 'create'),
  validateUpdatePost: validate('post', 'update'),
  validatePostFeed: validate('post', 'feed'),

  validateCreateComment: validate('comment', 'create'),
  validateUpdateComment: validate('comment', 'update'),
  validateListComments: validate('comment', 'list'),

  validateCreateAlgorithm: validate('algorithm', 'create'),
  validateUpdateAlgorithm: validate('algorithm', 'update'),
  validateBumpAlgorithm: validate('algorithm', 'bump'),

  validateCreateTicket: validate('support', 'createTicket'),

  validateCreatePlugin: validate('plugin', 'create'),
  validateUpdatePlugin: validate('plugin', 'update'),

  validateRotateCredential: validate('user', 'rotateCredential'),
  validateRevokeSession: validate('user', 'revokeSession'),

  validateUuid: validate('uuid', null, 'params'),
  validateSearch: validate('search', null, 'query'),
  validatePagination: validate('pagination', null, 'query'),
  validateUrl: validate('utils', 'url', 'body'),
  validateUrlQuery: validate('utils', 'url', 'query')
};
