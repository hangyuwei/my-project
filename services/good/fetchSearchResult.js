/* eslint-disable no-param-reassign */
import { config } from '../../config/index';
import { callCloudFunction } from '../_utils/cloud';
import { shouldMock } from '../_utils/shouldMock';
import { adaptSearchResult } from '../../model/search';

/** 获取搜索历史 */
function mockSearchResult(params) {
  const { delay } = require('../_utils/delay');
  const { getSearchResult } = require('../../model/search');

  const data = getSearchResult(params);

  if (data.spuList.length) {
    data.spuList.forEach((item) => {
      const goodsName = item.goodsName || item.title;
      const skuImage = item.skuImage || item.primaryImage;
      const skuId = item.skuList && item.skuList[0] ? item.skuList[0].skuId : item.spuId;
      const stockQuantity = typeof item.spuStockQuantity === 'number'
        ? item.spuStockQuantity
        : (item.skuList && item.skuList[0] && item.skuList[0].stockInfo
          ? item.skuList[0].stockInfo.stockQuantity
          : 0);
      item.spuId = item.spuId;
      item.skuId = skuId;
      item.storeId = item.storeId || 'local';
      item.thumb = skuImage;
      item.title = goodsName;
      item.goodsName = goodsName;
      item.skuImage = skuImage;
      item.price = item.minSalePrice;
      item.originPrice = item.maxLinePrice;
      item.stockQuantity = stockQuantity;
      if (item.spuTagList) {
        item.tags = item.spuTagList.map((tag) => ({ title: tag.title }));
      } else {
        item.tags = [];
      }
    });
  }
  return delay().then(() => {
    return data;
  });
}

/** 获取搜索历史 */
export function getSearchResult(params) {
  if (shouldMock('good.getSearchResult')) {
    return mockSearchResult(params);
  }
  return callCloudFunction('searchGoods', params || {}).then((real) =>
    adaptSearchResult(real, { tagAsObject: true }),
  );
}
