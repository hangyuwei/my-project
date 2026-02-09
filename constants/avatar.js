export const DEFAULT_AVATAR_URL =
  'https://tdesign.gtimg.com/miniprogram/template/retail/usercenter/icon-user-center-avatar@2x.png';

export const AVATAR_BACKUP_URL =
  'https://tdesign.gtimg.com/miniprogram/template/retail/avatar/avatar1.png';

export const BROKEN_AVATAR_KEYWORDS = ['/common/default-avatar.png'];

export const AVATAR_HEALTH_CHECK_URLS = [DEFAULT_AVATAR_URL, AVATAR_BACKUP_URL];

export function isBrokenAvatarUrl(url = '') {
  if (!url || typeof url !== 'string') return true;
  return BROKEN_AVATAR_KEYWORDS.some((keyword) => url.includes(keyword));
}

export function normalizeAvatarUrl(url = '', fallback = DEFAULT_AVATAR_URL) {
  if (!url || typeof url !== 'string') return fallback;
  return isBrokenAvatarUrl(url) ? fallback : url;
}
