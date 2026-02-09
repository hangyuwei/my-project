const STORAGE_KEY_PREFIX = 'local_order_records';
const LEGACY_STORAGE_KEY = 'local_order_records'; // 旧的固定key，用于数据迁移

// 订单按钮类型（与 pages/order/config.js 保持一致）
const OrderButtonTypes = {
  PAY: 1, // 付款
  CANCEL: 2, // 取消订单
  CONFIRM: 3, // 确认收货
  APPLY_REFUND: 4, // 申请售后
  VIEW_REFUND: 5, // 查看退款
  COMMENT: 6, // 评价
  DELETE: 7, // 删除订单
  DELIVERY: 8, // 查看物流
  REBUY: 9, // 再次购买
};

// 根据订单状态生成按钮
function generateButtonsByStatus(orderStatus, hasCommented = false) {
  const buttons = [];

  switch (orderStatus) {
    case 5: // 待付款
      buttons.push({ type: OrderButtonTypes.PAY, name: '付款', primary: true });
      buttons.push({ type: OrderButtonTypes.CANCEL, name: '取消订单', primary: false });
      break;
    case 10: // 待发货
      buttons.push({ type: OrderButtonTypes.APPLY_REFUND, name: '申请退款', primary: false });
      break;
    case 40: // 待收货
      buttons.push({ type: OrderButtonTypes.CONFIRM, name: '确认收货', primary: true });
      buttons.push({ type: OrderButtonTypes.DELIVERY, name: '查看物流', primary: false });
      break;
    case 50: // 已完成/待评价
      // 只有未评价的订单才显示评价按钮
      if (!hasCommented) {
        buttons.push({ type: OrderButtonTypes.COMMENT, name: '评价', primary: true });
      }
      buttons.push({ type: OrderButtonTypes.REBUY, name: '再次购买', primary: !hasCommented ? false : true });
      buttons.push({ type: OrderButtonTypes.DELETE, name: '删除订单', primary: false });
      break;
    case 80: // 已取消
      buttons.push({ type: OrderButtonTypes.DELETE, name: '删除订单', primary: false });
      break;
  }

  return buttons;
}

// 根据订单状态生成商品级别按钮
function generateGoodsButtonsByStatus(orderStatus) {
  const buttons = [];

  // 待收货和已完成状态显示申请售后按钮
  if (orderStatus === 40 || orderStatus === 50) {
    buttons.push({ type: OrderButtonTypes.APPLY_REFUND, name: '申请售后', primary: false });
  }

  return buttons;
}

const toInt = (value, fallback = 0) => {
  const num = parseInt(value, 10);
  return Number.isNaN(num) ? fallback : num;
};

const toAmount = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  return Math.round(num);
};

// 获取当前用户的订单存储key
function getStorageKey() {
  const app = getApp();
  let openid = app?.globalData?.openid;

  // 如果没有openid，强制生成一个
  if (!openid) {
    console.warn('[订单] 未获取到openid，尝试生成默认openid');
    if (app && typeof app.setDefaultOpenid === 'function') {
      app.setDefaultOpenid();
      openid = app.globalData.openid;
    }
  }

  if (!openid) {
    console.warn('[订单] 仍然无法获取openid，使用默认key');
    return LEGACY_STORAGE_KEY;
  }

  const key = `${STORAGE_KEY_PREFIX}_${openid}`;
  console.log('[订单] 使用存储key:', key);
  return key;
}

// 迁移旧的订单数据到新的用户专属key
function migrateOldOrderData() {
  try {
    const currentKey = getStorageKey();

    // 如果当前key就是旧key，说明没有openid，不需要迁移
    if (currentKey === LEGACY_STORAGE_KEY) {
      return;
    }

    // 检查新key是否已有数据
    const newData = wx.getStorageSync(currentKey);
    if (newData && Array.isArray(newData) && newData.length > 0) {
      // 新key已有数据，不需要迁移
      return;
    }

    // 读取旧key的数据
    const oldData = wx.getStorageSync(LEGACY_STORAGE_KEY);
    if (oldData && Array.isArray(oldData) && oldData.length > 0) {
      console.log('[订单] 迁移旧订单数据到用户专属存储', { count: oldData.length });

      // 将旧数据迁移到新key
      wx.setStorageSync(currentKey, oldData);

      // 清除旧key的数据
      wx.removeStorageSync(LEGACY_STORAGE_KEY);

      console.log('[订单] 数据迁移完成');
    }
  } catch (error) {
    console.error('[订单] 数据迁移失败', error);
  }
}

export function getLocalOrders() {
  // 尝试迁移旧数据
  migrateOldOrderData();

  const storageKey = getStorageKey();
  const data = wx.getStorageSync(storageKey);
  const orders = Array.isArray(data) ? data : [];

  // 每次获取时重新生成按钮，确保使用最新的按钮配置
  return orders.map((order) => ({
    ...order,
    buttonVOs: generateButtonsByStatus(order.orderStatus, order.hasCommented === true),
    orderItemVOs: (order.orderItemVOs || []).map((item) => ({
      ...item,
      buttonVOs: generateGoodsButtonsByStatus(order.orderStatus),
    })),
  }));
}

