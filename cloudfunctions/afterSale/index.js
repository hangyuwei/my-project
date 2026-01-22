const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

// 售后状态
const AfterSaleStatus = {
  APPLIED: 'APPLIED',           // 买家已申请
  SELLER_AGREED: 'SELLER_AGREED', // 商家同意
  SELLER_REJECTED: 'SELLER_REJECTED', // 商家拒绝
  WAIT_BUYER_RETURN: 'WAIT_BUYER_RETURN', // 等待买家退货
  BUYER_SHIPPED: 'BUYER_SHIPPED', // 买家已寄回
  SELLER_RECEIVED: 'SELLER_RECEIVED', // 商家已收货
  REFUNDING: 'REFUNDING',       // 退款中
  REFUNDED: 'REFUNDED',         // 已退款（终态）
  CANCELED: 'CANCELED',         // 已取消（终态）
};

// 售后类型
const AfterSaleType = {
  ONLY_REFUND: 'ONLY_REFUND',     // 仅退款
  RETURN_REFUND: 'RETURN_REFUND', // 退货退款
};

// 售后状态描述
const AfterSaleStatusDesc = {
  [AfterSaleStatus.APPLIED]: '等待商家处理',
  [AfterSaleStatus.SELLER_AGREED]: '商家已同意',
  [AfterSaleStatus.SELLER_REJECTED]: '商家已拒绝',
  [AfterSaleStatus.WAIT_BUYER_RETURN]: '请寄回商品',
  [AfterSaleStatus.BUYER_SHIPPED]: '等待商家收货',
  [AfterSaleStatus.SELLER_RECEIVED]: '商家已收货',
  [AfterSaleStatus.REFUNDING]: '退款处理中',
  [AfterSaleStatus.REFUNDED]: '退款成功',
  [AfterSaleStatus.CANCELED]: '已取消',
};

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  const { action } = event;

  console.log('[售后服务]', action, 'openid:', openid);

  try {
    switch (action) {
      case 'getEntry':
        return await getAfterSaleEntry(event, openid);
      case 'apply':
        return await applyAfterSale(event, openid);
      case 'cancel':
        return await cancelAfterSale(event, openid);
      case 'getDetail':
        return await getAfterSaleDetail(event, openid);
      case 'getList':
        return await getAfterSaleList(event, openid);
      case 'buyerShip':
        return await buyerShip(event, openid);
      default:
        return { success: false, error: '未知操作' };
    }
  } catch (error) {
    console.error('[售后服务] 错误:', error);
    return { success: false, error: error.message };
  }
};

// 获取售后入口信息（判断是否可以申请售后，显示什么按钮）
async function getAfterSaleEntry(event, openid) {
  const { orderNo, itemId } = event;

  // 获取订单信息
  const orderResult = await db.collection('orders')
    .where(_.and([
      _.or([{ openid }, { uid: openid }, { userId: openid }]),
      { orderNo }
    ]))
    .get();

  if (!orderResult.data || orderResult.data.length === 0) {
    return { success: false, error: '订单不存在' };
  }

  const order = orderResult.data[0];

  // 检查是否已支付
  const isPaid = order.orderStatus >= 10; // 待发货及之后状态表示已支付

  if (!isPaid) {
    return {
      success: true,
      data: {
        canApply: false,
        reason: '订单未支付',
      }
    };
  }

  // 检查订单是否已取消/关闭
  if (order.orderStatus === 80) {
    return {
      success: true,
      data: {
        canApply: false,
        reason: '订单已取消',
      }
    };
  }

  // 检查是否有进行中的售后
  const existingAfterSale = await db.collection('after_sales')
    .where({
      orderNo,
      openid,
      status: _.nin([AfterSaleStatus.REFUNDED, AfterSaleStatus.CANCELED])
    })
    .get();

  if (existingAfterSale.data && existingAfterSale.data.length > 0) {
    const afterSale = existingAfterSale.data[0];
    return {
      success: true,
      data: {
        canApply: false,
        hasOngoing: true,
        afterSaleId: afterSale._id,
        afterSaleStatus: afterSale.status,
        buttonText: '查看售后进度',
      }
    };
  }

  // 根据订单状态判断可申请的售后类型
  let availableTypes = [];
  let buttonText = '';

  if (order.orderStatus === 10) {
    // 待发货 - 只能仅退款
    availableTypes = [AfterSaleType.ONLY_REFUND];
    buttonText = '申请退款';
  } else if (order.orderStatus === 40) {
    // 待收货 - 可以仅退款或退货退款
    availableTypes = [AfterSaleType.ONLY_REFUND, AfterSaleType.RETURN_REFUND];
    buttonText = '申请退款/退货';
  } else if (order.orderStatus === 50) {
    // 已完成 - 检查是否在售后期内（签收后15天）
    const finishTime = order.finishTime || order.updateTime;
    const daysSinceFinish = (Date.now() - finishTime) / (1000 * 60 * 60 * 24);

    if (daysSinceFinish <= 15) {
      availableTypes = [AfterSaleType.RETURN_REFUND];
      buttonText = '申请售后';
    } else {
      return {
        success: true,
        data: {
          canApply: false,
          reason: '已超出售后期限',
        }
      };
    }
  }

  // 计算可退金额（数据库存的是分，转换为元返回）
  const refundableAmountFen = order.paymentAmount || order.totalAmount || 0;
  const refundableAmount = (refundableAmountFen / 100).toFixed(2);

  return {
    success: true,
    data: {
      canApply: availableTypes.length > 0,
      availableTypes,
      buttonText,
      refundableAmount,
      orderStatus: order.orderStatus,
    }
  };
}

