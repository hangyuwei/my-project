const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const Busboy = require('busboy');
const tcb = require('tcb-admin-node');

const PORT = process.env.PORT || 3001;
const ROOT = __dirname;
const SETTINGS_PATH = path.join(ROOT, 'data', 'settings.json');
const LOGS_FUNCTIONS_PATH = path.join(ROOT, 'data', 'logs-functions.json');
const LOGS_HTTP_PATH = path.join(ROOT, 'data', 'logs-http.json');
const ADMIN_DIR = path.join(ROOT, 'admin');
const TMP_DIR = path.join(os.tmpdir(), 'cloudbase-admin');
const FUNCTIONS_DIR = path.join(process.cwd(), 'functions');

const COLLECTIONS = ['products', 'home', 'categories', 'orders', 'rights'];
const DEFAULT_SETTINGS = {
  defaultOpenId: 'mock_openid_001',
  appId: 'mock_appid_001',
  env: 'mock',
  requireAdminAuth: true,
  requireApiAuth: false,
};

let cloudApp = null;

const getCloudEnvId = () =>
  process.env.CLOUDBASE_ENV_ID ||
  process.env.TCB_ENV_ID ||
  process.env.TCB_ENV ||
  process.env.ENV_ID ||
  '';

const getCloudCredentials = () => ({
  secretId:
    process.env.CLOUDBASE_SECRET_ID ||
    process.env.TCB_SECRET_ID ||
    process.env.TENCENTCLOUD_SECRET_ID ||
    process.env.TENCENTCLOUD_SECRETID ||
    '',
  secretKey:
    process.env.CLOUDBASE_SECRET_KEY ||
    process.env.TCB_SECRET_KEY ||
    process.env.TENCENTCLOUD_SECRET_KEY ||
    process.env.TENCENTCLOUD_SECRETKEY ||
    '',
});

const getCloudApp = () => {
  if (cloudApp) return cloudApp;
  const env = getCloudEnvId();
  if (!env) {
    throw new Error('CloudBase env id is required');
  }
  const { secretId, secretKey } = getCloudCredentials();
  cloudApp = tcb.init({
    env,
    ...(secretId && secretKey ? { secretId, secretKey } : {}),
  });
  return cloudApp;
};

const getCloudDb = () => getCloudApp().database();

const getCloudAppSafe = (res, meta) => {
  try {
    return getCloudApp();
  } catch (err) {
    sendJson(res, 500, wrapError('CloudEnvMissing', err.message, meta));
    return null;
  }
};

const adminTokens = new Set();

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const readJson = (filePath, fallback) => {
  try {
    const raw = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
    return JSON.parse(raw);
  } catch (err) {
    return fallback;
  }
};

const writeJson = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

const generateId = () => {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

const nowIso = () => new Date().toISOString();

const ensureDoc = (doc = {}) => {
  const next = { ...doc };
  if (!next.createdAt) next.createdAt = nowIso();
  next.updatedAt = nowIso();
  return next;
};

const wrapSuccess = (data, meta = {}) => ({
  data,
  code: 'Success',
  msg: null,
  requestId: meta.requestId || generateId(),
  clientIp: meta.clientIp || null,
  rt: meta.rt || 0,
  success: true,
});

const wrapError = (code, msg, meta = {}) => ({
  data: null,
  code,
  msg,
  requestId: meta.requestId || generateId(),
  clientIp: meta.clientIp || null,
  rt: meta.rt || 0,
  success: false,
});

const sendJson = (res, status, payload) => {
  const body = JSON.stringify(payload);
  res._bodySize = Buffer.byteLength(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-token, x-openid',
  });
  res.end(body);
};

const sendText = (res, status, body, contentType = 'text/plain; charset=utf-8') => {
  res._bodySize = Buffer.byteLength(body || '');
  res.writeHead(status, {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*',
  });
  res.end(body);
};

const summarizeBody = (data) => {
  if (!data) return null;
  const trimmed = String(data).trim();
  if (!trimmed) return null;
  if (trimmed.length > 500) return `${trimmed.slice(0, 500)}...`;
  return trimmed;
};

const parseBody = (req) =>
  new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      req._bodySummary = summarizeBody(data);
      if (!data) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        resolve({});
      }
    });
  });

