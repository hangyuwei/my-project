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
  const isMock = shouldMock('order.dispatchApplyService');
  console.log('[申请售后] shouldMock结果:', isMock, 'useMock:', config.useMock);

  if (isMock) {
    console.error('[申请售后] 警告：正在使用 MOCK 数据！');
    return mockDispatchApplyService(params);
  }

  // 调用 afterSale 云函数,action 为 'apply'
  console.log('[申请售后] 调用真实云函数,参数:', params);

  // 从 t-upload 的文件对象数组中提取 URL 字符串
  const rawImages = params.rights?.rightsImageUrls || [];
  const evidence = rawImages.map(file => {
    if (typeof file === 'string') return file;
    return file.url || file.tempFilePath || file.path || '';
  }).filter(url => url);

  console.log('[申请售后] 凭证图片:', evidence);

  return wx.cloud.callFunction({
    name: 'afterSale',
    data: {
      action: 'apply',
      orderNo: params.rights?.orderNo,
      type: params.rights?.rightsType === 20 ? 'ONLY_REFUND' : 'RETURN_REFUND',
      amount: (params.rights?.refundRequestAmount || 0), // 已经是分为单位，不需要转换
      reasonCode: params.rights?.rightsReasonType,
      reasonText: params.rights?.rightsReasonDesc,
      remark: params.refundMemo || '', // 用户填写的退款说明
      evidence: evidence,
    }
  }).then(res => {
    console.log('[申请售后] 云函数返回:', JSON.stringify(res, null, 2));
    if (!res.result || !res.result.success) {
      console.error('[申请售后] 云函数返回失败:', res.result);
      throw new Error(res.result?.error || '申请售后失败');
    }

    // 验证返回数据中是否包含售后单号
    if (!res.result.data?.afterSaleNo) {
      console.error('[申请售后] 云函数未返回售后单号:', res.result);
      throw new Error('申请售后失败：未获取到售后单号');
    }

    const adapted = adaptApplyService(res.result);
    console.log('[申请售后] 适配后的数据:', JSON.stringify(adapted, null, 2));
    return adapted;
  }).catch(error => {
    console.error('[申请售后] 异常:', error);
    throw error;
  });
}
