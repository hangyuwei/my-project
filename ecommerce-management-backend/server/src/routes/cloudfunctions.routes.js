import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as goodsService from '../services/goods.service.js';
import * as homeService from '../services/home.service.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '../../../..');
const FUNCTIONS_DIR = path.join(PROJECT_ROOT, 'cloudfunctions');
const LEGACY_FUNCTIONS_DIR = path.join(PROJECT_ROOT, 'functions');

// Detect whether local env has credentials to call real cloud functions.
const hasCloudSecrets = () => {
  const secretId =
    process.env.CLOUDBASE_SECRET_ID ||
    process.env.CLOUDBASE_SECRETID ||
    process.env.TENCENTCLOUD_SECRET_ID ||
    process.env.TENCENTCLOUD_SECRETID;
  const secretKey =
    process.env.CLOUDBASE_SECRET_KEY ||
    process.env.CLOUDBASE_SECRETKEY ||
    process.env.TENCENTCLOUD_SECRET_KEY ||
    process.env.TENCENTCLOUD_SECRETKEY;
  return Boolean(secretId && secretKey);
};

// Load cloud function entry (prefer cloudfunctions dir when credentials exist; fall back to legacy mock functions)
const loadFunction = async (name) => {
  const candidates = [];
  if (hasCloudSecrets()) {
    candidates.push(path.join(FUNCTIONS_DIR, name, 'index.js'));
    candidates.push(path.join(FUNCTIONS_DIR, `${name}.js`));
  } else {
    console.warn(`[cloudfunctions] skip cloudfunctions/${name} because cloud secrets are missing`);
  }
  candidates.push(path.join(LEGACY_FUNCTIONS_DIR, `${name}.js`));

  for (const functionPath of candidates) {
    try {
      const mod = await import(`file:///${functionPath.replace(/\\/g, '/')}?v=${Date.now()}`);
      const handler = mod.main || mod.default?.main || mod.default || null;
      if (handler) return handler;
    } catch (err) {
      // Try next candidate; log for debugging.
      console.debug(`[cloudfunctions] skip ${functionPath}: ${err.message}`);
    }
  }
  return null;
};

// Build cloud function context for local requests
const buildContext = (req, body) => {
  let openid = req.headers['x-openid'];

  if (!openid || openid.trim() === '') {
    console.warn('[Cloud Function] Missing x-openid header, using mock data');
    openid = 'mock_openid_001';
  }

  return {
    OPENID: openid,
    APPID: 'mock_appid_001',
    ENV: 'mock',
    CLIENT_IP: req.ip,
    REQ_ID: `req_${Date.now()}`,
    ...body?.context,
  };
};

// Local service adapter - used when cloud function is unavailable
const localServiceAdapter = async (name, event) => {
  if (name === 'getHome') {
    return await homeService.getHomeData();
  }

  if (name === 'getGoodsList') {
    const { pageNum = 1, pageSize = 20, category } = event;
    const result = await goodsService.listGoods({ page: pageNum, pageSize, search: category });
    return {
      list: result.list,
      pageNum,
      pageSize,
      totalCount: result.total,
    };
  }

  throw new Error(`No local adapter for function: ${name}`);
};

// POST /cloudfunctions/:name
router.post('/:name', async (req, res) => {
  const { name } = req.params;
  const body = req.body;

  try {
    const handler = await loadFunction(name);

    if (!handler) {
      console.log(`Cloud function ${name} not found, trying local adapter...`);
      try {
        const event = body?.data || {};
        const result = await localServiceAdapter(name, event);
        return res.json({
          result: result === undefined ? null : result,
          errMsg: 'cloud.callFunction:ok',
        });
      } catch {
        return res.status(404).json({
          result: {
            success: false,
            error: `Function ${name} not found and no local adapter available`,
          },
          errMsg: 'cloud.callFunction:fail',
        });
      }
    }

    const context = buildContext(req, body);
    const event = body?.data || {};

    const result = await handler(event, context);

    res.json({
      result: result === undefined ? null : result,
      errMsg: 'cloud.callFunction:ok',
    });
  } catch (err) {
    console.error(`Function ${name} error:`, err);

    console.log(`Cloud function ${name} failed, trying local adapter...`);
    try {
      const event = body?.data || {};
      const result = await localServiceAdapter(name, event);
      console.log(`Local adapter succeeded for ${name}`);
      return res.json({
        result: result === undefined ? null : result,
        errMsg: 'cloud.callFunction:ok',
      });
    } catch (adapterErr) {
      console.error(`Local adapter failed for ${name}:`, adapterErr);
      res.status(500).json({
        result: {
          success: false,
          error: err.message,
        },
        errMsg: 'cloud.callFunction:fail',
      });
    }
  }
});

export default router;
