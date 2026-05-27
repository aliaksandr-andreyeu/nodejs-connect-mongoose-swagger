import fs from 'fs';
import path from 'path';
import process from 'process';
import dotenv from 'dotenv';
import { generateOpenApiDocument } from '../openapi/document';
import { logger } from '../logger';

dotenv.config({
  path: path.join(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`)
});

const outputPath = path.join(process.cwd(), 'src/public/swagger.json');
const document = generateOpenApiDocument();

fs.writeFileSync(outputPath, `${JSON.stringify(document, null, 2)}\n`, 'utf-8');

logger.info({ outputPath }, 'OpenAPI document written');