// 申请售后
async function applyAfterSale(event, openid) {
  const { orderNo, itemId, type, amount, reasonCode, reasonText, evidence } = event;

  // 校验
  if (!orderNo) {
    return { success: false, error: '订单号不能为空' };
  }
  if (!type || ![AfterSaleType.ONLY_REFUND, AfterSaleType.RETURN_REFUND].includes(type)) {
    return { success: false, error: '售后类型无效' };
  }
  if (!amount || amount <= 0) {
    return { success: false, error: '退款金额无效' };
  }

  // 获取订单信息
  const orderResult = await db.collection('orders')
    .where(_.and([
      _.or([{ openid }, { uid: openid }, { userId: openid }]),
      { orderNo }
    ]))
    .get();

  if (!orderResult.data || orderResult.data.length === 0) {
    return { success: false, error: '订单不存在' };
  }

  const order = orderResult.data[0];

  // 校验金额不超过可退金额
  // 数据库中金额以分为单位，用户传入的是元，转换为分进行对比
  const refundableAmountFen = order.paymentAmount || order.totalAmount || 0;
  const amountFen = Math.round(amount * 100); // 元转分
  if (amountFen > refundableAmountFen) {
    return { success: false, error: '退款金额超出可退金额' };
  }

  // 检查是否有进行中的售后
  const existingAfterSale = await db.collection('after_sales')
    .where({
      orderNo,
      openid,
      status: _.nin([AfterSaleStatus.REFUNDED, AfterSaleStatus.CANCELED])
    })
    .get();

  if (existingAfterSale.data && existingAfterSale.data.length > 0) {
    return { success: false, error: '该订单已有进行中的售后申请' };
  }

  // 生成售后单号
  const afterSaleNo = 'AS' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();

  // 订单状态映射
  const orderStatusNames = {
    5: '待付款',
    10: '待发货',
    20: '已发货',
    30: '已完成',
    40: '已发货',
    50: '已完成',
    80: '已取消',
  };

  // 创建售后单
  const afterSaleData = {
    afterSaleNo,
    orderNo,
    orderId: order._id,
    openid,
    type,
    applyAmount: amountFen, // 以分为单位存储
    applyAmountYuan: amount, // 同时存储元，方便展示
    reasonCode: reasonCode || '',
    reasonText: reasonText || '',
    evidence: evidence || [],
    status: AfterSaleStatus.APPLIED,
    statusDesc: AfterSaleStatusDesc[AfterSaleStatus.APPLIED],
    // 订单信息快照（包括原订单状态）
    orderSnapshot: {
      goodsList: order.orderItemVOs || order.goodsList || [],
      paymentAmount: order.paymentAmount,
      totalAmount: order.totalAmount,
      orderStatus: order.orderStatus,
      orderStatusName: orderStatusNames[order.orderStatus] || '未知',
    },
    // 时间戳
    applyTime: Date.now(),
    createTime: Date.now(),
    updateTime: Date.now(),
  };

  const result = await db.collection('after_sales').add({
    data: afterSaleData,
  });

  // 更新订单标记
  await db.collection('orders')
    .doc(order._id)
    .update({
      data: {
        hasAfterSale: true,
        afterSaleId: result._id,
        updateTime: Date.now(),
      }
    });

  console.log('[售后服务] 申请成功:', afterSaleNo);

  return {
    success: true,
    data: {
      afterSaleId: result._id,
      afterSaleNo,
      status: AfterSaleStatus.APPLIED,
    }
  };
}

