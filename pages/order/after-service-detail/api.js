const dayjs = require('dayjs');

export const formatTime = (date, template) => dayjs(date).format(template);

// 状态名称映射
const StatusNameMapping = {
  'APPLIED': '待审核',
  'SELLER_AGREED': '商家已同意',
  'SELLER_REJECTED': '商家已拒绝',
  'WAIT_BUYER_RETURN': '等待寄回商品',
  'BUYER_SHIPPED': '已寄回商品',
  'SELLER_RECEIVED': '商家已收货',
  'REFUNDING': '退款中',
  'REFUNDED': '已退款',
  'CANCELED': '已取消',
};

// 状态描述映射
const StatusDescMapping = {
  'APPLIED': '商家将在24小时内审核，如24小时后商家仍未审核，系统将自动审核通过',
  'SELLER_AGREED': '商家已审核确认，预计1小时内发起退款',
  'SELLER_REJECTED': '商家拒绝了您的售后申请',
  'WAIT_BUYER_RETURN': '请尽快将商品寄回，并填写物流单号',
  'BUYER_SHIPPED': '商品已寄出，等待商家收货确认',
  'SELLER_RECEIVED': '商家已收到退货商品',
  'REFUNDING': '退款处理中，请耐心等待',
  'REFUNDED': '商家已退款，退回资金将原路三个工作日返回您的账户',
  'CANCELED': '售后申请已取消',
};

// 状态码映射
const StatusMapping = {
  'APPLIED': 10,
  'SELLER_AGREED': 20,
  'SELLER_REJECTED': 60,
  'WAIT_BUYER_RETURN': 20,
  'BUYER_SHIPPED': 20,
  'SELLER_RECEIVED': 20,
  'REFUNDING': 20,
  'REFUNDED': 50,
  'CANCELED': 60,
};

// 用户状态映射（用于详情页显示）
const UserStatusMapping = {
  'APPLIED': 100,
  'SELLER_AGREED': 110,
  'SELLER_REJECTED': 170,
  'WAIT_BUYER_RETURN': 120,
  'BUYER_SHIPPED': 130,
  'SELLER_RECEIVED': 140,
  'REFUNDING': 150,
  'REFUNDED': 160,
  'CANCELED': 170,
};

// 根据状态生成操作按钮
function getButtons(status, type) {
  const buttons = [];

  switch (status) {
    case 'APPLIED':
      buttons.push({ name: '撤销申请', primary: false, type: 2 });
      break;
    case 'SELLER_AGREED':
    case 'WAIT_BUYER_RETURN':
      if (type === 'RETURN_REFUND') {
        buttons.push({ name: '填写运单号', primary: false, type: 3 });
      }
      break;
    case 'BUYER_SHIPPED':
      buttons.push({ name: '修改运单号', primary: false, type: 4 });
      buttons.push({ name: '查看物流', primary: false, type: 5 });
      break;
    case 'SELLER_RECEIVED':
    case 'REFUNDING':
    case 'REFUNDED':
      if (type === 'RETURN_REFUND') {
        buttons.push({ name: '查看物流', primary: false, type: 5 });
      }
      break;
  }

  return buttons;
}

/**
 * 获取售后详情
 * @param {Object} params - 参数
 * @param {string} params.rightsNo - 售后单号
 */
export function getRightsDetail({ rightsNo }) {
  console.log('[获取售后详情] 参数 rightsNo:', rightsNo);

  if (!rightsNo) {
    console.error('[获取售后详情] 无效的售后单号:', rightsNo);
    return Promise.reject(new Error('售后单号无效，请重新申请'));
  }

  return wx.cloud.callFunction({
    name: 'afterSale',
    data: {
      action: 'getDetail',
      afterSaleNo: rightsNo,
    },
  }).then(res => {
    console.log('[获取售后详情] 云函数原始返回:', JSON.stringify(res, null, 2));
    if (!res.result || !res.result.success) {
      console.error('[获取售后详情] 失败:', res.result);
      throw new Error(res.result?.error || '获取售后详情失败');
    }

    const item = res.result.data;
    console.log('[获取售后详情] 售后数据:', JSON.stringify(item, null, 2));
    if (!item) {
      throw new Error('售后单不存在');
    }

    const goodsList = item.orderSnapshot?.goodsList || [];
    const tabStatus = StatusMapping[item.status] || 10;
    const userStatus = UserStatusMapping[item.status] || 100;

    // 转换为页面期望的数据格式
    const detailData = {
      buttonVOs: getButtons(item.status, item.type),
      storeId: item.storeId || '',
      createTime: String(item.createTime),
      refundMethodList: [{
        refundMethodAmount: item.applyAmount,
        refundMethodName: '原路退回',
      }],
      rights: {
        rightsNo: item.afterSaleNo,
        orderNo: item.orderNo,
        storeName: '店铺',
        rightsType: item.type === 'ONLY_REFUND' ? 20 : 10,
        rightsStatus: tabStatus,
        rightsStatusName: StatusNameMapping[item.status] || item.status,
        refundAmount: item.applyAmount,
        refundRequestAmount: item.applyAmount,
        userRightsStatus: userStatus,
        userRightsStatusName: StatusNameMapping[item.status] || item.status,
        userRightsStatusDesc: StatusDescMapping[item.status] || item.statusDesc || '',
        afterSaleRequireType: item.type === 'ONLY_REFUND' ? 'REFUND_MONEY' : 'REFUND_GOODS_MONEY',
        rightsReasonDesc: item.reasonText || '',
        createTime: String(item.createTime),
        rightsImageUrls: item.evidence || [],
        rawStatus: item.status, // 保存原始状态用于判断是否可以再次申请
      },
      rightsItem: goodsList.map((goods, i) => ({
        goodsName: goods.goodsName || goods.title || '商品',
        goodsPictureUrl: goods.goodsPictureUrl || goods.thumb || goods.image || goods.primaryImage || '',
        actualPrice: goods.actualPrice || goods.price || 0,
        itemRefundAmount: item.applyAmount,
        rightsQuantity: goods.buyQuantity || goods.quantity || 1,
        specInfo: goods.specifications
          ? goods.specifications.map(s => ({ specValues: s.specValue || s }))
          : (goods.specs ? goods.specs.map(s => ({ specValues: s })) : []),
        skuId: goods.skuId || i,
      })),
      rightsRefund: {
        traceNo: item.afterSaleNo,
        refundDesc: item.reasonText || '',
        refundAmount: item.applyAmount,
      },
      logisticsVO: {
        logisticsNo: item.buyerLogistics?.logisticsNo || '',
        logisticsCompanyName: item.buyerLogistics?.company || '',
        logisticsCompanyCode: '',
        remark: '',
        receiverName: '',
        receiverPhone: '',
        receiverProvince: '',
        receiverCity: '',
        receiverCountry: '',
        receiverArea: '',
        receiverAddress: '',
      },
    };

    return {
      data: [detailData],
      code: 'Success',
      success: true,
    };
  }).catch(err => {
    console.error('获取售后详情失败:', err);
    throw err;
  });
}

/**
 * 取消售后申请
 * @param {string} afterSaleId - 售后单ID
 */
export function cancelRights(afterSaleId) {
  return wx.cloud.callFunction({
    name: 'afterSale',
    data: {
      action: 'cancel',
      afterSaleId,
    },
  }).then(res => {
    if (!res.result || !res.result.success) {
      throw new Error(res.result?.error || '取消售后失败');
    }
    return {
      data: {},
      code: 'Success',
      success: true,
    };
  });
}
