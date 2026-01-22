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

  console.log('[获取订单详情] openid:', openid, 'orderNo:', event.orderNo);

  try {
    const { orderNo } = event;

    if (!orderNo) {
      return {
        success: false,
        error: '订单号不能为空',
      };
    }

    const userScope = _.or([{ openid }, { uid: openid }, { userId: openid }]);

    // 查询订单
    const result = await db.collection('orders')
      .where(_.and([userScope, { orderNo }]))
      .get();

    if (!result.data || result.data.length === 0) {
      console.log('[获取订单详情] 未找到订单');
      return {
        success: false,
        error: '订单不存在',
      };
    }

    const order = result.data[0];

    // 确保必要字段存在，防止前端报错
    if (!order.logisticsVO) {
      order.logisticsVO = { logisticsNo: '' };
    }
    if (!order.paymentVO) {
      order.paymentVO = { paySuccessTime: null };
    }

    // 收集需要查询的商品信息
    const allSpuIds = new Set();
    const allSkuIds = new Set();
    const allGoodsNames = new Set();

    if (order.orderItemVOs && Array.isArray(order.orderItemVOs)) {
      order.orderItemVOs.forEach(item => {
        if (item.spuId) allSpuIds.add(String(item.spuId));
        if (item.skuId) allSkuIds.add(String(item.skuId));
        if (item.goodsName) allGoodsNames.add(item.goodsName);
      });
    }

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

    // 收集云存储 fileID
    const fileIds = new Set();

    if (order.orderItemVOs && Array.isArray(order.orderItemVOs)) {
      order.orderItemVOs.forEach(item => {
        const goods = goodsMap[String(item.spuId)] ||
                     goodsMap[String(item.skuId)] ||
                     goodsMap[item.goodsName] ||
                     {};

        let imageSource = pickImageSource(goods);
        if (!imageSource && item.goodsPictureUrl) {
          imageSource = item.goodsPictureUrl;
        }

        if (isCloudFileId(imageSource)) {
          fileIds.add(imageSource);
        }

        item._imageSource = imageSource;
      });
    }

    // 批量转换云存储 fileID
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

    // 根据订单状态生成按钮
    const orderButtons = generateButtonsByStatus(order.orderStatus);
    const goodsButtons = generateGoodsButtonsByStatus(order.orderStatus);

    // 应用转换后的 URL 和生成按钮
    if (order.orderItemVOs && Array.isArray(order.orderItemVOs)) {
      order.orderItemVOs = order.orderItemVOs.map(item => {
        let imageUrl = item._imageSource || item.goodsPictureUrl || '';

        if (isCloudFileId(imageUrl) && urlMap[imageUrl]) {
          imageUrl = urlMap[imageUrl];
        }

        const { _imageSource, ...rest } = item;

        return {
          ...rest,
          goodsPictureUrl: imageUrl,
          buttonVOs: goodsButtons,
        };
      });
    }

    // 设置订单级别按钮和状态名称
    order.buttonVOs = orderButtons;
    order.orderStatusName = getStatusName(order.orderStatus);

    console.log('[获取订单详情] 成功');

    return {
      success: true,
      data: order,
    };
  } catch (error) {
    console.error('[获取订单详情] 失败:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
