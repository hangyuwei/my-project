import { config } from '../../config/index';
import { getLocalOrders } from './localOrders';
import { callCloudFunction } from '../_utils/cloud';
import { shouldMock } from '../_utils/shouldMock';
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

/** 获取订单列表mock数据 */
function mockFetchOrders(params) {
  const { delay } = require('../_utils/delay');
  const { genOrders } = require('../../model/order/orderList');

  return delay(200).then(() => {
    const pageNum = params?.parameter?.pageNum || 1;
    const pageSize = params?.parameter?.pageSize || 10;
    const orderStatus = params?.parameter?.orderStatus;

    const baseResp = genOrders({
      parameter: {
        pageNum: 1,
        pageSize: 9999,
        orderStatus,
      },
    });

    let orders = baseResp.data.orders || [];
    let localOrders = getLocalOrders();
    if (orderStatus !== undefined && orderStatus > -1) {
      localOrders = localOrders.filter((order) => order.orderStatus === orderStatus);
    }

    orders = localOrders.concat(orders);
    const totalCount = orders.length;
    const start = (pageNum - 1) * pageSize;
    const end = start + pageSize;

    return {
      ...baseResp,
      data: {
        ...baseResp.data,
        pageNum,
        pageSize,
        totalCount,
        orders: orders.slice(start, end),
      },
    };
  });
}

/** 获取订单列表数据 */
export function fetchOrders(params) {
  if (shouldMock('order.fetchOrders')) {
    return mockFetchOrders(params);
  }
  const localOrders = getLocalOrders();
  console.log('[order-list] fetchOrders params:', params);
  console.log('[order-list] local cache size:', localOrders.length);
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
      if (localOrders && localOrders.length) {
        console.warn('[order-list] fallback to local cache:', localOrders.length);
        return buildLocalOrdersResponse(localOrders, params);
      }
      return Promise.reject(error);
    });
}

/** 获取订单列表mock数据 */
function mockFetchOrdersCount(params) {
  const { delay } = require('../_utils/delay');
  const { genOrdersCount } = require('../../model/order/orderList');

  return delay().then(() => {
    const baseResp = genOrdersCount(params);
    const localOrders = getLocalOrders();
    if (!localOrders.length) return baseResp;

    const countMap = localOrders.reduce((acc, order) => {
      acc[order.orderStatus] = (acc[order.orderStatus] || 0) + 1;
      return acc;
    }, {});

    baseResp.data.forEach((tab) => {
      tab.orderNum = (tab.orderNum || 0) + (countMap[tab.tabType] || 0);
    });

    return baseResp;
  });
}

/** 获取订单列表统计 */
export function fetchOrdersCount(params) {
  if (shouldMock('order.fetchOrdersCount')) {
    return mockFetchOrdersCount(params);
  }
  const localOrders = getLocalOrders();
  console.log('[order-count] fetchOrdersCount params:', params);
  console.log('[order-count] local cache size:', localOrders.length);
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
      if (localOrders && localOrders.length) {
        console.warn('[order-count] fallback to local cache:', localOrders.length);
        return buildLocalCountResponse(localOrders);
      }
      return Promise.reject(error);
    });
}
