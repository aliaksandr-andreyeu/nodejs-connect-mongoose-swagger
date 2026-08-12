import { assertConfig } from '@constants';
import type { AppConfig } from '@constants/config';

const baseConfig: AppConfig = {
  host: 'localhost',
  port: 3000,
  dbHost: 'localhost',
  dbPort: 27017,
  dbName: 'app',
  dbUser: 'app',
  dbPass: 'secret',
  accessTokenKey: 'a'.repeat(32),
  accessTokenExpiresIn: 5,
  refreshTokenKey: 'r'.repeat(32),
  refreshTokenExpiresIn: 60,
  responseTimeout: 0,
  bcryptRounds: 12,
  maxBodyBytes: 1024,
  trustProxy: false,
  resetTokenTtlMin: 15,
  corsOrigins: [],
  redis: { enabled: false, host: 'localhost', port: 6379, password: '', userCacheTtlSec: 60 },
  rateLimit: { enabled: false, points: 10, durationSec: 60 }
};

describe('assertConfig', () => {
  test('valid config yields no problems', () => {
    expect(assertConfig(baseConfig)).toEqual([]);
  });

  test('flags empty DB credentials', () => {
    const problems = assertConfig({ ...baseConfig, dbName: '', dbUser: '', dbPass: '' });
    expect(problems).toEqual(expect.arrayContaining(['DB_NAME is empty', 'DB_USER is empty', 'DB_PSW is empty']));
  });

  test('flags short and equal JWT secrets', () => {
    const problems = assertConfig({ ...baseConfig, accessTokenKey: 'short', refreshTokenKey: 'short' });
    expect(problems).toEqual(
      expect.arrayContaining([
        'ACCESS_TOKEN_KEY must be at least 16 characters',
        'REFRESH_TOKEN_KEY must be at least 16 characters',
        'ACCESS_TOKEN_KEY and REFRESH_TOKEN_KEY must differ'
      ])
    );
  });

  test('requires Redis password when Redis is enabled', () => {
    const problems = assertConfig({
      ...baseConfig,
      redis: { ...baseConfig.redis, enabled: true, password: '' }
    });
    expect(problems).toContain('REDIS_PASSWORD is required when Redis is enabled');
  });
});
