const express = require('express');
const router = express.Router();
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { s3: s3Client } = require('../../config');
const { optionalAuth } = require('../../middleware/Auth');
const Logger = require('../../infra/logging/Logger.Service');

/**
 * CdnProxy Routes
 * High-fidelity consolidated gateway for secure media and static asset delivery.
 * Supports Arteo Cloud Storage (S3) with strict path validation and CDN-grade caching.
 * Replaces legacy /s3 and /media fragments.
 */

// Universal Media Retrieval Proxy
router.get('/:key(*)', optionalAuth, async (req, res) => {
    const key = req.params.key;
    if (!key) return res.badRequest({ message: 'Resource key is required.' });

    // Platinum Path Validation (Security Hardening)
    const isTraversing = key.includes('..') || key.includes('%2e%2e');
    const allowedPrefixes = ['media/', 'avatar/', 'avatars/', 'coverPhoto/', 'cover/', 'image/', 'images/', 'plugins/', 'videos/'];
    const isAllowedPrefix = allowedPrefixes.some((prefix) => key.startsWith(prefix));

    if (isTraversing || !isAllowedPrefix) {
        Logger.warn(`[CdnProxy] Unauthorized access attempt blocked: ${key}`);
        return res.forbidden({ message: 'Forbidden: Insufficient permissions for requested resource context.' });
    }

    try {
        if (!s3Client) {
            return res.internalServerError({ message: 'Supabase Storage is not configured for media streaming.' });
        }

        const command = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key
        });

        const response = await s3Client.send(command);
        
        // Professional CDN delivery orchestration
        res.set({
            'Content-Type': response.ContentType,
            'Content-Length': response.ContentLength,
            'Last-Modified': response.LastModified,
            'Cache-Control': 'public, max-age=31536000, immutable',
            'X-Content-Type-Options': 'nosniff'
        });

        response.Body.pipe(res);
    } catch (error) {
        if (error.name === 'NoSuchKey') {
            return res.notFound({ message: 'Resource not established in the Arteo Cloud Cluster.' });
        }
        
        Logger.error('[CdnProxy] Critical retrieval error:', error.message);
        return res.internalServerError({ message: 'Failed to establish resource stream.' });
    }
});

module.exports = router;
