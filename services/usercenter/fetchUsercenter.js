import { config } from '../../config/index';
import { callCloudFunction } from '../_utils/cloud';
import { shouldMock } from '../_utils/shouldMock';
import { adaptUsercenter } from '../../model/usercenter';

/** 获取个人中心信息 */
function mockFetchUserCenter() {
  const { delay } = require('../_utils/delay');
  const { genUsercenter } = require('../../model/usercenter');
  return delay(200).then(() => genUsercenter());
}

/** 获取个人中心信息 */
export function fetchUserCenter() {
  if (shouldMock('usercenter.fetchUserCenter')) {
    return mockFetchUserCenter();
  }
  return callCloudFunction('getUserCenter').then((real) => adaptUsercenter(real));
}
