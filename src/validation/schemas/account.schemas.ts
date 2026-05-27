import { z } from '@openapi/zod';
import { passwordField } from '../fields';

export const contactUsSchema = z
  .object({
    subject: z.string().min(1),
    message: z.string().min(1)
  })
  .openapi('ContactUsInput');

export const changePasswordSchema = z
  .object({
    password: passwordField,
    newpassword: passwordField,
    confirm: passwordField
  })
  .openapi('ChangePasswordInput');

export type ContactUsInput = z.infer<typeof contactUsSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
