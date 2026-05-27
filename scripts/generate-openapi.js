'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const fs_1 = __importDefault(require('fs'));
const path_1 = __importDefault(require('path'));
const process_1 = __importDefault(require('process'));
const dotenv_1 = __importDefault(require('dotenv'));
dotenv_1.default.config({
  path: path_1.default.join(process_1.default.cwd(), `.env.${process_1.default.env.NODE_ENV || 'development'}`)
});
const document_1 = require('../src/openapi/document');
const outputPath = path_1.default.join(process_1.default.cwd(), 'src/public/swagger.json');
const document = (0, document_1.generateOpenApiDocument)();
fs_1.default.writeFileSync(outputPath, `${JSON.stringify(document, null, 2)}\n`, 'utf-8');
console.log('OpenAPI document written to %s', outputPath);
