import { config } from '../../config/index';
import { getLocalOrders } from './localOrders';
import { callCloudFunction } from '../_utils/cloud';
import { shouldMock } from '../_utils/shouldMock';
import { adaptOrders, adaptOrdersCount } from '../../model/order/orderList';

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
  return callCloudFunction('getOrderList', { ...(params || {}), localOrders }).then((real) => {
    const adapted = adaptOrders(real, params);
    if (!localOrders.length || !adapted?.data?.orders) return adapted;

    const orderStatus = params?.parameter?.orderStatus;
    let orders = localOrders;
    if (orderStatus !== undefined && orderStatus > -1) {
      orders = orders.filter((order) => order.orderStatus === orderStatus);
    }
    orders = orders.concat(adapted.data.orders || []);
    const pageNum = params?.parameter?.pageNum || 1;
    const pageSize = params?.parameter?.pageSize || 10;
    const start = (pageNum - 1) * pageSize;
    const end = start + pageSize;

    return {
      ...adapted,
      data: {
        ...adapted.data,
        pageNum,
        pageSize,
        totalCount: orders.length,
        orders: orders.slice(start, end),
      },
    };
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
  return callCloudFunction('getOrderCount', { ...(params || {}), localOrders }).then((real) => {
    const adapted = adaptOrdersCount(real);
    if (!localOrders.length || !adapted?.data) return adapted;
    const countMap = localOrders.reduce((acc, order) => {
      acc[order.orderStatus] = (acc[order.orderStatus] || 0) + 1;
      return acc;
    }, {});
    adapted.data.forEach((tab) => {
      tab.orderNum = (tab.orderNum || 0) + (countMap[tab.tabType] || 0);
    });
    return adapted;
  });
}
