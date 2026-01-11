import { config } from '../../config/index';
import { callCloudFunction } from '../_utils/cloud';
import { shouldMock } from '../_utils/shouldMock';
import { adaptSearchHistory, adaptSearchPopular } from '../../model/search';

/** 获取搜索历史 */
function mockSearchHistory() {
  const { delay } = require('../_utils/delay');
  const { getSearchHistory } = require('../../model/search');
  return delay().then(() => getSearchHistory());
}

/** 获取搜索历史 */
export function getSearchHistory() {
  if (shouldMock('good.getSearchHistory')) {
    return mockSearchHistory();
  }
  return callCloudFunction('getSearchHistory').then((real) => adaptSearchHistory(real));
}

/** 获取搜索历史 */
function mockSearchPopular() {
  const { delay } = require('../_utils/delay');
  const { getSearchPopular } = require('../../model/search');
  return delay().then(() => getSearchPopular());
}

/** 获取搜索历史 */
export function getSearchPopular() {
  if (shouldMock('good.getSearchPopular')) {
    return mockSearchPopular();
  }
  return callCloudFunction('getSearchPopular').then((real) => adaptSearchPopular(real));
}
