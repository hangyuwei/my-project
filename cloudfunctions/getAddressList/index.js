const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  console.log('[获取地址列表] openid:', openid);

  try {
    // 从 user 集合获取用户的地址列表
    const userResult = await db.collection('user')
      .where(_.or([
        { openid },
        { _openid: openid },
      ]))
      .get();

    if (!userResult.data || userResult.data.length === 0) {
      console.log('[获取地址列表] 用户不存在，返回空列表');
      return {
        success: true,
        data: [],
      };
    }

    const user = userResult.data[0];
    let addresses = user.addresses || [];

    // 过滤已删除的地址
    addresses = addresses.filter(addr => addr.deleted !== true);

    // 按默认地址优先、创建时间倒序排列
    addresses.sort((a, b) => {
      if (a.isDefault !== b.isDefault) {
        return b.isDefault - a.isDefault;
      }
      return (b.createTime || 0) - (a.createTime || 0);
    });

    console.log('[获取地址列表] 成功, 数量:', addresses.length);

    return {
      success: true,
      data: addresses,
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
