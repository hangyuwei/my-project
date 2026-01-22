import { callCloudFunction } from '../_utils/cloud';
import { addLocalOrder, buildLocalOrder } from './localOrders';

/** fetch settle detail */
export function fetchSettleDetail(params) {
  const { goodsRequestList = [], userAddressReq, couponList = [] } = params;

  const storeMap = new Map();

  goodsRequestList.forEach((goods) => {
    const storeId = goods.storeId || 'local';
    if (!storeMap.has(storeId)) {
      storeMap.set(storeId, {
        storeId,
        storeName: goods.storeName || 'Local Store',
        storeTotalAmount: 0,
        storeTotalPayAmount: 0,
        skuDetailVos: [],
      });
    }

    const store = storeMap.get(storeId);
    const price = parseFloat(goods.price || 0);
    const quantity = parseInt(goods.quantity || 1, 10);
    const totalPrice = price * quantity;

    store.storeTotalAmount += totalPrice;
    store.storeTotalPayAmount += totalPrice;
    store.skuDetailVos.push({
      uid: goods.uid || 'local',
      saasId: goods.saasId || 'local',
      spuId: goods.spuId,
      skuId: goods.skuId,
      storeId,
      goodsName: goods.title || goods.goodsName || '',
      image: goods.thumb || goods.primaryImage || '',
      quantity,
      price: goods.price || '0',
      settlePrice: goods.price || '0',
      tagPrice: goods.tagPrice || null,
      tagText: goods.tagText || null,
      skuSpecLst: Array.isArray(goods.specInfo)
        ? goods.specInfo.map((spec) => ({ specValue: spec }))
        : [],
      stockQuantity: goods.stockQuantity || 999,
      available: goods.available !== undefined ? goods.available : 1,
    });
  });

  const storeGoodsList = Array.from(storeMap.values());

  const totalAmount = storeGoodsList.reduce((sum, store) => sum + store.storeTotalAmount, 0);
  const totalPayAmount = storeGoodsList.reduce((sum, store) => sum + store.storeTotalPayAmount, 0);

  return Promise.resolve({
    data: {
      storeGoodsList,
      invalidGoodItems: [],
      limitGoodsList: [],
      outOfStockGoodsList: [],
      abnormalDeliveryGoodsList: [],
      inValidGoodsList: [],
      couponList: couponList || [],
      userAddress: userAddressReq || null,
      totalAmount,
      totalPayAmount,
      totalDiscountAmount: 0,
      settleType: 1,
    },
    success: true,
  });
}

/* submit order */
export function dispatchCommitPay(params) {
  const app = getApp();
  const openid = app?.globalData?.openid;
  if (!openid) {
    console.error('[order] openid missing, abort order creation');
    return Promise.resolve({
      data: { isSuccess: false },
      success: false,
      code: 'Fail',
      msg: 'OpenID missing. Please relaunch and retry.',
    });
  }

  const now = Date.now();
  const orderNo = `ORDER-${now}`;

  const { goodsRequestList = [], userAddressReq, storeInfoList = [], totalAmount } = params;

  const orderItemVOs = goodsRequestList.map((goods, index) => {
    const price = parseFloat(goods.price || 0);
    const quantity = parseInt(goods.quantity || 1, 10);
    const total = price * quantity;
    return {
      id: `${orderNo}-${index}`,
      orderNo,
      spuId: goods.spuId,
      skuId: goods.skuId,
      goodsName: goods.title || goods.goodsName || '',
      goodsPictureUrl: goods.thumb || goods.primaryImage || '',
      originPrice: String(goods.originPrice || price),
      actualPrice: String(price),
      specifications: Array.isArray(goods.specInfo) ? goods.specInfo : [],
      buyQuantity: quantity,
      itemTotalAmount: String(total),
      itemDiscountAmount: '0',
      itemPaymentAmount: String(total),
      goodsPaymentPrice: String(price),
    };
  });

  const orderData = {
    orderNo,
    orderId: orderNo,
    orderStatus: 5, // 5=待付款（新建订单）
    orderStatusName: '待付款',
    createTime: String(now),
    totalAmount: String(totalAmount || 0),
    goodsAmount: String(totalAmount || 0),
    paymentAmount: String(totalAmount || 0),
    freightFee: '0',
    discountAmount: '0',
    orderItemVOs,
    logisticsVO: {
      receiverName: userAddressReq?.name || '',
      receiverPhone: userAddressReq?.phone || '',
      receiverProvince: userAddressReq?.provinceName || '',
      receiverCity: userAddressReq?.cityName || '',
      receiverCountry: userAddressReq?.districtName || '',
      receiverAddress: userAddressReq?.detailAddress || '',
    },
    storeId: goodsRequestList[0]?.storeId || 'local',
    storeName: storeInfoList[0]?.storeName || 'Local Store',
    remark: storeInfoList[0]?.remark || '',
  };

  const localOrder = buildLocalOrder({
    orderNo,
    goodsRequestList,
    storeInfoList,
    settleDetailData: {
      totalAmount,
      totalPayAmount: totalAmount,
      userAddress: userAddressReq,
    },
    userAddress: userAddressReq,
  });

  // 立即保存到本地存储，无论后端是否可用
  addLocalOrder(localOrder);
  console.log('[order] Order saved to local storage:', orderNo);

  return callCloudFunction('createOrder', { orderData })
    .then((real) => {
      if (real && real.success) {
        console.log('[order] Cloud function success, order synced to backend');
        return {
          data: {
            isSuccess: true,
            orderNo: real.orderNo || orderNo,
            orderId: real.orderId || orderNo,
            tradeNo: real.orderNo || orderNo,
            channel: 'wechat',
            payInfo: {},
          },
          success: true,
          code: 'Success',
        };
      }
      // 即使后端失败，本地订单已保存，返回成功
      console.warn('[order] Cloud function returned error, but local order is saved');
      return {
        data: {
          isSuccess: true,
          orderNo: orderNo,
          orderId: orderNo,
          tradeNo: orderNo,
          channel: 'wechat',
          payInfo: {},
        },
        success: true,
        code: 'Success',
      };
    })
    .catch((error) => {
      // 即使后端连接失败，本地订单已保存，返回成功
      console.warn('[order] Cloud function failed, but local order is saved:', error);
      return {
        data: {
          isSuccess: true,
          orderNo: orderNo,
          orderId: orderNo,
          tradeNo: orderNo,
          channel: 'wechat',
          payInfo: {},
        },
        success: true,
        code: 'Success',
      };
    });
}

export function dispatchSupplementInvoice() {
  return callCloudFunction('supplementInvoice');
}