export function findLocalOrder(orderNo) {
  if (!orderNo) return null;
  const list = getLocalOrders();
  return list.find((order) => order.orderNo === orderNo) || null;
}

export function buildLocalOrder(params = {}) {
  const app = getApp();
  const openid = app?.globalData?.openid || 'unknown';

  const now = Date.now();
  const orderNo = params.orderNo || `${openid}-${now}`;
  const goodsRequestList = Array.isArray(params.goodsRequestList) ? params.goodsRequestList : [];
  const storeInfoList = Array.isArray(params.storeInfoList) ? params.storeInfoList : [];
  const settleDetailData = params.settleDetailData || {};
  const userAddress = params.userAddress || settleDetailData.userAddress || {};

  const storeId = goodsRequestList[0]?.storeId || 'local';
  const storeName =
    storeInfoList[0]?.storeName ||
    settleDetailData.storeGoodsList?.[0]?.storeName ||
    'Local Store';

  // 初始订单状态为待付款(5)
  const initialStatus = 5;
  const goodsButtons = generateGoodsButtonsByStatus(initialStatus);

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
      buttonVOs: goodsButtons,
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
    uid: openid,
    openid,
    parentOrderNo: orderNo,
    orderId: orderNo,
    orderNo,
    orderType: 0,
    orderSubType: 0,
    orderStatus: 5, // 5=待付款, 10=待发货, 40=待收货, 60=已完成
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
    remark: params.remark || '',
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
    buttonVOs: generateButtonsByStatus(initialStatus),
    labelVOs: null,
    invoiceVO: null,
    couponAmount: null,
    autoCancelTime: null,
    orderStatusName: '待付款',
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
  const storageKey = getStorageKey();
  wx.setStorageSync(storageKey, list);
  console.log('[订单] 订单已保存到本地:', order.orderNo);
  return order;
}

// 更新本地订单状态
export function updateLocalOrderStatus(orderNo, newStatus, newStatusName) {
  if (!orderNo) return false;
  const list = getLocalOrders();
  const order = list.find((item) => item.orderNo === orderNo);
  if (!order) {
    console.warn('[订单] 未找到订单:', orderNo);
    return false;
  }

  order.orderStatus = newStatus;
  if (newStatusName) {
    order.orderStatusName = newStatusName;
  }

  // 根据新状态更新按钮
  order.buttonVOs = generateButtonsByStatus(newStatus);

  // 更新商品级别按钮
  const goodsButtons = generateGoodsButtonsByStatus(newStatus);
  if (order.orderItemVOs && Array.isArray(order.orderItemVOs)) {
    order.orderItemVOs = order.orderItemVOs.map((item) => ({
      ...item,
      buttonVOs: goodsButtons,
    }));
  }

  // 如果是付款成功，更新支付时间
  if (newStatus === 10) {
    order.paymentVO.payStatus = 2;
    order.paymentVO.payTime = String(Date.now());
    order.paymentVO.paySuccessTime = String(Date.now());
  }

  const storageKey = getStorageKey();
  wx.setStorageSync(storageKey, list);
  console.log('[订单] 订单状态已更新:', orderNo, newStatus, newStatusName);
  return true;
}

// 标记本地订单为已评价
export function markLocalOrderCommented(orderNo) {
  if (!orderNo) {
    console.warn('[订单] 标记评价失败：订单号为空');
    return false;
  }

  try {
    const storageKey = getStorageKey();
    const data = wx.getStorageSync(storageKey);
    const orders = Array.isArray(data) ? data : [];

    const order = orders.find((o) => o.orderNo === orderNo);
    if (!order) {
      console.warn('[订单] 标记评价失败：未找到订单', orderNo);
      return false;
    }

    order.hasCommented = true;
    order.commentTime = Date.now();

    wx.setStorageSync(storageKey, orders);
    console.log('[订单] 订单已标记为已评价:', orderNo);
    return true;
  } catch (error) {
    console.error('[订单] 标记评价失败', error);
    return false;
  }
}

// 删除本地订单
export function deleteLocalOrder(orderNo) {
  if (!orderNo) {
    console.warn('[订单] 删除订单失败：订单号为空');
    return false;
  }

  try {
    const storageKey = getStorageKey();
    const data = wx.getStorageSync(storageKey);
    const orders = Array.isArray(data) ? data : [];

    const index = orders.findIndex((order) => order.orderNo === orderNo);
    if (index === -1) {
      console.warn('[订单] 删除订单失败：未找到订单', orderNo);
      return false;
    }

    orders.splice(index, 1);
    wx.setStorageSync(storageKey, orders);
    console.log('[订单] 订单已删除:', orderNo);
    return true;
  } catch (error) {
    console.error('[订单] 删除订单失败', error);
    return false;
  }
}

// 清除所有订单数据（用于调试或用户登出场景）
export function clearAllOrders() {
  try {
    // 清除当前用户的订单
    const storageKey = getStorageKey();
    wx.removeStorageSync(storageKey);

    // 清除旧的固定key订单
    wx.removeStorageSync(LEGACY_STORAGE_KEY);

    console.log('[订单] 已清除所有订单数据');
  } catch (error) {
    console.error('[订单] 清除订单数据失败', error);
  }
}
