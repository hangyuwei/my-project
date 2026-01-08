import { config } from '../../config/index';
import { callCloudFunction } from '../_utils/cloud';
import { shouldMock } from '../_utils/shouldMock';
import { adaptAddress, adaptDeliveryAddressList } from '../../model/address';

/** 获取收货地址 */
function mockFetchDeliveryAddress(id) {
  const { delay } = require('../_utils/delay');
  const { genAddress } = require('../../model/address');

  return delay().then(() => genAddress(id));
}

/** 获取收货地址 */
export function fetchDeliveryAddress(id = 0) {
  if (shouldMock('address.fetchDeliveryAddress')) {
    return mockFetchDeliveryAddress(id);
  }
  return callCloudFunction('getAddress', { id }).then((real) => adaptAddress(real));
}

/** 获取收货地址列表 */
function mockFetchDeliveryAddressList(len = 0) {
  const { delay } = require('../_utils/delay');
  const { genAddressList } = require('../../model/address');

  return delay().then(() =>
    genAddressList(len).map((address) => {
      return {
        ...address,
        phoneNumber: address.phone,
        address: `${address.provinceName}${address.cityName}${address.districtName}${address.detailAddress}`,
        tag: address.addressTag,
      };
    }),
  );
}

/** 获取收货地址列表 */
export function fetchDeliveryAddressList(len = 10) {
  if (shouldMock('address.fetchDeliveryAddressList')) {
    return mockFetchDeliveryAddressList(len);
  }
  return callCloudFunction('getAddressList', { len }).then((real) =>
    adaptDeliveryAddressList(real),
  );
}
