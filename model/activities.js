import { getActivity, adaptActivity } from './activity';
import { ensureArray } from './adaptUtils';

export function getActivityList(baseID = 0, length = 10) {
  return new Array(length).fill(0).map((_, idx) => getActivity(idx + baseID));
}

export const activityList = getActivityList();

export function adaptActivityList(realList = []) {
  const list = Array.isArray(realList)
    ? realList
    : ensureArray(realList?.list || realList?.items || realList?.data?.list);
  if (!list.length) return getActivityList();
  return list.map((item, index) => adaptActivity(item || { id: index }));
}
