const baseEnv = { ...process.env };

const seedRequiredEnv = (overrides = {}) => {
  process.env = {
    ...baseEnv,
    NODE_ENV: 'test',
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    JWT_ACCESS_SECRET: 'test-access-secret-1234567890-abcdef',
    JWT_REFRESH_SECRET: 'test-refresh-secret-1234567890-abcdef',
    SMTP_HOST: 'localhost',
    SMTP_PORT: '1025',
    SMTP_USER: 'test',
    SMTP_PASS: 'test',
    EMAIL_FROM: 'test@example.com',
    ...overrides
  };
};

describe('SupabaseAuth.Provider test isolation', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = { ...baseEnv };
  });

  it('does not create a Supabase client or call supabase.com in NODE_ENV=test', async () => {
    seedRequiredEnv({
      SUPABASE_URL: 'https://project.supabase.co',
      SUPABASE_ANON_KEY: 'anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-key'
    });

    const createClient = jest.fn(() => ({
      auth: {
        signInWithPassword: jest.fn(),
        admin: {
          createUser: jest.fn(),
          deleteUser: jest.fn(),
          updateUserById: jest.fn()
        }
      }
    }));

    jest.doMock('@supabase/supabase-js', () => ({ createClient }));

    const SupabaseAuth = require('../../src/infra/security/SupabaseAuth.Provider');

    expect(SupabaseAuth.isEnabled()).toBe(false);
    expect(createClient).not.toHaveBeenCalled();
    await expect(SupabaseAuth.createUser({
      email: 'test@example.com',
      password: 'Password123!',
      username: 'tester'
    })).resolves.toBeNull();
    await expect(SupabaseAuth.authenticate('test@example.com', 'Password123!')).resolves.toBeNull();
  });
});
