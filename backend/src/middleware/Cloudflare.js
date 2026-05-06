const Logger = require('../infra/logging/Logger.Service');
const axios = require('axios');

/**
 * Cloudflare Turnstile Verification Middleware (ADS v14.1)
 * Chống bot và bảo vệ các thực thể định danh.
 */
const verifyTurnstile = async (req, res, next) => {
    const turnstileToken = req.headers['x-turnstile-token'] || req.body.turnstileToken;
    const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;

    // 1. Chế độ phát triển hoặc thiếu cấu hình: Cho qua
    if (!secretKey || process.env.NODE_ENV === 'development') {
        return next();
    }

    // 2. [PLATINUM BYPASS] Nếu yêu cầu đã có Token xác thực, cho phép bỏ qua check Bot
    // Điều này cực kỳ quan trọng cho luồng authenticated requests
    if (req.headers['authorization']) {
        return next();
    }

    // 3. Nếu không có token bot và cũng không có token auth: Chặn đứng
    if (!turnstileToken) {
        return res.badRequest({
            message: 'Verification failed: Security token missing.'
        });
    }

    try {
        const response = await axios.post(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            new URLSearchParams({
                secret: secretKey,
                response: turnstileToken,
                remoteip: req.ip
            })
        );

        if (response.data.success) {
            delete req.body.turnstileToken;
            next();
        } else {
            res.forbidden({
                message: 'Security check failed. Please try again.',
                details: response.data['error-codes']
            });
        }
    } catch (error) {
        Logger.error('Turnstile verification error:', error.message);
        res.internalServerError({
            message: 'Internal security service error.'
        });
    }
};

module.exports = { verifyTurnstile };
