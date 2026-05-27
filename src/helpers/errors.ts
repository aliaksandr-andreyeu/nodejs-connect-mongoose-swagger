import type { AppError } from '@types';

export const getErrorStatusCode = (err: unknown): number | undefined => {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = (err as AppError).code;
    return typeof code === 'number' ? code : undefined;
  }
  return undefined;
};

export const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) {
    return err.message;
  }
  return String(err);
};
