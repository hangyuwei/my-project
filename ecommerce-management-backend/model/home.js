import { cdnBase } from '../config/index';
import { genSwiperImageList } from './swiper';
import { ensureArray, pickFirst } from './adaptUtils';

const defaultTabList = [
  { text: '精选推荐', key: 0 },
  { text: '人气榜', key: 1 },
  { text: '好评榜', key: 2 },
];

const normalizeTabList = (tabs) => {
  const list = ensureArray(tabs).map((item, index) => {
    const source = item || {};
    return {
      text: pickFirst(source.text, source.title, source.name, defaultTabList[index]?.text, ''),
      key: pickFirst(source.key, source.id, index),
    };
  });
  return list.length ? list : defaultTabList;
};

export function adaptHome(real = {}) {
  if (real && real.swiper && real.tabList && real.activityImg) {
    return real;
  }

  const banners = ensureArray(real.banners || real.swiper);
  const swiper = banners.length
    ? banners.map((item) => (item && typeof item === 'object' ? item.image || item.img || item.url : item))
    : genSwiperImageList();

  const tabList = normalizeTabList(real.tabs || real.tabList);
  const activityImg = pickFirst(real.activityImage, real.activityImg, `${cdnBase}/activity/banner.png`);

  return {
    swiper,
    tabList,
    activityImg,
  };
}
