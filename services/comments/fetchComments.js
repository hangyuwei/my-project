import { callCloudFunction } from '../_utils/cloud';
import { adaptGoodsAllComments } from '../../model/comments';

/** 获取商品评论 - 直接调用云函数 */
export function fetchComments(parmas) {
  return callCloudFunction('getComments', parmas || {}).then((real) =>
    adaptGoodsAllComments(real, parmas),
  );
}