// 取消售后申请
async function cancelAfterSale(event, openid) {
  const { afterSaleId } = event;

  if (!afterSaleId) {
    return { success: false, error: '售后单ID不能为空' };
  }

  // 获取售后单
  const afterSaleResult = await db.collection('after_sales').doc(afterSaleId).get();

  if (!afterSaleResult.data) {
    return { success: false, error: '售后单不存在' };
  }

  const afterSale = afterSaleResult.data;

  // 校验是否是本人的售后单
  if (afterSale.openid !== openid) {
    return { success: false, error: '无权操作此售后单' };
  }

  // 只有在申请中或商家拒绝状态可以取消
  if (![AfterSaleStatus.APPLIED, AfterSaleStatus.SELLER_REJECTED].includes(afterSale.status)) {
    return { success: false, error: '当前状态无法取消' };
  }

  // 更新售后单状态
  await db.collection('after_sales').doc(afterSaleId).update({
    data: {
      status: AfterSaleStatus.CANCELED,
      statusDesc: AfterSaleStatusDesc[AfterSaleStatus.CANCELED],
      cancelTime: Date.now(),
      updateTime: Date.now(),
    }
  });

  // 更新订单标记
  await db.collection('orders')
    .where({ orderNo: afterSale.orderNo })
    .update({
      data: {
        hasAfterSale: false,
        updateTime: Date.now(),
      }
    });

  console.log('[售后服务] 取消成功:', afterSaleId);

  return { success: true };
}

