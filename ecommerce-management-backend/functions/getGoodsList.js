const { readDb, ensureArray, toNumber } = require('./_helpers');

exports.main = async (event = {}) => {
  const db = readDb();
  const list = ensureArray(db.products);
  const pageIndex = toNumber(event.pageIndex || event.pageNum || 1, 1);
  const pageSize = toNumber(event.pageSize || 20, 20);
  const start = (pageIndex - 1) * pageSize;
  return list.slice(start, start + pageSize);
};
