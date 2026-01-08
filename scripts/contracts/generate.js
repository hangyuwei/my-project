const fs = require('fs');
const path = require('path');
const { contracts } = require('./definitions');
const { registerEsbuild, initWx, getConfig, loadService } = require('./runtime');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const writeJson = (filePath, data) => {
  const payload = data === undefined ? null : data;
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
};

const isPromise = (value) => value && typeof value.then === 'function';

const run = async () => {
  registerEsbuild();
  initWx({ enableRequest: false });

  const config = getConfig();
  config.useMock = true;
  config.realServices = [];

  const outDir = path.join(process.cwd(), 'contracts');
  ensureDir(outDir);

  const results = [];

  for (const contract of contracts) {
    const mod = loadService(contract.modulePath);
    const fn = mod[contract.fn];
    if (typeof fn !== 'function') {
      results.push({ id: contract.id, error: 'Function not found' });
      continue;
    }

    try {
      const value = fn.apply(null, contract.args || []);
      const resolved = isPromise(value) ? await value : value;
      const outPath = path.join(outDir, `${contract.id}.json`);
      writeJson(outPath, resolved);
      results.push({ id: contract.id, ok: true });
    } catch (err) {
      results.push({ id: contract.id, error: err.message || String(err) });
    }
  }

  writeJson(path.join(outDir, '_summary.json'), results);
  const failed = results.filter((item) => item.error);
  if (failed.length) {
    console.error('Snapshot generation had failures:');
    failed.forEach((item) => console.error(`${item.id}: ${item.error}`));
    process.exitCode = 1;
  } else {
    console.log(`Generated ${results.length} snapshots in contracts/.`);
  }
};

run();
