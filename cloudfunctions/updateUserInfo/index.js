const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  const { nickName, avatarUrl } = event;

  console.log('更新用户信息 - openid:', openid);
  console.log('nickName:', nickName, 'avatarUrl:', avatarUrl);

  try {
    // 查询用户
    const userQuery = await db.collection('user').where({
      openid: openid
    }).get();

    if (userQuery.data && userQuery.data.length > 0) {
      const userId = userQuery.data[0]._id;

      // 准备更新数据（只更新提供的字段）
      const updateData = {
        updateTime: new Date(),
      };

      if (nickName !== null && nickName !== undefined) {
        updateData.nickName = nickName;
      }

      if (avatarUrl !== null && avatarUrl !== undefined) {
        updateData.avatarUrl = avatarUrl;
      }

      // 更新用户信息
      await db.collection('user').doc(userId).update({
        data: updateData
      });

      // 查询更新后的用户信息
      const updatedUser = await db.collection('user').doc(userId).get();

      console.log('用户信息更新成功');
      return {
        success: true,
        userInfo: updatedUser.data,
      };
    } else {
      console.error('用户不存在');
      return {
        success: false,
        error: '用户不存在',
      };
    }
  } catch (error) {
    console.error('更新用户信息失败:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
