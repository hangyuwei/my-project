import { callCloudFunction } from '../_utils/cloud';
import { adaptOrders, adaptOrdersCount } from '../../model/order/orderList';

const buildLocalOrdersResponse = (localOrders = [], params = {}) => {
  const { parameter = {} } = params || {};
  const { pageNum = 1, pageSize = 10, orderStatus } = parameter;

  let filteredOrders = localOrders;
  if (orderStatus !== undefined && orderStatus !== -1) {
    filteredOrders = localOrders.filter((order) => order.orderStatus === orderStatus);
  }

  const startIndex = (pageNum - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pagedOrders = filteredOrders.slice(startIndex, endIndex);

  return {
    success: true,
    data: {
      pageNum,
      pageSize,
      totalCount: filteredOrders.length,
      orders: pagedOrders,
    },
  };
};

const buildLocalCountResponse = (localOrders = []) => {
  const statusList = [
    { tabType: 5, name: 'PendingPay' },
    { tabType: 10, name: 'PendingShip' },
    { tabType: 40, name: 'PendingReceive' },
    { tabType: 50, name: 'Completed' },
  ];

  const counts = statusList.map((status) => {
    const orderNum = localOrders.filter((order) => order.orderStatus === status.tabType).length;
    return {
      tabType: status.tabType,
      orderNum,
    };
  });

  return {
    success: true,
    data: counts,
  };
};

/** fetch order list */
export function fetchOrders(params) {
  console.log('[order-list] fetchOrders params:', params);
  return callCloudFunction('getOrderList', params || {})
    .then((real) => {
      const adapted = adaptOrders(real, params);
      const orders = adapted?.data?.orders || [];

      console.log('[order-list] cloud response:', {
        success: real?.success,
        code: real?.code,
        ordersCount: orders.length,
        totalCount: adapted?.data?.totalCount,
      });

      return adapted;
    })
    .catch((error) => {
      console.error('[order-list] cloud request failed:', error);
      return buildLocalOrdersResponse([], params);
    });
}

/** fetch order counts */
export function fetchOrdersCount(params) {
  console.log('[order-count] fetchOrdersCount params:', params);
  return callCloudFunction('getOrderCount', params || {})
    .then((real) => {
      const adapted = adaptOrdersCount(real);
      const counts = adapted?.data || [];

      console.log('[order-count] cloud response:', {
        success: real?.success,
        code: real?.code,
        countSize: counts.length,
      });

      return adapted;
    })
    .catch((error) => {
      console.error('[order-count] cloud request failed:', error);
      return buildLocalCountResponse([]);
    });
}