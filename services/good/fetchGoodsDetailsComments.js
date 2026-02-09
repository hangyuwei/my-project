import { callCloudFunction } from '../_utils/cloud';

/** 获取商品详情页评论统计 */
export function getGoodsDetailsCommentsCount(spuId = '') {
  return callCloudFunction('getComments', { spuId: String(spuId), type: 'count' })
    .then((res) => {
      if (res && res.success && res.data) {
        return res.data;
      }
      // 返回默认值
      return {
        commentCount: 0,
        goodCount: 0,
        middleCount: 0,
        badCount: 0,
        hasImageCount: 0,
        goodRate: 100,
      };
    })
    .catch((error) => {
      console.error('[获取评价统计失败]', error);
      return {
        commentCount: 0,
        goodCount: 0,
        middleCount: 0,
        badCount: 0,
        hasImageCount: 0,
        goodRate: 100,
      };
    });
}

/** 获取商品详情页评论列表 */
export function getGoodsDetailsCommentList(spuId = '', pageNum = 1, pageSize = 10) {
  return callCloudFunction('getComments', { spuId: String(spuId), type: 'list', pageNum, pageSize })
    .then((res) => {
      if (res && res.success && res.data) {
        return res.data;
      }
      // 返回默认值
      return {
        homePageComments: [],
        totalCount: 0,
      };
    })
    .catch((error) => {
      console.error('[获取评价列表失败]', error);
      return {
        homePageComments: [],
        totalCount: 0,
      };
    });
}
