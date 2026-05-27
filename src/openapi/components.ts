import { z } from './zod';
import { registry } from './registry';

export const apiErrorSchema = registry.register(
  'APIError',
  z.object({
    message: z.string(),
    status: z.string()
  })
);

export const apiResponseBaseSchema = z.object({
  isOk: z.boolean(),
  message: z.string().nullable()
});

export const userSchema = registry.register(
  'User',
  z.object({
    id: z.string(),
    username: z.string(),
    name: z.string().optional(),
    surname: z.string().optional(),
    isActive: z.boolean().optional(),
    job: z.string().optional(),
    age: z.number().optional()
  })
);

export const authDataSchema = registry.register(
  'AuthData',
  z.object({
    accessToken: z.string(),
    overview: userSchema
  })
);

export const authResponseBodySchema = registry.register(
  'AuthResponseBody',
  apiResponseBaseSchema.extend({
    data: authDataSchema.optional()
  })
);

export const userResponseBodySchema = registry.register(
  'UserResponseBody',
  apiResponseBaseSchema.extend({
    data: userSchema.optional()
  })
);

export const usersListResponseBodySchema = registry.register(
  'UsersListResponseBody',
  apiResponseBaseSchema.extend({
    data: z.array(userSchema).optional()
  })
);

export const emptyResponseBodySchema = registry.register(
  'EmptyResponseBody',
  apiResponseBaseSchema.extend({
    data: z.unknown().optional()
  })
);

registry.registerComponent('securitySchemes', 'Bearer', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'Bearer Authentication with JWT'
});

registry.registerComponent('securitySchemes', 'CookieAuth', {
  type: 'apiKey',
  in: 'cookie',
  name: 'X-Refresh-Token',
  description: 'Refresh token cookie'
});

/** Requires both Bearer access token and refresh cookie (matches jwtVerify middleware). */
export const jwtSecurity = [{ Bearer: [] as string[], CookieAuth: [] as string[] }];

export const jsonErrorResponse = (description: string) => ({
  description,
  content: {
    'application/json': {
      schema: apiErrorSchema
    }
  }
});

export const standardErrorResponses = {
  400: jsonErrorResponse('Bad Request'),
  401: jsonErrorResponse('Unauthorized'),
  404: jsonErrorResponse('Not Found'),
  500: jsonErrorResponse('Internal Server Error')
};
