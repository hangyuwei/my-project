import { config } from '../../config/index';
import { findLocalOrder, getLocalOrders } from './localOrders';
import { callCloudFunction } from '../_utils/cloud';
import { shouldMock } from '../_utils/shouldMock';
import { adaptBusinessTime, adaptOrderDetail } from '../../model/order/orderDetail';

/** 获取订单详情mock数据 */
function mockFetchOrderDetail(params) {
  const { delay } = require('../_utils/delay');
  const { genOrderDetail } = require('../../model/order/orderDetail');

  return delay().then(() => genOrderDetail(params));
}

/** 获取订单详情数据 */
export function fetchOrderDetail(params) {
  if (shouldMock('order.fetchOrderDetail')) {
    const localOrder = findLocalOrder(params?.parameter);
    if (localOrder) {
      return Promise.resolve({ data: localOrder });
    }
    return mockFetchOrderDetail(params);
  }
  const localOrders = getLocalOrders ? getLocalOrders() : [];
  return callCloudFunction('getOrderDetail', { ...(params || {}), localOrders }).then((real) =>
    adaptOrderDetail(real, params),
  );
}

/** 获取客服mock数据 */
function mockFetchBusinessTime(params) {
  const { delay } = require('../_utils/delay');
  const { genBusinessTime } = require('../../model/order/orderDetail');

  return delay().then(() => genBusinessTime(params));
}

/** 获取客服数据 */
export function fetchBusinessTime(params) {
  if (shouldMock('order.fetchBusinessTime')) {
    return mockFetchBusinessTime(params);
  }
  return callCloudFunction('getBusinessTime', params || {}).then((real) => adaptBusinessTime(real));
}
