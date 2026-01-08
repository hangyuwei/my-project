import { config } from '../../config/index';
import { callCloudFunction } from '../_utils/cloud';
import { shouldMock } from '../_utils/shouldMock';
import { adaptActivityList } from '../../model/activities';

/** 获取活动列表 */
function mockFetchActivityList(pageIndex = 1, pageSize = 20) {
  const { delay } = require('../_utils/delay');
  const { getActivityList } = require('../../model/activities');

  return delay().then(() => getActivityList(pageIndex, pageSize));
}

/** 获取活动列表 */
export function fetchActivityList(pageIndex = 1, pageSize = 20) {
  if (shouldMock('activity.fetchActivityList')) {
    return mockFetchActivityList(pageIndex, pageSize);
  }
  return callCloudFunction('getActivityList', { pageIndex, pageSize }).then((real) =>
    adaptActivityList(real),
  );
}
