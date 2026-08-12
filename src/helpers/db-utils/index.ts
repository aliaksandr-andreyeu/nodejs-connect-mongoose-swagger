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

// MongoDB duplicate-key error (e.g. unique index violation on `username`).
export const isDuplicateKeyError = (err: unknown): boolean => {
  return Boolean(err && typeof err === 'object' && (err as { code?: number }).code === 11000);
};
