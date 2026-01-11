import { callCloudFunction as callLocal } from './_utils/cloud';

export function call(name, data = {}) {
  const hasCloud =
    typeof wx !== 'undefined' && wx.cloud && typeof wx.cloud.callFunction === 'function';

  if (hasCloud) {
    // 直接使用 wx.cloud（单小程序模式）
    return wx.cloud
      .callFunction({ name, data })
      .then((res) => res && res.result);
  }

  return callLocal(name, data);
}
