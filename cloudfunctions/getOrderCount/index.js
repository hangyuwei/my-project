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
      { tabType: 51, name: '待评价' },     // OrderStatus.PENDING_COMMENT (虚拟状态)
      { tabType: 50, name: '已完成', values: [50, 60] }, // OrderStatus.COMPLETE
    ];
    const userScope = _.or([{ openid }, { uid: openid }, { userId: openid }]);


    // 排除已删除的订单
    const notDeleted = _.or([{ isDeleted: _.neq(true) }, { isDeleted: _.exists(false) }]);

    // 并行查询各状态订单数量
    const countPromises = statusList.map(async (status) => {
      let conditions = [userScope, notDeleted];

      // 特殊处理：51 表示待评价（已完成但未评价的订单）
      if (status.tabType === 51) {
        conditions.push({ orderStatus: 50 });
        conditions.push(_.or([
          { hasCommented: _.neq(true) },
          { hasCommented: _.exists(false) }
        ]));
      } else if (status.values) {
        conditions.push(_.or(status.values.map((value) => ({ orderStatus: value }))));
      } else {
        conditions.push({ orderStatus: status.tabType });
      }

      const result = await db.collection('orders')
        .where(_.and(conditions))
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
