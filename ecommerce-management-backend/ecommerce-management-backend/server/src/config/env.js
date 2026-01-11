const getEnv = (value, fallback = '') => (value === undefined ? fallback : value);

const requireEnv = (name, value) => {
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
};

const port = Number.parseInt(getEnv(process.env.PORT, '3001'), 10);
const cloudbaseEnvId = getEnv(process.env.CLOUDBASE_ENV_ID, process.env.VITE_ENV_ID);
const secretId =
  process.env.CLOUDBASE_SECRET_ID ||
  process.env.CLOUDBASE_SECRETID ||
  process.env.TENCENTCLOUD_SECRET_ID;
const secretKey =
  process.env.CLOUDBASE_SECRET_KEY ||
  process.env.CLOUDBASE_SECRETKEY ||
  process.env.TENCENTCLOUD_SECRET_KEY;

requireEnv('CLOUDBASE_ENV_ID', cloudbaseEnvId);
requireEnv('CLOUDBASE_SECRET_ID', secretId);
requireEnv('CLOUDBASE_SECRET_KEY', secretKey);

export const env = {
  port,
  cloudbaseEnvId,
  secretId,
  secretKey,
};
