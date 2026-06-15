import {
  getRequestParamsId,
  isValidObjectId,
  isDuplicateKeyError,
  hashPassword,
  userError,
  getResponse
} from '@helpers';
import { invalidateUser } from '@db/cache';
import { apiErrors } from '@constants';
import { userModel } from '@models';
import { userProfileSchema, validateRequestBody } from '@validation';
import type { AppRequest } from '@types';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

const getPagination = (req: AppRequest): { page: number; limit: number; skip: number } => {
  const rawPage = Number(req.query?.page);
  const rawLimit = Number(req.query?.limit);

  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const limit =
    Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(Math.floor(rawLimit), MAX_PAGE_SIZE) : DEFAULT_PAGE_SIZE;

  return { page, limit, skip: (page - 1) * limit };
};

const get = async (req: AppRequest) => {
  const id = getRequestParamsId(req);

  if (!id) {
    const { page, limit, skip } = getPagination(req);

    const [users, total] = await Promise.all([
      userModel.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      userModel.estimatedDocumentCount()
    ]);

    return getResponse(users, {}, true, null, { pagination: { page, limit, total } });
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

  const entity: Record<string, unknown> = { ...validatedBody };
  if (validatedBody.password) {
    entity.password = await hashPassword(validatedBody.password);
  }

  try {
    const newUser = await new userModel(entity).save();
    return getResponse(newUser);
  } catch (error) {
    // Unique index on `username` guards against the find-then-create race.
    if (isDuplicateKeyError(error)) {
      throw userError(apiErrors.user.exists(validatedBody.username), 400);
    }
    throw error;
  }
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

  let user;
  try {
    user = await userModel.findByIdAndUpdate(id, entity, { new: true, runValidators: true }).exec();
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw userError(apiErrors.user.exists(validatedBody.username), 400);
    }
    throw error;
  }

  if (!user) {
    throw userError(apiErrors.user.notFound, 404);
  }

  await invalidateUser(id);

  return getResponse(user);
};

const update = async (req: AppRequest) => {
  const id = getRequestParamsId(req);

  if (!(id && isValidObjectId(id))) {
    throw userError(apiErrors.user.notFound, 404);
  }

  const validatedBody = await validateRequestBody(userProfileSchema, req.body);

  let user;
  try {
    user = await userModel.findByIdAndUpdate(id, validatedBody, { new: true, runValidators: true }).exec();
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw userError(apiErrors.user.exists(validatedBody.username), 400);
    }
    throw error;
  }

  if (!user) {
    throw userError(apiErrors.user.notFound, 404);
  }

  await invalidateUser(id);

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

  await invalidateUser(id);

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
