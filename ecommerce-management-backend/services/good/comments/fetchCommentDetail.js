import { config } from '../../../config/index';
import { queryCommentDetail, adaptCommentDetail } from '../../../model/comments/queryDetail';
import { callCloudFunction } from '../../_utils/cloud';
import { shouldMock } from '../../_utils/shouldMock';
/** 获取商品评价数据 */
function mockQueryCommentDetail(params) {
  const { delay } = require('../../_utils/delay');
  const data = queryCommentDetail(params);
  return delay().then(() => {
    return data;
  });
}

/** 获取评价详情 */
export function getCommentDetail(params) {
  if (shouldMock('good.getCommentDetail')) {
    return mockQueryCommentDetail(params);
  }
  return callCloudFunction('getCommentDetail', params || {}).then((real) =>
    adaptCommentDetail(real),
  );
}
