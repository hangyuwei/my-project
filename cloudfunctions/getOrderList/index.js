const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

// 订单按钮类型
const OrderButtonTypes = {
  PAY: 1,           // 付款
  CANCEL: 2,        // 取消订单
  CONFIRM: 3,       // 确认收货
  APPLY_REFUND: 4,  // 申请售后
  VIEW_REFUND: 5,   // 查看退款
  COMMENT: 6,       // 评价
  DELETE: 7,        // 删除订单
  DELIVERY: 8,      // 查看物流
  REBUY: 9,         // 再次购买
};

// 根据订单状态生成按钮
function generateButtonsByStatus(orderStatus) {
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
      buttons.push({ type: OrderButtonTypes.COMMENT, name: '评价', primary: true });
      buttons.push({ type: OrderButtonTypes.REBUY, name: '再次购买', primary: false });
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

// 根据订单状态获取中文状态名称
function getStatusName(orderStatus) {
  const statusMap = {
    5: '待付款',
    10: '待发货',
    40: '待收货',
    50: '已完成',
    80: '已取消',
  };
  return statusMap[orderStatus] || '未知状态';
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

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  console.log('[获取订单列表] openid:', openid, 'event:', event);

  try {
    const { parameter = {} } = event;
    const { pageNum = 1, pageSize = 10, orderStatus } = parameter;

    // 构建查询条件
    const userScope = _.or([{ openid }, { uid: openid }, { userId: openid }]);
    const conditions = [userScope];
    if (orderStatus !== undefined && orderStatus !== -1) {
      conditions.push({ orderStatus });
    }
    const where = conditions.length > 1 ? _.and(conditions) : conditions[0];

    // 查询总数
    const countResult = await db.collection('orders')
      .where(where)
      .count();
    const total = countResult.total;

    // 查询订单列表
    const result = await db.collection('orders')
      .where(where)
      .orderBy('createTime', 'desc')
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .get();

    console.log('[获取订单列表] 成功, 总数:', total, '当前页:', result.data.length);

    // 收集所有需要查询的商品信息
    const allSpuIds = new Set();
    const allSkuIds = new Set();
    const allGoodsNames = new Set();

    result.data.forEach(order => {
      if (order.orderItemVOs && Array.isArray(order.orderItemVOs)) {
        order.orderItemVOs.forEach(item => {
          if (item.spuId) allSpuIds.add(String(item.spuId));
          if (item.skuId) allSkuIds.add(String(item.skuId));
          if (item.goodsName) allGoodsNames.add(item.goodsName);
        });
      }
    });

    // 批量查询商品信息
    let goodsMap = {};
    if (allSpuIds.size > 0 || allSkuIds.size > 0 || allGoodsNames.size > 0) {
      try {
        const goodsResult = await db.collection('goods')
          .where(_.or([
            { spuId: _.in([...allSpuIds]) },
            { sku: _.in([...allSkuIds]) },
            { skuId: _.in([...allSkuIds]) },
            { goodName: _.in([...allGoodsNames]) },
            { goodsName: _.in([...allGoodsNames]) },
          ]))
          .limit(100)
          .get();

        if (goodsResult.data) {
          goodsResult.data.forEach(goods => {
            const keys = [
              goods.spuId,
              goods.sku,
              goods.skuId,
              goods.goodName,
              goods.goodsName
            ].filter(Boolean).map(String);

            keys.forEach(key => {
              goodsMap[key] = goods;
            });
          });
        }
      } catch (error) {
        console.error('[批量查询商品] 失败:', error);
      }
    }

    // 收集所有云存储 fileID
    const fileIds = new Set();

    const orders = result.data.map(order => {
      if (!order.orderItemVOs || !Array.isArray(order.orderItemVOs)) {
        return order;
      }

      const enrichedItems = order.orderItemVOs.map(item => {
        // 从商品表获取图片
        const goods = goodsMap[String(item.spuId)] ||
                     goodsMap[String(item.skuId)] ||
                     goodsMap[item.goodsName] ||
                     {};

        // 优先使用商品表中的云存储 fileID
        let imageSource = pickImageSource(goods);

        // 如果商品表没有，使用订单中存储的
        if (!imageSource && item.goodsPictureUrl) {
          imageSource = item.goodsPictureUrl;
        }

        // 收集云存储 fileID
        if (isCloudFileId(imageSource)) {
          fileIds.add(imageSource);
        }

        return {
          ...item,
          _imageSource: imageSource, // 临时存储原始图片源
        };
      });

      return {
        ...order,
        orderItemVOs: enrichedItems,
      };
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
        console.log('[批量转换云存储URL] 成功, 数量:', Object.keys(urlMap).length);
      } catch (error) {
        console.error('[批量转换云存储URL] 失败:', error);
      }
    }

    // 应用转换后的 URL 和生成按钮
    const finalOrders = orders.map(order => {
      // 根据订单状态生成按钮和状态名称
      const orderButtons = generateButtonsByStatus(order.orderStatus);
      const goodsButtons = generateGoodsButtonsByStatus(order.orderStatus);
      const statusName = getStatusName(order.orderStatus);

      if (!order.orderItemVOs || !Array.isArray(order.orderItemVOs)) {
        return {
          ...order,
          orderStatusName: statusName,
          buttonVOs: orderButtons,
        };
      }

      const finalItems = order.orderItemVOs.map(item => {
        let imageUrl = item._imageSource || item.goodsPictureUrl || '';

        // 如果是云存储 fileID，使用转换后的临时 URL
        if (isCloudFileId(imageUrl) && urlMap[imageUrl]) {
          imageUrl = urlMap[imageUrl];
        }

        // 删除临时字段
        const { _imageSource, ...rest } = item;

        return {
          ...rest,
          goodsPictureUrl: imageUrl,
          buttonVOs: goodsButtons,
        };
      });

      return {
        ...order,
        orderStatusName: statusName,
        orderItemVOs: finalItems,
        buttonVOs: orderButtons,
      };
    });

    return {
      success: true,
      data: {
        pageNum,
        pageSize,
        totalCount: total,
        orders: finalOrders || [],
      },
    };
  } catch (error) {
    console.error('[获取订单列表] 失败:', error);
    return {
      success: false,
      error: error.message,
      data: {
        pageNum: 1,
        pageSize: 10,
        totalCount: 0,
        orders: [],
      },
    };
  }
};
