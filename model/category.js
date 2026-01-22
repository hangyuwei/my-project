import { ensureArray, ensureObject, pickFirst, toString } from './adaptUtils';
import { PRODUCT_CATEGORIES, CATEGORY_NAMES } from '../constants/productCategory';

export function getCategoryList() {
  return [
    {
      groupId: '0',
      key: '',  // 空字符串表示全部
      name: '全部商品',
      thumbnail: 'https://cdn-we-retail.ym.tencent.com/tsr/goods/nz-09a.png',
      children: [],
    },
    {
      groupId: '1',
      key: PRODUCT_CATEGORIES.NUTRITION,
      name: CATEGORY_NAMES[PRODUCT_CATEGORIES.NUTRITION],
      thumbnail: 'https://cdn-we-retail.ym.tencent.com/tsr/goods/muy-3a.png',
      children: [],
    },
    {
      groupId: '2',
      key: PRODUCT_CATEGORIES.HEALTH_FOOD,
      name: CATEGORY_NAMES[PRODUCT_CATEGORIES.HEALTH_FOOD],
      thumbnail: 'https://cdn-we-retail.ym.tencent.com/tsr/goods/nz-08b.png',
      children: [],
    },
    {
      groupId: '3',
      key: PRODUCT_CATEGORIES.BEAUTY_SKINCARE,
      name: CATEGORY_NAMES[PRODUCT_CATEGORIES.BEAUTY_SKINCARE],
      thumbnail: 'https://cdn-we-retail.ym.tencent.com/tsr/goods/muy-2a.png',
      children: [],
    },
    {
      groupId: '4',
      key: PRODUCT_CATEGORIES.HOME_LIVING,
      name: CATEGORY_NAMES[PRODUCT_CATEGORIES.HOME_LIVING],
      thumbnail: 'https://cdn-we-retail.ym.tencent.com/tsr/goods/nz-09b.png',
      children: [],
    },
    {
      groupId: '5',
      key: PRODUCT_CATEGORIES.SENIOR_LEISURE_FOOD,
      name: CATEGORY_NAMES[PRODUCT_CATEGORIES.SENIOR_LEISURE_FOOD],
      thumbnail: 'https://cdn-we-retail.ym.tencent.com/tsr/goods/nz-08a.png',
      children: [],
    },
  ];
}


export function adaptCategoryList(realList = []) {
  const list = Array.isArray(realList)
    ? realList
    : ensureArray(realList?.list || realList?.items || realList?.data?.list);
  if (list.length && list[0]?.groupId && list[0]?.key) return list;
  if (!list.length) return getCategoryList();
  return list.map((item, index) => {
    const source = ensureObject(item);
    const key = pickFirst(source.key, source.categoryKey, source.id, '');
    return {
      groupId: toString(pickFirst(source.mockId, source.id, source.groupId, index)),
      key: key,
      name: pickFirst(source.name, source.title, ''),
      thumbnail: pickFirst(source.thumbnail, source.image, ''),
      children: ensureArray(source.children).map((child, childIndex) => ({
        groupId: toString(pickFirst(child?.id, child?.groupId, `${index}-${childIndex}`)),
        key: pickFirst(child?.key, child?.categoryKey, child?.id, ''),
        name: pickFirst(child?.name, child?.title, ''),
        thumbnail: pickFirst(child?.thumbnail, child?.image, ''),
        children: ensureArray(child?.children),
      })),
    };
  });
}
