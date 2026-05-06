process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.PORT = process.env.PORT || '5000';
process.env.APP_VERSION = process.env.APP_VERSION || 'test';
process.env.DOMAIN = process.env.DOMAIN || 'localhost';
process.env.BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test';
process.env.AWS_S3_BUCKET = process.env.AWS_S3_BUCKET || 'test-bucket';
process.env.AWS_REGION = process.env.AWS_REGION || 'ap-southeast-1';
process.env.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || 'test-key';
process.env.AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || 'test-secret';

process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test-access-secret-1234567890-abcdef';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-1234567890-abcdef';
process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || '1h';
process.env.JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '7d';

const request = require('supertest');
const app = require('../../src/app/App');

describe('System health endpoints', () => {
  it('GET /api/live should return alive probe', async () => {
    const res = await request(app).get('/api/live');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.probe).toBe('live');
    expect(res.body.data.status).toBe('alive');
  });

  it('GET /api/health should return health payload', async () => {
    const res = await request(app).get('/api/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.probe).toBe('health');
    expect(res.body.data.runtime.service).toBe('arteo-backend');
    expect(res.body.data.metrics.queue).toBeDefined();
  });

  it('Unknown route should return standardized 404', async () => {
    const res = await request(app).get('/api/__unknown_route__');

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBeDefined();
  });
});