import { config } from '../../config/index';
import { callCloudFunction } from '../_utils/cloud';
import { shouldMock } from '../_utils/shouldMock';
import { adaptActivity } from '../../model/activity';

/** 获取活动列表 */
function mockFetchActivity(ID = 0) {
  const { delay } = require('../_utils/delay');
  const { getActivity } = require('../../model/activity');

  return delay().then(() => getActivity(ID));
}

/** 获取活动列表 */
export function fetchActivity(ID = 0) {
  if (shouldMock('activity.fetchActivity')) {
    return mockFetchActivity(ID);
  }
  return callCloudFunction('getActivity', { id: ID }).then((real) => adaptActivity(real));
}
