import { ensureObject, pickFirst, toString } from './adaptUtils';

/**
 * @param {string|number} key 唯一值
 */
export function getActivity(key) {
  return {
    promotionId: `${key}`,
    title: `满减满折回归${key}`,
    description: null,
    promotionCode: 'MERCHANT',
    promotionSubCode: key % 2 === 0 ? 'MYJ' : 'MYG',
    tag: '满减',
    timeType: 1,
    startTime: '1588737710000',
    endTime: '1601467070000',
    teasingStartTime: null,
    activityLadder: [{ label: '满100元减99.9元' }],
  };
}

export function adaptActivity(real = {}) {
  if (real && real.promotionId && real.promotionCode) return real;
  const source = ensureObject(real);
  const base = getActivity(pickFirst(source.id, source.promotionId, 0));
  return {
    ...base,
    promotionId: toString(pickFirst(source.id, source.promotionId), base.promotionId),
    title: pickFirst(source.title, source.name, base.title),
    description: pickFirst(source.description, base.description),
    promotionCode: pickFirst(source.promotionCode, base.promotionCode),
    promotionSubCode: pickFirst(source.promotionSubCode, base.promotionSubCode),
    tag: pickFirst(source.tag, base.tag),
    timeType: pickFirst(source.timeType, base.timeType),
    startTime: pickFirst(source.startTime, base.startTime),
    endTime: pickFirst(source.endTime, base.endTime),
    teasingStartTime: pickFirst(source.teasingStartTime, base.teasingStartTime),
    activityLadder: Array.isArray(source.activityLadder) ? source.activityLadder : base.activityLadder,
  };
}
