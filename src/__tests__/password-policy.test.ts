import { passwordField } from '@validation/fields';

describe('password policy', () => {
  test('rejects too-short passwords', () => {
    const res = passwordField.safeParse('Aa1!');
    expect(res.success).toBe(false);
  });

  test('accepts a strong password', () => {
    const res = passwordField.safeParse('Abcdef1!');
    expect(res.success).toBe(true);
  });
});
