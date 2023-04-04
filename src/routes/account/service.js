import joi from 'joi';
import bcrypt from 'bcrypt';

import { userError, getResponse, validateAccessToken, getAccessToken, isValidObjectId } from '@helpers';
import { apiErrors } from '@constants';
import { userModel } from '@models';

const contactUs = async (req) => {
  const body = req.body;

  const contactUsSchema = joi.object({
    subject: joi.string().required(),
    message: joi.string().required()
  });

  try {
    const validatedBody = await contactUsSchema.validateAsync(body);

    /* TODO:  Mailer logic */
    console.log('contactUs validatedBody: ', validatedBody);

    const token = getAccessToken(req);
    const jwtAccessData = validateAccessToken(token);

    if (!(jwtAccessData && jwtAccessData.id && isValidObjectId(jwtAccessData.id) && jwtAccessData.email)) {
      throw userError(apiErrors.common.unauthorized, 401);
    }

    return getResponse();
  } catch (err) {
    throw userError(err.message, 400);
  }
};

const getAccount = async (req) => {
  const token = getAccessToken(req);
  const jwtAccessData = validateAccessToken(token);

  if (!(jwtAccessData && jwtAccessData.id && isValidObjectId(jwtAccessData.id) && jwtAccessData.email)) {
    throw userError(apiErrors.common.unauthorized, 401);
  }

  const user = await userModel.findById(jwtAccessData.id).exec();

  if (!(user && user.username && user.username === jwtAccessData.email)) {
    throw userError(apiErrors.user.notFound, 404);
  }

  return getResponse(user.getPublicFields());
};

const editAccount = async (req) => {
  const body = req.body;

  const editAccountSchema = joi.object({
    username: joi.string().required(),
    name: joi.string().allow(''),
    surname: joi.string().allow(''),
    age: joi.number(),
    job: joi.string().allow('')
  });

  try {
    const validatedBody = await editAccountSchema.validateAsync(body);

    const token = getAccessToken(req);
    const jwtAccessData = validateAccessToken(token);

    if (!(jwtAccessData && jwtAccessData.id && isValidObjectId(jwtAccessData.id) && jwtAccessData.email)) {
      throw userError(apiErrors.common.unauthorized, 401);
    }

    const user = await userModel.findByIdAndUpdate(jwtAccessData.id, validatedBody, { new: true }).exec();

    if (!user) {
      throw userError(apiErrors.user.notFound, 404);
    }

    return getResponse(user.getPublicFields());
  } catch (err) {
    throw userError(err.message, 400);
  }
};

const changePassword = async (req) => {
  const body = req.body;

  const changePasswordSchema = joi.object({
    password: joi.string().required(),
    newpassword: joi.string().required(),
    confirm: joi.string().required()
  });

  try {
    const validatedBody = await changePasswordSchema.validateAsync(body);

    const token = getAccessToken(req);
    const jwtAccessData = validateAccessToken(token);

    if (!(jwtAccessData && jwtAccessData.id && isValidObjectId(jwtAccessData.id) && jwtAccessData.email)) {
      throw userError(apiErrors.common.unauthorized, 401);
    }

    const user = await userModel.findById(jwtAccessData.id).exec();

    if (!(user && user.username && user.username === jwtAccessData.email)) {
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
      username: jwtAccessData.email,
      password: hash
    };

    const userUpdate = await userModel.findByIdAndUpdate(jwtAccessData.id, entity, { new: true }).exec();

    if (!userUpdate) {
      throw userError(apiErrors.user.notUpdated, 400);
    }

    return getResponse();
  } catch (err) {
    throw userError(err.message, 400);
  }
};

const accountService = {
  contactUs,
  getAccount,
  editAccount,
  changePassword
};
export default accountService;
