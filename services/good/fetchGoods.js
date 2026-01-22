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
export function fetchGoodsList(params = {}) {
  // 兼容旧的调用方式：fetchGoodsList(pageIndex, pageSize)
  if (typeof params === 'number') {
    const pageIndex = params;
    const pageSize = arguments[1] || 20;
    params = { pageIndex, pageSize };
  }

  const pageIndex = params.pageIndex ?? params.page ?? 0;
  const pageSize = params.pageSize ?? params.limit ?? 20;
  const category = params.category ?? '';

  if (shouldMock('good.fetchGoodsList')) {
    return mockFetchGoodsList(pageIndex, pageSize);
  }

  const callParams = {
    pageIndex,
    pageNum: pageIndex + 1,
    pageSize,
  };

  // 添加分类参数
  if (category) {
    callParams.category = category;
  }

  return call('getGoodsList', callParams).then((real) => adaptGoodsList(real));
}
