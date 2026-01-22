/**
 * 售后列表 API - 调用云函数获取真实数据
 */

// 售后状态映射（云函数状态 -> 页面Tab状态码）
const StatusMapping = {
  'APPLIED': 10,           // 待审核
  'SELLER_AGREED': 20,     // 已审核
  'SELLER_REJECTED': 60,   // 已关闭（商家拒绝）
  'WAIT_BUYER_RETURN': 20, // 已审核（等待买家寄回）
  'BUYER_SHIPPED': 20,     // 已审核（买家已寄回）
  'SELLER_RECEIVED': 20,   // 已审核（商家已收货）
  'REFUNDING': 20,         // 已审核（退款处理中）
  'REFUNDED': 50,          // 已完成
  'CANCELED': 60,          // 已关闭
};

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
 * 获取售后列表
 * @param {Object} params - 参数
 * @param {Object} params.parameter - 查询参数
 * @param {number} params.parameter.pageSize - 每页数量
 * @param {number} params.parameter.pageNum - 页码
 * @param {number} params.parameter.afterServiceStatus - 状态筛选（10/20/50/60）
 */
export function getRightsList({ parameter: { afterServiceStatus = -1, pageNum = 1, pageSize = 10 } }) {
  // 调用云函数获取数据
  return wx.cloud.callFunction({
    name: 'afterSale',
    data: {
      action: 'getList',
      pageIndex: pageNum - 1,  // 云函数使用0开始的索引
      pageSize,
      // 如果是全部(-1)则不传status，否则传对应的云函数状态数组
      // 注意：云函数当前只支持单状态筛选，这里先不筛选，在前端过滤
    },
  }).then(res => {
    if (!res.result || !res.result.success) {
      throw new Error(res.result?.error || '获取售后列表失败');
    }

    const list = res.result.data || [];

    // 转换数据格式
    let dataList = list.map(item => {
      const tabStatus = StatusMapping[item.status] || 10;
      const goodsList = item.orderSnapshot?.goodsList || [];

      return {
        buttonVOs: getButtons(item.status, item.type),
        storeId: item.storeId || '',
        createTime: String(item.createTime),
        rights: {
          rightsNo: item.afterSaleNo,
          orderNo: item.orderNo,
          storeName: '店铺',
          rightsType: item.type === 'ONLY_REFUND' ? 20 : 10,
          rightsStatus: tabStatus,
          rightsStatusName: StatusNameMapping[item.status] || item.status,
          refundAmount: item.applyAmount,
          userRightsStatus: tabStatus,
          userRightsStatusName: StatusNameMapping[item.status] || item.status,
          userRightsStatusDesc: StatusDescMapping[item.status] || item.statusDesc || '',
          afterSaleRequireType: item.type === 'ONLY_REFUND' ? 'REFUND_MONEY' : 'RETURN_GOODS',
        },
        rightsItem: goodsList.map((goods, i) => ({
          goodsName: goods.goodsName || goods.title || '商品',
          goodsPictureUrl: goods.goodsPictureUrl || goods.thumb || goods.image || goods.primaryImage || '',
          actualPrice: goods.actualPrice || goods.price || 0,
          itemRefundAmount: item.applyAmount,
          specInfo: goods.specifications
            ? goods.specifications.map(s => ({ specValues: s.specValue || s }))
            : (goods.specs ? goods.specs.map(s => ({ specValues: s })) : []),
          skuId: goods.skuId || i,
          buyQuantity: goods.buyQuantity || goods.quantity || 1,
        })),
        logisticsVO: {
          logisticsNo: item.buyerLogistics?.logisticsNo || '',
          logisticsCompanyName: item.buyerLogistics?.company || '',
          logisticsCompanyCode: '',
        },
        // 保存原始数据用于详情页
        _raw: item,
      };
    });

    // 如果指定了状态筛选，在前端过滤
    if (afterServiceStatus !== -1) {
      dataList = dataList.filter(item => item.rights.rightsStatus === afterServiceStatus);
    }

    // 计算各状态数量
    const states = {
      audit: list.filter(item => StatusMapping[item.status] === 10).length,
      approved: list.filter(item => StatusMapping[item.status] === 20).length,
      complete: list.filter(item => StatusMapping[item.status] === 50).length,
      closed: list.filter(item => StatusMapping[item.status] === 60).length,
    };

    return {
      data: {
        pageNum,
        pageSize,
        totalCount: dataList.length,
        states,
        dataList,
      },
      code: 'Success',
      success: true,
    };
  }).catch(err => {
    console.error('获取售后列表失败:', err);
    // 返回空列表而不是抛出错误，避免页面崩溃
    return {
      data: {
        pageNum,
        pageSize,
        totalCount: 0,
        states: { audit: 0, approved: 0, complete: 0, closed: 0 },
        dataList: [],
      },
      code: 'Success',
      success: true,
    };
  });
}
