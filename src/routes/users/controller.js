import { errorHandler } from '@helpers';
import { httpStatusMessage, jsonHeader, eTagHeader, encoding } from '@constants';

import usersService from './service';

export const getUsers = async (req, res, next) => {
  try {
    const response = await usersService.get(req);

    res.writeHead(200, httpStatusMessage[200], jsonHeader);
    res.end(JSON.stringify(response), encoding);
  } catch (err) {
    errorHandler(err, req, res, next);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const response = await usersService.create(req);

    res.writeHead(201, httpStatusMessage[201], jsonHeader);
    res.end(JSON.stringify(response), encoding);
  } catch (err) {
    errorHandler(err, req, res, next);
  }
};

export const modifyUser = async (req, res, next) => {
  try {
    const response = await usersService.modify(req);

    res.writeHead(200, httpStatusMessage[200], jsonHeader);
    res.end(JSON.stringify(response), encoding);
  } catch (err) {
    errorHandler(err, req, res, next);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const response = await usersService.update(req);

    const resStr = JSON.stringify(response);

    res.writeHead(200, httpStatusMessage[200], { ...jsonHeader, ...eTagHeader(resStr) });
    res.end(resStr, encoding);
  } catch (err) {
    errorHandler(err, req, res, next);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const response = await usersService.remove(req);

    res.writeHead(200, httpStatusMessage[200], jsonHeader);
    res.end(JSON.stringify(response), encoding);
  } catch (err) {
    errorHandler(err, req, res, next);
  }
};
