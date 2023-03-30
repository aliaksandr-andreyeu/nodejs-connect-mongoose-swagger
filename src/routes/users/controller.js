import { httpStatusMessage, jsonHeader, eTagHeader, encoding } from '@constants';
import usersService from './service';

export const getUsers = async (req, res, next) => {
  try {
    const { response } = await usersService.get(req);

    res.writeHead(200, httpStatusMessage[200], jsonHeader);
    res.end(JSON.stringify(response), encoding);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const response = await usersService.create(req);

    res.writeHead(201, httpStatusMessage[201], jsonHeader);
    res.end(JSON.stringify(response), encoding);
  } catch (error) {
    next(error);
  }
};

export const modifyUser = async (req, res, next) => {
  try {
    const response = await usersService.modify(req);

    res.writeHead(200, httpStatusMessage[200], jsonHeader);
    res.end(JSON.stringify(response), encoding);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { response } = await usersService.update(req);

    const data = JSON.stringify(response);

    res.writeHead(200, httpStatusMessage[200], { ...jsonHeader, ...eTagHeader(data) });
    res.end(data, encoding);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { response } = await usersService.remove(req);

    res.writeHead(200, httpStatusMessage[200], jsonHeader);
    res.end(JSON.stringify(response), encoding);
  } catch (error) {
    next(error);
  }
};
