const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

/**
 * 手机号快速验证登录云函数
 * 使用微信提供的 code 换取手机号
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const appid = wxContext.APPID;

  const { code } = event;

  console.log('[phoneLogin] 开始处理手机号登录');
  console.log('[phoneLogin] openid:', openid);
  console.log('[phoneLogin] code:', code);

  try {
    // 使用 code 换取手机号
    const phoneResult = await cloud.openapi.phonenumber.getPhoneNumber({
      code: code,
    });

    console.log('[phoneLogin] 获取手机号结果:', phoneResult);

    if (phoneResult.errCode !== 0) {
      return {
        success: false,
        message: '获取手机号失败: ' + phoneResult.errMsg,
      };
    }

    const phoneInfo = phoneResult.phoneInfo;
    const phoneNumber = phoneInfo.phoneNumber; // 用户绑定的手机号（国外手机号会有区号）
    const purePhoneNumber = phoneInfo.purePhoneNumber; // 没有区号的手机号

    console.log('[phoneLogin] 手机号:', purePhoneNumber);

    // 查询用户是否已存在
    const userQuery = await db.collection('user').where({
      openid: openid,
    }).get();

    let userInfo;

    if (userQuery.data && userQuery.data.length > 0) {
      // 用户已存在，更新手机号和登录时间
      const userId = userQuery.data[0]._id;
      await db.collection('user').doc(userId).update({
        data: {
          phoneNumber: purePhoneNumber,
          lastLoginTime: new Date(),
        },
      });

      userInfo = {
        ...userQuery.data[0],
        phoneNumber: purePhoneNumber,
      };

      console.log('[phoneLogin] 用户已存在，更新信息');
    } else {
      // 新用户，创建记录
      const newUserData = {
        openid,
        appid,
        phoneNumber: purePhoneNumber,
        nickName: '微信用户',
        avatarUrl: '',
        createTime: new Date(),
        lastLoginTime: new Date(),
      };

      const createResult = await db.collection('user').add({
        data: newUserData,
      });

      userInfo = {
        _id: createResult._id,
        ...newUserData,
      };

      console.log('[phoneLogin] 新用户创建成功');
    }

    return {
      success: true,
      openid,
      phoneNumber: purePhoneNumber,
      userInfo: {
        nickName: userInfo.nickName || '微信用户',
        avatarUrl: userInfo.avatarUrl || '',
        phoneNumber: purePhoneNumber,
      },
    };
  } catch (error) {
    console.error('[phoneLogin] 登录失败:', error);
    return {
      success: false,
      message: error.message || '登录失败',
      openid,
    };
  }
};
