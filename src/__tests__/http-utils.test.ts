import { getCookieHeader } from '@helpers';

describe('http-utils', () => {
  test('getCookieHeader expired clears cookie', () => {
    const headers = getCookieHeader('', true);
    const setCookie = headers['Set-Cookie'];
    expect(setCookie).toBeDefined();
    expect(Array.isArray(setCookie)).toBe(true);
    expect((setCookie as string[])[0]).toContain('Max-Age=0');
  });
});
