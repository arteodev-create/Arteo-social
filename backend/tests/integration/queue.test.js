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

const Queue = require('../../src/infra/queue/Queue.Service');
const EmailWorker = require('../../src/infra/queue/EmailQueue.Worker');

describe('Queue service', () => {
  it('should enqueue and dequeue FIFO jobs', async () => {
    const queue = 'email';
    await Queue.enqueue({ type: 'verification', data: { to: 'a@b.com', otp: '123456', language: 'en' } }, { queue });
    await Queue.enqueue({ type: 'password_reset', data: { to: 'a@b.com', token: 'abc', language: 'en' } }, { queue });

    const size = await Queue.size(queue);
    expect(size).toBeGreaterThanOrEqual(2);

    const first = await Queue.dequeue(queue);
    const second = await Queue.dequeue(queue);

    expect(first.payload.type).toBe('verification');
    expect(second.payload.type).toBe('password_reset');
  });

  it('should move failed jobs to dead-letter after max attempts', async () => {
    const queue = 'email';
    const job = await Queue.enqueue({ type: 'unknown_type', data: {} }, { queue, maxAttempts: 1 });
    await EmailWorker.handleJob(job);

    const deadSize = await Queue.deadLetterSize(queue);
    expect(deadSize).toBeGreaterThanOrEqual(1);
  });
});