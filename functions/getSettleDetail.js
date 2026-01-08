exports.main = async (event = {}) => ({
  goodsRequestList: Array.isArray(event.goodsRequestList) ? event.goodsRequestList : [],
  couponList: Array.isArray(event.couponList) ? event.couponList : [],
  userAddressReq: event.userAddressReq || event.userAddress || null,
});
