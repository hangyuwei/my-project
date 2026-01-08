const STORAGE_KEY = 'local_order_records';

const toInt = (value, fallback = 0) => {
  const num = parseInt(value, 10);
  return Number.isNaN(num) ? fallback : num;
};

const toAmount = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  return Math.round(num);
};

export function getLocalOrders() {
  const data = wx.getStorageSync(STORAGE_KEY);
  return Array.isArray(data) ? data : [];
}

export function findLocalOrder(orderNo) {
  if (!orderNo) return null;
  const list = getLocalOrders();
  return list.find((order) => order.orderNo === orderNo) || null;
}

export function buildLocalOrder(params = {}) {
  const now = Date.now();
  const orderNo = params.orderNo || `local-${now}`;
  const goodsRequestList = Array.isArray(params.goodsRequestList) ? params.goodsRequestList : [];
  const storeInfoList = Array.isArray(params.storeInfoList) ? params.storeInfoList : [];
  const settleDetailData = params.settleDetailData || {};
  const userAddress = params.userAddress || settleDetailData.userAddress || {};

  const storeId = goodsRequestList[0]?.storeId || 'local';
  const storeName =
    storeInfoList[0]?.storeName ||
    settleDetailData.storeGoodsList?.[0]?.storeName ||
    'Local Store';

  const orderItemVOs = goodsRequestList.map((goods, index) => {
    const price = toAmount(goods.price || 0);
    const originPrice = toAmount(goods.originPrice || price);
    const quantity = toInt(goods.quantity, 1);
    const total = price * quantity;
    const name = goods.goodsName || goods.title || '';
    const image = goods.primaryImage || goods.thumb || '';
    return {
      id: `${orderNo}-${index}`,
      orderNo,
      spuId: goods.spuId,
      skuId: goods.skuId,
      roomId: goods.roomId || null,
      goodsMainType: 0,
      goodsViceType: 0,
      goodsName: name,
      goodsPictureUrl: image,
      originPrice: String(originPrice),
      actualPrice: String(price),
      specifications: Array.isArray(goods.specInfo) ? goods.specInfo : [],
      buyQuantity: quantity,
      itemTotalAmount: String(total),
      itemDiscountAmount: '0',
      itemPaymentAmount: String(total),
      goodsPaymentPrice: String(price),
      tagPrice: null,
      tagText: null,
      outCode: null,
      labelVOs: null,
      buttonVOs: null,
    };
  });

  const totalAmount = orderItemVOs.reduce((sum, item) => sum + toAmount(item.itemTotalAmount), 0);
  const receiverCity = userAddress.cityName || userAddress.city || userAddress.receiverCity || '';
  const receiverCountry = userAddress.districtName || userAddress.receiverCountry || '';
  const receiverArea = userAddress.area || userAddress.receiverArea || '';
  const receiverAddress = userAddress.detailAddress || userAddress.address || userAddress.receiverAddress || '';
  const receiverName = userAddress.name || userAddress.receiverName || '';
  const receiverPhone = userAddress.phone || userAddress.receiverPhone || '';

  return {
    saasId: 'local',
    storeId,
    storeName,
    uid: 'local',
    parentOrderNo: orderNo,
    orderId: orderNo,
    orderNo,
    orderType: 0,
    orderSubType: 0,
    orderStatus: 10,
    orderSubStatus: null,
    totalAmount: String(totalAmount),
    goodsAmount: String(totalAmount),
    goodsAmountApp: String(totalAmount),
    paymentAmount: String(totalAmount),
    freightFee: '0',
    packageFee: '0',
    discountAmount: '0',
    channelType: 0,
    channelSource: '',
    channelIdentity: '',
    remark: '',
    cancelType: null,
    cancelReasonType: null,
    cancelReason: null,
    rightsType: null,
    createTime: String(now),
    orderItemVOs,
    logisticsVO: {
      logisticsType: 1,
      logisticsNo: '',
      logisticsStatus: null,
      logisticsCompanyCode: '',
      logisticsCompanyName: '',
      receiverAddressId: userAddress.id || '',
      provinceCode: userAddress.provinceCode || '',
      cityCode: userAddress.cityCode || '',
      countryCode: userAddress.districtCode || '',
      receiverProvince: userAddress.provinceName || '',
      receiverCity,
      receiverCountry,
      receiverArea,
      receiverAddress,
      receiverPostCode: '',
      receiverLongitude: userAddress.longitude || '',
      receiverLatitude: userAddress.latitude || '',
      receiverIdentity: 'local',
      receiverPhone,
      receiverName,
      expectArrivalTime: null,
      senderName: '',
      senderPhone: '',
      senderAddress: '',
      sendTime: null,
      arrivalTime: null,
    },
    paymentVO: {
      payStatus: 1,
      amount: String(totalAmount),
      currency: null,
      payType: null,
      payWay: null,
      payWayName: null,
      interactId: null,
      traceNo: null,
      channelTrxNo: null,
      period: null,
      payTime: null,
      paySuccessTime: String(now),
    },
    buttonVOs: [],
    labelVOs: null,
    invoiceVO: null,
    couponAmount: null,
    autoCancelTime: null,
    orderStatusName: 'Pending delivery',
    orderStatusRemark: null,
    logisticsLogVO: null,
    invoiceStatus: null,
    invoiceDesc: null,
    invoiceUrl: null,
  };
}

export function addLocalOrder(order) {
  if (!order || !order.orderNo) return null;
  const list = getLocalOrders();
  const exists = list.find((item) => item.orderNo === order.orderNo);
  if (exists) return order;
  list.unshift(order);
  wx.setStorageSync(STORAGE_KEY, list);
  return order;
}
