const { readDb, ensureArray, findById } = require('./_helpers');

exports.main = async (event = {}) => {
  const db = readDb();
  const orderNo = event.parameter || event.orderNo || event.id;
  const order = findById(ensureArray(db.orders), orderNo);
  if (order) return order;
  const localOrders = ensureArray(event.localOrders);
  return findById(localOrders, orderNo) || null;
};
