const sendSuccess = (res, data, meta = {}, statusCode = 200) => {
  const response = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: res.locals.requestId || generateRequestId(),
      ...meta
    }
  };

  return res.status(statusCode).json(response);
};

const sendError = (res, error, statusCode = 500) => {
  const errorResponse = {
    success: false,
    error: {
      code: error.code || getErrorCode(statusCode),
      message: error.message || 'Arteo internal server error.',
      ...(error.details && { details: error.details }),
      ...(error.field && { field: error.field })
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: res.locals.requestId || generateRequestId()
    }
  };

  if (process.env.NODE_ENV === 'development' && error.stack) {
    errorResponse.error.stack = error.stack;
  }

  return res.status(statusCode).json(errorResponse);
};

const generateRequestId = () => `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const requestIdMiddleware = (req, res, next) => {
  res.locals.requestId = generateRequestId();
  next();
};

const createPaginationMeta = (page, limit, total, baseUrl = '', query = {}) => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  const pagination = {
    page,
    limit,
    total,
    pages: totalPages,
    hasNext,
    hasPrev
  };

  if (baseUrl) {
    const cleanQuery = { ...query };
    delete cleanQuery.page;

    const queryString = new URLSearchParams(cleanQuery).toString();
    const baseQuery = queryString ? `${baseUrl}?${queryString}&` : `${baseUrl}?`;

    if (hasPrev) pagination.prev = `${baseQuery}page=${page - 1}&limit=${limit}`;
    if (hasNext) pagination.next = `${baseQuery}page=${page + 1}&limit=${limit}`;

    pagination.first = `${baseQuery}page=1&limit=${limit}`;
    pagination.last = `${baseQuery}page=${totalPages}&limit=${limit}`;
  }

  return { pagination };
};

const getErrorCode = (statusCode) => {
  const codeMap = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    413: 'PAYLOAD_TOO_LARGE',
    422: 'UNPROCESSABLE_ENTITY',
    429: 'TOO_MANY_REQUESTS',
    500: 'INTERNAL_SERVER_ERROR',
    502: 'BAD_GATEWAY',
    503: 'SERVICE_UNAVAILABLE'
  };

  return codeMap[statusCode] || 'INTERNAL_SERVER_ERROR';
};

const formatValidationErrors = (errors) => {
  if (Array.isArray(errors)) {
    return {
      code: 'VALIDATION_ERROR',
      message: 'Invalid input data',
      details: errors.reduce((acc, error) => {
        acc[error.field] = error.message;
        return acc;
      }, {})
    };
  }

  if (typeof errors === 'object') {
    return {
      code: 'VALIDATION_ERROR',
      message: 'Invalid input data',
      details: errors
    };
  }

  return {
    code: 'VALIDATION_ERROR',
    message: errors || 'Invalid input data'
  };
};

const responseHelpers = (req, res, next) => {
  res.success = (data, meta, statusCode) => sendSuccess(res, data, meta, statusCode);
  res.created = (data, meta) => sendSuccess(res, data, meta, 201);
  res.noContent = () => res.status(204).end();

  res.badRequest = (error) => sendError(res, error, 400);
  res.unauthorized = (error) => sendError(res, error, 401);
  res.forbidden = (error) => sendError(res, error, 403);
  res.notFound = (error) => sendError(res, error, 404);
  res.conflict = (error) => sendError(res, error, 409);
  res.unprocessableEntity = (error) => sendError(res, error, 422);
  res.tooManyRequests = (error) => sendError(res, error, 429);
  res.internalServerError = (error) => sendError(res, error, 500);

  next();
};

module.exports = {
  sendSuccess,
  sendError,
  requestIdMiddleware,
  responseHelpers,
  createPaginationMeta,
  formatValidationErrors,
  generateRequestId
};