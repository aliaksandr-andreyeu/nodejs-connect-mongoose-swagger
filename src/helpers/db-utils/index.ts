import { Types } from 'mongoose';

export const isValidObjectId = (id: unknown): boolean => {
  if (!id) return false;

  const { ObjectId } = Types;

  const stringId = id.toString().toLowerCase();

  if (!ObjectId.isValid(stringId)) return false;

  let objectId: string | null = null;

  try {
    objectId = new ObjectId(stringId).toString();
  } catch {
    return false;
  }

  return objectId === stringId;
};
