const fs = require('fs');
const path = require('path');

// 从 .env 文件（已 gitignore，不会入库）加载 JWT_SECRET，
// 并始终以 process.env 为最高优先级，便于部署时覆盖。
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return {};
  const result = {};
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    result[key] = value;
  }
  return result;
}

const fileEnv = loadEnv();

if (!process.env.JWT_SECRET && !fileEnv.JWT_SECRET) {
  console.error('缺少 JWT_SECRET：请在项目根的 .env 中设置 JWT_SECRET=<强随机密钥>');
  console.error('生成命令: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64\'))"');
  process.exit(1);
}

module.exports = {
  apps: [
    {
      name: 'guess-weight',
      script: './dist-server/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        JWT_SECRET: process.env.JWT_SECRET || fileEnv.JWT_SECRET,
        ADMIN_USERNAME: process.env.ADMIN_USERNAME || fileEnv.ADMIN_USERNAME || 'admin',
        ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH || fileEnv.ADMIN_PASSWORD_HASH || '',
        CORS_ORIGIN: process.env.CORS_ORIGIN || fileEnv.CORS_ORIGIN || '',
      },
      max_memory_restart: '256M',
      watch: false,
      autorestart: true,
      max_restarts: 10,
    },
  ],
};