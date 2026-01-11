const fs = require('fs');
const path = require('path');
const { contracts } = require('./definitions');
const { registerEsbuild, initWx, getConfig, loadService } = require('./runtime');

const GLOBAL_IGNORE_KEYS = ['requestId', 'clientIp', 'rt'];

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const readJson = (filePath) => {
  const raw = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(raw);
};

const writeJson = (filePath, data) => {
  const payload = data === undefined ? null : data;
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
};

const isPromise = (value) => value && typeof value.then === 'function';

const shouldIgnorePath = (pathParts, ignoreKeys = []) => {
  const pathStr = pathParts.join('.');
  return ignoreKeys.some((key) => key === pathStr || key === pathParts[pathParts.length - 1]);
};

const diffValues = (expected, actual, pathParts, diffs, ignoreKeys) => {
  if (shouldIgnorePath(pathParts, ignoreKeys)) return;

  if (expected === actual) return;

  const expectedType = Array.isArray(expected) ? 'array' : typeof expected;
  const actualType = Array.isArray(actual) ? 'array' : typeof actual;

  if (expectedType !== actualType) {
    diffs.push({ path: pathParts.join('.'), expectedType, actualType, expected, actual });
    return;
  }

  if (expectedType === 'array') {
    if (expected.length !== actual.length) {
      diffs.push({
        path: pathParts.join('.'),
        expectedType,
        actualType,
        expected: expected.length,
        actual: actual.length,
        note: 'array length mismatch',
      });
    }
    const max = Math.min(expected.length, actual.length);
    for (let i = 0; i < max; i += 1) {
      diffValues(expected[i], actual[i], pathParts.concat(String(i)), diffs, ignoreKeys);
    }
    return;
  }

  if (expectedType === 'object' && expected && actual) {
    const expectedKeys = Object.keys(expected);
    const actualKeys = Object.keys(actual);

    expectedKeys.forEach((key) => {
      diffValues(expected[key], actual[key], pathParts.concat(key), diffs, ignoreKeys);
    });

    actualKeys.forEach((key) => {
      if (!(key in expected) && !shouldIgnorePath(pathParts.concat(key), ignoreKeys)) {
        diffs.push({
          path: pathParts.concat(key).join('.'),
          expectedType: 'missing',
          actualType: typeof actual[key],
          expected: undefined,
          actual: actual[key],
        });
      }
    });

    return;
  }

  if (expected !== actual) {
    diffs.push({ path: pathParts.join('.'), expected, actual });
  }
};

const run = async () => {
  registerEsbuild();
  initWx({ enableRequest: true });

  const config = getConfig();
  config.useMock = false;

  const snapshotDir = path.join(process.cwd(), 'contracts');
  const realDir = path.join(snapshotDir, '_real');
  ensureDir(realDir);

  const results = [];

  for (const contract of contracts) {
    const snapshotPath = path.join(snapshotDir, `${contract.id}.json`);
    if (!fs.existsSync(snapshotPath)) {
      results.push({ id: contract.id, error: 'Snapshot not found' });
      continue;
    }

    const mod = loadService(contract.modulePath);
    const fn = mod[contract.fn];
    if (typeof fn !== 'function') {
      results.push({ id: contract.id, error: 'Function not found' });
      continue;
    }

    try {
      const value = fn.apply(null, contract.args || []);
      const resolved = isPromise(value) ? await value : value;
      const snapshot = readJson(snapshotPath);

      writeJson(path.join(realDir, `${contract.id}.json`), resolved);

      const diffs = [];
      const ignoreKeys = GLOBAL_IGNORE_KEYS.concat(contract.ignoreKeys || []);
      diffValues(snapshot, resolved, [], diffs, ignoreKeys);

      results.push({ id: contract.id, ok: diffs.length === 0, diffCount: diffs.length, diffs });
    } catch (err) {
      results.push({ id: contract.id, error: err.message || String(err) });
    }
  }

  writeJson(path.join(snapshotDir, '_diff.json'), results);

  const failed = results.filter((item) => item.error || item.diffCount > 0);
  if (failed.length) {
    console.error('Contract diff failed:');
    failed.forEach((item) => {
      if (item.error) {
        console.error(`${item.id}: ${item.error}`);
      } else {
        console.error(`${item.id}: ${item.diffCount} diffs`);
      }
    });
    process.exitCode = 1;
  } else {
    console.log('All contracts match snapshots.');
  }
};

run();
