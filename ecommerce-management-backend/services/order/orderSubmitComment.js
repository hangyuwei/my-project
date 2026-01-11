import { config } from '../../config/index';
import { callCloudFunction } from '../_utils/cloud';
import { shouldMock } from '../_utils/shouldMock';
import { adaptSubmitCommentGoods } from '../../model/submitComment';

/** 获取评价商品 */
function mockGetGoods(parameter) {
  const { delay } = require('../_utils/delay');
  const { getGoods } = require('../../model/submitComment');
  const data = getGoods(parameter);

  return delay().then(() => {
    return data;
  });
}

/** 获取评价商品 */
export function getGoods(parameter) {
  if (shouldMock('order.orderSubmitCommentGoods')) {
    return mockGetGoods(parameter);
  }
  return callCloudFunction('getSubmitCommentGoods', parameter || {}).then((real) =>
    adaptSubmitCommentGoods(real),
  );
}
