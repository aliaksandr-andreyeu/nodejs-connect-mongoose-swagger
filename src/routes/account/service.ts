import bcrypt from 'bcrypt';

import { userError, getResponse, getAuth, hashPassword, isDuplicateKeyError } from '@helpers';
import { apiErrors } from '@constants';
import { invalidateUser } from '@db/cache';
import { userModel } from '@models';
import { changePasswordSchema, contactUsSchema, userAccountSchema, validateRequestBody } from '@validation';
import type { AppRequest } from '@types';

const contactUs = async (req: AppRequest) => {
  await validateRequestBody(contactUsSchema, req.body);

  getAuth(req);

  return getResponse();
};

const getAccount = async (req: AppRequest) => {
  const { userId, email } = getAuth(req);

  const user = await userModel.findById(userId).exec();

  if (!(user && user.username && user.username === email)) {
    throw userError(apiErrors.user.notFound, 404);
  }

  return getResponse(user);
};

const editAccount = async (req: AppRequest) => {
  const validatedBody = await validateRequestBody(userAccountSchema, req.body);

  const { userId } = getAuth(req);

  let user;
  try {
    user = await userModel.findByIdAndUpdate(userId, validatedBody, { new: true, runValidators: true }).exec();
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw userError(apiErrors.user.exists(validatedBody.username), 400);
    }
    throw error;
  }

  if (!user) {
    throw userError(apiErrors.user.notFound, 404);
  }

  // Username may have changed — drop the cached projection.
  await invalidateUser(userId);

  return getResponse(user);
};

const changePassword = async (req: AppRequest) => {
  const validatedBody = await validateRequestBody(changePasswordSchema, req.body);

  const { userId, email } = getAuth(req);

  const user = await userModel.findById(userId).exec();

  if (!(user && user.username && user.username === email)) {
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

  const hash = await hashPassword(validatedBody.newpassword);

  const entity = {
    username: email,
    password: hash
  };

  const userUpdate = await userModel.findByIdAndUpdate(userId, entity, { new: true, runValidators: true }).exec();

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
