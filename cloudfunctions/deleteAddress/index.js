const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  console.log('[删除地址] openid:', openid, 'event:', event);

  try {
    const { addressId } = event;

    if (!addressId) {
      return {
        success: false,
        error: '地址ID不能为空',
      };
    }

    // 从 user 集合获取用户
    const userResult = await db.collection('user')
      .where(_.or([
        { openid },
        { _openid: openid },
      ]))
      .get();

    if (!userResult.data || userResult.data.length === 0) {
      return {
        success: false,
        error: '用户不存在',
      };
    }

    const user = userResult.data[0];
    let addresses = user.addresses || [];

    // 查找地址
    const addressIndex = addresses.findIndex(addr => addr.addressId === addressId);

    if (addressIndex < 0) {
      return {
        success: false,
        error: '地址不存在',
      };
    }

    // 软删除：标记为已删除
    addresses[addressIndex].deleted = true;
    addresses[addressIndex].deleteTime = Date.now();

    // 更新用户文档
    await db.collection('user').doc(user._id).update({
      data: {
        addresses,
        updateTime: Date.now(),
      },
    });

    console.log('[删除地址] 成功:', addressId);

    return {
      success: true,
      message: '地址删除成功',
    };
  } catch (error) {
    console.error('[删除地址] 失败:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
