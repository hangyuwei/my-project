const {
  readDb,
  ensureArray,
  toNumber,
  normalizeStatusValue,
  normalizeOrderStatus,
  resolveStatusName,
} = require('./_helpers');

exports.main = async (event = {}) => {
  const db = readDb();
  const list = ensureArray(db.orders).filter(
    (order) => (Array.isArray(order.orderItemVOs) && order.orderItemVOs.length) || (Array.isArray(order.items) && order.items.length),
  );
  if (!list.length) return {};
  const param = event.parameter || {};
  const orderStatus = param.orderStatus ?? event.orderStatus;
  const normalizedFilter = normalizeStatusValue(orderStatus);
  const pageNum = toNumber(param.pageNum || event.pageNum || 1, 1);
  const pageSize = toNumber(param.pageSize || event.pageSize || 10, 10);

  let orders = list;
  if (normalizedFilter !== null && normalizedFilter > -1) {
    orders = orders.filter((item) => normalizeOrderStatus(item) === normalizedFilter);
  }

  const totalCount = orders.length;
  const start = (pageNum - 1) * pageSize;
  const mappedOrders = orders.map((order) => {
    const normalizedStatus = normalizeOrderStatus(order);
    if (normalizedStatus === null) return order;
    return {
      ...order,
      orderStatus: normalizedStatus,
      orderStatusName: resolveStatusName(order, normalizedStatus),
    };
  });
  return {
    pageNum,
    pageSize,
    totalCount,
    orders: mappedOrders.slice(start, start + pageSize),
  };
};
