import { callCloudFunction } from '../_utils/cloud';
import { adaptBusinessTime, adaptOrderDetail } from '../../model/order/orderDetail';
import { findLocalOrder } from './localOrders';

/** 获取订单详情数据 */
export function fetchOrderDetail(params) {
  const orderNo = params?.parameter || params?.orderNo || params;

  // 优先使用本地存储的订单数据
  const localOrder = findLocalOrder(orderNo);
  if (localOrder) {
    return Promise.resolve({
      success: true,
      data: localOrder,
    });
  }

  // 本地没有找到，尝试从云端获取
  return callCloudFunction('getOrderDetail', { orderNo }).then((real) => adaptOrderDetail(real, params));
}

/** 获取客服数据 */
export function fetchBusinessTime(params) {
  return callCloudFunction('getBusinessTime', params || {}).then((real) => adaptBusinessTime(real));
}