const parseCookies = (req) => {
  const header = req.headers.cookie || '';
  return header.split(';').reduce((acc, part) => {
    const [key, value] = part.trim().split('=');
    if (!key) return acc;
    acc[key] = decodeURIComponent(value || '');
    return acc;
  }, {});
};

const safeJoin = (base, target) => {
  const targetPath = path.normalize(path.join(base, target));
  if (!targetPath.startsWith(base)) return null;
  return targetPath;
};

const serveStatic = (req, res, baseDir, prefix) => {
  const urlPath = req.url.replace(prefix, '').split('?')[0];
  const filePath = safeJoin(baseDir, urlPath === '/' || urlPath === '' ? 'index.html' : urlPath);
  if (!filePath || !fs.existsSync(filePath)) {
    sendText(res, 404, 'Not Found');
    return;
  }
  const ext = path.extname(filePath);
  const contentTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
  };
  const contentType = contentTypes[ext] || 'application/octet-stream';
  res.writeHead(200, {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*',
  });
  fs.createReadStream(filePath).pipe(res);
};

const getSettings = () => {
  ensureDir(path.dirname(SETTINGS_PATH));
  const settings = readJson(SETTINGS_PATH, null);
  const merged = { ...DEFAULT_SETTINGS, ...(settings || {}) };
  const envPassword = process.env.ADMIN_PASSWORD;
  if (envPassword) merged.adminPassword = envPassword;
  return merged;
};

const saveSettings = (next) => {
  const envPassword = process.env.ADMIN_PASSWORD;
  const toSave = { ...next };
  if (envPassword) {
    toSave.adminPassword = envPassword;
  }
  writeJson(SETTINGS_PATH, toSave);
  return toSave;
};

