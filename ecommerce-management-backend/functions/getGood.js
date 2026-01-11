const { readDb, findById } = require('./_helpers');

exports.main = async (event = {}) => {
  const db = readDb();
  const id = event.id || event.spuId || event.mockId;
  const product = findById(db.products, id) || db.products[0] || null;
  return product;
};
