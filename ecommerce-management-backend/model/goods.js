import { genGood, adaptGoodsListItem } from './good';
import { ensureArray } from './adaptUtils';

export function getGoodsList(baseID = 0, length = 10) {
  return [genGood(0)];
}

export const goodsList = getGoodsList();

export function adaptGoodsList(realList = []) {
  const list = Array.isArray(realList)
    ? realList
    : ensureArray(realList?.list || realList?.items || realList?.products || realList?.data?.list);
  if (!list.length) return getGoodsList();
  return list.map((item) => adaptGoodsListItem(item));
}