const ensureSeedCloud = async () => {
  if (process.env.SEED_ON_START !== '1') return;
  let app;
  try {
    app = getCloudApp();
  } catch (err) {
    return;
  }
  const db = app.database();
  const productsRes = await db.collection('products').limit(1).get().catch(() => ({ data: [] }));
  if ((productsRes.data || []).length === 0) {
    await db.collection('products').add({
      data: {
        title: '航天神舟牌鱼蛋白粉固体饮料',
        subTitle: '',
        status: 'ON',
        price: 95800,
        linePrice: 100000,
        stock: 999,
        coverFileId: '',
        galleryFileIds: [],
        detailBlocks: [],
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
    });
  }
};

const getClientIp = (req) => {
  const header = req.headers['x-forwarded-for'];
  const ip = Array.isArray(header) ? header[0] : header;
  return (ip || req.socket.remoteAddress || '').replace('::ffff:', '');
};

const getAdminPassword = () => {
  const settings = getSettings();
  return settings.adminPassword || process.env.ADMIN_PASSWORD || 'admin123';
};

const isAdminAuthRequired = () => {
  const settings = getSettings();
  return settings.requireAdminAuth !== false;
};

const isApiAuthRequired = () => {
  const settings = getSettings();
  return settings.requireApiAuth === true;
};

const isAdminAuthenticated = (req) => {
  if (!isAdminAuthRequired()) return true;
  const token = req.headers['x-admin-token'] || parseCookies(req).admin_token;
  if (!token) return false;
  return adminTokens.has(token);
};

const requireAdmin = (req, res) => {
  if (!isAdminAuthenticated(req)) {
    sendJson(res, 401, wrapError('Unauthorized', 'Admin auth required'));
    return false;
  }
  return true;
};

const appendLog = (filePath, entry) => {
  ensureDir(path.dirname(filePath));
  const logs = readJson(filePath, []);
  logs.unshift(entry);
  const next = logs.slice(0, 500);
  writeJson(filePath, next);
};

const scanFunctions = () => {
  ensureDir(FUNCTIONS_DIR);
  const files = fs.readdirSync(FUNCTIONS_DIR).filter((file) => file.endsWith('.js') || file.endsWith('.ts'));
  return files.map((file) => ({
    name: path.basename(file, path.extname(file)),
    file: path.join(FUNCTIONS_DIR, file),
  }));
};

const loadFunction = async (name) => {
  const functions = scanFunctions();
  const entry = functions.find((fn) => fn.name === name);
  if (!entry) return null;

  const fullPath = entry.file;
  delete require.cache[fullPath];

  try {
    const mod = require(fullPath);
    return mod.main || (mod.default && mod.default.main) || mod.default || null;
  } catch (err) {
    if (err.code === 'ERR_REQUIRE_ESM' || /Unexpected token 'export'/.test(err.message)) {
      const fileUrl = require('url').pathToFileURL(fullPath).href;
      const mod = await import(`${fileUrl}?v=${Date.now()}`);
      return mod.main || (mod.default && mod.default.main) || mod.default || null;
    }
    throw err;
  }
};

const buildContext = (req, body) => {
  const settings = getSettings();
  const clientIp = getClientIp(req);
  const openid = req.headers['x-openid'] || settings.defaultOpenId || DEFAULT_SETTINGS.defaultOpenId;
  return {
    OPENID: openid,
    APPID: settings.appId || DEFAULT_SETTINGS.appId,
    ENV: settings.env || DEFAULT_SETTINGS.env,
    CLIENT_IP: clientIp,
    REQ_ID: generateId(),
    ...body?.context,
  };
};

const handleFunctionInvoke = async (name, req, body, meta) => {
  const handler = await loadFunction(name);
  if (!handler) {
    return {
      result: wrapError('FunctionNotFound', `Function ${name} not found`, meta),
      errMsg: 'cloud.callFunction:fail',
      error: `Function ${name} not found`,
    };
  }

  const context = buildContext(req, body);
  const event = body?.data || {};

  const start = Date.now();
  try {
    const result = await handler(event, context);
    const rt = Date.now() - start;
    appendLog(LOGS_FUNCTIONS_PATH, {
      _id: generateId(),
      type: 'functions',
      name,
      event,
      context,
      rt,
      success: true,
      createdAt: nowIso(),
      resultSummary: JSON.stringify(result).slice(0, 500),
    });
    return { result: result === undefined ? null : result, errMsg: 'cloud.callFunction:ok' };
  } catch (err) {
    const rt = Date.now() - start;
    appendLog(LOGS_FUNCTIONS_PATH, {
      _id: generateId(),
      type: 'functions',
      name,
      event,
      context,
      rt,
      success: false,
      error: err.stack || err.message,
      createdAt: nowIso(),
    });
    return { result: wrapError('FunctionError', err.message, meta), errMsg: 'cloud.callFunction:fail' };
  }
};

const handleDbApi = async (req, res, meta) => {
  if (isApiAuthRequired() && !requireAdmin(req, res)) return;

  const app = getCloudAppSafe(res, meta);
  if (!app) return;

  const db = app.database();
  const _ = db.command;
  const url = new URL(req.url, `http://${req.headers.host}`);
  const parts = url.pathname.split('/').filter(Boolean);
  const collection = parts[1];
  const itemId = parts[2];

  if (!collection) {
    return sendJson(res, 404, wrapError('NotFound', 'Collection not specified', meta));
  }

  if (req.method === 'GET' && !itemId) {
    const page = Number(url.searchParams.get('page') || 1);
    const pageSize = Number(url.searchParams.get('pageSize') || 20);
    const q = String(url.searchParams.get('q') || '').trim();
    let query = db.collection(collection);
    if (q) {
      const reg = db.RegExp({ regexp: q, options: 'i' });
      query = query.where(_.or([{ title: reg }, { name: reg }, { goodsName: reg }, { spuId: reg }]));
    }
    const totalRes = await query.count();
    const resData = await query.skip((page - 1) * pageSize).limit(pageSize).get();
    return sendJson(
      res,
      200,
      wrapSuccess(
        {
          list: resData.data || [],
          page,
          pageSize,
          total: totalRes.total || 0,
        },
        meta,
      ),
    );
  }

  if (req.method === 'GET' && itemId) {
    const resData = await db.collection(collection).doc(itemId).get().catch(() => null);
    return sendJson(res, 200, wrapSuccess(resData ? resData.data : null, meta));
  }

  if (req.method === 'POST') {
    const body = await parseBody(req);
    const doc = ensureDoc(body || {});
    const addRes = await db.collection(collection).add({ data: doc });
    return sendJson(res, 200, wrapSuccess({ ...doc, _id: addRes._id }, meta));
  }

  if (req.method === 'PUT' && itemId) {
    const body = await parseBody(req);
    const existing = await db.collection(collection).doc(itemId).get().catch(() => null);
    const createdAt = existing?.data?.createdAt || nowIso();
    const next = {
      ...(existing?.data || {}),
      ...(body || {}),
      createdAt,
      updatedAt: nowIso(),
    };
    await db.collection(collection).doc(itemId).set({ data: next });
    return sendJson(res, 200, wrapSuccess(next, meta));
  }

  if (req.method === 'DELETE' && itemId) {
    await db.collection(collection).doc(itemId).remove();
    return sendJson(res, 200, wrapSuccess(true, meta));
  }

  return sendJson(res, 405, wrapError('MethodNotAllowed', 'Unsupported method', meta));
};

const handleStorageApi = async (req, res, meta) => {
  if (isApiAuthRequired() && !requireAdmin(req, res)) return;

  const app = getCloudAppSafe(res, meta);
  if (!app) return;
  const db = app.database();

  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === 'POST' && url.pathname === '/storage/upload') {
    ensureDir(TMP_DIR);
    req._bodySummary = '[multipart]';
    const busboy = Busboy({ headers: req.headers });
    let uploadInfo = null;

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      let name = filename;
      let mime = mimetype;
      if (filename && typeof filename === 'object') {
        name = filename.filename;
        mime = filename.mimeType;
      }
      const safeName = `${Date.now()}_${Math.random().toString(16).slice(2)}_${name || 'upload'}`;
      const savePath = path.join(TMP_DIR, safeName);
      let size = 0;
      file.on('data', (data) => {
        size += data.length;
      });
      file.pipe(fs.createWriteStream(savePath));
      uploadInfo = {
        name: name || safeName,
        path: savePath,
        size,
        mime,
      };
    });

    busboy.on('finish', () => {
      (async () => {
        if (!uploadInfo) {
          sendJson(res, 400, wrapError('UploadFailed', 'No file received', meta));
          return;
        }
        const cloudPath = `uploads/${Date.now()}_${uploadInfo.name}`;
        const uploadRes = await app.uploadFile({
          cloudPath,
          fileContent: fs.createReadStream(uploadInfo.path),
        });
        fs.unlink(uploadInfo.path, () => {});

        const fileId = uploadRes.fileID || '';
        let tempUrl = '';
        if (fileId) {
          const urlRes = await app.getTempFileURL({ fileList: [fileId] });
          const first = urlRes.fileList && urlRes.fileList[0];
          tempUrl = (first && first.tempFileURL) || '';
        }

        await db.collection('files').add({
          data: ensureDoc({
            name: uploadInfo.name,
            fileId,
            size: uploadInfo.size,
            mime: uploadInfo.mime,
          }),
        });

        sendJson(
          res,
          200,
          wrapSuccess(
            {
              fileId,
              url: tempUrl,
              name: uploadInfo.name,
              size: uploadInfo.size,
              mime: uploadInfo.mime,
            },
            meta,
          ),
        );
      })().catch((err) => {
        sendJson(res, 500, wrapError('UploadFailed', err.message, meta));
      });
    });

    req.pipe(busboy);
    return;
  }

  if (req.method === 'GET' && url.pathname === '/storage/list') {
    const prefix = url.searchParams.get('prefix') || '';
    const reg = prefix ? db.RegExp({ regexp: prefix, options: 'i' }) : null;
    let query = db.collection('files');
    if (reg) {
      query = query.where({ name: reg });
    }
    const resData = await query.orderBy('createdAt', 'desc').limit(100).get();
    const list = resData.data || [];
    const fileIds = list.map((item) => item.fileId).filter(Boolean);
    let urlMap = {};
    if (fileIds.length) {
      const urlRes = await app.getTempFileURL({ fileList: Array.from(new Set(fileIds)) });
      urlMap = (urlRes.fileList || []).reduce((acc, item) => {
        acc[item.fileID] = item.tempFileURL || '';
        return acc;
      }, {});
    }
    const output = list.map((item) => ({
      name: item.name,
      fileId: item.fileId,
      url: urlMap[item.fileId] || '',
    }));
    return sendJson(res, 200, wrapSuccess({ list: output }, meta));
  }

  if (req.method === 'DELETE' && url.pathname === '/storage/item') {
    const fileId = url.searchParams.get('fileId');
    const targetName = url.searchParams.get('path') || url.searchParams.get('name');
    if (!fileId && !targetName) {
      return sendJson(res, 400, wrapError('InvalidPath', 'Missing fileId', meta));
    }
    const query = fileId
      ? db.collection('files').where({ fileId })
      : db.collection('files').where({ name: targetName });
    const resData = await query.limit(1).get();
    const record = resData.data && resData.data[0];
    if (!record || !record.fileId) {
      return sendJson(res, 404, wrapError('NotFound', 'File not found', meta));
    }
    await app.deleteFile({ fileList: [record.fileId] });
    await db.collection('files').doc(record._id).remove();
    return sendJson(res, 200, wrapSuccess(true, meta));
  }

  return sendJson(res, 404, wrapError('NotFound', 'Storage API not found', meta));
};

