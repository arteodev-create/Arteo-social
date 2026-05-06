require('dotenv').config();
const { validateConfig } = require('./Validation');


/**
 * Arteo Config Registry (Platinum v14.1)
 * Centralized, immutable configuration orchestrator.
 * Acts as the 'Single Source of Truth' for all environmental entropy.
 */
class ConfigRegistry {
    constructor() {
        const rawValues = validateConfig();
        this._values = Object.freeze(this._mapRegistry(rawValues));
    }

    /**
     * Maps raw environment values into a structured domain hierarchy.
     */
    _mapRegistry(env) {
        return {
            infra: {
                env: env.NODE_ENV,
                port: env.PORT || 5000,
                nodeName: env.NODE_NAME || 'Arteo Primary Server',
                appVersion: env.APP_VERSION,
                frontendUrl: env.FRONTEND_URL || 'https://arteosocial.com',
                domain: env.DOMAIN || 'arteosocial.com',
                baseUrl: env.BASE_URL || 'https://arteosocial.com'
            },
            db: {
                url: env.SUPABASE_DB_URL || env.DATABASE_URL,
                supabaseUrl: env.SUPABASE_URL,
                supabaseAnonKey: env.SUPABASE_ANON_KEY,
                supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
                supabaseAuthEnabled: env.SUPABASE_AUTH_ENABLED !== 'false'
            },
            security: {
                jwtAccessSecret: env.JWT_ACCESS_SECRET,
                jwtRefreshSecret: env.JWT_REFRESH_SECRET,
                jwtExpire: env.JWT_EXPIRE,
                jwtRefreshExpire: env.JWT_REFRESH_EXPIRE
            },
            cache: {
                redisUrl: env.REDIS_URL,
                upstashUrl: env.UPSTASH_REDIS_REST_URL,
                upstashToken: env.UPSTASH_REDIS_REST_TOKEN
            },
            storage: {
                driver: env.STORAGE_DRIVER || 'local',
                s3: {
                    bucket: env.AWS_S3_BUCKET,
                    endpoint: env.AWS_S3_ENDPOINT,
                    cdnUrl: env.AWS_S3_CDN_URL,
                    region: env.AWS_S3_REGION || env.AWS_REGION,
                    accessKeyId: env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: env.AWS_SECRET_ACCESS_KEY
                },
                cloudinary: {
                    url: env.CLOUDINARY_URL
                }
            },
            email: {
                host: env.SMTP_HOST,
                port: env.SMTP_PORT,
                user: env.SMTP_USER,
                pass: env.SMTP_PASS,
                from: env.EMAIL_FROM,
                secure: env.SMTP_SECURE === 'true'
            }
        };
    }

    /**
     * Retrieves the entire frozen configuration tree.
     */
    getValues() {
        return this._values;
    }
}

// Global Singleton Instance
const instance = new ConfigRegistry();
module.exports = instance.getValues();
