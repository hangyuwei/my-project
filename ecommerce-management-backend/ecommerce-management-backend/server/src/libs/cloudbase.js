import cloudbase from '@cloudbase/node-sdk';
import { env } from '../config/env.js';

export const cloudApp = cloudbase.init({
  env: env.cloudbaseEnvId,
  secretId: env.secretId,
  secretKey: env.secretKey,
});

export const db = cloudApp.database();