const handleLogsApi = async (req, res, meta) => {
  if (isApiAuthRequired() && !requireAdmin(req, res)) return;

  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === 'GET' && url.pathname === '/logs') {
    const type = url.searchParams.get('type') || 'functions';
    const limit = Number(url.searchParams.get('limit') || 100);
    const cursor = Number(url.searchParams.get('cursor') || 0);
    const name = url.searchParams.get('name');

    const filePath = type === 'http' ? LOGS_HTTP_PATH : LOGS_FUNCTIONS_PATH;
    const logs = readJson(filePath, []);
    const filtered = name ? logs.filter((entry) => entry.name === name) : logs;
    const slice = filtered.slice(cursor, cursor + limit);
    const nextCursor = cursor + slice.length;

    return sendJson(res, 200, wrapSuccess({ list: slice, nextCursor }, meta));
  }

  if (req.method === 'GET' && url.pathname.startsWith('/logs/')) {
    const id = url.pathname.replace('/logs/', '');
    const files = [LOGS_FUNCTIONS_PATH, LOGS_HTTP_PATH];
    for (const file of files) {
      const logs = readJson(file, []);
      const entry = logs.find((item) => item._id === id);
      if (entry) return sendJson(res, 200, wrapSuccess(entry, meta));
    }
    return sendJson(res, 404, wrapError('NotFound', 'Log not found', meta));
  }

  return sendJson(res, 404, wrapError('NotFound', 'Logs API not found', meta));
};

