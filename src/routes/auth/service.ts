import bcrypt from 'bcrypt';
import crypto from 'crypto';
import {
  userError,
  generateTokens,
  getResponse,
  validateRefreshToken,
  isValidObjectId,
  isDuplicateKeyError,
  hashPassword,
  getAuth,
  getRefreshToken
} from '@helpers';
import { apiErrors, config } from '@constants';
import { invalidateUser } from '@db/cache';
import { userModel } from '@models';
import {
  resetPasswordSchema,
  resetPasswordConfirmSchema,
  signInSchema,
  signUpSchema,
  validateRequestBody
} from '@validation';
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
  await invalidateUser(String(user._id));

  const data = {
    overview: user,
    accessToken
  };

  return getResponse(data, { refreshToken });
};

const signUp = async (req: AppRequest) => {
  const validatedBody = await validateRequestBody(signUpSchema, req.body);

  const hash = await hashPassword(validatedBody.password);

  const entity = {
    username: validatedBody.username,
    password: hash
  };

  let newUser;
  try {
    newUser = await new userModel(entity).save();
  } catch (error) {
    // Unique index on `username` guards against the find-then-create race.
    if (isDuplicateKeyError(error)) {
      throw userError(apiErrors.user.exists(validatedBody.username), 400);
    }
    throw error;
  }

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
  const tokenHash = await bcrypt.hash(rawToken, config.bcryptRounds);
  const expires = new Date(Date.now() + config.resetTokenTtlMin * 60 * 1000);

  user.resetPasswordToken = tokenHash;
  user.resetPasswordExpires = expires;
  await user.save();

  // In a real system you'd email `rawToken`. We never return it in production.
  const includeToken = process.env.NODE_ENV === 'development';
  return getResponse(includeToken ? { resetToken: rawToken } : null);
};

const resetPasswordConfirm = async (req: AppRequest) => {
  const validatedBody = await validateRequestBody(resetPasswordConfirmSchema, req.body);

  const user = await userModel.findOne({ username: validatedBody.username });

  // Treat every failure mode (no user, no pending reset, expired, wrong token)
  // identically to avoid leaking which usernames have an active reset.
  if (!user || !user.resetPasswordToken || !user.resetPasswordExpires) {
    throw userError(apiErrors.user.resetTokenInvalid, 400);
  }

  if (user.resetPasswordExpires.getTime() < Date.now()) {
    throw userError(apiErrors.user.resetTokenInvalid, 400);
  }

  const tokenMatches = await bcrypt.compare(validatedBody.token, user.resetPasswordToken);
  if (!tokenMatches) {
    throw userError(apiErrors.user.resetTokenInvalid, 400);
  }

  user.password = await hashPassword(validatedBody.newpassword);
  user.resetPasswordToken = '';
  user.resetPasswordExpires = null;
  // Revoke any active session so a leaked refresh token can't outlive the reset.
  user.refreshToken = '';
  await user.save();
  await invalidateUser(String(user._id));

  return getResponse();
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
  await invalidateUser(String(user._id));

  const data = {
    overview: user,
    accessToken
  };

  return getResponse(data, { refreshToken: newRefreshToken });
};

const signOut = async (req: AppRequest) => {
  const { userId } = getAuth(req);

  const user = await userModel.findById(userId).exec();
  if (!user) {
    throw userError(apiErrors.common.unauthorized, 401);
  }

  user.refreshToken = '';
  await user.save();
  await invalidateUser(String(user._id));

  // Controller will clear cookie (expired=true).
  return getResponse();
};

const authService = {
  signIn,
  signUp,
  refreshToken,
  signOut,
  resetPassword,
  resetPasswordConfirm
};

export default authService;
