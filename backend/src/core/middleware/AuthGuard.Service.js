const Logger = require('../infra/logging/Logger.Service');
const axios = require('axios');
const cacheService = require('../../infra/cache/Cache.Service');
const { ValidationError, AuthorizationError } = require('../../middleware/ErrorHandler');

const LOCKOUT_ATTEMPTS = 5;
const LOCKOUT_DURATION = 1800; // 30 minutes in seconds
const TURNSTILE_SECRET = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA';

async function verifyRobot(token, ip) {
    if (process.env.NODE_ENV === 'development' && !token) return true;

    try {
        const params = new URLSearchParams();
        params.append('secret', TURNSTILE_SECRET);
        params.append('response', token);
        if (ip) params.append('remoteip', ip);

        const response = await axios.post(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            params.toString(),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        return !!response.data.success;
    } catch (error) {
        Logger.error(`[Guard] Turnstile API Error: ${error.message}`);
        return false;
    }
}

async function checkLockout(identifier) {
    const key = `auth:lockout:${identifier}`;
    const status = await cacheService.get(key);

    if (status && status.attempts >= LOCKOUT_ATTEMPTS) {
        const remaining = Math.max(0, Math.floor((status.lockedUntil - Date.now()) / 1000));
        if (remaining > 0) {
            throw new AuthorizationError(
                `Too many failed attempts. Try again in ${Math.ceil(remaining / 60)} minutes.`, 
                'AUTH_LOCKED'
            );
        } else {
            await cacheService.del(key);
        }
    }
}

async function recordFailure(identifier) {
    const key = `auth:lockout:${identifier}`;
    const status = (await cacheService.get(key)) || { attempts: 0 };

    status.attempts += 1;
    status.lastAttempt = Date.now();

    if (status.attempts >= LOCKOUT_ATTEMPTS) {
        status.lockedUntil = Date.now() + (LOCKOUT_DURATION * 1000);
    }

    await cacheService.set(key, status, LOCKOUT_DURATION);
}

async function clearLockout(identifier) {
    await cacheService.del(`auth:lockout:${identifier}`);
}

module.exports = {
    verifyRobot,
    checkLockout,
    recordFailure,
    clearLockout
};


