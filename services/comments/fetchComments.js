import { config } from '../../config/index';
import { callCloudFunction } from '../_utils/cloud';
import { shouldMock } from '../_utils/shouldMock';
import { adaptGoodsAllComments } from '../../model/comments';

/** 获取商品评论 */
function mockFetchComments(parmas) {
  const { delay } = require('../_utils/delay');
  const { getGoodsAllComments } = require('../../model/comments');
  return delay().then(() => getGoodsAllComments(parmas));
}

/** 获取商品评论 */
export function fetchComments(parmas) {
  if (shouldMock('comments.fetchComments')) {
    return mockFetchComments(parmas);
  }
  return callCloudFunction('getComments', parmas || {}).then((real) =>
    adaptGoodsAllComments(real, parmas),
  );
}
