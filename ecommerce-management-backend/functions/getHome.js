const { readDb } = require('./_helpers');

const defaultBanners = [
  { image: 'https://tdesign.gtimg.com/miniprogram/template/retail/home/v2/banner1.png' },
  { image: 'https://tdesign.gtimg.com/miniprogram/template/retail/home/v2/banner2.png' },
  { image: 'https://tdesign.gtimg.com/miniprogram/template/retail/home/v2/banner3.png' },
  { image: 'https://tdesign.gtimg.com/miniprogram/template/retail/home/v2/banner4.png' },
  { image: 'https://tdesign.gtimg.com/miniprogram/template/retail/home/v2/banner5.png' },
  { image: 'https://tdesign.gtimg.com/miniprogram/template/retail/home/v2/banner6.png' },
];

const defaultTabs = [
  { text: '精选推荐', key: 0 },
  { text: '人气榜', key: 1 },
  { text: '好评榜', key: 2 },
];

exports.main = async () => {
  const db = readDb();
  const raw = Array.isArray(db.home) ? db.home[0] : db.home;
  const home = raw && typeof raw === 'object' ? { ...raw } : {};
  const banners = Array.isArray(home.banners) && home.banners.length >= 6 ? home.banners : defaultBanners;
  const tabs = Array.isArray(home.tabs) && home.tabs.length ? home.tabs : defaultTabs;
  return {
    banners,
    tabs,
    activityImage: home.activityImage || '',
    recommendProductIds: Array.isArray(home.recommendProductIds) ? home.recommendProductIds : [],
  };
};
