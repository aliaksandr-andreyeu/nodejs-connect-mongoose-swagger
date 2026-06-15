import { getCookieHeader } from '@helpers';
import { httpStatusMessage, jsonHeader, encoding } from '@constants';
import authService from './service';
import type { AppNextFunction, AppRequest, AppResponse } from '@types';

export const signIn = async (req: AppRequest, res: AppResponse, next: AppNextFunction) => {
  try {
    const { response, refreshToken } = await authService.signIn(req);

    const setCookieHeader = getCookieHeader(refreshToken);

    res.writeHead(200, httpStatusMessage[200], { ...jsonHeader, ...setCookieHeader });
    res.end(JSON.stringify(response), encoding);
  } catch (error) {
    next(error);
  }
};

export const signUp = async (req: AppRequest, res: AppResponse, next: AppNextFunction) => {
  try {
    const { response, refreshToken } = await authService.signUp(req);

    const setCookieHeader = getCookieHeader(refreshToken);

    res.writeHead(200, httpStatusMessage[200], { ...jsonHeader, ...setCookieHeader });
    res.end(JSON.stringify(response), encoding);
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: AppRequest, res: AppResponse, next: AppNextFunction) => {
  try {
    const { response, refreshToken } = await authService.refreshToken(req);

    const setCookieHeader = getCookieHeader(refreshToken);

    res.writeHead(200, httpStatusMessage[200], { ...jsonHeader, ...setCookieHeader });
    res.end(JSON.stringify(response), encoding);
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: AppRequest, res: AppResponse, next: AppNextFunction) => {
  try {
    const { response } = await authService.resetPassword(req);

    res.writeHead(200, httpStatusMessage[200], jsonHeader);
    res.end(JSON.stringify(response), encoding);
  } catch (error) {
    next(error);
  }
};

export const resetPasswordConfirm = async (req: AppRequest, res: AppResponse, next: AppNextFunction) => {
  try {
    const { response } = await authService.resetPasswordConfirm(req);

    res.writeHead(200, httpStatusMessage[200], jsonHeader);
    res.end(JSON.stringify(response), encoding);
  } catch (error) {
    next(error);
  }
};

export const signOut = async (req: AppRequest, res: AppResponse, next: AppNextFunction) => {
  try {
    const { response } = await authService.signOut(req);

    const setCookieHeader = getCookieHeader('', true);

    res.writeHead(200, httpStatusMessage[200], { ...jsonHeader, ...setCookieHeader });
    res.end(JSON.stringify(response), encoding);
  } catch (error) {
    next(error);
  }
};
