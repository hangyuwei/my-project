const { readDb, ensureArray, toNumber } = require('./_helpers');

exports.main = async (event = {}) => {
  const db = readDb();
  const list = ensureArray(db.products);
  // pageIndex starts at 0; 0 means the first page.
  const pageIndex = Math.max(0, toNumber(event.pageIndex || event.pageNum, 0));
  const pageSize = toNumber(event.pageSize || 20, 20);
  const start = pageIndex * pageSize;
  const result = list.slice(start, start + pageSize);

  return {
    list: result,
    pageNum: pageIndex,
    pageSize,
    totalCount: list.length,
  };
};
