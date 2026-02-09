export const config = {
  /** 是否使用mock代替api返回 */
  useMock: false,
  cloudEnvId: 'dfhxcx-7gwr0cb34dd24d36',
  cloudBaseUrl: 'http://127.0.0.1:3001',
  // Force cloud function calls to use cloudBaseUrl (local mock server).
  forceLocalCloud: false,
  /** 强制走 mock 的服务（useMock=false 时生效） */
  mockServices: [
    'activity.fetchActivity',
    'activity.fetchActivityList',
    'coupon.fetchCouponList',
    'coupon.fetchCouponDetail',
    'good.createGoods',
    'good.getSearchHistory',
    'good.getSearchPopular',
    'good.getCommentDetail',
    'order.dispatchConfirmReceived',
    'order.dispatchSupplementInvoice',
    'order.fetchBusinessTime',
    'order.orderSubmitCommentGoods',
    'promotion.fetchPromotion',
    'usercenter.fetchUserCenter',
    'usercenter.fetchPerson',
  ],
  /** 强制走真实 API 的服务（useMock=true 时也生效） */
  realServices: [
    'home.fetchHome',
    'good.fetchGoodsList',
    'good.fetchGoodsListSearch',
    'good.fetchGood',
    'good.getSearchResult',
    // 售后相关服务 - 只有提交售后申请需要真实云函数
    // fetchRightsPreview 和 fetchApplyReasonList 使用 mock 数据即可（静态列表）
    'order.dispatchApplyService',
    // 地址相关服务 - 使用真实云函数
    'address.fetchDeliveryAddress',
    'address.fetchDeliveryAddressList',
  ],
};

export const cdnBase =
  'https://we-retail-static-1300977798.cos.ap-guangzhou.myqcloud.com/retail-mp';

