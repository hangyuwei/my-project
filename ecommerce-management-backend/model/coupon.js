import { ensureArray, ensureObject, pickFirst, toInt, toString } from './adaptUtils';
import { genAddressList } from './address';

/**
 * 优惠券
 *
 * @typedef {'default'|'useless'|'disabled'} CouponCardStatus
 * @typedef {'discount'|'price'} CouponCardType
 *
 * @param {number} [id]
 * @param {CouponCardStatus} [status]
 * @param {CouponCardType} [type]
 */
export function getCoupon(id = 0, status = 'default', type = (id % 2) + 1) {
  return {
    /** key */
    key: `${id}`,
    /** 优惠券状态 */
    status,
    /** 优惠券类型 */
    type,
    /** 折扣或者满减值 */
    value: type === 2 ? 5.5 : 1800,
    /** 标签 */
    tag: '',
    /** 描述 */
    desc: parseInt(id) > 0 ? `满${parseInt(id) * 100}元可用` : '无门槛使用',
    /** 订单底价,满n元 */
    base: 10000 * (parseInt(id) || 0),
    /** 标题 */
    title: type === 2 ? `生鲜折扣券 - ${id}` : `生鲜满减券 - ${id}`,
    /** 有效时间限制 */
    timeLimit: '2019.11.18-2023.12.18',
    /** 货币符号 */
    currency: '¥',
  };
}

/** 优惠券列表 */
export function getCouponList(status = 'default', length = 10) {
  return new Array(length).fill(0).map((_, idx) => getCoupon(idx, status));
}



const normalizeCoupon = (source = {}, base = {}) => {
  const coupon = ensureObject(source);
  return {
    key: toString(pickFirst(coupon.mockId, coupon.key, coupon.id, base.key)),
    status: pickFirst(coupon.status, base.status, 'default'),
    type: pickFirst(coupon.type, base.type),
    value: pickFirst(coupon.value, base.value),
    tag: pickFirst(coupon.tag, base.tag),
    desc: pickFirst(coupon.desc, base.desc),
    base: pickFirst(coupon.base, base.base),
    title: pickFirst(coupon.title, base.title),
    timeLimit: pickFirst(coupon.timeLimit, base.timeLimit),
    currency: pickFirst(coupon.currency, base.currency),
    useNotes: pickFirst(coupon.useNotes, base.useNotes, null),
    storeAdapt: pickFirst(coupon.storeAdapt, base.storeAdapt, null),
  };
};

const finalizeCouponDetail = (detail) => {
  const next = { ...detail };
  if (!next.useNotes) {
    next.useNotes =
      '1 order per coupon, no stacking with other coupon types (except shipping).\n2 valid for normal items in each region.';
  }
  if (!next.storeAdapt) {
    next.storeAdapt = 'All stores';
  }

  if (next.type === 'price') {
    next.desc = `Save ${toInt(next.value, 0) / 100} CNY`;
    if (next.base) {
      next.desc += `, min ${toInt(next.base, 0) / 100} CNY`;
    }
    next.desc += '.';
  } else if (next.type === 'discount') {
    next.desc = `${next.value} off`;
    if (next.base) {
      next.desc += `, min ${toInt(next.base, 0) / 100} CNY`;
    }
    next.desc += '.';
  }

  return next;
};

export function adaptCouponList(realList = []) {
  const list = Array.isArray(realList)
    ? realList
    : ensureArray(realList?.list || realList?.items || realList?.data?.list);
  if (list.length && list[0]?.key) return list;
  if (!list.length) return getCouponList();
  return list.map((item, index) => normalizeCoupon(item, getCoupon(index)));
}

export function adaptCouponDetail(real = {}) {
  if (real && real.detail && real.storeInfoList) return real;
  const source = ensureObject(real);
  const baseDetail = getCoupon(source.id || 0, source.status || 'default', source.type || 1);
  const detail = finalizeCouponDetail(normalizeCoupon(source.detail || source.coupon || source, baseDetail));
  const storeInfoList = ensureArray(source.storeInfoList || source.stores).length
    ? ensureArray(source.storeInfoList || source.stores)
    : genAddressList();

  return {
    detail,
    storeInfoList,
  };
}
