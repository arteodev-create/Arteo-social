const Logger = require('../infra/logging/Logger.Service');

/**
 * Metrics Middleware
 * Orchestrates high-fidelity performance telemetry and latency monitoring.
 * Standardized for Phase 22 (Platinum Telemetry).
 */
class MetricsMiddleware {
    /**
     * Latency Tracker: Measures precisely how long a request takes to process.
     */
    trackLatency = (req, res, next) => {
        const start = process.hrtime();

        // Hook into the finish event of the response
        res.on('finish', () => {
            const diff = process.hrtime(start);
            const durationMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
            
            const logLevel = res.statusCode >= 500 ? 'error' : (res.statusCode >= 400 ? 'warn' : 'info');
            
            Logger[logLevel](`[Metrics] HTTP ${res.statusCode} ${req.method} ${req.originalUrl} - ${durationMs}ms`, {
                method: req.method,
                url: req.originalUrl,
                status: res.statusCode,
                latency: parseFloat(durationMs),
                ip: req.ip
            });
        });

        next();
    }
}

module.exports = new MetricsMiddleware();