// 获取售后详情
async function getAfterSaleDetail(event, openid) {
  const { afterSaleId, afterSaleNo } = event;

  let afterSale = null;

  if (afterSaleId) {
    const result = await db.collection('after_sales').doc(afterSaleId).get();
    if (!result.data || result.data.openid !== openid) {
      return { success: false, error: '售后单不存在' };
    }
    afterSale = result.data;
  } else if (afterSaleNo) {
    const result = await db.collection('after_sales')
      .where({ afterSaleNo, openid })
      .get();

    if (!result.data || result.data.length === 0) {
      return { success: false, error: '售后单不存在' };
    }
    afterSale = result.data[0];
  } else {
    return { success: false, error: '请提供售后单ID或售后单号' };
  }

  // 处理商品图片URL
  if (afterSale && afterSale.orderSnapshot?.goodsList) {
    const goodsList = afterSale.orderSnapshot.goodsList;

    // 收集商品标识
    const allGoodsNames = new Set();
    const allSpuIds = new Set();
    const allSkuIds = new Set();

    goodsList.forEach(goods => {
      if (goods.goodsName) allGoodsNames.add(goods.goodsName);
      if (goods.spuId) allSpuIds.add(String(goods.spuId));
      if (goods.skuId) allSkuIds.add(String(goods.skuId));
    });

    // 从商品数据库查询最新的商品图片
    let goodsMap = {};
    if (allGoodsNames.size > 0 || allSpuIds.size > 0 || allSkuIds.size > 0) {
      try {
        const goodsResult = await db.collection('goods')
          .where(_.or([
            { goodName: _.in([...allGoodsNames]) },
            { goodsName: _.in([...allGoodsNames]) },
            { spuId: _.in([...allSpuIds]) },
            { skuId: _.in([...allSkuIds]) },
            { sku: _.in([...allSkuIds]) },
          ]))
          .limit(100)
          .get();

        if (goodsResult.data) {
          goodsResult.data.forEach(goods => {
            const keys = [
              goods.goodName,
              goods.goodsName,
              goods.spuId,
              goods.skuId,
              goods.sku,
            ].filter(Boolean).map(String);

            keys.forEach(key => {
              goodsMap[key] = goods;
            });
          });
        }
      } catch (error) {
        console.error('[售后详情] 查询商品失败:', error);
      }
    }

    // 收集需要转换的云存储 fileIDs
    const fileIds = new Set();
    goodsList.forEach(goods => {
      const dbGoods = goodsMap[goods.goodsName] || goodsMap[String(goods.spuId)] || goodsMap[String(goods.skuId)] || {};
      let imageUrl = pickImageSource(dbGoods);

      if (!imageUrl) {
        imageUrl = goods.goodsPictureUrl || goods.thumb || goods.image || goods.primaryImage || '';
      }

      if (isCloudFileId(imageUrl)) {
        fileIds.add(imageUrl);
      }

      goods._freshImageSource = imageUrl;
    });

    // 批量转换云存储 fileID 为临时 URL
    let urlMap = {};
    if (fileIds.size > 0) {
      try {
        const tempUrlResult = await cloud.getTempFileURL({
          fileList: [...fileIds],
        });

        if (tempUrlResult.fileList) {
          tempUrlResult.fileList.forEach(file => {
            if (file.tempFileURL) {
              urlMap[file.fileID] = file.tempFileURL;
            }
          });
        }
      } catch (error) {
        console.error('[售后详情] 转换图片URL失败:', error);
      }
    }

    afterSale.orderSnapshot.goodsList = goodsList.map(goods => {
      let imageUrl = goods._freshImageSource || goods.goodsPictureUrl || '';
      if (isCloudFileId(imageUrl) && urlMap[imageUrl]) {
        imageUrl = urlMap[imageUrl];
      }
      const { _freshImageSource, ...rest } = goods;
      return { ...rest, goodsPictureUrl: imageUrl };
    });
  }

  return { success: true, data: afterSale };
}

// 检查是否是云存储 fileID
const isCloudFileId = (url) => url && typeof url === 'string' && url.startsWith('cloud://');

// 从商品数据中提取图片源
const pickImageSource = (goods) =>
  goods.coverFileId ||
  goods.thumbFileId ||
  goods.imageFileId ||
  goods.primaryImage ||
  goods.image ||
  goods.thumb ||
  (Array.isArray(goods.images) && goods.images[0]) ||
  (Array.isArray(goods.galleryImages) && goods.galleryImages[0]) ||
  '';

