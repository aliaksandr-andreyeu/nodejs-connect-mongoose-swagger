import { getRequestParamsId, isValidObjectId, userError, mapRequestBody, getResponse } from '@helpers';
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
  return user;
};

const create = async (req) => {
  const mapModel = mapRequestBody(req);

  // console.log('*** mapRequestBody Response: ', mapModel);

  if (mapModel.errors && mapModel.errors.length > 0) {
    throw userError(mapModel.errors.join(', '), 400);
  }

  const model = new userModel(mapModel.data);

  // console.log('*** toObject: ', model.toObject({ virtuals: true }));
  // console.log('*** toJSON: ', model.toJSON({ virtuals: true }));

  const user = await model.save();
  return user;
};

const modify = async (req) => {
  const id = getRequestParamsId(req);

  if (!id) {
    throw userError(apiErrors.user.notFound, 404);
  }

  if (!isValidObjectId(id)) {
    throw userError(apiErrors.user.notFound, 404);
  }

  const mapModel = mapRequestBody(req);

  // console.log('*** mapRequestBody Response: ', mapModel);

  if (mapModel.errors && mapModel.errors.length > 0) {
    throw userError(mapModel.errors.join(', '), 400);
  }

  if (mapModel.data && Object.keys(mapModel.data).length === 0) {
    throw userError(apiErrors.user.notUpdated, 400);
  }

  // const model = new userModel(mapModel.data); // ??????????????????????????????????????????????????????????????

  // console.log('*** toObject: ', model.toObject({ virtuals: true }));
  // console.log('*** toJSON: ', model.toJSON({ virtuals: true }));

  const user = await userModel.findByIdAndUpdate(id, { ...mapModel.data, ...mapModel.excluded }, { new: true }).exec();

  if (!user) {
    throw userError(apiErrors.user.notFound, 404);
  }

  return user;
};

const update = async (req) => {
  const id = getRequestParamsId(req);

  if (!id) {
    throw userError(apiErrors.user.notFound, 404);
  }

  if (!isValidObjectId(id)) {
    throw userError(apiErrors.user.notFound, 404);
  }

  const mapModel = mapRequestBody(req, true);

  // console.log('*** mapRequestBody Response: ', mapModel);

  if (mapModel.errors && mapModel.errors.length > 0) {
    throw userError(mapModel.errors.join(', '), 400);
  }

  if (mapModel.data && Object.keys(mapModel.data).length === 0) {
    throw userError(apiErrors.user.notUpdated, 400);
  }

  // const model = new userModel(mapModel.data); // ??????????????????????????????????????????????????????????????

  const user = await userModel.findByIdAndUpdate(id, mapModel.data, { new: true }).exec();

  if (!user) {
    throw userError(apiErrors.user.notFound, 404);
  }

  return user;
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

  const response = {
    isOk: true,
    message: 'User deleted'
  };

  return response;
};

const usersService = {
  get,
  create,
  modify,
  update,
  remove
};

export default usersService;
