import bcrypt from 'bcrypt';
import crypto from 'crypto';
import {
  userError,
  generateTokens,
  getResponse,
  validateRefreshToken,
  isValidObjectId,
  getRefreshToken
} from '@helpers';
import { apiErrors } from '@constants';
import { userModel } from '@models';
import { resetPasswordSchema, signInSchema, signUpSchema, validateRequestBody } from '@validation';
import type { AppRequest } from '@types';

const signIn = async (req: AppRequest) => {
  const validatedBody = await validateRequestBody(signInSchema, req.body);

  const user = await userModel.findOne({ username: validatedBody.username });

  if (!user) {
    throw userError(apiErrors.user.notFound, 404);
  }

  const validPassword = await bcrypt.compare(validatedBody.password, user.password);

  if (!validPassword) {
    throw userError(apiErrors.user.passwordIncorrect, 400);
  }

  const { accessToken, refreshToken, refreshJti } = generateTokens(user);
  user.refreshToken = refreshJti;
  await user.save();

  const data = {
    overview: user,
    accessToken
  };

  return getResponse(data, { refreshToken });
};

const signUp = async (req: AppRequest) => {
  const validatedBody = await validateRequestBody(signUpSchema, req.body);

  const userExist = await userModel.findOne({ username: validatedBody.username });

  if (userExist) {
    throw userError(apiErrors.user.exists(validatedBody.username), 400);
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(validatedBody.password, salt);

  const entity = {
    username: validatedBody.username,
    password: hash
  };

  const newUserModel = new userModel(entity);

  const newUser = await newUserModel.save();

  const { accessToken, refreshToken, refreshJti } = generateTokens(newUser);
  newUser.refreshToken = refreshJti;
  await newUser.save();

  const data = {
    overview: newUser,
    accessToken
  };

  return getResponse(data, { refreshToken });
};

const resetPassword = async (req: AppRequest) => {
  const validatedBody = await validateRequestBody(resetPasswordSchema, req.body);

  const user = await userModel.findOne({ username: validatedBody.username });

  if (!user) {
    throw userError(apiErrors.user.notFound, 404);
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = await bcrypt.hash(rawToken, 10);
  const expires = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes

  user.resetPasswordToken = tokenHash;
  user.resetPasswordExpires = expires;
  await user.save();

  // In a real system you'd email `rawToken`. We never return it in production.
  const includeToken = process.env.NODE_ENV === 'development';
  return getResponse(includeToken ? { resetToken: rawToken } : null);
};

const refreshToken = async (req: AppRequest) => {
  const jwtRefreshToken = getRefreshToken(req);

  const jwtData = validateRefreshToken(jwtRefreshToken);

  if (!(jwtData && jwtData.id && isValidObjectId(jwtData.id) && jwtData.email)) {
    throw userError(apiErrors.common.unauthorized, 401);
  }

  const user = await userModel.findById(jwtData.id).exec();

  if (!(user && user.username && user.username === jwtData.email)) {
    throw userError(apiErrors.common.unauthorized, 401);
  }
  if (user.refreshToken !== jwtData.jti) {
    throw userError(apiErrors.common.unauthorized, 401);
  }

  const { accessToken, refreshToken: newRefreshToken, refreshJti } = generateTokens(user);
  user.refreshToken = refreshJti;
  await user.save();

  const data = {
    overview: user,
    accessToken
  };

  return getResponse(data, { refreshToken: newRefreshToken });
};

const signOut = async (req: AppRequest) => {
  if (!req.auth?.userId) {
    throw userError(apiErrors.common.unauthorized, 401);
  }

  const user = await userModel.findById(req.auth.userId).exec();
  if (!user) {
    throw userError(apiErrors.common.unauthorized, 401);
  }

  user.refreshToken = '';
  await user.save();

  // Controller will clear cookie (expired=true).
  return getResponse();
};

const authService = {
  signIn,
  signUp,
  refreshToken,
  signOut,
  resetPassword
};

export default authService;
