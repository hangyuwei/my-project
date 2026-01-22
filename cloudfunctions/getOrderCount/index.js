const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  console.log('[获取订单统计] openid:', openid);

  try {
    // 订单状态枚举
    const statusList = [
      { tabType: 5, name: '待付款' },      // OrderStatus.PENDING_PAYMENT
      { tabType: 10, name: '待发货' },     // OrderStatus.PENDING_DELIVERY
      { tabType: 40, name: '待收货' },     // OrderStatus.PENDING_RECEIPT
      { tabType: 60, name: '已完成' },     // OrderStatus.COMPLETE
    ];
    const userScope = _.or([{ openid }, { uid: openid }, { userId: openid }]);


    // 并行查询各状态订单数量
    const countPromises = statusList.map(async (status) => {
      const result = await db.collection('orders')
        .where(_.and([userScope, { orderStatus: status.tabType }]))
        .count();

      return {
        tabType: status.tabType,
        orderNum: result.total,
      };
    });

    const counts = await Promise.all(countPromises);

    console.log('[获取订单统计] 成功:', counts);

    return {
      success: true,
      data: counts,
    };
  } catch (error) {
    console.error('[获取订单统计] 失败:', error);
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};
