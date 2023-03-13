import { Types } from 'mongoose';

export const isValidObjectId = (id) => {
  if (!id) return false;

  const { ObjectId } = Types;

  const stringId = id.toString().toLowerCase();

  if (!ObjectId.isValid(stringId)) return false;

  let objectId = null;

  try {
    objectId = new ObjectId(stringId).toString();
  } catch (error) {
    return false;
  }

  return objectId === stringId ? true : false;
};
