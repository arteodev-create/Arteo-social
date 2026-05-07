const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');

const { config } = require('../config');
const passport = require('../infra/security/Passport.Provider');
const HealthService = require('../infra/health/Health.Service');
const Logger = require('../infra/logging/Logger.Service');

const ErrorHandler = require('../middleware/ErrorHandler');
const RequestTransformer = require('../middleware/RequestTransformer');
const ResponseHandler = require('../middleware/ResponseHandler');
const TraceMiddleware = require('../middleware/Trace');
const MetricsMiddleware = require('../middleware/Metrics');

const routes = require('./routes');
const sitemapRoutes = require('../modules/system/sitemap/Sitemap.Routes');
const federationRoutes = require('../modules/federation/Federation.Routes');

const LOCAL_ORIGINS = new Set(['localhost', '127.0.0.1', '[::1]']);

const resolveOriginHost = (origin) => origin.replace(/^https?:\/\//, '').split(':')[0];

const isAllowedOrigin = (origin) => {
    if (!origin) return true;

    const host = resolveOriginHost(origin);
    if (LOCAL_ORIGINS.has(host)) return true;

    if (config.infra.env === 'development') return true;

    return Boolean(config.infra.domain && origin.includes(config.infra.domain));
};

const createCorsOptions = () => ({
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) return callback(null, true);
        Logger.warn('Blocked unauthorized CORS origin', { origin });
        return callback(new Error(`CORS origin not allowed: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'x-correlation-id', 'x-turnstile-token']
});

const registerObservabilityRoutes = (app) => {
    app.get('/', (req, res) => {
        res.status(200).json({ service: 'arteo-backend', status: 'alive' });
    });

    app.get('/api/live', (req, res) => {
        res.success({ probe: 'live', status: 'alive', uptime: process.uptime(), observedAt: new Date().toISOString() });
    });

    app.get('/api/health', async (req, res) => {
        const queue = await HealthService.getQueueMetrics();
        res.success({
            probe: 'health',
            status: 'ok',
            node: config.infra.nodeName,
            uptime: process.uptime(),
            observedAt: new Date().toISOString(),
            runtime: { service: 'arteo-backend', version: config.infra.appVersion, env: config.infra.env },
            metrics: { readiness: HealthService.getMetrics(), queue }
        });
    });

    app.get('/api/ready', async (req, res) => {
        const checks = await HealthService.getReadinessChecks();
        const metrics = HealthService.getMetrics();

        if (checks.db && checks.redis) {
            return res.success({ probe: 'ready', status: 'ready', checks, metrics });
        }

        Logger.warn('Readiness check failed', { checks, metrics });
        return res.internalServerError({
            code: 'DEPENDENCY_NOT_READY',
            message: 'Internal services are currently unavailable.',
            details: { probe: 'ready', status: 'not_ready', checks }
        });
    });
};

const createApp = () => {
    const app = express();
    app.set('trust proxy', 1);

    app.use(cors(createCorsOptions()));
    app.use(TraceMiddleware.traceRequest);
    app.use(MetricsMiddleware.trackLatency);
    app.use(morgan(config.infra.env === 'production' ? 'combined' : 'dev'));
    app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false, crossOriginEmbedderPolicy: false }));
    app.use(compression({
        threshold: 1024,
        level: 6
    }));

    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    app.use(RequestTransformer.transformRequest);
    app.use(ResponseHandler.responseHelpers);
    app.use(passport.initialize());

    const uploadsPath = path.join(process.cwd(), 'uploads');
    app.use('/uploads', express.static(uploadsPath));
    app.use('/s3', express.static(uploadsPath));

    registerObservabilityRoutes(app);

    app.use('/', federationRoutes);
    app.use('/', sitemapRoutes);
    app.use('/api', routes);

    app.use(ErrorHandler.notFoundHandler);
    app.use(ErrorHandler.errorHandler);

    return app;
};

module.exports = createApp();
