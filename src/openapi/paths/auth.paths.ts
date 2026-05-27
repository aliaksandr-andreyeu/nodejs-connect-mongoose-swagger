import { registry } from '../registry';
import { authResponseBodySchema, emptyResponseBodySchema, jwtSecurity, standardErrorResponses } from '../components';
import { resetPasswordSchema, signInSchema, signUpSchema } from '@validation';

registry.registerPath({
  method: 'post',
  path: '/signin',
  tags: ['Auth'],
  summary: 'Sign in',
  request: {
    body: {
      content: {
        'application/json': {
          schema: signInSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'OK',
      headers: {
        'Set-Cookie': {
          schema: { type: 'string' },
          description: 'X-Refresh-Token refresh token'
        }
      },
      content: {
        'application/json': {
          schema: authResponseBodySchema
        }
      }
    },
    ...standardErrorResponses
  }
});

registry.registerPath({
  method: 'post',
  path: '/signup',
  tags: ['Auth'],
  summary: 'Sign up',
  request: {
    body: {
      content: {
        'application/json': {
          schema: signUpSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'OK',
      headers: {
        'Set-Cookie': {
          schema: { type: 'string' },
          description: 'X-Refresh-Token refresh token'
        }
      },
      content: {
        'application/json': {
          schema: authResponseBodySchema
        }
      }
    },
    ...standardErrorResponses
  }
});

registry.registerPath({
  method: 'get',
  path: '/refresh-token',
  tags: ['Auth'],
  summary: 'Refresh access token',
  responses: {
    200: {
      description: 'OK',
      headers: {
        'Set-Cookie': {
          schema: { type: 'string' },
          description: 'X-Refresh-Token refresh token'
        }
      },
      content: {
        'application/json': {
          schema: authResponseBodySchema
        }
      }
    },
    ...standardErrorResponses
  }
});

registry.registerPath({
  method: 'post',
  path: '/reset-password',
  tags: ['Auth'],
  summary: 'Reset password',
  request: {
    body: {
      content: {
        'application/json': {
          schema: resetPasswordSchema
        }
      }
    }
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
  path: '/signout',
  tags: ['Auth'],
  summary: 'Sign out',
  security: jwtSecurity,
  responses: {
    200: {
      description: 'OK',
      headers: {
        'Set-Cookie': {
          schema: { type: 'string' },
          description: 'Clears X-Refresh-Token cookie'
        }
      },
      content: {
        'application/json': {
          schema: emptyResponseBodySchema
        }
      }
    },
    ...standardErrorResponses
  }
});
