import { config } from '../../config/index';
import { callCloudFunction } from '../_utils/cloud';
import { shouldMock } from '../_utils/shouldMock';
import { adaptPromotion } from '../../model/promotion';

/** 获取商品列表 */
function mockFetchPromotion(ID = 0) {
  const { delay } = require('../_utils/delay');
  const { getPromotion } = require('../../model/promotion');
  return delay().then(() => getPromotion(ID));
}

/** 获取商品列表 */
export function fetchPromotion(ID = 0) {
  if (shouldMock('promotion.fetchPromotion')) {
    return mockFetchPromotion(ID);
  }
  return callCloudFunction('getPromotion', { id: ID }).then((real) => adaptPromotion(real));
}
