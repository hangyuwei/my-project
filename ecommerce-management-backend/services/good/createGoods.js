import { config } from '../../config/index';
import { normalizeGoodsRecord } from './goodsTransform';
import { addLocalGoodsRecord } from './localGoods';
import { callCloudFunction } from '../_utils/cloud';
import { shouldMock } from '../_utils/shouldMock';
import { adaptGoodDetail } from '../../model/good';

export async function createGoods(payload = {}) {
  const normalized = normalizeGoodsRecord(payload);
  if (shouldMock('good.createGoods')) {
    return addLocalGoodsRecord(normalized);
  }
  return callCloudFunction('createGoods', normalized).then((real) => adaptGoodDetail(real));
}
