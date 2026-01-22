const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

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

    // 软删除：只标记为已删除，不真正删除数据
    const result = await db.collection('address').doc(addressId).update({
      data: {
        deleted: true,
        deleteTime: String(Date.now()),
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
