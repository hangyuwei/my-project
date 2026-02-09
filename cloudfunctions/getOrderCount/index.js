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
      { tabType: 50, name: '已完成', values: [50, 60] }, // OrderStatus.COMPLETE
    ];
    const userScope = _.or([{ openid }, { uid: openid }, { userId: openid }]);


    // 排除已删除的订单
    const notDeleted = _.or([{ isDeleted: _.neq(true) }, { isDeleted: _.exists(false) }]);

    // 并行查询各状态订单数量
    const countPromises = statusList.map(async (status) => {
      const statusQuery = status.values
        ? _.or(status.values.map((value) => ({ orderStatus: value })))
        : { orderStatus: status.tabType };
      const result = await db.collection('orders')
        .where(_.and([userScope, statusQuery, notDeleted]))
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