const handleSettingsApi = async (req, res, meta) => {
  if (!requireAdmin(req, res)) return;

  if (req.method === 'GET') {
    return sendJson(res, 200, wrapSuccess(getSettings(), meta));
  }

  if (req.method === 'PUT') {
    const body = await parseBody(req);
    const next = saveSettings({ ...getSettings(), ...(body || {}) });
    return sendJson(res, 200, wrapSuccess(next, meta));
  }

  return sendJson(res, 405, wrapError('MethodNotAllowed', 'Unsupported method', meta));
};

const toNumber = (value, fallback = null) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const mapTempUrls = async (app, fileIds = []) => {
  const unique = Array.from(new Set(fileIds.filter(Boolean)));
  if (!unique.length) return {};
  const urlRes = await app.getTempFileURL({ fileList: unique });
  return (urlRes.fileList || []).reduce((acc, item) => {
    acc[item.fileID] = item.tempFileURL || '';
    return acc;
  }, {});
};

const normalizeProductForSave = async (db, product = {}) => {
  const now = nowIso();
  const title = String(product.title || product.name || product.goodsName || '').trim();
  const price = toNumber(product.price);
  const stock = toNumber(product.stock);
  if (!title) throw new Error('TITLE_REQUIRED');
  if (price === null) throw new Error('PRICE_REQUIRED');
  if (stock === null) throw new Error('STOCK_REQUIRED');

  const data = {
    ...product,
    title,
    subTitle: product.subTitle || '',
    status: product.status === 'OFF' ? 'OFF' : 'ON',
    price,
    linePrice: toNumber(product.linePrice, price),
    stock,
    spuId: product.spuId ? String(product.spuId) : String(Date.now()),
    skuId: product.skuId ? String(product.skuId) : String(product.spuId || Date.now()),
    coverFileId: product.coverFileId || '',
    galleryFileIds: Array.isArray(product.galleryFileIds) ? product.galleryFileIds : [],
    detailBlocks: Array.isArray(product.detailBlocks) ? product.detailBlocks : [],
    updatedAt: now,
  };

  if (data._id) {
    const existing = await db.collection('products').doc(data._id).get().catch(() => null);
    data.createdAt = existing?.data?.createdAt || now;
  } else {
    data.createdAt = now;
  }

  return data;
};

