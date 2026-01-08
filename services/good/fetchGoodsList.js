/* eslint-disable no-param-reassign */
import { getLocalGoodsRecords } from './localGoods';
import { recordToListItem } from './goodsTransform';
import { call } from '../cloud';
import { shouldMock } from '../_utils/shouldMock';
import { adaptSearchResult } from '../../model/search';

/** ?????? */
function mockFetchGoodsList(params = {}) {
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
      item.desc = '';
      if (item.spuTagList) {
        item.tags = item.spuTagList.map((tag) => tag.title);
      } else {
        item.tags = [];
      }
    });
  }

  const merged = mergeLocalGoodsList(data, params);

  return delay().then(() => merged);
}

function mergeLocalGoodsList(data, params = {}) {
  const pageNum = params.pageNum || 1;
  if (pageNum > 1) return data;
  const localRecords = filterLocalRecords(getLocalGoodsRecords(), params);
  if (!localRecords.length) return data;
  const localSpuList = localRecords.map(recordToListItem);
  const nextSpuList = localSpuList.concat(data.spuList || []);
  return {
    ...data,
    spuList: nextSpuList,
    totalCount: nextSpuList.length,
  };
}

function filterLocalRecords(records, params = {}) {
  const keyword = (params.keyword || '').trim();
  const minPrice = typeof params.minPrice === 'number' ? params.minPrice : null;
  const maxPrice = typeof params.maxPrice === 'number' ? params.maxPrice : null;
  const sort = params.sort === 1;
  const sortType = params.sortType === 1 ? -1 : 1;

  let list = records.filter((record) => {
    if (record.isPutOnSale === 0) return false;
    if (keyword && !String(record.title || '').includes(keyword)) return false;
    if (minPrice !== null && record.price < minPrice) return false;
    if (maxPrice !== null && record.price > maxPrice) return false;
    return true;
  });

  if (sort) {
    list = list.slice().sort((a, b) => (a.price - b.price) * sortType);
  } else {
    list = list.slice().sort((a, b) => b.createdAt - a.createdAt);
  }
  return list;
}

/** ?????? */
export function fetchGoodsList(params = {}) {
  if (shouldMock('good.fetchGoodsListSearch')) {
    return mockFetchGoodsList(params);
  }
  return call('getGoodsList', params).then((real) => {
    const adapted = adaptSearchResult(real, { tagAsObject: false });
    if (adapted && Array.isArray(adapted.spuList)) {
      adapted.spuList = adapted.spuList.map((item) => ({
        ...item,
        desc: '',
      }));
    }
    return mergeLocalGoodsList(adapted, params);
  });
}
