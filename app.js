import updateManager from './common/updateManager';
import { config } from './config/index';
import automation from './utils/automation/index';
import { checkStaticAssetsHealth } from './utils/resourceHealthCheck';

App({
  globalData: {
    userInfo: null,
    openid: null,
    automation: automation, // 全局自动化实例
  },

  onLaunch: function () {
    // 初始化 UI 自动化系统
    automation.init({
      maxRecords: 50 // 最多保存50条录制记录
    });
    console.log('[App] UI 自动化系统已初始化');
    if (typeof wx !== 'undefined' && wx.cloud) {
      // 初始化云开发（单小程序模式）
      wx.cloud.init({
        env: config.cloudEnvId,
        traceUser: true,
      });

      // 静默获取 openid（不创建用户记录）
      this.getOpenid();
    }

    this.runStaticAssetHealthCheck();
  },

  onShow: function () {
    updateManager();
  },

  runStaticAssetHealthCheck: function () {
    try {
      if (typeof wx === 'undefined' || typeof wx.request !== 'function') return;

      let envVersion = 'unknown';
      if (typeof wx.getAccountInfoSync === 'function') {
        const accountInfo = wx.getAccountInfoSync() || {};
        envVersion = (accountInfo.miniProgram && accountInfo.miniProgram.envVersion) || 'unknown';
      }

      if (envVersion === 'release') return;

      setTimeout(() => {
        checkStaticAssetsHealth().catch((error) => {
          console.warn('[StaticAssetCheck] Check failed:', error);
        });
      }, 0);
    } catch (error) {
      console.warn('[StaticAssetCheck] Init failed:', error);
    }
  },

  // 静默获取 openid（不创建用户记录）
  // 使用云开发模板 wx-user-v2 的用户信息获取
  getOpenid: function () {
    return new Promise((resolve) => {
      // 检查是否已退出登录
      const hasLoggedOut = wx.getStorageSync('hasLoggedOut');

      // 使用 login 云函数进行静默登录，获取 openid
      wx.cloud.callFunction({
        name: 'login',
        data: { silentLogin: true },
        success: res => {
          console.log('[wx-user-v2] 获取用户信息成功:', res);
          if (res.result) {
            const { openid, userInfo } = res.result;
            this.globalData.openid = openid;

            // 如果用户已退出登录，不恢复用户信息
            if (hasLoggedOut) {
              console.log('[App] 用户已退出登录，不自动恢复登录状态');
              resolve({ openid });
              return;
            }

            // 如果有用户信息，保存到 globalData
            if (userInfo) {
              this.globalData.userInfo = userInfo;
            }

            resolve(res.result);
          } else {
            // 使用默认 openid，不阻塞流程
            this.setDefaultOpenid();
            resolve({ openid: this.globalData.openid });
          }
        },
        fail: err => {
          console.warn('[wx-user-v2] call failed, skip login fallback:', err);
          this.setDefaultOpenid();
          resolve({ openid: this.globalData.openid, userInfo: null });
        }
      });
    });
  },

  // 设置默认 openid（用于云开发未配置时的降级方案）
  setDefaultOpenid: function () {
    if (this.globalData.openid) return;
    const storageKey = 'local_openid';
    const storedOpenid = typeof wx !== 'undefined' ? wx.getStorageSync(storageKey) : '';
    if (storedOpenid) {
      this.globalData.openid = storedOpenid;
      return;
    }
    const defaultOpenid = `local-${Date.now()}`;
    this.globalData.openid = defaultOpenid;
    if (typeof wx !== 'undefined') {
      wx.setStorageSync(storageKey, defaultOpenid);
    }
    console.log('use default openid:', defaultOpenid);
  },

  // 登录/注册函数（可选带头像和昵称）
  login: function (nickName, avatarUrl) {
    return new Promise((resolve, reject) => {
      console.log('开始注册/登录...', { nickName, avatarUrl });

      // 登录时清除退出登录标记
      wx.removeStorageSync('hasLoggedOut');

      // 构建请求数据，只有传入参数时才包含
      const data = {};
      if (nickName) data.nickName = nickName;
      if (avatarUrl) data.avatarUrl = avatarUrl;

      wx.cloud.callFunction({
        name: 'login',
        data: data,
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
