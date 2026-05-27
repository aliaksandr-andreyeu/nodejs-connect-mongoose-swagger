import { ZodError, ZodType } from 'zod';
import { userError } from '@helpers';

const formatZodError = (error: ZodError): string => {
  return error.issues.map((issue) => issue.message).join('; ');
};

export const validateRequestBody = async <T>(schema: ZodType<T>, body: unknown): Promise<T> => {
  try {
    return await schema.parseAsync(body);
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      throw userError(formatZodError(err), 400);
    }
    throw err;
  }
};
