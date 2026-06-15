import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { apiErrors, config } from '@constants';
import type {
  ApiResponseBody,
  AppAuth,
  AppError,
  AppRequest,
  JwtAccessPayload,
  JwtRefreshPayload,
  ServiceResult
} from '@types';
import type { UserDocument } from '@models/user';

const { accessTokenKey, accessTokenExpiresIn, refreshTokenKey, refreshTokenExpiresIn, bcryptRounds } = config;

export const getAccessToken = (req: AppRequest): string => {
  if (!req) {
    throw userError(apiErrors.common.unauthorized, 401);
  }

  const headers = req.headers;

  if (!(headers && headers.authorization)) {
    throw userError(apiErrors.common.unauthorized, 401);
  }

  const authorization = headers.authorization;
  return (Array.isArray(authorization) ? authorization[0] : authorization).replace('Bearer ', '');
};

export const getRefreshToken = (req: AppRequest): string => {
  if (!req) {
    throw userError(apiErrors.common.unauthorized, 401);
  }

  const cookies = req.cookies;

  if (!(cookies && cookies['X-Refresh-Token'])) {
    throw userError(apiErrors.common.unauthorized, 401);
  }

  return cookies['X-Refresh-Token'];
};

const getRefreshTokenCookieHeader = (token = '', expired = false): string => {
  const maxAge = expired ? 0 : refreshTokenExpiresIn * 60;
  const expiresIn = new Date(new Date().getTime() + (expired ? 0 : refreshTokenExpiresIn * 60 * 1000)).toUTCString();

  const options = [
    `X-Refresh-Token=${token}`,
    'Path=/',
    'SameSite=None',
    'Secure',
    'HttpOnly',
    `Max-Age=${maxAge}`,
    `Expires=${expiresIn}`
  ];

  return options.join('; ');
};

export const getCookieHeader = (refreshToken?: string, expired = false): Record<string, string | string[]> => {
  const options: string[] = [];
  if (expired) {
    options.push(getRefreshTokenCookieHeader(refreshToken || '', true));
  } else if (refreshToken) {
    options.push(getRefreshTokenCookieHeader(refreshToken, false));
  }
  return options.length > 0
    ? {
        'Set-Cookie': options
      }
    : {};
};

export const validateRefreshToken = (token = ''): JwtRefreshPayload | false => {
  try {
    const data = jwt.verify(token, refreshTokenKey) as JwtRefreshPayload;
    return data;
  } catch {
    return false;
  }
};

export const validateAccessToken = (token = ''): JwtAccessPayload | false => {
  try {
    const data = jwt.verify(token, accessTokenKey) as JwtAccessPayload;
    return data;
  } catch {
    return false;
  }
};

export const generateTokens = (entity?: UserDocument | null) => {
  const accessJti = uuidv4();
  const refreshJti = uuidv4();

  const accessTokenPayload = entity
    ? {
        id: entity._id,
        email: entity.username,
        refreshId: refreshJti,
        createdAt: entity.createdAt
      }
    : {};

  const accessTokenOptions = {
    expiresIn: accessTokenExpiresIn * 60,
    jwtid: accessJti
  };

  const refreshTokenPayload = entity
    ? {
        id: entity._id,
        email: entity.username
      }
    : {};

  const refreshTokenOptions = {
    expiresIn: refreshTokenExpiresIn * 60,
    jwtid: refreshJti
  };

  const accessToken = jwt.sign(accessTokenPayload, accessTokenKey, accessTokenOptions);
  const refreshToken = jwt.sign(refreshTokenPayload, refreshTokenKey, refreshTokenOptions);

  return {
    accessToken,
    refreshToken,
    refreshJti
  };
};

export const getResponse = <T>(
  data?: T | null,
  // ServiceResult-level extras that must NOT leak into the body (e.g. refreshToken).
  extra: Record<string, unknown> = {},
  isOk = true,
  message: string | null = null,
  // Extra fields merged into the response body (e.g. pagination).
  meta: Partial<ApiResponseBody> = {}
): ServiceResult<T> => {
  return {
    response: {
      ...(data != null && data !== undefined && { data }),
      ...meta,
      isOk,
      message
    },
    ...(extra && extra)
  } as ServiceResult<T>;
};

export const getRequestParamsId = (req: AppRequest): string | false => {
  return req?.params?.id ? req.params.id.toString().toLowerCase() : false;
};

export const userError = (msg: string, code?: number): AppError => {
  const error = new Error(msg) as AppError;
  error.code = code || 400;
  error.expose = true;
  return error;
};

// Returns the authenticated context guaranteed by jwtVerify, or throws 401.
// Centralizes the `req.auth` guard so services don't repeat it.
export const getAuth = (req: AppRequest): AppAuth => {
  if (!req.auth?.userId || !req.auth.email) {
    throw userError(apiErrors.common.unauthorized, 401);
  }
  return req.auth;
};

export const hashPassword = (plain: string): Promise<string> => {
  return bcrypt.hash(plain, bcryptRounds);
};
