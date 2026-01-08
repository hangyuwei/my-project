import { config } from '../../config/index';
import { callCloudFunction } from '../_utils/cloud';
import { shouldMock } from '../_utils/shouldMock';
import { adaptGoodsDetailsComments, adaptGoodsDetailsCommentsCount } from '../../model/detailsComments';

/** 获取商品详情页评论数 */
function mockFetchGoodDetailsCommentsCount(spuId = 0) {
  const { delay } = require('../_utils/delay');
  const {
    getGoodsDetailsCommentsCount,
  } = require('../../model/detailsComments');
  return delay().then(() => getGoodsDetailsCommentsCount(spuId));
}

/** 获取商品详情页评论数 */
export function getGoodsDetailsCommentsCount(spuId = 0) {
  if (shouldMock('good.getGoodsDetailsCommentsCount')) {
    return mockFetchGoodDetailsCommentsCount(spuId);
  }
  return callCloudFunction('getGoodsDetailsCommentsCount', { spuId }).then((real) =>
    adaptGoodsDetailsCommentsCount(real),
  );
}

/** 获取商品详情页评论 */
function mockFetchGoodDetailsCommentList(spuId = 0) {
  const { delay } = require('../_utils/delay');
  const { getGoodsDetailsComments } = require('../../model/detailsComments');
  return delay().then(() => getGoodsDetailsComments(spuId));
}

/** 获取商品详情页评论 */
export function getGoodsDetailsCommentList(spuId = 0) {
  if (shouldMock('good.getGoodsDetailsCommentList')) {
    return mockFetchGoodDetailsCommentList(spuId);
  }
  return callCloudFunction('getGoodsDetailsCommentList', { spuId }).then((real) =>
    adaptGoodsDetailsComments(real),
  );
}
