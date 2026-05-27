import { z } from '@openapi/zod';

export const usernameField = z.string().min(1);
export const passwordField = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(256, 'Password must be at most 256 characters')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain a special character');
export const optionalStringField = z.string().optional();

export const userProfileShape = {
  username: usernameField,
  name: optionalStringField,
  surname: optionalStringField,
  isActive: z.boolean().optional(),
  age: z.number().optional(),
  job: optionalStringField,
  // Optional: admin-created user may set password; will be hashed in service.
  password: passwordField.optional()
};

export const userAccountShape = {
  username: usernameField,
  name: optionalStringField,
  surname: optionalStringField,
  age: z.number().optional(),
  job: optionalStringField
};
