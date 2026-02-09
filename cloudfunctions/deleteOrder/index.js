const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { orderNo } = event;

  console.log('[删除订单] openid:', openid, 'orderNo:', orderNo);

  if (!orderNo) {
    return {
      success: false,
      error: '订单号不能为空',
    };
  }

  try {
    // 查找订单
    const userScope = _.or([{ openid }, { uid: openid }, { userId: openid }]);
    const orderRes = await db.collection('orders')
      .where(_.and([userScope, { orderNo }]))
      .get();

    if (!orderRes.data || orderRes.data.length === 0) {
      // 订单不存在于云端，可能只存在本地，返回成功让前端删除本地订单
      console.log('[删除订单] 云端订单不存在，返回成功');
      return {
        success: true,
        data: {
          orderNo,
          message: '订单已删除',
        },
      };
    }

    const order = orderRes.data[0];

    // 只允许删除已完成(50)或已取消(80)的订单
    if (order.orderStatus !== 50 && order.orderStatus !== 80) {
      return {
        success: false,
        error: '只能删除已完成或已取消的订单',
      };
    }

    // 软删除：标记订单为已删除状态，而不是真正删除
    await db.collection('orders')
      .doc(order._id)
      .update({
        data: {
          isDeleted: true,
          deletedAt: Date.now(),
          deletedBy: openid,
        },
      });

    console.log('[删除订单] 软删除成功, orderNo:', orderNo);

    return {
      success: true,
      data: {
        orderNo,
        message: '订单已删除',
      },
    };
  } catch (error) {
    console.error('[删除订单] 失败:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
