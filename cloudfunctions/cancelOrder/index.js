const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  const { orderNo, cancelReason = '用户主动取消' } = event;

  console.log('[取消订单] openid:', openid, 'orderNo:', orderNo, '原因:', cancelReason);

  try {
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

    // 检查订单状态，只有待付款（status=5）的订单可以取消
    if (order.orderStatus !== 5) {
      return {
        success: false,
        error: '只有待付款订单可以取消',
      };
    }

    const now = Date.now();

    // 更新订单状态为已取消
    await db.collection('orders').doc(order._id).update({
      data: {
        orderStatus: 80,
        orderStatusName: '已取消',
        status: 'canceled',
        cancelTime: now,
        cancelReason: cancelReason,
        updateTime: now,
      },
    });

    // 创建售后记录（可选，记录取消原因）
    try {
      await db.collection('after_sales').add({
        data: {
          orderNo: orderNo,
          orderId: order._id,
          openid: openid,
          type: 'cancel',
          reason: cancelReason,
          status: 'completed',
          statusName: '已完成',
          createTime: now,
          updateTime: now,
          amount: order.paymentAmount || 0,
        },
      });
    } catch (afterSaleError) {
      console.error('[取消订单] 创建售后记录失败:', afterSaleError);
      // 售后记录创建失败不影响订单取消
    }

    console.log('[取消订单] 成功:', orderNo);

    return {
      success: true,
      message: '订单已取消',
    };
  } catch (error) {
    console.error('[取消订单] 失败:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