const handleAdminApi = async (req, res, meta) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === '/admin/api/login' && req.method === 'POST') {
    const body = await parseBody(req);
    const password = body.password || '';
    if (password !== getAdminPassword()) {
      return sendJson(res, 401, wrapError('Unauthorized', 'Invalid password', meta));
    }
    const token = generateId();
    adminTokens.add(token);
    res.setHeader('Set-Cookie', `admin_token=${encodeURIComponent(token)}; Path=/; HttpOnly`);
    return sendJson(res, 200, wrapSuccess({ token }, meta));
  }

  if (url.pathname === '/admin/api/functions' && req.method === 'GET') {
    if (!requireAdmin(req, res)) return;
    const functions = scanFunctions().map((fn) => fn.name);
    return sendJson(res, 200, wrapSuccess({ functions }, meta));
  }

  if (url.pathname === '/admin/api/products' && req.method === 'GET') {
    if (!requireAdmin(req, res)) return;
    const app = getCloudAppSafe(res, meta);
    if (!app) return;
    const db = app.database();
    const _ = db.command;
    const q = String(url.searchParams.get('q') || '').trim();
    const status = url.searchParams.get('status');
    const page = Number(url.searchParams.get('page') || 1);
    const pageSize = Number(url.searchParams.get('pageSize') || 50);

    const conditions = [];
    if (status === 'ON' || status === 'OFF') {
      conditions.push({ status });
    }
    if (q) {
      const reg = db.RegExp({ regexp: q, options: 'i' });
      conditions.push(_.or([{ title: reg }, { name: reg }, { goodsName: reg }]));
    }
    const whereClause = conditions.length ? _.and(conditions) : {};

    const query = db.collection('products').where(whereClause);
    const totalRes = await query.count();
    const resData = await query
      .orderBy('updatedAt', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get();
    const list = resData.data || [];
    const coverIds = list.map((item) => item.coverFileId).filter(Boolean);
    const urlMap = await mapTempUrls(app, coverIds);

    return sendJson(
      res,
      200,
      wrapSuccess(
        {
          list: list.map((item) => ({
            _id: item._id,
            title: item.title || item.name || item.goodsName || '',
            status: item.status || 'ON',
            price: item.price || 0,
            linePrice: item.linePrice || 0,
            stock: item.stock || 0,
            coverFileId: item.coverFileId || '',
            coverUrl: urlMap[item.coverFileId] || '',
            updatedAt: item.updatedAt || '',
          })),
          total: totalRes.total || 0,
          page,
          pageSize,
        },
        meta,
      ),
    );
  }

  if (url.pathname === '/admin/api/products' && req.method === 'POST') {
    if (!requireAdmin(req, res)) return;
    const app = getCloudAppSafe(res, meta);
    if (!app) return;
    const db = app.database();
    const body = await parseBody(req);
    const product = body.product || body;
    const data = await normalizeProductForSave(db, product);
    if (data._id) {
      const id = String(data._id);
      delete data._id;
      await db.collection('products').doc(id).set({ data });
      return sendJson(res, 200, wrapSuccess({ id }, meta));
    }
    const addRes = await db.collection('products').add({ data });
    return sendJson(res, 200, wrapSuccess({ id: addRes._id }, meta));
  }

  if (url.pathname.startsWith('/admin/api/products/') && req.method === 'GET') {
    if (!requireAdmin(req, res)) return;
    const app = getCloudAppSafe(res, meta);
    if (!app) return;
    const db = app.database();
    const id = url.pathname.replace('/admin/api/products/', '');
    const resData = await db.collection('products').doc(id).get().catch(() => null);
    if (!resData) return sendJson(res, 404, wrapError('NotFound', 'Product not found', meta));
    const product = resData.data || {};
    const fileIds = [
      product.coverFileId,
      ...(Array.isArray(product.galleryFileIds) ? product.galleryFileIds : []),
      ...(Array.isArray(product.detailBlocks)
        ? product.detailBlocks.filter((b) => b && b.type === 'image').map((b) => b.fileId)
        : []),
    ].filter(Boolean);
    const urlMap = await mapTempUrls(app, fileIds);
    return sendJson(
      res,
      200,
      wrapSuccess(
        {
          ...product,
          coverUrl: urlMap[product.coverFileId] || '',
          galleryUrls: (product.galleryFileIds || []).map((id) => urlMap[id] || ''),
          detailBlocks: (product.detailBlocks || []).map((block) => {
            if (block && block.type === 'image') {
              return { ...block, url: urlMap[block.fileId] || '' };
            }
            return block;
          }),
        },
        meta,
      ),
    );
  }

  if (url.pathname.startsWith('/admin/api/products/') && req.method === 'DELETE') {
    if (!requireAdmin(req, res)) return;
    const app = getCloudAppSafe(res, meta);
    if (!app) return;
    const db = app.database();
    const id = url.pathname.replace('/admin/api/products/', '');
    await db.collection('products').doc(id).remove();
    return sendJson(res, 200, wrapSuccess({ success: true }, meta));
  }

  if (url.pathname.startsWith('/admin/api/functions/') && req.method === 'POST') {
    if (!requireAdmin(req, res)) return;
    const name = url.pathname.replace('/admin/api/functions/', '');
    const body = await parseBody(req);
    const result = await handleFunctionInvoke(name, req, { data: body }, meta);
    return sendJson(res, 200, wrapSuccess(result, meta));
  }

  return sendJson(res, 404, wrapError('NotFound', 'Admin API not found', meta));
};

