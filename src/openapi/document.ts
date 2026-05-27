import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { config } from '@constants';
import { registry } from './registry';
import './register';

export const generateOpenApiDocument = () => {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'Node.js Connect Mongoose Swagger API',
      version: '0.1.0',
      description: 'REST API boilerplate with Connect, Mongoose, and OpenAPI generated from Zod schemas'
    },
    servers: [
      {
        url: `http://${config.host}:${config.port}`,
        description: 'Current environment'
      }
    ],
    tags: [
      { name: 'Auth', description: 'Authentication operations' },
      { name: 'Account', description: 'Operations with account' },
      { name: 'Users', description: 'Operations with users' }
    ]
  });
};
