import { ensureArray, ensureObject, pickFirst, toString } from './adaptUtils';

/** 地址 */
export function genAddress(id) {
  return {
    saasId: '88888888',
    uid: `8888888820550${id}`,
    authToken: null,
    id: `${id}`,
    addressId: `${id}`,
    phone: '17612345678',
    name: `测试用户${id}`,
    countryName: '中国',
    countryCode: 'chn',
    provinceName: '甘肃省',
    provinceCode: '620000',
    cityName: '甘南藏族自治州',
    cityCode: '623000',
    districtName: '碌曲县',
    districtCode: '623026',
    detailAddress: `松日鼎盛大厦${id}层${id}号`,
    isDefault: `${id}` === '0' ? 1 : 0,
    addressTag: id === 0 ? '' : '公司',
    latitude: '34.59103',
    longitude: '102.48699',
    storeId: null,
  };
}

/** 地址列表 */
export function genAddressList(len = 10) {
  return new Array(len).fill(0).map((_, idx) => genAddress(idx));
}


export function adaptAddress(real = {}) {
  if (real && real.addressId && real.phone) return real;
  const source = ensureObject(real);
  const base = genAddress(pickFirst(source.id, source.addressId, 0));
  const isDefault = pickFirst(source.isDefault, source.default, base.isDefault);
  return {
    ...base,
    saasId: pickFirst(source.saasId, base.saasId),
    uid: pickFirst(source.uid, base.uid),
    id: toString(pickFirst(source.id, source.addressId), base.id),
    addressId: toString(pickFirst(source.addressId, source.id), base.addressId),
    phone: pickFirst(source.phone, source.phoneNumber, base.phone),
    name: pickFirst(source.name, source.receiverName, base.name),
    countryName: pickFirst(source.countryName, source.country, base.countryName),
    countryCode: pickFirst(source.countryCode, base.countryCode),
    provinceName: pickFirst(source.provinceName, source.province, base.provinceName),
    provinceCode: pickFirst(source.provinceCode, base.provinceCode),
    cityName: pickFirst(source.cityName, source.city, base.cityName),
    cityCode: pickFirst(source.cityCode, base.cityCode),
    districtName: pickFirst(source.districtName, source.district, base.districtName),
    districtCode: pickFirst(source.districtCode, base.districtCode),
    detailAddress: pickFirst(source.detailAddress, source.addressDetail, source.address, base.detailAddress),
    isDefault: typeof isDefault === 'boolean' ? (isDefault ? 1 : 0) : isDefault,
    addressTag: pickFirst(source.addressTag, source.tag, base.addressTag),
    latitude: pickFirst(source.latitude, base.latitude),
    longitude: pickFirst(source.longitude, base.longitude),
    storeId: source.storeId ?? base.storeId,
  };
}

export function adaptDeliveryAddressList(realList = []) {
  const listSource = Array.isArray(realList)
    ? realList
    : ensureArray(realList?.list || realList?.items || realList?.data?.list);
  const list = listSource.length ? listSource.map((item) => adaptAddress(item)) : genAddressList();
  return list.map((address) => ({
    ...address,
    phoneNumber: address.phone,
    address: `${address.provinceName}${address.cityName}${address.districtName}${address.detailAddress}`,
    tag: address.addressTag,
  }));
}
