const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  console.log('[获取地址列表] openid:', openid, 'event:', event);

  try {
    // 查询用户的所有地址，按默认地址优先、创建时间倒序排列
    const result = await db.collection('address')
      .where({
        openid: openid,
        deleted: _.neq(true), // 排除已删除的地址
      })
      .orderBy('isDefault', 'desc')
      .orderBy('createTime', 'desc')
      .get();

    console.log('[获取地址列表] 成功, 数量:', result.data.length);

    return {
      success: true,
      data: result.data || [],
    };
  } catch (error) {
    console.error('[获取地址列表] 失败:', error);
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};
