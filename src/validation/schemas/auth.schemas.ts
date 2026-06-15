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

export const resetPasswordConfirmSchema = z
  .object({
    username: usernameField,
    token: z.string().min(1),
    newpassword: passwordField
  })
  .openapi('ResetPasswordConfirmInput');

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ResetPasswordConfirmInput = z.infer<typeof resetPasswordConfirmSchema>;
