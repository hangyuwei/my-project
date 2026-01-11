import { getGoodsList } from './goods';
import { adaptGoodsListItem } from './good';
import { ensureArray, ensureObject, pickFirst, toInt } from './adaptUtils';

export function getPromotion(baseID = 0, length = 10) {
  return {
    list: getGoodsList(baseID, length).map((item) => {
      return {
        spuId: item.spuId,
        thumb: item.primaryImage,
        title: item.title,
        price: item.minSalePrice,
        originPrice: item.maxLinePrice,
        tags: item.spuTagList.map((tag) => ({ title: tag.title })),
      };
    }),
    banner: 'https://tdesign.gtimg.com/miniprogram/template/retail/promotion/banner-promotion.png',
    time: 1000 * 60 * 60 * 20,
    showBannerDesc: true,
    statusTag: 'running',
  };
}

export function adaptPromotion(real = {}) {
  if (real && Array.isArray(real.list) && real.banner) return real;
  const source = ensureObject(real);
  const items = ensureArray(source.items || source.list || source.products);
  const base = getPromotion(0, items.length || 10);

  const list = items.length
    ? items.map((item) => {
        const mapped = adaptGoodsListItem(item, { tagAsObject: true });
        return {
          spuId: mapped.spuId,
          thumb: mapped.thumb,
          title: mapped.title,
          price: mapped.price,
          originPrice: mapped.originPrice,
          tags: mapped.tags,
        };
      })
    : base.list;

  return {
    list,
    banner: pickFirst(source.banner, base.banner),
    time: toInt(pickFirst(source.time, base.time), base.time),
    showBannerDesc: pickFirst(source.showBannerDesc, base.showBannerDesc),
    statusTag: pickFirst(source.statusTag, base.statusTag),
  };
}
