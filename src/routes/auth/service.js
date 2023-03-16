import joi from 'joi';
import bcrypt from 'bcrypt';
import { userError, generateTokens, getResponse } from '@helpers';
import { apiErrors } from '@constants';
import { userModel } from '@models';

const signIn = async (req) => {
  const body = req.body;

  const signInSchema = joi.object({
    username: joi.string().required(),
    password: joi.string().required()
  });

  try {
    const validatedBody = await signInSchema.validateAsync(body);

    console.log('signInSchema validatedBody', validatedBody);

    const user = await userModel.findOne({ username: validatedBody.username });

    console.log('signIn user: ', user);

    console.log('username: ', validatedBody.username, user.username);
    console.log('password: ', validatedBody.password, user.password);

    if (!user) {
      throw new userError(apiErrors.user.notFound, 400);
    }

    const validPassword = await bcrypt.compare(validatedBody.password, user.password);

    console.log('signInSchema validPassword', validatedBody.password, user.password, validPassword);

    if (!validPassword) {
      throw new userError(apiErrors.user.passwordIncorrect, 400);
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
    console.log('signUpSchema err.name', err.name);
    console.log('signUpSchema err.message', err.message);
    console.log('signUpSchema err.isJoi', err.isJoi);
    console.log('signUpSchema err.details ', err.details);
    // throw new Error(err.message);
    throw new userError(err.message, 400);
  }
};

const signUp = async (req) => {
  const body = req.body;

  console.log('signUp body', body);

  const signUpSchema = joi.object({
    username: joi.string().required(),
    password: joi.string().required()
  });

  try {
    const validatedBody = await signUpSchema.validateAsync(body);

    console.log('signUpSchema validatedBody', validatedBody);

    const userExist = await userModel.findOne({ username: validatedBody.username });

    console.log('userExist: ', userExist);

    if (userExist) {
      throw new userError(apiErrors.user.exists(validatedBody.username), 400);
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
    throw new userError(err.message, 400);
  }
};

const authService = {
  signIn,
  signUp
};
export default authService;
