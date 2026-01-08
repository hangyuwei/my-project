import { getGoodsList } from './goods';
import { adaptGoodDetail, adaptGoodsListItem } from './good';
import { ensureArray, ensureObject, pickFirst, toInt } from './adaptUtils';

/**
 * @param {number} sort
 * @param {number} pageNum
 * @param {number} pageSize
 * @param {number} minPrice
 * @param {number} maxPrice
 * @param {string} keyword
 */

export function getSearchHistory() {
  return {
    historyWords: [
      '鸡',
      '电脑',
      'iPhone12',
      '车载手机支架',
      '自然堂',
      '小米10',
      '原浆古井贡酒',
      '欧米伽',
      '华为',
      '针织半身裙',
      '氢跑鞋',
      '三盒处理器',
    ],
  };
}

export function getSearchPopular() {
  return {
    popularWords: [
      '鸡',
      '电脑',
      'iPhone12',
      '车载手机支架',
      '自然堂',
      '小米10',
      '原浆古井贡酒',
      '欧米伽',
      '华为',
      '针织半身裙',
      '氢跑鞋',
      '三盒处理器',
    ],
  };
}

export function getSearchResult(params = {}) {
  const keyword = (params.keyword || '').trim();
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 30;
  let spuList = getGoodsList(0, pageSize);

  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    spuList = spuList.filter((item) => {
      const name = `${item.goodsName || item.title || ''}`.toLowerCase();
      return name.includes(lowerKeyword);
    });
  }

  const totalCount = spuList.length;
  const startIndex = (pageNum - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  spuList = spuList.slice(startIndex, endIndex);

  return {
    saasId: null,
    storeId: null,
    pageNum,
    pageSize,
    totalCount,
    spuList,
    algId: 0,
  };
}

export function adaptSearchHistory(real = {}) {
  if (real && Array.isArray(real.historyWords)) return real;
  const source = ensureObject(real);
  const words = ensureArray(source.historyWords || source.words || source.list || source);
  if (words.length) {
    return { historyWords: words };
  }
  return getSearchHistory();
}

export function adaptSearchPopular(real = {}) {
  if (real && Array.isArray(real.popularWords)) return real;
  const source = ensureObject(real);
  const words = ensureArray(source.popularWords || source.words || source.list || source);
  if (words.length) {
    return { popularWords: words };
  }
  return getSearchPopular();
}

export function adaptSearchResult(real = {}, options = {}) {
  const buildItem = (item) => {
    const detail = item && item.spuId && Array.isArray(item.skuList) ? item : adaptGoodDetail(item);
    const listItem = adaptGoodsListItem(detail, { tagAsObject: options.tagAsObject });
    return {
      ...detail,
      ...listItem,
    };
  };

  if (real && Array.isArray(real.spuList) && real.pageNum !== undefined) {
    const mapped = real.spuList.map((item) => buildItem(item));
    return {
      ...real,
      saasId: real.saasId ?? null,
      storeId: real.storeId ?? null,
      spuList: mapped,
    };
  }

  const source = ensureObject(real);
  const listSource = source.items || source.spuList || source.list || source.products || source.data?.list || source.data?.items;
  const list = ensureArray(listSource).map((item) => buildItem(item));

  const pageNum = toInt(pickFirst(source.pageNum, source.page, 1), 1);
  const pageSize = toInt(pickFirst(source.pageSize, source.limit, list.length || 0), 0);
  const totalCount = toInt(pickFirst(source.totalCount, source.total, list.length), list.length);

  return {
    saasId: source.saasId ?? null,
    storeId: source.storeId ?? null,
    pageNum,
    pageSize,
    totalCount,
    spuList: list,
    algId: pickFirst(source.algId, 0),
  };
}
