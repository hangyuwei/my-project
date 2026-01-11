import { ensureObject, pickFirst } from './adaptUtils';

const userInfo = {
  avatarUrl:
    'https://we-retail-static-1300977798.cos.ap-guangzhou.myqcloud.com/retail-ui/components-exp/avatar/avatar-1.jpg',
  nickName: 'TDesign 🌟',
  phoneNumber: '13438358888',
  gender: 2,
};
const countsData = [
  {
    num: 2,
    name: '积分',
    type: 'point',
  },
  {
    num: 10,
    name: '优惠券',
    type: 'coupon',
  },
];

const orderTagInfos = [
  {
    orderNum: 1,
    tabType: 5,
  },
  {
    orderNum: 1,
    tabType: 10,
  },
  {
    orderNum: 1,
    tabType: 40,
  },
  {
    orderNum: 0,
    tabType: 0,
  },
];

const customerServiceInfo = {
  servicePhone: '4006336868',
  serviceTimeDuration: '每周三至周五 9:00-12:00  13:00-15:00',
};

export const genSimpleUserInfo = () => ({ ...userInfo });

export const genUsercenter = () => ({
  userInfo,
  countsData,
  orderTagInfos,
  customerServiceInfo,
});


export function adaptUsercenter(real = {}) {
  if (real && real.userInfo && real.countsData) return real;
  const source = ensureObject(real);
  const base = genUsercenter();
  return {
    userInfo: {
      ...base.userInfo,
      ...ensureObject(source.userInfo || source.profile),
    },
    countsData: Array.isArray(source.countsData) ? source.countsData : base.countsData,
    orderTagInfos: Array.isArray(source.orderTagInfos) ? source.orderTagInfos : base.orderTagInfos,
    customerServiceInfo: source.customerServiceInfo || base.customerServiceInfo,
  };
}

export function adaptPerson(real = {}) {
  if (real && real.address) return real;
  const source = ensureObject(real);
  const base = genSimpleUserInfo();
  const address = ensureObject(source.address || source.location);
  return {
    ...base,
    ...source,
    address: {
      provinceName: pickFirst(address.provinceName, address.province, ''),
      provinceCode: pickFirst(address.provinceCode, ''),
      cityName: pickFirst(address.cityName, address.city, ''),
      cityCode: pickFirst(address.cityCode, ''),
    },
  };
}
