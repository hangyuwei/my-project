import updateManager from './common/updateManager';
import { config } from './config/index';

App({
  globalData: {
    userInfo: null,
    openid: null,
  },

  onLaunch: function () {
    if (typeof wx !== 'undefined' && wx.cloud) {
      // 初始化云开发（单小程序模式）
      wx.cloud.init({
        env: config.cloudEnvId,
        traceUser: true,
      });

      // 自动登录
      this.login();
    }
  },

  onShow: function () {
    updateManager();
  },

  // 登录函数
  login: function () {
    return new Promise((resolve, reject) => {
      console.log('开始自动登录...');

      wx.cloud.callFunction({
        name: 'login',
        success: res => {
          console.log('登录成功:', res);
          if (res.result && res.result.success) {
            this.globalData.userInfo = res.result.userInfo;
            this.globalData.openid = res.result.openid;
            resolve(res.result);
          } else {
            console.error('登录失败:', res.result);
            reject(res.result);
          }
        },
        fail: err => {
          console.error('登录云函数调用失败:', err);
          reject(err);
        }
      });
    });
  },

  // 更新用户信息
  updateUserInfo: function (nickName, avatarUrl) {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'updateUserInfo',
        data: {
          nickName,
          avatarUrl,
        },
        success: res => {
          console.log('更新用户信息成功:', res);
          if (res.result && res.result.success) {
            this.globalData.userInfo = res.result.userInfo;
            resolve(res.result.userInfo);
          } else {
            reject(res.result);
          }
        },
        fail: err => {
          console.error('更新用户信息失败:', err);
          reject(err);
        }
      });
    });
  },
});
