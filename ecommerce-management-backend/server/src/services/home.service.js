import { getBanners } from '../repositories/banners.repo.js';
import { db } from '../libs/cloudbase.js';

export const getHomeData = async () => {
  // 获取 banners
  const bannersResponse = await getBanners();
  const bannersList = bannersResponse?.list || [];

  const banners = bannersList.map((item) => ({
    id: item._id || item.id,
    image: item.imageTempUrl || item.imageUrl || item.image || '',
    linkUrl: item.linkUrl || item.url || '',
    title: item.title || '',
  }));

  // 组装 swiper 数据
  const swiper = banners.map((item) => item.image).filter(Boolean);

  // 固定的 tab 列表
  const tabList = [
    { text: '精选推荐', key: 0 },
    { text: '人气榜', key: 1 },
    { text: '好评榜', key: 2 },
  ];

  // 活动图片
  const activityImg = 'https://we-retail-static-1300977798.cos.ap-guangzhou.myqcloud.com/retail-mp/activity/banner.png';

  return {
    swiper,
    banners,
    tabList,
    activityImg,
  };
};
