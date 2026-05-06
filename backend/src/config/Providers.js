const Logger = require('../infra/logging/Logger.Service');
const { PrismaClient } = require('@prisma/client');
const IORedis = require('ioredis');
const { Redis: UpstashRedis } = require('@upstash/redis');
const { S3Client } = require('@aws-sdk/client-s3');
const cloudinary = require('cloudinary').v2;
const config = require('./Registry');

const prisma = new PrismaClient({
    log: process.env.PRISMA_QUERY_LOG === 'true'
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'],
    errorFormat: 'minimal',
});

function bootstrapRedis() {
    if (config.cache.upstashUrl && config.cache.upstashToken) {
        let url = config.cache.upstashUrl;
        if (!url.startsWith('http')) url = `https://${url}`;
        Logger.info('Redis: Upstash initialized.');
        return new UpstashRedis({ url, token: config.cache.upstashToken.trim() });
    }

    if (config.cache.redisUrl) {
        const client = new IORedis(config.cache.redisUrl, {
            retryStrategy: (times) => Math.min(times * 50, 2000),
            maxRetriesPerRequest: 3,
            enableOfflineQueue: true,
            commandTimeout: 1000
        });
        client.on('error', (err) => Logger.warn('Redis Local Connection Error', { error: err.message }));
        Logger.info('Redis: Local initialized.');
        return client;
    }

    Logger.info('Redis: Mock initialized for development/test.');
    const mockData = new Map();

    const getList = (key) => {
        const entry = mockData.get(key);
        if (!entry) return [];
        if (entry.expiry && entry.expiry < Date.now()) {
            mockData.delete(key);
            return [];
        }
        if (entry.type !== 'list') return [];
        return Array.isArray(entry.value) ? entry.value : [];
    };

    const setList = (key, list) => {
        const entry = mockData.get(key);
        mockData.set(key, {
            type: 'list',
            value: list,
            expiry: entry?.expiry || null
        });
    };

    return {
        _isMock: true,
        get: async (key) => {
            const entry = mockData.get(key);
            if (!entry) return null;
            if (entry.expiry && entry.expiry < Date.now()) {
                mockData.delete(key);
                return null;
            }
            if (entry.type === 'list') return JSON.stringify(entry.value);
            return entry.value;
        },
        set: async (key, value, ...args) => {
            let ttl = null;
            const exIndex = args.indexOf('EX');
            if (exIndex !== -1 && args[exIndex + 1]) ttl = parseInt(args[exIndex + 1], 10);
            mockData.set(key, { type: 'string', value, expiry: ttl ? Date.now() + ttl * 1000 : null });
            return 'OK';
        },
        del: async (...keys) => {
            let count = 0;
            keys.forEach((key) => { if (mockData.delete(key)) count += 1; });
            return count;
        },
        incr: async (key) => {
            const entry = mockData.get(key);
            let val = entry ? parseInt(entry.value, 10) || 0 : 0;
            val += 1;
            mockData.set(key, { type: 'string', value: val.toString(), expiry: entry?.expiry || null });
            return val;
        },
        expire: async (key, seconds) => {
            const entry = mockData.get(key);
            if (!entry) return 0;
            entry.expiry = Date.now() + seconds * 1000;
            return 1;
        },
        lpush: async (key, ...values) => {
            const list = getList(key);
            list.unshift(...values);
            setList(key, list);
            return list.length;
        },
        rpop: async (key) => {
            const list = getList(key);
            const value = list.pop() || null;
            setList(key, list);
            return value;
        },
        llen: async (key) => getList(key).length,
        scanStream: (options = {}) => {
            const EventEmitter = require('events');
            const stream = new EventEmitter();
            const match = options.match ? new RegExp('^' + options.match.replace(/\*/g, '.*') + '$') : null;
            setImmediate(() => {
                const keys = Array.from(mockData.keys()).filter((key) => !match || match.test(key));
                if (keys.length > 0) stream.emit('data', keys);
                stream.emit('end');
            });
            return stream;
        }
    };
}

const redis = bootstrapRedis();

const { bucket, endpoint, region, accessKeyId, secretAccessKey } = config.storage.s3;
const hasS3Credentials = Boolean(
    bucket && region && accessKeyId && secretAccessKey &&
    bucket.trim() && region.trim() && accessKeyId.trim() && secretAccessKey.trim()
);

const s3 = hasS3Credentials
    ? new S3Client({
        region,
        endpoint: endpoint || `https://s3.${region}.amazonaws.com`,
        forcePathStyle: Boolean(endpoint),
        credentials: { accessKeyId: accessKeyId.trim(), secretAccessKey: secretAccessKey.trim() }
    })
    : null;

if (!hasS3Credentials) {
    Logger.warn('S3 is not fully configured. File upload will fallback to local storage.');
}

if (config.storage.cloudinary.url) cloudinary.config(true);

const jwt = {
    getAccessTokenSecret: () => config.security.jwtAccessSecret,
    getRefreshTokenSecret: () => config.security.jwtRefreshSecret,
    expiresIn: config.security.jwtExpire || '24h'
};

module.exports = { prisma, redis, s3, cloudinary, jwt };
