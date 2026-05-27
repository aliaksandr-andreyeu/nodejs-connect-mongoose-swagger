import { registry } from '../registry';
import { emptyResponseBodySchema, jwtSecurity, standardErrorResponses, userResponseBodySchema } from '../components';
import { changePasswordSchema, contactUsSchema, userAccountSchema } from '@validation';

registry.registerPath({
  method: 'post',
  path: '/contact',
  tags: ['Account'],
  summary: 'Contact us',
  security: jwtSecurity,
  request: {
    body: {
      content: {
        'application/json': {
          schema: contactUsSchema
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
  path: '/account',
  tags: ['Account'],
  summary: 'Get current account',
  security: jwtSecurity,
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
  method: 'put',
  path: '/account',
  tags: ['Account'],
  summary: 'Update current account',
  security: jwtSecurity,
  request: {
    body: {
      content: {
        'application/json': {
          schema: userAccountSchema
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
  method: 'post',
  path: '/change-password',
  tags: ['Account'],
  summary: 'Change password',
  security: jwtSecurity,
  request: {
    body: {
      content: {
        'application/json': {
          schema: changePasswordSchema
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
