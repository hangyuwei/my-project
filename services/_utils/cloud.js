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
  if (!baseUrl) {
    return Promise.reject(new Error('cloudBaseUrl not configured'));
  }

  return request({
    url: `${baseUrl}/cloudfunctions/${name}`,
    method: 'POST',
    data: { data, context },
  }).then((res) => {
    const payload = res?.data;
    if (!payload) return payload;
    if (Object.prototype.hasOwnProperty.call(payload, 'result')) {
      return payload.result;
    }
    return payload;
  });
}
