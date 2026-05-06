const ResponseHandler = require('./ResponseHandler');
const { AppError, ErrorCodes } = require('../core/Errors');
const Logger = require('../infra/logging/Logger.Service');

const sanitizeData = (data) => {
    if (!data || typeof data !== 'object') return data;

    const sensitiveKeys = ['password', 'token', 'secret', 'credential', 'apikey', 'access_token'];
    const sanitized = Array.isArray(data) ? [...data] : { ...data };

    Object.keys(sanitized).forEach((key) => {
        if (sensitiveKeys.some((k) => key.toLowerCase().includes(k))) {
            sanitized[key] = '**** [MASKED]';
            return;
        }

        if (typeof sanitized[key] === 'object') {
            sanitized[key] = sanitizeData(sanitized[key]);
        }
    });

    return sanitized;
};

const errorHandler = (err, req, res, next) => {
    let statusCode = err.status || err.statusCode || 500;

    const isStaticAsset = req.url.match(/\.(png|jpg|jpeg|gif|ico|svg|map|css|js|json)$/i);

    if (statusCode >= 500 || (statusCode === 404 && !isStaticAsset)) {
        Logger.error('Request failed with server error', {
            message: err.message,
            stack: err.stack,
            url: req.url,
            method: req.method,
            requestId: res.locals.requestId,
            body: sanitizeData(req.body),
            query: sanitizeData(req.query)
        });
    } else if (statusCode >= 400) {
        Logger.warn('Request failed with client error', {
            message: err.message,
            url: req.url,
            method: req.method,
            requestId: res.locals.requestId
        });
    }

    const errorResponse = {
        code: err.code || ErrorCodes.INTERNAL_SERVER_ERROR,
        message: err.message || 'Internal server error.',
        ...(err.data && typeof err.data === 'object' ? err.data : { data: err.data })
    };

    if (err.name === 'ValidationError') {
        statusCode = 400;
        errorResponse.code = ErrorCodes.VALIDATION_FAILED;
    } else if (err.name === 'ZodError') {
        statusCode = 400;
        errorResponse.code = ErrorCodes.VALIDATION_FAILED;
        errorResponse.message = err.errors?.map((e) => e.message).join('. ') || 'Invalid input data.';
        errorResponse.data = {
            errors: err.errors?.reduce((acc, e) => {
                const key = e.path[0];
                if (key) acc[key] = e.message;
                return acc;
            }, {})
        };
    } else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        errorResponse.code = 'IDENTITY_TOKEN_INVALID';
    } else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        errorResponse.code = 'IDENTITY_TOKEN_EXPIRED';
    } else if (err.name === 'MulterError') {
        statusCode = 400;
        errorResponse.code = 'MEDIA_STORAGE_ERROR';
        if (err.code === 'LIMIT_FILE_SIZE') {
            errorResponse.code = ErrorCodes.PAYLOAD_TOO_LARGE;
        }
    }

    return ResponseHandler.sendError(res, errorResponse, statusCode);
};

const notFoundHandler = (req, res, next) => {
    next(new AppError(`Resource not found: ${req.originalUrl}`, 404, ErrorCodes.NOT_FOUND));
};

module.exports = {
    errorHandler,
    notFoundHandler
};