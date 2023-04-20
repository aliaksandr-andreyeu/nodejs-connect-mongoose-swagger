import joi from 'joi';
import bcrypt from 'bcrypt';
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

const signIn = async (req) => {
  const body = req.body;

  const signInSchema = joi.object({
    username: joi.string().required(),
    password: joi.string().required()
  });

  /* TO DO: Customize error messages */

  try {
    const validatedBody = await signInSchema.validateAsync(body);

    const user = await userModel.findOne({ username: validatedBody.username });

    if (!user) {
      throw userError(apiErrors.user.notFound, 404);
    }

    const validPassword = await bcrypt.compare(validatedBody.password, user.password);

    if (!validPassword) {
      throw userError(apiErrors.user.passwordIncorrect, 400);
    }

    const { accessToken, refreshToken } = generateTokens(user);

    const data = {
      overview: user,
      accessToken
    };

    return getResponse(data, { refreshToken });
  } catch (err) {
    throw userError(err.message, err.code);
  }
};

const signUp = async (req) => {
  const body = req.body;

  const signUpSchema = joi.object({
    username: joi.string().required(),
    password: joi.string().required()
  });

  /* TO DO: Customize error messages */

  try {
    const validatedBody = await signUpSchema.validateAsync(body);

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

    const { accessToken, refreshToken } = generateTokens(newUser);

    const data = {
      overview: newUser,
      accessToken
    };

    return getResponse(data, { refreshToken });
  } catch (err) {
    throw userError(err.message, err.code);
  }
};

const resetPassword = async (req) => {
  const body = req.body;

  const resetPasswordSchema = joi.object({
    username: joi.string().required()
  });

  /* TO DO: Customize error messages */

  try {
    const validatedBody = await resetPasswordSchema.validateAsync(body);

    const user = await userModel.findOne({ username: validatedBody.username });

    if (!user) {
      throw userError(apiErrors.user.notFound, 404);
    }

    return getResponse();
  } catch (err) {
    throw userError(err.message, err.code);
  }
};

const refreshToken = async (req) => {
  const jwtRefreshToken = getRefreshToken(req);

  const jwtData = validateRefreshToken(jwtRefreshToken);

  if (!(jwtData && jwtData.id && isValidObjectId(jwtData.id) && jwtData.email)) {
    throw userError(apiErrors.common.unauthorized, 401);
  }

  const user = await userModel.findById(jwtData.id).exec();

  if (!(user && user.username && user.username === jwtData.email)) {
    throw userError(apiErrors.common.unauthorized, 401);
  }

  const { accessToken, refreshToken } = generateTokens(user);

  const data = {
    overview: user,
    accessToken
  };

  return getResponse(data, { refreshToken });
};

const signOut = async (req) => {
  const jwtRefreshToken = getRefreshToken(req);

  const jwtData = validateRefreshToken(jwtRefreshToken);

  if (!(jwtData && jwtData.id && isValidObjectId(jwtData.id) && jwtData.email)) {
    throw userError(apiErrors.common.unauthorized, 401);
  }

  const user = await userModel.findById(jwtData.id).exec();

  if (!(user && user.username && user.username === jwtData.email)) {
    throw userError(apiErrors.common.unauthorized, 401);
  }

  const { refreshToken } = generateTokens(user);

  return getResponse(null, { refreshToken });
};

const authService = {
  signIn,
  signUp,
  refreshToken,
  signOut,
  resetPassword
};
export default authService;
