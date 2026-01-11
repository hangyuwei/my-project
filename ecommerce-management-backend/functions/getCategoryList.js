const { readDb, ensureArray } = require('./_helpers');

exports.main = async () => {
  const db = readDb();
  const list = ensureArray(db.categories);
  if (!list.length) return list;
  return list.map((item, index) => {
    const next = { ...item };
    if ((next.mockId === 0 || next.mockId === '0') && index === 0) {
      next.mockId = 24948;
    }
    return next;
  });
};
