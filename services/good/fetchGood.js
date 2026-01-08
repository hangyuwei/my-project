import { findLocalGoodsRecord } from './localGoods';
import { recordToDetail } from './goodsTransform';
import { call } from '../cloud';
import { shouldMock } from '../_utils/shouldMock';
import { adaptGoodDetail } from '../../model/good';

/** ?????? */
function mockFetchGood(ID = 0) {
  const { delay } = require('../_utils/delay');
  const { genGood } = require('../../model/good');
  return delay().then(() => genGood(ID));
}

/** ?????? */
export function fetchGood(ID = 0) {
  if (shouldMock('good.fetchGood')) {
    const local = findLocalGoodsRecord(String(ID));
    if (local) {
      return Promise.resolve(recordToDetail(local));
    }
    return mockFetchGood(ID);
  }
  return call('getGood', { spuId: ID }).then((real) => adaptGoodDetail(real));
}
