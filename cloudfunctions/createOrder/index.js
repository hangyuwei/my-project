const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  console.log('[创建订单] openid:', openid, 'event:', event);

  try {
    const { orderData } = event;

    if (!orderData) {
      return {
        success: false,
        error: '订单数据不能为空',
      };
    }

    // 确保订单包含必要的字段
    const now = Date.now();
    const orderNo = orderData.orderNo || `${openid}-${now}`;

    const order = {
      ...orderData,
      orderNo,
      openid,
      uid: openid,
      createTime: orderData.createTime || String(now),
      updateTime: String(now),
    };

    // 保存订单到数据库（使用单数 'order' 与后台管理系统一致）
    const result = await db.collection('orders').add({
      data: order,
    });

    console.log('[创建订单] 成功:', result._id);

    return {
      success: true,
      orderId: result._id,
      orderNo,
      message: '订单创建成功',
    };
  } catch (error) {
    console.error('[创建订单] 失败:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
