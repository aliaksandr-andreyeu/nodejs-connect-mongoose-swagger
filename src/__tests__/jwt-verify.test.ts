import type { AppRequest } from '@types';

jest.mock('@models', () => ({
  userModel: {
    findById: jest.fn()
  }
}));

jest.mock('@helpers', () => ({
  userError: (msg: string, code?: number) => {
    const err = new Error(msg) as Error & { code?: number };
    err.code = code;
    return err;
  },
  validateRefreshToken: jest.fn(),
  validateAccessToken: jest.fn(),
  isValidObjectId: jest.fn(),
  getAccessToken: jest.fn(),
  getRefreshToken: jest.fn()
}));

import jwtVerify from '@app/router/jwt-verify';
import { userModel } from '@models';
import { getAccessToken, getRefreshToken, isValidObjectId, validateAccessToken, validateRefreshToken } from '@helpers';

describe('jwtVerify', () => {
  test('sets req.auth and calls handler when valid', async () => {
    (getAccessToken as jest.Mock).mockReturnValue('access');
    (getRefreshToken as jest.Mock).mockReturnValue('refresh');
    (validateRefreshToken as jest.Mock).mockReturnValue({
      id: '507f191e810c19729de860ea',
      email: 'test@example.com',
      jti: 'refresh-jti'
    });
    (validateAccessToken as jest.Mock).mockReturnValue({
      id: '507f191e810c19729de860ea',
      email: 'test@example.com',
      refreshId: 'refresh-jti'
    });
    (isValidObjectId as jest.Mock).mockReturnValue(true);
    (userModel.findById as jest.Mock).mockReturnValue({
      exec: async () => ({ username: 'test@example.com', refreshToken: 'refresh-jti' })
    });

    const handler = jest.fn(async () => undefined);
    const next = jest.fn();

    const req = { method: 'GET', headers: {}, cookies: {} } as unknown as AppRequest;
    const res = {} as any;

    await jwtVerify(handler, req, res, next);

    expect(req.auth).toEqual({
      userId: '507f191e810c19729de860ea',
      email: 'test@example.com',
      refreshJti: 'refresh-jti'
    });
    expect(handler).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });
});
