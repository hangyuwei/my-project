import { config } from '../../config/index';
import { callCloudFunction } from '../_utils/cloud';
import { shouldMock } from '../_utils/shouldMock';
import { adaptApplyReasonList, adaptApplyService, adaptRightsPreview } from '../../model/order/applyService';

/** 获取售后单mock数据 */
function mockFetchRightsPreview(params) {
  const { delay } = require('../_utils/delay');
  const { genRightsPreview } = require('../../model/order/applyService');

  return delay().then(() => genRightsPreview(params));
}

/** 获取售后单数据 */
export function fetchRightsPreview(params) {
  if (shouldMock('order.fetchRightsPreview')) {
    return mockFetchRightsPreview(params);
  }
  return callCloudFunction('getRightsPreview', params || {}).then((real) =>
    adaptRightsPreview(real),
  );
}

/** 确认收货 */
export function dispatchConfirmReceived() {
  if (shouldMock('order.dispatchConfirmReceived')) {
    const { delay } = require('../_utils/delay');
    return delay().then(() => null);
  }
  return callCloudFunction('confirmReceived');
}

/** 获取可选的mock售后原因列表 */
function mockFetchApplyReasonList(params) {
  const { delay } = require('../_utils/delay');
  const { genApplyReasonList } = require('../../model/order/applyService');

  return delay().then(() => genApplyReasonList(params));
}

/** 获取可选的售后原因列表 */
export function fetchApplyReasonList(params) {
  if (shouldMock('order.fetchApplyReasonList')) {
    return mockFetchApplyReasonList(params);
  }
  return callCloudFunction('getApplyReasonList', params || {}).then((real) =>
    adaptApplyReasonList(real),
  );
}

/** 发起mock售后申请 */
function mockDispatchApplyService(params) {
  const { delay } = require('../_utils/delay');
  const { applyService } = require('../../model/order/applyService');

  return delay().then(() => applyService(params));
}

/** 发起售后申请 */
export function dispatchApplyService(params) {
  if (shouldMock('order.dispatchApplyService')) {
    return mockDispatchApplyService(params);
  }
  return callCloudFunction('applyService', params || {}).then((real) => adaptApplyService(real));
}
