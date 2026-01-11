import { config } from '../../config/index';
import { buildCartGroupData, getLocalCartItems } from './localCart';
import { callCloudFunction } from '../_utils/cloud';
import { shouldMock } from '../_utils/shouldMock';
import { adaptCartGroupData } from '../../model/cart';

/** 获取购物车mock数据 */
function mockFetchCartGroupData() {
  const { delay } = require('../_utils/delay');
  const localItems = getLocalCartItems();
  const data = buildCartGroupData(localItems);
  return delay().then(() => ({ data }));
}

/** 获取购物车数据 */
export function fetchCartGroupData(params) {
  if (shouldMock('cart.fetchCartGroupData')) {
    return mockFetchCartGroupData();
  }
  const localItems = getLocalCartItems();
  return callCloudFunction('getCartGroupData', { ...(params || {}), items: localItems }).then((real) =>
    adaptCartGroupData(real),
  );
}
