import { z } from '../zod';
import { registry } from '../registry';
import {
  emptyResponseBodySchema,
  jwtSecurity,
  standardErrorResponses,
  userResponseBodySchema,
  usersListResponseBodySchema
} from '../components';
import { userProfileSchema } from '@validation';

const userIdPathParams = registry.register(
  'UserIdPathParams',
  z.object({
    id: z.string().openapi({ description: 'User ID' })
  })
);

registry.registerPath({
  method: 'get',
  path: '/users',
  tags: ['Users'],
  summary: 'List users',
  security: jwtSecurity,
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: usersListResponseBodySchema
        }
      }
    },
    ...standardErrorResponses
  }
});

registry.registerPath({
  method: 'post',
  path: '/users',
  tags: ['Users'],
  summary: 'Create user',
  security: jwtSecurity,
  request: {
    body: {
      content: {
        'application/json': {
          schema: userProfileSchema
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Created',
      content: {
        'application/json': {
          schema: userResponseBodySchema
        }
      }
    },
    ...standardErrorResponses
  }
});

registry.registerPath({
  method: 'put',
  path: '/users/{id}',
  tags: ['Users'],
  summary: 'Replace user by id',
  security: jwtSecurity,
  request: {
    params: userIdPathParams,
    body: {
      content: {
        'application/json': {
          schema: userProfileSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: userResponseBodySchema
        }
      }
    },
    ...standardErrorResponses
  }
});

registry.registerPath({
  method: 'patch',
  path: '/users/{id}',
  tags: ['Users'],
  summary: 'Update user by id',
  security: jwtSecurity,
  request: {
    params: userIdPathParams,
    body: {
      content: {
        'application/json': {
          schema: userProfileSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: userResponseBodySchema
        }
      }
    },
    ...standardErrorResponses
  }
});

registry.registerPath({
  method: 'delete',
  path: '/users/{id}',
  tags: ['Users'],
  summary: 'Delete user by id',
  security: jwtSecurity,
  request: {
    params: userIdPathParams
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: emptyResponseBodySchema
        }
      }
    },
    ...standardErrorResponses
  }
});

registry.registerPath({
  method: 'get',
  path: '/users/{id}',
  tags: ['Users'],
  summary: 'Get user by id',
  security: jwtSecurity,
  request: {
    params: userIdPathParams
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: userResponseBodySchema
        }
      }
    },
    ...standardErrorResponses
  }
});
