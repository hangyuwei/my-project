/**
 * 售后服务
 */

// 获取售后入口信息
export function getAfterSaleEntry(orderNo, itemId) {
  return wx.cloud.callFunction({
    name: 'afterSale',
    data: {
      action: 'getEntry',
      orderNo,
      itemId,
    },
  }).then(res => {
    if (res.result && res.result.success) {
      return res.result.data;
    }
    throw new Error(res.result?.error || '获取售后入口失败');
  });
}

// 申请售后
export function applyAfterSale(params) {
  const { orderNo, itemId, type, amount, reasonCode, reasonText, evidence } = params;
  return wx.cloud.callFunction({
    name: 'afterSale',
    data: {
      action: 'apply',
      orderNo,
      itemId,
      type,
      amount,
      reasonCode,
      reasonText,
      evidence,
    },
  }).then(res => {
    if (res.result && res.result.success) {
      return res.result.data;
    }
    throw new Error(res.result?.error || '申请售后失败');
  });
}

// 取消售后
export function cancelAfterSale(afterSaleId) {
  return wx.cloud.callFunction({
    name: 'afterSale',
    data: {
      action: 'cancel',
      afterSaleId,
    },
  }).then(res => {
    if (res.result && res.result.success) {
      return true;
    }
    throw new Error(res.result?.error || '取消售后失败');
  });
}

// 获取售后详情
export function getAfterSaleDetail(afterSaleId) {
  return wx.cloud.callFunction({
    name: 'afterSale',
    data: {
      action: 'getDetail',
      afterSaleId,
    },
  }).then(res => {
    if (res.result && res.result.success) {
      return res.result.data;
    }
    throw new Error(res.result?.error || '获取售后详情失败');
  });
}

// 获取售后列表
export function getAfterSaleList(params = {}) {
  const { pageIndex = 0, pageSize = 10, status } = params;
  return wx.cloud.callFunction({
    name: 'afterSale',
    data: {
      action: 'getList',
      pageIndex,
      pageSize,
      status,
    },
  }).then(res => {
    if (res.result && res.result.success) {
      return res.result.data;
    }
    throw new Error(res.result?.error || '获取售后列表失败');
  });
}

// 买家填写物流
export function buyerShip(afterSaleId, logisticsCompany, logisticsNo) {
  return wx.cloud.callFunction({
    name: 'afterSale',
    data: {
      action: 'buyerShip',
      afterSaleId,
      logisticsCompany,
      logisticsNo,
    },
  }).then(res => {
    if (res.result && res.result.success) {
      return true;
    }
    throw new Error(res.result?.error || '填写物流失败');
  });
}

// 售后类型
export const AfterSaleType = {
  ONLY_REFUND: 'ONLY_REFUND',     // 仅退款
  RETURN_REFUND: 'RETURN_REFUND', // 退货退款
};

// 售后类型描述
export const AfterSaleTypeDesc = {
  [AfterSaleType.ONLY_REFUND]: '仅退款',
  [AfterSaleType.RETURN_REFUND]: '退货退款',
};

// 退款原因列表
export const RefundReasons = [
  { code: '1', text: '不想要了' },
  { code: '2', text: '买错了/订单信息错误' },
  { code: '3', text: '协商一致退款' },
  { code: '4', text: '缺货' },
  { code: '5', text: '未按约定时间发货' },
  { code: '6', text: '快递一直未送达' },
  { code: '7', text: '其他原因' },
];

// 退货原因列表
export const ReturnReasons = [
  { code: '10', text: '商品与描述不符' },
  { code: '11', text: '商品质量问题' },
  { code: '12', text: '收到商品破损' },
  { code: '13', text: '发错货/漏发' },
  { code: '14', text: '商品存在异味' },
  { code: '15', text: '不喜欢/不想要' },
  { code: '16', text: '其他原因' },
];
