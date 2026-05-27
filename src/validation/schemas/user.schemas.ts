import { z } from '@openapi/zod';
import { userAccountShape, userProfileShape } from '../fields';

export const userProfileSchema = z.object(userProfileShape).openapi('UserProfileInput');

export const userAccountSchema = z.object(userAccountShape).openapi('UserAccountInput');

export type UserProfileInput = z.infer<typeof userProfileSchema>;
export type UserAccountInput = z.infer<typeof userAccountSchema>;
