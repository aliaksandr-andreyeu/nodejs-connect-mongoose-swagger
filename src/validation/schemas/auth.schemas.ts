import { z } from '@openapi/zod';
import { passwordField, usernameField } from '../fields';

export const signInSchema = z
  .object({
    username: usernameField,
    password: passwordField
  })
  .openapi('SignInInput');

export const signUpSchema = z
  .object({
    username: usernameField,
    password: passwordField
  })
  .openapi('SignUpInput');

export const resetPasswordSchema = z
  .object({
    username: usernameField
  })
  .openapi('ResetPasswordInput');

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
