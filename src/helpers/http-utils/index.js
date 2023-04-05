import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import { apiErrors, config } from '@constants';

const { accessTokenKey, accessTokenExpiresIn, refreshTokenKey, refreshTokenExpiresIn } = config;

export const getAccessToken = (req) => {
  if (!req) {
    throw userError(apiErrors.common.unauthorized, 401);
  }

  const headers = req.headers;

  if (!(headers && headers['authorization'])) {
    throw userError(apiErrors.common.unauthorized, 401);
  }

  return headers['authorization'].replace('Bearer ', '');
};

export const getRefreshToken = (req) => {
  if (!req) {
    throw userError(apiErrors.common.unauthorized, 401);
  }

  const cookies = req.cookies;

  if (!(cookies && cookies['X-Refresh-Token'])) {
    throw userError(apiErrors.common.unauthorized, 401);
  }

  return cookies['X-Refresh-Token'];
};

const getRefreshTokenCookieHeader = (token = '', expired = false) => {
  const maxAge = expired ? 0 : refreshTokenExpiresIn * 60;
  const expiresIn = new Date(new Date().getTime() + (expired ? 0 : refreshTokenExpiresIn * 60 * 1000)).toUTCString();

  const options = [`X-Refresh-Token=${token}`, 'Path=/', 'HttpOnly', `Max-Age=${maxAge}`, `Expires=${expiresIn}`];

  return options.join('; ');
};

export const getCookieHeader = (refreshToken, expired = false) => {
  const options = [];
  refreshToken && options.push(getRefreshTokenCookieHeader(refreshToken, expired));
  return options.length > 0
    ? {
        'Set-Cookie': options
      }
    : {};
};

export const validateRefreshToken = (token = '') => {
  try {
    const data = jwt.verify(token, refreshTokenKey);
    return data;
  } catch (err) {
    return false;
  }
};

export const validateAccessToken = (token = '') => {
  try {
    const data = jwt.verify(token, accessTokenKey);
    return data;
  } catch (err) {
    return false;
  }
};

export const generateTokens = (entity) => {
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

  console.log('*************************** accessToken: ', accessToken);
  console.log('*************************** refreshToken: ', refreshToken);

  return {
    accessToken,
    refreshToken
  };
};

export const getResponse = (data, extra = {}, isOk = true, message = null) => {
  return {
    response: {
      ...(data && { data }),
      isOk,
      message
    },
    ...(extra && extra)
  };
};

export const getRequestParamsId = (req) => {
  return req && req.params && req.params.id ? req.params.id.toString().toLowerCase() : false;
};

export const userError = (msg, code) => {
  const error = new Error(msg);
  error.code = code || 400;
  return error;
};

/* eslint-disable no-useless-escape, no-control-regex */
export const validateEmail = (value) => {
  const regex =
    /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i;
  return regex.test(value);
};

// export const validateEmail = (value) => {
// const regex = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i;
// const error = !value ? emailRequired : ! ? emailInvalid : '';
// cb(error);
// };

export const validatePassword = false;

// Numbers
// Uppercase letters
// Lowercase letters
// Special characters
// Password Length : 8 - 256
