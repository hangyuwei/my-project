const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();

  const openid = wxContext.OPENID;
  const appid = wxContext.APPID;
  const unionid = wxContext.UNIONID;

  const { silentLogin, nickName, avatarUrl } = event;

  console.log('用户登录/获取信息 - openid:', openid);
  console.log('参数:', { silentLogin, nickName, avatarUrl });

  try {
    // 查询用户是否已存在
    const userQuery = await db.collection('user').where({
      openid: openid
    }).get();

    // 静默登录模式：只返回 openid 和已有用户信息，不创建新用户
    if (silentLogin) {
      if (userQuery.data && userQuery.data.length > 0) {
        console.log('静默登录 - 用户已存在');
        return {
          success: true,
          openid,
          userInfo: userQuery.data[0],
        };
      } else {
        console.log('静默登录 - 用户不存在');
        return {
          success: true,
          openid,
          userInfo: null,
        };
      }
    }

    // 正常登录/注册模式
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
      // 新用户，创建记录（使用传入的头像和昵称）
      userData.createTime = new Date();
      userData.nickName = nickName || '微信用户';
      userData.avatarUrl = avatarUrl || '';

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
