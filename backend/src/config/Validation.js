const Joi = require('joi');
const Logger = require('../infra/logging/Logger.Service');
const { ConfigurationError } = require('../core/Errors');

/**
 * Config Schema
 * Professional environmental registry for the Arteo platform.
 * Standardized for Platinum Architectural Purity (ABS v14.1).
 * Standardized in Phase 116 (Environmental Entropy Sealing).
 */
const configSchema = Joi.object({
  // Infrastructure
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(5000),
  
  // Database (Supabase-first, Prisma-compatible)
  SUPABASE_DB_URL: Joi.string().uri().allow('').optional().messages({
    'string.uri': 'SUPABASE_DB_URL must be a valid database connection URI.'
  }),
  DATABASE_URL: Joi.string().uri().allow('').optional().messages({
    'string.uri': 'DATABASE_URL must be a valid database connection URI.'
  }),
  SUPABASE_URL: Joi.string().uri().allow('').optional(),
  SUPABASE_ANON_KEY: Joi.string().allow('').optional(),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().allow('').optional(),
  SUPABASE_AUTH_ENABLED: Joi.string().valid('true', 'false').default('true'),
  
  // High-Fidelity Security
  JWT_ACCESS_SECRET: Joi.string().min(32).required().messages({
    'any.required': 'JWT_ACCESS_SECRET is mandatory for Arteo High-Fidelity Security (Synchronize from legacy JWT_SECRET).',
    'string.min': 'JWT_ACCESS_SECRET must be at least 32 characters for Platinum security standards.'
  }),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRE: Joi.string().default('24h'),
  JWT_REFRESH_EXPIRE: Joi.string().default('30d'),
  
  // Discovery & SEO
  FRONTEND_URL: Joi.string().uri().optional(),
  
  // Cache Orchestration
  REDIS_URL: Joi.string().uri().optional(),
  UPSTASH_REDIS_REST_URL: Joi.string().uri().optional(),
  UPSTASH_REDIS_REST_TOKEN: Joi.string().optional(),

  // Storage & Media Cluster
  STORAGE_DRIVER: Joi.string().valid('local', 's3').default('local'),
  AWS_S3_BUCKET: Joi.string().allow('').optional(),
  AWS_S3_ENDPOINT: Joi.string().uri().allow('').optional(),
  AWS_S3_CDN_URL: Joi.string().uri().allow('').optional(),
  AWS_REGION: Joi.string().allow('').optional(),
  AWS_S3_REGION: Joi.string().allow('').optional(),
  AWS_ACCESS_KEY_ID: Joi.string().allow('').optional(),
  AWS_SECRET_ACCESS_KEY: Joi.string().allow('').optional(),

  CLOUDINARY_URL: Joi.string().uri().optional(),
  
  // SMTP Infrastructure (Transactional Messaging)
  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().required(),
  SMTP_USER: Joi.string().required(),
  SMTP_PASS: Joi.string().required(),
  EMAIL_FROM: Joi.string().required(),
  SMTP_SECURE: Joi.string().valid('true', 'false').default('true'),
  
  // SEO Integrity Cluster
  SITEMAP_USER_LIMIT: Joi.number().default(500),
  SITEMAP_POST_LIMIT: Joi.number().default(1000),
  
  // Identity Metrics
  NODE_NAME: Joi.string().default('node-local-dev'),
  APP_VERSION: Joi.string().default('2.1.0')
}).unknown(true);

/**
 * Giải mã các biến môi trường dạng Template (e.g. ${DB_HOST})
 * Arteo Platform - Environment Expansion Logic
 */
const expandEnv = (config) => {
  const expanded = { ...config };
  
  // 1. Pre-clean: Bóc tách toàn bộ dấu nháy của các biến thành phần
  Object.keys(expanded).forEach(key => {
    if (typeof expanded[key] === 'string') {
      expanded[key] = expanded[key].replace(/^['"]|['"]$/g, '');
    }
  });

  // 2. Expand: Lắp ráp Template (Hỗ trợ lồng nhau 2 cấp)
  const resolve = (val) => {
    return val.replace(/\${(\w+)}/g, (_, v) => expanded[v] || '');
  };

  Object.keys(expanded).forEach(key => {
    if (typeof expanded[key] === 'string' && expanded[key].includes('${')) {
      expanded[key] = resolve(expanded[key]);
      // Resolve lần 2 nếu có biến lồng nhau
      if (expanded[key].includes('${')) {
        expanded[key] = resolve(expanded[key]);
      }
    }
  });

  return expanded;
};

/**
 * Validates the current process.env against the platform schema.
 * Orchestrates a "Fail-Fast" boot sequence to prevent corrupt entropy.
 */
const validateConfig = () => {
  // 1. Thực hiện giải mã Template biến động (Dynamic Assignment)
  const preProcessed = expandEnv(process.env);
  
  // 2. Kiểm tra tính hợp lệ qua Schema
  const { error, value } = configSchema.validate(preProcessed, {
    abortEarly: false,
    stripUnknown: false 
  });

  if (error) {
    const details = error.details.map(d => `${d.path.join('.')}: ${d.message}`).join(', ');
    const criticalError = `[Config Validation Failed] Critical environment mismatch: ${details}`;
    
    Logger.error(criticalError);
    
    // Terminal failure: Arteo Nodes cannot operate with corrupt entropy.
    throw new ConfigurationError(criticalError);
  }

  const hasSupabaseDbUrl = Boolean(value.SUPABASE_DB_URL && value.SUPABASE_DB_URL.trim());
  const hasDatabaseUrl = Boolean(value.DATABASE_URL && value.DATABASE_URL.trim());
  if (!hasSupabaseDbUrl && !hasDatabaseUrl) {
    const criticalError = '[Config Validation Failed] Critical environment mismatch: SUPABASE_DB_URL (preferred) or DATABASE_URL is required for Supabase database connectivity.';
    Logger.error(criticalError);
    throw new ConfigurationError(criticalError);
  }

  const usingS3 = value.STORAGE_DRIVER === 's3' || value.NODE_ENV === 'production';
  if (usingS3) {
    const missingS3 = [];
    if (!value.AWS_S3_BUCKET || !value.AWS_S3_BUCKET.trim()) missingS3.push('AWS_S3_BUCKET');
    if (!(value.AWS_REGION || value.AWS_S3_REGION || '').trim()) missingS3.push('AWS_REGION or AWS_S3_REGION');
    if (!value.AWS_ACCESS_KEY_ID || !value.AWS_ACCESS_KEY_ID.trim()) missingS3.push('AWS_ACCESS_KEY_ID');
    if (!value.AWS_SECRET_ACCESS_KEY || !value.AWS_SECRET_ACCESS_KEY.trim()) missingS3.push('AWS_SECRET_ACCESS_KEY');

    if (missingS3.length > 0) {
      const criticalError = `[Config Validation Failed] Missing S3 config for ${value.NODE_ENV} mode: ${missingS3.join(', ')}`;
      Logger.error(criticalError);
      throw new ConfigurationError(criticalError);
    }
  }

  // Refrelect validated and cast values back into process.env for legacy support
  Object.assign(process.env, value);
  
  return value;
};

module.exports = {
  validateConfig,
  configSchema
};
