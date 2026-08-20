const fs = require('fs');
const path = require('path');

// Ensure src/environments directory exists
const envDir = path.join(__dirname, 'src', 'environments');
if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir, { recursive: true });
}

// Default fallback URLs
const defaultProdApiUrl = 'https://nineantra-the-bridge-backend.onrender.com/api';
const defaultDevApiUrl = 'http://localhost:8080/api';

// Retrieve from Node process environment at build time
const prodApiUrl = process.env.PROD_API_URL || defaultProdApiUrl;
const devApiUrl = process.env.DEV_API_URL || defaultDevApiUrl;

const prodEnvContent = `// Auto-generated build-time environment file (set-env.js)
export const environment = {
  production: true,
  apiUrl: '${prodApiUrl}'
};
`;

const devEnvContent = `// Auto-generated build-time environment file (set-env.js)
export const environment = {
  production: false,
  apiUrl: '${devApiUrl}'
};
`;

fs.writeFileSync(path.join(envDir, 'environment.prod.ts'), prodEnvContent, { encoding: 'utf8' });
fs.writeFileSync(path.join(envDir, 'environment.ts'), devEnvContent, { encoding: 'utf8' });

console.log('✅ Generated Angular environment files successfully:');
console.log(`   - environment.prod.ts => apiUrl: ${prodApiUrl}`);
console.log(`   - environment.ts      => apiUrl: ${devApiUrl}`);