import bcrypt from 'bcrypt';
import { getRequestParamsId, isValidObjectId, userError, getResponse } from '@helpers';
import { apiErrors } from '@constants';
import { userModel } from '@models';
import { userProfileSchema, validateRequestBody } from '@validation';
import type { AppRequest } from '@types';

const get = async (req: AppRequest) => {
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

  return getResponse(user);
};

const create = async (req: AppRequest) => {
  const validatedBody = await validateRequestBody(userProfileSchema, req.body);

  const userExist = await userModel.findOne({ username: validatedBody.username });

  if (userExist) {
    throw userError(apiErrors.user.exists(validatedBody.username), 400);
  }

  const entity: Record<string, unknown> = { ...validatedBody };
  if (validatedBody.password) {
    const salt = await bcrypt.genSalt(10);
    entity.password = await bcrypt.hash(validatedBody.password, salt);
  }

  const model = new userModel(entity);

  const newUser = await model.save();

  return getResponse(newUser);
};

const modify = async (req: AppRequest) => {
  const id = getRequestParamsId(req);

  if (!id) {
    throw userError(apiErrors.user.notFound, 404);
  }

  if (!isValidObjectId(id)) {
    throw userError(apiErrors.user.notFound, 404);
  }

  const validatedBody = await validateRequestBody(userProfileSchema, req.body);

  const entity = {
    username: validatedBody.username,
    name: validatedBody.name || '',
    surname: validatedBody.surname || '',
    isActive: validatedBody.isActive ?? true,
    age: validatedBody.age || 0,
    job: validatedBody.job || ''
  };

  const user = await userModel.findByIdAndUpdate(id, entity, { new: true }).exec();

  if (!user) {
    throw userError(apiErrors.user.notFound, 404);
  }

  return getResponse(user);
};

const update = async (req: AppRequest) => {
  const id = getRequestParamsId(req);

  if (!(id && isValidObjectId(id))) {
    throw userError(apiErrors.user.notFound, 404);
  }

  const validatedBody = await validateRequestBody(userProfileSchema, req.body);

  const user = await userModel.findByIdAndUpdate(id, validatedBody, { new: true }).exec();

  if (!user) {
    throw userError(apiErrors.user.notFound, 404);
  }

  return getResponse(user);
};

const remove = async (req: AppRequest) => {
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
