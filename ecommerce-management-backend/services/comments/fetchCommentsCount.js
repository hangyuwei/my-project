import { config } from '../../config/index';
import { callCloudFunction } from '../_utils/cloud';
import { shouldMock } from '../_utils/shouldMock';
import { adaptGoodsCommentsCount } from '../../model/comments';

/** 获取商品评论数 */
function mockFetchCommentsCount(ID = 0) {
  const { delay } = require('../_utils/delay');
  const { getGoodsCommentsCount } = require('../../model/comments');
  return delay().then(() => getGoodsCommentsCount(ID));
}

/** 获取商品评论数 */
export function fetchCommentsCount(ID = 0) {
  if (shouldMock('comments.fetchCommentsCount')) {
    return mockFetchCommentsCount(ID);
  }
  return callCloudFunction('getCommentsCount', { id: ID }).then((real) =>
    adaptGoodsCommentsCount(real),
  );
}
