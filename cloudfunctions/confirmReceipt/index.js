const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { orderNo } = event;

  console.log('[确认收货] openid:', openid, 'orderNo:', orderNo);

  if (!orderNo) {
    return {
      success: false,
      error: '订单号不能为空',
    };
  }

  try {
    // 查找订单
    const orderRes = await db.collection('orders')
      .where({ orderNo })
      .get();

    if (!orderRes.data || orderRes.data.length === 0) {
      return {
        success: false,
        error: '订单不存在',
      };
    }

    const order = orderRes.data[0];

    // 验证订单属于当前用户
    if (order.openid !== openid) {
      return {
        success: false,
        error: '无权操作此订单',
      };
    }

    // 验证订单状态（只有待收货状态才能确认收货）
    if (order.orderStatus !== 40) {
      return {
        success: false,
        error: '订单状态不正确，无法确认收货',
      };
    }

    // 更新订单状态为已完成
    await db.collection('orders')
      .where({ orderNo })
      .update({
        data: {
          orderStatus: 50,
          orderStatusName: '已完成',
          status: 'completed',
          completeTime: Date.now(),
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
