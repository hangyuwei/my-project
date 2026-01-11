import { getLocalGoodsRecords } from './localGoods';
import { recordToListItem } from './goodsTransform';
import { call } from '../cloud';
import { shouldMock } from '../_utils/shouldMock';
import { adaptGoodsList } from '../../model/goods';

/** ?????? */
function mockFetchGoodsList(pageIndex = 1, pageSize = 20) {
  const { delay } = require('../_utils/delay');
  const { getGoodsList } = require('../../model/goods');
  const mockList = getGoodsList(pageIndex, pageSize).map((item) => {
    const goodsName = item.goodsName || item.title;
    const skuImage = item.skuImage || item.primaryImage;
    const skuId = item.skuList && item.skuList[0] ? item.skuList[0].skuId : item.spuId;
    const stockQuantity = typeof item.spuStockQuantity === 'number'
      ? item.spuStockQuantity
      : (item.skuList && item.skuList[0] && item.skuList[0].stockInfo
        ? item.skuList[0].stockInfo.stockQuantity
        : 0);
    return {
      spuId: item.spuId,
      skuId,
      storeId: item.storeId,
      thumb: skuImage,
      title: goodsName,
      goodsName,
      skuImage,
      price: item.minSalePrice,
      originPrice: item.maxLinePrice,
      stockQuantity,
      tags: item.spuTagList.map((tag) => tag.title),
    };
  });

  const localList = pageIndex === 0
    ? getLocalGoodsRecords().filter((item) => item.isPutOnSale !== 0).map(recordToListItem)
    : [];
  const nextList = localList.concat(mockList);

  return delay().then(() => nextList);
}

/** ?????? */
export function fetchGoodsList(pageIndex = 1, pageSize = 20) {
  if (shouldMock('good.fetchGoodsList')) {
    return mockFetchGoodsList(pageIndex, pageSize);
  }
  return call('getGoodsList', { pageNum: pageIndex, pageSize }).then((real) =>
    adaptGoodsList(real),
  );
}
