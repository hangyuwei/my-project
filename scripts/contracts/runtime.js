const path = require('path');

const registerEsbuild = () => {
  // Lazy register so scripts can run without global side effects.
  const { register } = require('esbuild-register/dist/node');
  register({ extensions: ['.js'] });
};

const storage = new Map();

const ensureStorageKey = (key) => (key === undefined || key === null ? '' : String(key));

const createRequest = (options = {}) => {
  const url = options.url || '';
  const method = (options.method || 'GET').toUpperCase();
  const data = options.data || null;
  const header = options.header || {};

  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error('wx.request missing url'));
      return;
    }

    const isHttps = url.startsWith('https://');
    const lib = isHttps ? require('https') : require('http');
    const parsed = new URL(url);

    const payload = data ? JSON.stringify(data) : null;
    const req = lib.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || (isHttps ? 443 : 80),
        path: parsed.pathname + parsed.search,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
          ...header,
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          let parsedBody = body;
          try {
            parsedBody = JSON.parse(body);
          } catch (err) {
            // keep raw
          }
          resolve({ statusCode: res.statusCode, data: parsedBody });
        });
      },
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
};

const initWx = ({ enableRequest } = {}) => {
  global.wx = {
    getStorageSync(key) {
      return storage.get(ensureStorageKey(key));
    },
    setStorageSync(key, value) {
      storage.set(ensureStorageKey(key), value);
    },
    removeStorageSync(key) {
      storage.delete(ensureStorageKey(key));
    },
    request(options) {
      if (!enableRequest) {
        if (options?.fail) options.fail(new Error('wx.request disabled'));
        return;
      }
      createRequest(options)
        .then((res) => options?.success && options.success(res))
        .catch((err) => options?.fail && options.fail(err));
    },
  };

  return global.wx;
};

const getConfig = () => {
  const configPath = path.join(process.cwd(), 'config', 'index.js');
  return require(configPath).config;
};

const loadService = (modulePath) => {
  const fullPath = path.join(process.cwd(), modulePath);
  return require(fullPath);
};

module.exports = {
  registerEsbuild,
  initWx,
  getConfig,
  loadService,
};