// 获取售后列表
async function getAfterSaleList(event, openid) {
  const { pageIndex = 0, pageSize = 10, status } = event;

  let query = { openid };

  if (status) {
    query.status = status;
  }

  const result = await db.collection('after_sales')
    .where(query)
    .orderBy('createTime', 'desc')
    .skip(pageIndex * pageSize)
    .limit(pageSize)
    .get();

  const afterSaleList = result.data || [];

  // 收集所有商品标识，用于查询最新的商品图片
  const allGoodsNames = new Set();
  const allSpuIds = new Set();
  const allSkuIds = new Set();

  afterSaleList.forEach(item => {
    const goodsList = item.orderSnapshot?.goodsList || [];
    goodsList.forEach(goods => {
      if (goods.goodsName) allGoodsNames.add(goods.goodsName);
      if (goods.spuId) allSpuIds.add(String(goods.spuId));
      if (goods.skuId) allSkuIds.add(String(goods.skuId));
    });
  });

  // 从商品数据库查询最新的商品图片
  let goodsMap = {};
  if (allGoodsNames.size > 0 || allSpuIds.size > 0 || allSkuIds.size > 0) {
    try {
      const goodsResult = await db.collection('goods')
        .where(_.or([
          { goodName: _.in([...allGoodsNames]) },
          { goodsName: _.in([...allGoodsNames]) },
          { spuId: _.in([...allSpuIds]) },
          { skuId: _.in([...allSkuIds]) },
          { sku: _.in([...allSkuIds]) },
        ]))
        .limit(100)
        .get();

      if (goodsResult.data) {
        goodsResult.data.forEach(goods => {
          const keys = [
            goods.goodName,
            goods.goodsName,
            goods.spuId,
            goods.skuId,
            goods.sku,
          ].filter(Boolean).map(String);

          keys.forEach(key => {
            goodsMap[key] = goods;
          });
        });
      }
    } catch (error) {
      console.error('[售后列表] 查询商品失败:', error);
    }
  }

  // 收集需要转换的云存储 fileIDs
  const fileIds = new Set();
  afterSaleList.forEach(item => {
    const goodsList = item.orderSnapshot?.goodsList || [];
    goodsList.forEach(goods => {
      // 尝试从商品数据库获取最新图片
      const dbGoods = goodsMap[goods.goodsName] || goodsMap[String(goods.spuId)] || goodsMap[String(goods.skuId)] || {};
      let imageUrl = pickImageSource(dbGoods);

      // 如果数据库没有，使用快照中的图片
      if (!imageUrl) {
        imageUrl = goods.goodsPictureUrl || goods.thumb || goods.image || goods.primaryImage || '';
      }

      if (isCloudFileId(imageUrl)) {
        fileIds.add(imageUrl);
      }

      // 临时存储查找到的图片源
      goods._freshImageSource = imageUrl;
    });
  });

  // 批量转换云存储 fileID 为临时 URL
  let urlMap = {};
  if (fileIds.size > 0) {
    try {
      const tempUrlResult = await cloud.getTempFileURL({
        fileList: [...fileIds],
      });

      if (tempUrlResult.fileList) {
        tempUrlResult.fileList.forEach(file => {
          if (file.tempFileURL) {
            urlMap[file.fileID] = file.tempFileURL;
          }
        });
      }
      console.log('[售后列表] 转换图片URL成功, 数量:', Object.keys(urlMap).length);
    } catch (error) {
      console.error('[售后列表] 转换图片URL失败:', error);
    }
  }

  // 应用转换后的 URL 到商品列表
  const processedList = afterSaleList.map(item => {
    if (item.orderSnapshot?.goodsList) {
      item.orderSnapshot.goodsList = item.orderSnapshot.goodsList.map(goods => {
        let imageUrl = goods._freshImageSource || goods.goodsPictureUrl || '';

        if (isCloudFileId(imageUrl) && urlMap[imageUrl]) {
          imageUrl = urlMap[imageUrl];
        }

        // 清理临时字段
        const { _freshImageSource, ...rest } = goods;

        return {
          ...rest,
          goodsPictureUrl: imageUrl,
        };
      });
    }
    return item;
  });

  return {
    success: true,
    data: processedList,
  };
}

// 买家填写物流信息（退货退款）
async function buyerShip(event, openid) {
  const { afterSaleId, logisticsCompany, logisticsNo } = event;

  if (!afterSaleId || !logisticsCompany || !logisticsNo) {
    return { success: false, error: '参数不完整' };
  }

  // 获取售后单
  const afterSaleResult = await db.collection('after_sales').doc(afterSaleId).get();

  if (!afterSaleResult.data) {
    return { success: false, error: '售后单不存在' };
  }

  const afterSale = afterSaleResult.data;

  if (afterSale.openid !== openid) {
    return { success: false, error: '无权操作此售后单' };
  }

  if (afterSale.status !== AfterSaleStatus.WAIT_BUYER_RETURN) {
    return { success: false, error: '当前状态无法填写物流' };
  }

  // 更新售后单
  await db.collection('after_sales').doc(afterSaleId).update({
    data: {
      status: AfterSaleStatus.BUYER_SHIPPED,
      statusDesc: AfterSaleStatusDesc[AfterSaleStatus.BUYER_SHIPPED],
      buyerLogistics: {
        company: logisticsCompany,
        logisticsNo,
        shipTime: Date.now(),
      },
      updateTime: Date.now(),
    }
  });

  console.log('[售后服务] 买家已发货:', afterSaleId);

  return { success: true };
}
