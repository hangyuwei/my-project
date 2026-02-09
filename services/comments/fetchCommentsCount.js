import { callCloudFunction } from '../_utils/cloud';
import { adaptGoodsCommentsCount } from '../../model/comments';

/** 获取商品评论数 - 直接调用云函数 */
export function fetchCommentsCount(params = {}) {
  const spuId = params.spuId || params.id || params;
  return callCloudFunction('getComments', { spuId, type: 'count' }).then((real) =>
    adaptGoodsCommentsCount(real?.data || real),
  );
}
