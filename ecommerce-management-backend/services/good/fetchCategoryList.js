import { config } from '../../config/index';
import { callCloudFunction } from '../_utils/cloud';
import { shouldMock } from '../_utils/shouldMock';
import { adaptCategoryList } from '../../model/category';

/** 获取商品列表 */
function mockFetchGoodCategory() {
  const { delay } = require('../_utils/delay');
  const { getCategoryList } = require('../../model/category');
  return delay().then(() => getCategoryList());
}

/** 获取商品列表 */
export function getCategoryList() {
  if (shouldMock('good.getCategoryList')) {
    return mockFetchGoodCategory();
  }
  return callCloudFunction('getCategoryList').then((real) => adaptCategoryList(real));
}
