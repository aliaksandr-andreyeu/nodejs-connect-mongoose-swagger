import { httpStatusMessage, jsonHeader, encoding } from '@constants';
import accountService from './service';
import type { AppNextFunction, AppRequest, AppResponse } from '@types';

export const contactUs = async (req: AppRequest, res: AppResponse, next: AppNextFunction) => {
  try {
    const { response } = await accountService.contactUs(req);

    res.writeHead(200, httpStatusMessage[200], jsonHeader);
    res.end(JSON.stringify(response), encoding);
  } catch (error) {
    next(error);
  }
};

export const getAccount = async (req: AppRequest, res: AppResponse, next: AppNextFunction) => {
  try {
    const { response } = await accountService.getAccount(req);

    res.writeHead(200, httpStatusMessage[200], jsonHeader);
    res.end(JSON.stringify(response), encoding);
  } catch (error) {
    next(error);
  }
};

export const editAccount = async (req: AppRequest, res: AppResponse, next: AppNextFunction) => {
  try {
    const { response } = await accountService.editAccount(req);

    res.writeHead(200, httpStatusMessage[200], jsonHeader);
    res.end(JSON.stringify(response), encoding);
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: AppRequest, res: AppResponse, next: AppNextFunction) => {
  try {
    const { response } = await accountService.changePassword(req);

    res.writeHead(200, httpStatusMessage[200], jsonHeader);
    res.end(JSON.stringify(response), encoding);
  } catch (error) {
    next(error);
  }
};