const logHttpRequest = (req, res, startTime) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const duration = Date.now() - startTime;
  appendLog(LOGS_HTTP_PATH, {
    _id: generateId(),
    type: 'http',
    method: req.method,
    path: url.pathname,
    query: Object.fromEntries(url.searchParams.entries()),
    bodySummary: req._bodySummary || null,
    status: res.statusCode,
    rt: duration,
    responseSize: res._bodySize || 0,
    createdAt: nowIso(),
  });
};

const server = http.createServer(async (req, res) => {
  const startTime = Date.now();
  res.on('finish', () => logHttpRequest(req, res, startTime));

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-admin-token, x-openid',
    });
    res.end();
    return;
  }

  const meta = { requestId: generateId(), clientIp: getClientIp(req) };

  if (req.url.startsWith('/admin/api/')) {
    return handleAdminApi(req, res, meta);
  }

  if (req.url === '/admin' || req.url.startsWith('/admin/')) {
    return serveStatic(req, res, ADMIN_DIR, '/admin');
  }

  if (req.url.startsWith('/db/')) {
    return handleDbApi(req, res, meta);
  }

  if (req.url.startsWith('/storage')) {
    return handleStorageApi(req, res, meta);
  }

  if (req.url.startsWith('/logs')) {
    return handleLogsApi(req, res, meta);
  }

  if (req.url.startsWith('/settings')) {
    return handleSettingsApi(req, res, meta);
  }

  if (req.url.startsWith('/cloudfunctions/') && req.method === 'POST') {
    const name = req.url.replace('/cloudfunctions/', '').split('?')[0];
    const body = await parseBody(req);
    const result = await handleFunctionInvoke(name, req, body, meta);
    return sendJson(res, 200, { result: result.result, errMsg: result.errMsg });
  }

  sendText(res, 404, 'Not Found');
});

ensureSeedCloud();
ensureDir(TMP_DIR);
ensureDir(FUNCTIONS_DIR);

server.listen(PORT, () => {
  console.log(`Mock cloud server running at http://127.0.0.1:${PORT}`);
  console.log(`Admin console at http://127.0.0.1:${PORT}/admin`);
});
