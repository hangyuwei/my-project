import { cdnBase } from '../../config/index';
import { call } from '../cloud';
import { shouldMock } from '../_utils/shouldMock';
import { adaptHome } from '../../model/home';

/** 获取首页数据 */
function mockFetchHome() {
  const { delay } = require('../_utils/delay');
  const { genSwiperImageList } = require('../../model/swiper');
  return delay().then(() => {
    return {
      swiper: genSwiperImageList(),
      tabList: [
        {
          text: '精选推荐',
          key: 0,
        },
        {
          text: '人气榜',
          key: 1,
        },
        {
          text: '好评榜',
          key: 2,
        },
      ],
      activityImg: `${cdnBase}/activity/banner.png`,
    };
  });
}

/** 获取首页数据 */
export function fetchHome() {
  if (shouldMock('home.fetchHome')) {
    return mockFetchHome();
  }
  return call('getHome', {})
    .then((real) => adaptHome(real))
    .catch((err) => {
      console.error('getHome failed, fallback to mock', err);
      return mockFetchHome();
    });
}
