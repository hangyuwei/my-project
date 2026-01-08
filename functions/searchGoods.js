const { readDb, ensureArray, toNumber, pickFirst } = require('./_helpers');

const normalizeKeyword = (value) => (value ? String(value).trim().toLowerCase() : '');

exports.main = async (event = {}) => {
  const db = readDb();
  const keyword = normalizeKeyword(pickFirst(event.keyword, event.key, event.search, ''));
  const minPrice = Number.isFinite(Number(event.minPrice)) ? Number(event.minPrice) : null;
  const maxPrice = Number.isFinite(Number(event.maxPrice)) ? Number(event.maxPrice) : null;
  const sort = toNumber(event.sort, 0) === 1;
  const sortType = toNumber(event.sortType, 0) === 1 ? -1 : 1;

  let list = ensureArray(db.products);
  if (keyword) {
    list = list.filter((item) => {
      const name = String(item.name || item.goodsName || item.title || '').toLowerCase();
      return name.includes(keyword);
    });
  }

  if (minPrice !== null) {
    list = list.filter((item) => Number(item.price || 0) >= minPrice);
  }
  if (maxPrice !== null) {
    list = list.filter((item) => Number(item.price || 0) <= maxPrice);
  }

  if (sort) {
    list = list.slice().sort((a, b) => (Number(a.price || 0) - Number(b.price || 0)) * sortType);
  }

  const pageNum = toNumber(event.pageNum || 1, 1);
  const pageSize = toNumber(event.pageSize || 20, 20);
  const totalCount = list.length;
  const start = (pageNum - 1) * pageSize;
  const pageList = list.slice(start, start + pageSize);

  return {
    pageNum,
    pageSize,
    totalCount,
    list: pageList,
  };
};
