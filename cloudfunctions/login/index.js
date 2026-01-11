const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();

  const openid = wxContext.OPENID;
  const appid = wxContext.APPID;
  const unionid = wxContext.UNIONID;

  console.log('用户登录 - openid:', openid);

  try {
    // 查询用户是否已存在
    const userQuery = await db.collection('user').where({
      openid: openid
    }).get();

    let userData = {
      openid,
      appid,
      unionid,
      lastLoginTime: new Date(),
    };

    if (userQuery.data && userQuery.data.length > 0) {
      // 用户已存在，更新最后登录时间
      const userId = userQuery.data[0]._id;
      await db.collection('user').doc(userId).update({
        data: {
          lastLoginTime: new Date(),
        }
      });

      console.log('用户已存在，更新登录时间');
      return {
        success: true,
        isNewUser: false,
        userInfo: userQuery.data[0],
        openid,
      };
    } else {
      // 新用户，创建记录
      userData.createTime = new Date();
      userData.nickName = '微信用户';
      userData.avatarUrl = '';

      const createResult = await db.collection('user').add({
        data: userData
      });

      console.log('新用户创建成功');
      return {
        success: true,
        isNewUser: true,
        userInfo: {
          _id: createResult._id,
          ...userData
        },
        openid,
      };
    }
  } catch (error) {
    console.error('登录失败:', error);
    return {
      success: false,
      error: error.message,
      openid,
    };
  }
};
