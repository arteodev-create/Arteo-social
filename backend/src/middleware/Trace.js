const { AsyncLocalStorage } = require('async_hooks');
const { nanoid } = require('nanoid');

/**
 * Trace Middleware
 * Orchestrates request correlation and observability tracking.
 * Standardized for Phase 21 (High-Fidelity Resilience).
 */

const asyncLocalStorage = new AsyncLocalStorage();

class TraceMiddleware {
    /**
     * Entry point: Generates a unique correlationId for the request lifecycle.
     */
    traceRequest = (req, res, next) => {
        const correlationId = req.headers['x-correlation-id'] || nanoid(10);
        
        // Attach to request and response header for visibility
        req.correlationId = correlationId;
        res.setHeader('x-correlation-id', correlationId);

        // Run the request in the context of the async storage
        asyncLocalStorage.run({ correlationId }, () => {
            next();
        });
    }

    /**
     * Retrieves the current correlationId from the async context.
     */
    getCorrelationId() {
        const store = asyncLocalStorage.getStore();
        return store ? store.correlationId : null;
    }

    /**
     * Wraps an asynchronous execution in a new or existing trace context.
     * Essential for high-fidelity socket event observability.
     */
    runWithContext(correlationId, fn) {
        return asyncLocalStorage.run({ correlationId: correlationId || nanoid(10) }, fn);
    }
}

module.exports = new TraceMiddleware();
