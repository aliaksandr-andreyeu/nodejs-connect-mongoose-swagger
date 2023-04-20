import joi from 'joi';
import { getRequestParamsId, isValidObjectId, userError, getResponse } from '@helpers';
import { apiErrors } from '@constants';
import { userModel } from '@models';

const get = async (req) => {
  const id = getRequestParamsId(req);

  if (!id) {
    const users = await userModel.find({}).exec();

    return getResponse(users);
  }

  if (!isValidObjectId(id)) {
    throw userError(apiErrors.user.notFound, 404);
  }

  const user = await userModel.findById(id).exec();
  if (!user) {
    throw userError(apiErrors.user.notFound, 404);
  }

  return getResponse(user.getPublicFields());
};

const create = async (req) => {
  const body = req.body;

  const createSchema = joi.object({
    username: joi.string().required(),
    name: joi.string().allow(''),
    surname: joi.string().allow(''),
    isActive: joi.boolean(),
    age: joi.number(),
    job: joi.string().allow('')
  });

  try {
    const validatedBody = await createSchema.validateAsync(body);

    const userExist = await userModel.findOne({ username: validatedBody.username });

    if (userExist) {
      throw userError(apiErrors.user.exists(validatedBody.username), 400);
    }

    const model = new userModel(validatedBody);

    const newUser = await model.save();

    return getResponse(newUser.getPublicFields());
  } catch (err) {
    throw userError(err.message, err.code);
  }
};

const modify = async (req) => {
  const id = getRequestParamsId(req);

  if (!id) {
    throw userError(apiErrors.user.notFound, 404);
  }

  if (!isValidObjectId(id)) {
    throw userError(apiErrors.user.notFound, 404);
  }

  const body = req.body;

  const modifySchema = joi.object({
    username: joi.string().required(),
    name: joi.string().allow(''),
    surname: joi.string().allow(''),
    isActive: joi.boolean(),
    age: joi.number(),
    job: joi.string().allow('')
  });

  try {
    const validatedBody = await modifySchema.validateAsync(body);

    const entity = {
      username: validatedBody.username,
      name: validatedBody.name || '',
      surname: validatedBody.surname || '',
      isActive: validatedBody.isActive || true,
      age: validatedBody.age || 0,
      job: validatedBody.job || ''
    };

    const user = await userModel.findByIdAndUpdate(id, entity, { new: true }).exec();

    if (!user) {
      throw userError(apiErrors.user.notFound, 404);
    }

    return getResponse(user.getPublicFields());
  } catch (err) {
    throw userError(err.message, err.code);
  }
};

const update = async (req) => {
  const id = getRequestParamsId(req);

  if (!(id && isValidObjectId(id))) {
    throw userError(apiErrors.user.notFound, 404);
  }

  const body = req.body;

  const updateSchema = joi.object({
    username: joi.string().required(),
    name: joi.string().allow(''),
    surname: joi.string().allow(''),
    isActive: joi.boolean(),
    age: joi.number(),
    job: joi.string().allow('')
  });

  try {
    const validatedBody = await updateSchema.validateAsync(body);

    const user = await userModel.findByIdAndUpdate(id, validatedBody, { new: true }).exec();

    if (!user) {
      throw userError(apiErrors.user.notFound, 404);
    }

    return getResponse(user.getPublicFields());
  } catch (err) {
    throw userError(err.message, err.code);
  }
};

const remove = async (req) => {
  const id = getRequestParamsId(req);

  if (!id) {
    throw userError(apiErrors.user.notFound, 404);
  }

  if (!isValidObjectId(id)) {
    throw userError(apiErrors.user.notFound, 404);
  }

  const user = await userModel.findByIdAndDelete(id).exec();

  if (!user) {
    throw userError(apiErrors.user.notFound, 404);
  }

  return getResponse();
};

const usersService = {
  get,
  create,
  modify,
  update,
  remove
};

export default usersService;
