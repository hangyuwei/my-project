// 使用动态导入云数据库模块
let cloudApp, db;

const initCloudbase = async () => {
  if (db) return db;

  try {
    // 动态导入 cloudbase 和 env 配置
    const cloudbasePath = '../ecommerce-management-backend/server/src/libs/cloudbase.js';
    const { cloudApp: app, db: database } = await import(cloudbasePath);
    cloudApp = app;
    db = database;
    return db;
  } catch (error) {
    console.error('[createOrder] Failed to init cloudbase:', error);
    // 降级到本地 JSON 文件
    return null;
  }
};

exports.main = async (event = {}, context = {}) => {
  try {
    const { orderData } = event;

    if (!orderData) {
      return {
        success: false,
        error: '订单数据不能为空',
      };
    }

    // 尝试初始化云数据库
    const database = await initCloudbase();

    // 确保订单包含必要的字段
    const now = Date.now();
    const openid = context?.OPENID || 'local_user';
    const orderNo = orderData.orderNo || `${openid}-${now}`;

    const order = {
      ...orderData,
      orderNo,
      openid,
      uid: openid,
      createTime: orderData.createTime || String(now),
      updateTime: String(now),
    };

    // 保存订单到云数据库
    if (database) {
      try {
        const result = await database.collection('orders').add(order);
        console.log('[创建订单] 成功保存到云数据库:', result.id || result._id);

        return {
          success: true,
          orderId: result.id || result._id,
          orderNo,
          message: '订单创建成功',
        };
      } catch (dbError) {
        console.error('[创建订单] 云数据库保存失败:', dbError);
        // 降级到本地 JSON 文件
      }
    }

    // 降级方案：保存到本地 JSON 文件
    const { readDb, writeDb, generateId, nowIso } = require('./_helpers');
    const localDb = readDb();

    const localOrder = {
      _id: generateId(),
      id: orderData.orderId || orderData.id || orderNo,
      orderNo,
      orderId: orderData.orderId || orderData.id || orderNo,
      orderStatus: orderData.orderStatus || 10,
      orderStatusName: orderData.orderStatusName || '待发货',
      createTime: orderData.createTime || String(now),
      updateTime: String(now),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      totalAmount: orderData.totalAmount || '0',
      goodsAmount: orderData.goodsAmount || '0',
      paymentAmount: orderData.paymentAmount || '0',
      freightFee: orderData.freightFee || '0',
      discountAmount: orderData.discountAmount || '0',
      orderItemVOs: orderData.orderItemVOs || [],
      logisticsVO: orderData.logisticsVO || {},
      storeId: orderData.storeId || '',
      storeName: orderData.storeName || '',
      remark: orderData.remark || '',
    };

    localDb.orders.unshift(localOrder);
    writeDb(localDb);

    console.log('[创建订单] 保存到本地 JSON:', orderNo);

    return {
      success: true,
      orderId: localOrder._id,
      orderNo,
      message: '订单创建成功（本地存储）',
    };
  } catch (error) {
    console.error('[创建订单] 失败:', error);
    return {
      success: false,
      error: error.message || '订单创建失败',
    };
  }
};
