import { getCookieHeader } from '@helpers';
import { httpStatusMessage, jsonHeader, encoding } from '@constants';
import authService from './service';

export const signIn = async (req, res, next) => {
  try {
    const { response, refreshToken } = await authService.signIn(req);

    const setCookieHeader = getCookieHeader(refreshToken);

    res.writeHead(200, httpStatusMessage[200], { ...jsonHeader, ...setCookieHeader });
    res.end(JSON.stringify(response), encoding);
  } catch (error) {
    next(error);
  }
};

export const signUp = async (req, res, next) => {
  try {
    const { response, refreshToken } = await authService.signUp(req);

    const setCookieHeader = getCookieHeader(refreshToken);

    res.writeHead(200, httpStatusMessage[200], { ...jsonHeader, ...setCookieHeader });
    res.end(JSON.stringify(response), encoding);
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { response, refreshToken } = await authService.refreshToken(req);

    const setCookieHeader = getCookieHeader(refreshToken);

    res.writeHead(200, httpStatusMessage[200], { ...jsonHeader, ...setCookieHeader });
    res.end(JSON.stringify(response), encoding);
  } catch (error) {
    next(error);
  }
};

export const signOut = async (req, res, next) => {};
