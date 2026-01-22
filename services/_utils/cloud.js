import { config } from '../../config/index';

const normalizeBaseUrl = (value) => {
  if (!value) return '';
  return value.endsWith('/') ? value.slice(0, -1) : value;
};

export function request(options = {}) {
  const { url, method = 'GET', data, header } = options;

  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method,
      data,
      header,
      success: (res) => resolve(res),
      fail: (err) => reject(err),
    });
  });
}

export function callCloudFunction(name, data = {}, context = {}) {
  const baseUrl = normalizeBaseUrl(config.cloudBaseUrl);
  const forceLocal = Boolean(config.forceLocalCloud && baseUrl);
  const hasCloud =
    typeof wx !== 'undefined' && wx.cloud && typeof wx.cloud.callFunction === 'function';

  if (!forceLocal && hasCloud) {
    return wx.cloud
      .callFunction({ name, data })
      .then((res) => res && res.result);
  }

  if (!baseUrl) {
    return Promise.reject(new Error('cloudBaseUrl not configured'));
  }

  // 获取当前用户的 openid，用于 HTTP 请求模式
  const app = typeof getApp === 'function' ? getApp() : null;
  const openid = app?.globalData?.openid || '';

  return request({
    url: `${baseUrl}/cloudfunctions/${name}`,
    method: 'POST',
    data: { data, context },
    header: {
      'Content-Type': 'application/json',
      'x-openid': openid, // 传递用户 openid 给后端服务器
    },
  }).then((res) => {
    const payload = res?.data;
    if (!payload) return payload;
    if (Object.prototype.hasOwnProperty.call(payload, 'result')) {
      return payload.result;
    }
    return payload;
  });
}
