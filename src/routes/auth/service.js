import joi from 'joi';
import bcrypt from 'bcrypt';
import { userError, generateTokens, getResponse, validateRefreshToken, isValidObjectId } from '@helpers';
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

    console.log('signInSchema validatedBody', validatedBody);

    const user = await userModel.findOne({ username: validatedBody.username });

    console.log('signIn user: ', user);

    if (!user) {
      throw userError(apiErrors.user.notFound, 400);
    }

    console.log('username: ', validatedBody.username, user.username);
    console.log('password: ', validatedBody.password, user.password);

    const validPassword = await bcrypt.compare(validatedBody.password, user.password);

    console.log('signInSchema validPassword', validatedBody.password, user.password, validPassword);

    if (!validPassword) {
      throw userError(apiErrors.user.passwordIncorrect, 400);
    }

    // const entity = {
    // username: validatedBody.username,
    // password: validatedBody.password,
    // };

    const { accessToken, refreshToken } = generateTokens(user);

    const data = {
      overview: user.getPublicFields(),
      accessToken
    };

    return getResponse(data, { refreshToken });
  } catch (err) {
    console.log('signInSchema err.name', err.name);
    console.log('signInSchema err.message', err.message);
    console.log('signInSchema err.isJoi', err.isJoi);
    console.log('signInSchema err.details ', err.details);
    // throw new Error(err.message);
    throw userError(err.message, 400);
  }
};

const signUp = async (req) => {
  const body = req.body;

  console.log('signUp body', body);

  const signUpSchema = joi.object({
    username: joi.string().required(),
    password: joi.string().required()
  });

  /* TO DO: Customize error messages */

  try {
    const validatedBody = await signUpSchema.validateAsync(body);

    console.log('signUpSchema validatedBody', validatedBody);

    const userExist = await userModel.findOne({ username: validatedBody.username });

    console.log('userExist: ', userExist);

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
      overview: newUser.getPublicFields(),
      accessToken
    };

    return getResponse(data, { refreshToken });
  } catch (err) {
    console.log('signUpSchema err.name', err.name);
    console.log('signUpSchema err.message', err.message);
    console.log('signUpSchema err.isJoi', err.isJoi);
    console.log('signUpSchema err.details ', err.details);
    // throw new Error(err.message);
    throw userError(err.message, 400);
  }
};

const refreshToken = async (req) => {
  const cookies = req.cookies;

  if (!(cookies && cookies['X-Refresh-Token'])) {
    throw userError(apiErrors.common.unauthorized, 401);
  }

  const jwtRefreshToken = cookies['X-Refresh-Token'];

  console.log(' ************************** jwtRefreshToken: ', jwtRefreshToken);

  const jwtData = validateRefreshToken(jwtRefreshToken);

  if (!(jwtData && jwtData.id && isValidObjectId(jwtData.id) && jwtData.email)) {
    throw userError(apiErrors.common.unauthorized, 401);
  }

  console.log(' ************************** jwtData: ', jwtData);

  const user = await userModel.findById(jwtData.id).exec();

  if (!(user && user.username && user.username === jwtData.email)) {
    throw userError(apiErrors.common.unauthorized, 401);
  }

  console.log('user: ', user, Boolean(user && user.username && user.username === jwtData.email));

  const { accessToken, refreshToken } = generateTokens(user);

  const data = {
    overview: user.getPublicFields(),
    accessToken
  };

  return getResponse(data, { refreshToken });
};

const signOut = async (req) => {
  const cookies = req.cookies;

  if (!(cookies && cookies['X-Refresh-Token'])) {
    throw userError(apiErrors.common.unauthorized, 401);
  }

  const jwtRefreshToken = cookies['X-Refresh-Token'];

  console.log(' ************************** jwtRefreshToken: ', jwtRefreshToken);

  const jwtData = validateRefreshToken(jwtRefreshToken);

  if (!(jwtData && jwtData.id && isValidObjectId(jwtData.id) && jwtData.email)) {
    throw userError(apiErrors.common.unauthorized, 401);
  }

  console.log(' ************************** jwtData: ', jwtData);

  const user = await userModel.findById(jwtData.id).exec();

  if (!(user && user.username && user.username === jwtData.email)) {
    throw userError(apiErrors.common.unauthorized, 401);
  }

  console.log('user: ', user, Boolean(user && user.username && user.username === jwtData.email));

  const { refreshToken } = generateTokens(user);

  return getResponse(null, { refreshToken });
};

const authService = {
  signIn,
  signUp,
  refreshToken,
  signOut
};
export default authService;
