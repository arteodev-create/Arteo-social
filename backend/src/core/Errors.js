/**
 * ErrorCodes: Centralized error identifiers for Arteo.
 */
const ErrorCodes = {
    // General
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
    BAD_REQUEST: 'BAD_REQUEST',
    NOT_FOUND: 'NOT_FOUND',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    CONFLICT: 'CONFLICT',
    VALIDATION_FAILED: 'VALIDATION_FAILED',
    PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
    UNPROCESSABLE_ENTITY: 'UNPROCESSABLE_ENTITY',

    // Identity Domain
    AUTH_INVALID_CREDS: 'AUTH_INVALID_CREDS',
    AUTH_USER_NOT_FOUND: 'AUTH_USER_NOT_FOUND',
    AUTH_USER_MIGRATED: 'AUTH_USER_MIGRATED',
    AUTH_CAPTCHA_FAILED: 'AUTH_CAPTCHA_FAILED',
    AUTH_CODE_INVALID: 'AUTH_CODE_INVALID',
    AUTH_IDENTIFIER_EXISTS: 'AUTH_IDENTIFIER_EXISTS',
    AUTH_RESET_TOKEN_INVALID: 'AUTH_RESET_TOKEN_INVALID',
    AUTH_NOT_VERIFIED: 'AUTH_NOT_VERIFIED',
    AUTH_INVALID_OTP: 'AUTH_INVALID_OTP',
    
    // Social Domain
    POST_NOT_FOUND: 'POST_NOT_FOUND',
    COMMENT_NOT_FOUND: 'COMMENT_NOT_FOUND',

    // Algorithm & Feed Domain
    ALGO_NOT_FOUND: 'ALGO_NOT_FOUND',
    ALGO_INVALID_PIPELINE: 'ALGO_INVALID_PIPELINE',
    ALGO_EXECUTION_ERROR: 'ALGO_EXECUTION_ERROR',

    // Admin & Management Domain
    ADMIN_ACCESS_DENIED: 'ADMIN_ACCESS_DENIED',
    RESOURCE_LOCKED: 'RESOURCE_LOCKED',

    // Plugin & Sandbox Domain
    PLUGIN_NOT_FOUND: 'PLUGIN_NOT_FOUND',
    PLUGIN_RUNTIME_ERROR: 'PLUGIN_RUNTIME_ERROR',
    PLUGIN_TIMEOUT: 'PLUGIN_TIMEOUT'
};

/**
 * AppError: Base application error.
 */
class AppError extends Error {
    constructor(message, statusCode = 500, code = ErrorCodes.INTERNAL_SERVER_ERROR, data = null) {
        super(message);
        this.status = statusCode; // For legacy compatibility
        this.statusCode = statusCode;
        this.code = code;
        this.data = data;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }

    static internal(message = 'An internal Arteo platform error occurred.') {
        return new AppError(message, 500, ErrorCodes.INTERNAL_SERVER_ERROR);
    }

    static badRequest(message, data = null) {
        return new AppError(message, 400, ErrorCodes.BAD_REQUEST, data);
    }

    static forbidden(message = 'Access denied to requested Arteo resource.') {
        return new AppError(message, 403, ErrorCodes.FORBIDDEN);
    }
}

class ValidationError extends AppError {
    constructor(message, data) {
        super(message, 400, ErrorCodes.VALIDATION_FAILED, data);
        this.name = 'ValidationError';
    }
}

class BadRequestError extends AppError {
    constructor(message, data) {
        super(message, 400, ErrorCodes.BAD_REQUEST, data);
        this.name = 'BadRequestError';
    }
}

class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed', data) {
        super(message, 401, ErrorCodes.UNAUTHORIZED, data);
        this.name = 'AuthenticationError';
    }
}

class AuthorizationError extends AppError {
    constructor(message = 'Access denied', data) {
        super(message, 403, ErrorCodes.FORBIDDEN, data);
        this.name = 'AuthorizationError';
    }
}

class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404, ErrorCodes.NOT_FOUND);
        this.name = 'NotFoundError';
    }
}

class ConflictError extends AppError {
    constructor(message = 'Resource already exists') {
        super(message, 409, ErrorCodes.CONFLICT);
        this.name = 'ConflictError';
    }
}

class ConfigurationError extends AppError {
    constructor(message) {
        super(message, 500, 'CONFIGURATION_ERROR');
        this.name = 'ConfigurationError';
    }
}

module.exports = {
    ErrorCodes,
    AppError,
    ValidationError,
    BadRequestError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    ConfigurationError
};
