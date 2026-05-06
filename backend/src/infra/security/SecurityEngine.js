const { AppError } = require('../../core/Errors');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * SecurityEngine
 * Professional-grade security utilities for the Arteo Identity System.
 * Standardizes hashing, OTP generation, and sensitive data handling.
 */
class SecurityEngine {
    /**
     * Hashes a raw credential (password) using industry standard cost factor.
     */
    static async hashCredential(raw) {
        if (!raw) throw new AppError('Credential cannot be empty', 400);
        return await bcrypt.hash(raw, 12); // Standard Cost Factor
    }

    /**
     * Verifies a raw credential against a stored hash.
     * Hardened against timing leaks via constant-time verification.
     */
    static async verifyCredential(raw, hash) {
        if (!raw || !hash) return false;
        try {
            return await bcrypt.compare(raw, hash);
        } catch (e) {
            return false;
        }
    }

    /**
     * Generates a crypographically secure random token (e.g. for Reset).
     */
    static generateSecureToken(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    }

    /**
     * Generates a numeric OTP (One-Time Password) using a secure random generator.
     */
    static generateOTP(digits = 6) {
        const min = Math.pow(10, digits - 1);
        const max = Math.pow(10, digits) - 1;
        return crypto.randomInt(min, max + 1).toString();
    }

    /**
     * Performs a constant-time comparison to prevent timing attacks.
     */
    static secureCompare(a, b) {
        if (!a || !b || a.length !== b.length) return false;
        return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
    }
}

module.exports = SecurityEngine;
