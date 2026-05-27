import bcrypt from 'bcrypt';

import { userError, getResponse } from '@helpers';
import { apiErrors } from '@constants';
import { userModel } from '@models';
import { changePasswordSchema, contactUsSchema, userAccountSchema, validateRequestBody } from '@validation';
import type { AppRequest } from '@types';

const contactUs = async (req: AppRequest) => {
  await validateRequestBody(contactUsSchema, req.body);

  if (!req.auth?.userId) {
    throw userError(apiErrors.common.unauthorized, 401);
  }

  return getResponse();
};

const getAccount = async (req: AppRequest) => {
  if (!req.auth?.userId || !req.auth.email) {
    throw userError(apiErrors.common.unauthorized, 401);
  }

  const user = await userModel.findById(req.auth.userId).exec();

  if (!(user && user.username && user.username === req.auth.email)) {
    throw userError(apiErrors.user.notFound, 404);
  }

  return getResponse(user);
};

const editAccount = async (req: AppRequest) => {
  const validatedBody = await validateRequestBody(userAccountSchema, req.body);

  if (!req.auth?.userId) {
    throw userError(apiErrors.common.unauthorized, 401);
  }

  const user = await userModel.findByIdAndUpdate(req.auth.userId, validatedBody, { new: true }).exec();

  if (!user) {
    throw userError(apiErrors.user.notFound, 404);
  }

  return getResponse(user);
};

const changePassword = async (req: AppRequest) => {
  const validatedBody = await validateRequestBody(changePasswordSchema, req.body);

  if (!req.auth?.userId || !req.auth.email) {
    throw userError(apiErrors.common.unauthorized, 401);
  }

  const user = await userModel.findById(req.auth.userId).exec();

  if (!(user && user.username && user.username === req.auth.email)) {
    throw userError(apiErrors.user.notFound, 404);
  }

  const validPassword = await bcrypt.compare(validatedBody.password, user.password);

  if (!validPassword) {
    throw userError(apiErrors.user.passwordIncorrect, 400);
  }

  if (!(validatedBody.newpassword === validatedBody.confirm)) {
    throw userError(apiErrors.user.confirmIncorrect, 400);
  }

  if (validatedBody.password === validatedBody.newpassword) {
    throw userError(apiErrors.user.sameOldNewPassword, 400);
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(validatedBody.newpassword, salt);

  const entity = {
    username: req.auth.email,
    password: hash
  };

  const userUpdate = await userModel.findByIdAndUpdate(req.auth.userId, entity, { new: true }).exec();

  if (!userUpdate) {
    throw userError(apiErrors.user.notUpdated, 400);
  }

  return getResponse();
};

const accountService = {
  contactUs,
  getAccount,
  editAccount,
  changePassword
};

export default accountService;
