import { errorHandler, getRefreshTokenCookieHeader } from '@helpers';
import { httpStatusMessage, jsonHeader, encoding } from '@constants';
import authService from './service';

export const signIn = async (req, res, next) => {
  try {
    const { response, refreshToken } = await authService.signIn(req);

    const setCookieHeader = getRefreshTokenCookieHeader(refreshToken);

    res.writeHead(200, httpStatusMessage[200], { ...jsonHeader, ...setCookieHeader });
    res.end(JSON.stringify(response), encoding);
  } catch (err) {
    errorHandler(err, req, res, next);
  }
};

export const signUp = async (req, res, next) => {
  try {
    const { response, refreshToken } = await authService.signUp(req);

    const setCookieHeader = getRefreshTokenCookieHeader(refreshToken);

    res.writeHead(200, httpStatusMessage[200], { ...jsonHeader, ...setCookieHeader });
    res.end(JSON.stringify(response), encoding);
  } catch (err) {
    errorHandler(err, req, res, next);
  }
};

export const refreshToken = async (req, res, next) => {};

export const signOut = async (req, res, next) => {};
