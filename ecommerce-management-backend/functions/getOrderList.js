const { readDb, ensureArray, toNumber } = require('./_helpers');

exports.main = async (event = {}) => {
  const db = readDb();
  const list = ensureArray(db.orders).filter(
    (order) => (Array.isArray(order.orderItemVOs) && order.orderItemVOs.length) || (Array.isArray(order.items) && order.items.length),
  );
  if (!list.length) return {};
  const param = event.parameter || {};
  const orderStatus = param.orderStatus ?? event.orderStatus;
  const pageNum = toNumber(param.pageNum || event.pageNum || 1, 1);
  const pageSize = toNumber(param.pageSize || event.pageSize || 10, 10);

  let orders = list;
  if (orderStatus !== undefined && orderStatus !== null && Number(orderStatus) > -1) {
    orders = orders.filter((item) => Number(item.orderStatus) === Number(orderStatus));
  }

  const totalCount = orders.length;
  const start = (pageNum - 1) * pageSize;
  return {
    pageNum,
    pageSize,
    totalCount,
    orders: orders.slice(start, start + pageSize),
  };
};
