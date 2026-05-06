const Logger = require('../infra/logging/Logger.Service');
const IORedis = require('ioredis');
const { Redis: UpstashRedis } = require('@upstash/redis');
const config = require('./Registry');

/**
 * Redis Client Orchestrator
 * High-fidelity performance and caching engine for the Arteo platform.
 * Orchestrates seamless switching between Local Redis, Upstash (Edge), and Mock (Development).
 */
class RedisClientOrchestrator {
    constructor() {
        this.client = this._bootstrap();
    }

    _bootstrap() {
        if (config.cache.upstashUrl && config.cache.upstashToken) {
            return this._initUpstash();
        } else if (config.cache.redisUrl) {
            return this._initLocalRedis();
        } else {
            return this._initMock();
        }
    }


    _initUpstash() {
        let url = config.cache.upstashUrl;
        if (!url.startsWith('http')) url = `https://${url}`;
        Logger.info('☁️ Redis: Upstash (Edge/Cloud) initialized.');
        return new UpstashRedis({
            url,
            token: config.cache.upstashToken.trim(),
        });
    }

    _initLocalRedis() {
        const client = new IORedis(config.cache.redisUrl, {
            retryStrategy: (times) => Math.min(times * 50, 2000),
            maxRetriesPerRequest: 3,
            enableOfflineQueue: true,
            commandTimeout: 1000
        });

        client.on('error', (err) => {
            Logger.warn('⚠️ Redis Local Connection Error:', err.message);
        });

        Logger.info('🔌 Redis: Local (IORedis) initialized.');
        return client;
    }

    _initMock() {
        Logger.info('📦 Redis: Mock (In-Memory) initialized for Development.');
        const mockData = new Map();
        return {
            get: async (key) => {
                const entry = mockData.get(key);
                if (!entry) return null;
                if (entry.expiry && entry.expiry < Date.now()) {
                    mockData.delete(key);
                    return null;
                }
                return entry.value;
            },
            set: async (key, value, ...args) => {
                let ttl = null;
                if (args.includes('EX')) {
                    const exIndex = args.indexOf('EX');
                    if (args[exIndex + 1]) ttl = parseInt(args[exIndex + 1]);
                }
                mockData.set(key, { value, expiry: ttl ? Date.now() + ttl * 1000 : null });
                return 'OK';
            },
            del: async (...keys) => {
                keys.forEach(key => mockData.delete(key));
                return keys.length;
            },
            scanStream: (options) => {
                const match = options?.match?.replace('*', '.*');
                const regex = match ? new RegExp(`^${match}$`) : null;
                const keys = Array.from(mockData.keys()).filter(key => !regex || regex.test(key));
                
                const { EventEmitter } = require('events');
                const stream = new EventEmitter();
                process.nextTick(() => {
                    if (keys.length > 0) {
                        // Split into chunks if needed, but for mock, all at once is fine
                        stream.emit('data', keys);
                    }
                    stream.emit('end');
                });
                return stream;
            },
            pipeline: () => ({
                del: (key) => mockData.delete(key),
                exec: async () => []
            }),
            on: () => {},
            _isMock: true
        };
    }

    getInstance() {
        return this.client;
    }
}

module.exports = new RedisClientOrchestrator().getInstance();


