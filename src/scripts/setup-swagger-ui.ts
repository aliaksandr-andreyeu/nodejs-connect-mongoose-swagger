import fs from 'fs';
import path from 'path';

const distDir = path.join(process.cwd(), 'node_modules/swagger-ui-dist');
const publicDir = path.join(process.cwd(), 'src/public');

const copyFile = (from: string, to: string): void => {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
};

if (!fs.existsSync(distDir)) {
  console.error('swagger-ui-dist is not installed. Run: npm install');
  process.exit(1);
}

const files: Array<{ from: string; to: string }> = [
  { from: 'swagger-ui-bundle.js', to: 'js/swagger-ui-bundle.js' },
  { from: 'swagger-ui-standalone-preset.js', to: 'js/swagger-ui-standalone-preset.js' },
  { from: 'swagger-ui.css', to: 'css/swagger-ui.css' },
  { from: 'favicon-32x32.png', to: 'img/favicon-32x32.png' },
  { from: 'favicon-16x16.png', to: 'img/favicon-16x16.png' }
];

for (const { from, to } of files) {
  copyFile(path.join(distDir, from), path.join(publicDir, to));
  console.log('Copied %s -> src/public/%s', from, to);
}
