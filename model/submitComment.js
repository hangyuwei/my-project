import { ensureArray, ensureObject, pickFirst } from './adaptUtils';

export function getGoods() {
  return {
    goods: [
      {
        squid: '1',
        checkItems: [
          {
            name: '匿名评价',
            value: 'anonymous',
            checked: false,
          },
        ],
        detail: {
          image:
            'https://wx.qlogo.cn/mmopen/vi_32/51VSMNuy1CyHiaAhAjLJ00kMZVqqnCqXeZduCLXHUBr52zFHRGxwL7kGia3fHj8GSNzFcqFDInQmRGM1eWjtQgqA/132',
          title: '',
        },
        goodComment: {
          /** 商品评价 */
          rate: 0,
          /** 评价内容 */
          label: '123',
          /** 上传图片 */
          images: [],
        },
      },
      {
        squid: '2',
        checkItems: [
          {
            name: '匿名评价',
            value: 'anonymous',
            checked: false,
          },
        ],
        detail: {
          image:
            'https://wx.qlogo.cn/mmopen/vi_32/51VSMNuy1CyHiaAhAjLJ00kMZVqqnCqXeZduCLXHUBr52zFHRGxwL7kGia3fHj8GSNzFcqFDInQmRGM1eWjtQgqA/132',
          title: '评价内容 山姆智利进口',
        },
        goodComment: {
          /** 商品评价 */
          rate: 0,
          /** 评价内容 */
          label: '山姆智利进口',
          /** 上传图片 */
          images: [],
        },
      },
    ],
    storeComment: {
      /** 物流评价 */
      logisticsRate: 0,
      /** 服务评价 */
      servicesRate: 0,
    },
  };
}


export function adaptSubmitCommentGoods(real = {}) {
  if (real && Array.isArray(real.goods)) return real;
  const source = ensureObject(real);
  const base = getGoods();
  const baseItem = base.goods[0] || {};
  const list = ensureArray(source.goods || source.items || source.list);
  if (!list.length) return base;

  return {
    goods: list.map((item, index) => {
      const info = ensureObject(item);
      const detail = ensureObject(info.detail);
      const comment = ensureObject(info.goodComment);
      return {
        squid: pickFirst(info.squid, info.id, String(index)),
        checkItems: ensureArray(info.checkItems).length ? info.checkItems : baseItem.checkItems,
        detail: {
          image: pickFirst(detail.image, info.image, baseItem.detail?.image),
          title: pickFirst(detail.title, info.title, baseItem.detail?.title, ''),
        },
        goodComment: {
          rate: pickFirst(comment.rate, info.rate, 0),
          label: pickFirst(comment.label, info.label, ''),
          images: ensureArray(comment.images || info.images),
        },
      };
    }),
    storeComment: source.storeComment || base.storeComment,
  };
}
