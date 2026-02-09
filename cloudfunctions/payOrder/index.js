const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  console.log('[支付订单] openid:', openid, 'orderNo:', event.orderNo);

  try {
    const { orderNo } = event;

    if (!orderNo) {
      return {
        success: false,
        error: '订单号不能为空',
      };
    }

    // 查询订单
    const userScope = _.or([{ openid }, { uid: openid }, { userId: openid }]);
    const result = await db.collection('orders')
      .where(_.and([userScope, { orderNo }]))
      .get();

    if (!result.data || result.data.length === 0) {
      return {
        success: false,
        error: '订单不存在',
      };
    }

    const order = result.data[0];

    // 检查订单状态是否为待付款(5)
    if (order.orderStatus !== 5) {
      return {
        success: false,
        error: '订单状态不正确，无法支付',
      };
    }

    const now = Date.now();

    // 更新订单状态为待发货(10)
    await db.collection('orders')
      .doc(order._id)
      .update({
        data: {
          orderStatus: 10,
          orderStatusName: '待发货',
          payTime: now,
          paySuccessTime: now,
          updateTime: now,
        },
      });

    console.log('[支付订单] 成功, orderNo:', orderNo);

    return {
      success: true,
      data: {
        orderNo,
        newStatus: 10,
        newStatusName: '待发货',
      },
    };
  } catch (error) {
    console.error('[支付订单] 失败:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
