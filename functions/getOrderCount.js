const { readDb, ensureArray, normalizeOrderStatus } = require('./_helpers');

const STATUS_LIST = [5, 10, 40, 50];

exports.main = async () => {
  const db = readDb();
  const list = ensureArray(db.orders).filter(
    (order) => (Array.isArray(order.orderItemVOs) && order.orderItemVOs.length) || (Array.isArray(order.items) && order.items.length),
  );
  if (!list.length) return {};
  const counts = list.reduce((acc, item) => {
    const status = normalizeOrderStatus(item);
    if (status !== null) {
      acc[status] = (acc[status] || 0) + 1;
    }
    return acc;
  }, {});

  return {
    list: STATUS_LIST.map((status) => ({
      status,
      count: counts[status] || 0,
    })),
  };
};
