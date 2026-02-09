import { AVATAR_HEALTH_CHECK_URLS } from '../constants/avatar';

const requestHead = (url, timeout = 5000) =>
  new Promise((resolve) => {
    wx.request({
      url,
      method: 'HEAD',
      timeout,
      success: (res) => {
        const statusCode = res.statusCode || 0;
        const ok = statusCode >= 200 && statusCode < 400;
        resolve({ url, ok, statusCode });
      },
      fail: (error) => {
        resolve({ url, ok: false, statusCode: 0, error });
      },
    });
  });

export async function checkStaticAssetsHealth(urls = AVATAR_HEALTH_CHECK_URLS) {
  const uniqueUrls = [...new Set((urls || []).filter((url) => typeof url === 'string' && url))];
  if (uniqueUrls.length === 0) return { ok: true, failed: [], results: [] };

  const results = await Promise.all(uniqueUrls.map((url) => requestHead(url)));
  const failed = results.filter((item) => !item.ok);

  if (failed.length > 0) {
    console.warn(
      '[StaticAssetCheck] Some assets are unavailable:',
      failed.map((item) => ({
        url: item.url,
        statusCode: item.statusCode,
        errorMessage: (item.error && item.error.errMsg) || '',
      })),
    );
  } else {
    console.log('[StaticAssetCheck] All configured assets are reachable.');
  }

  return {
    ok: failed.length === 0,
    failed,
    results,
  };
}
