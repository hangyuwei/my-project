const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  console.log('[确认收货] openid:', openid, 'orderNo:', event.orderNo);

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

    // 检查订单状态是否为待收货(40)
    if (order.orderStatus !== 40) {
      return {
        success: false,
        error: '订单状态不正确，无法确认收货',
      };
    }

    // 更新订单状态为已完成(50)
    await db.collection('orders')
      .doc(order._id)
      .update({
        data: {
          orderStatus: 50,
          orderStatusName: '已完成',
          finishTime: Date.now(),
          updateTime: Date.now(),
        },
      });

    console.log('[确认收货] 成功, orderNo:', orderNo);

    return {
      success: true,
      data: {
        orderNo,
        newStatus: 50,
        newStatusName: '已完成',
      },
    };
  } catch (error) {
    console.error('[确认收货] 失败:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
