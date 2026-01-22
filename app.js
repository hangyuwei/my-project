import updateManager from './common/updateManager';
import { config } from './config/index';

App({
  globalData: {
    userInfo: null,
    openid: null,
  },

  onLaunch: function () {
    if (typeof wx !== 'undefined' && wx.cloud) {
      // 鍒濆鍖栦簯寮€鍙戯紙鍗曞皬绋嬪簭妯″紡锛?
      wx.cloud.init({
        env: config.cloudEnvId,
        traceUser: true,
      });

      // 闈欓粯鑾峰彇 openid锛堜笉鍒涘缓鐢ㄦ埛璁板綍锛?
      this.getOpenid();
    }
  },

  onShow: function () {
    updateManager();
  },

  // 闈欓粯鑾峰彇 openid锛堜笉鍒涘缓鐢ㄦ埛璁板綍锛?
  // 浣跨敤浜戝紑鍙戞ā鏉?wx-user-v2 鐨勭敤鎴蜂俊鎭幏鍙?
  getOpenid: function () {
    return new Promise((resolve) => {
      // 使用 login 云函数进行静默登录，获取 openid
      wx.cloud.callFunction({
        name: 'login',
        data: { silentLogin: true },
        success: res => {
          console.log('[wx-user-v2] 鑾峰彇鐢ㄦ埛淇℃伅鎴愬姛:', res);
          if (res.result) {
            const { openid, userInfo } = res.result;
            this.globalData.openid = openid;

            // 濡傛灉鏈夌敤鎴蜂俊鎭紝淇濆瓨鍒?globalData
            if (userInfo) {
              this.globalData.userInfo = userInfo;
            }

            resolve(res.result);
          } else {
            // 浣跨敤榛樿 openid锛屼笉闃诲娴佺▼
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

  // 璁剧疆榛樿 openid锛堢敤浜庝簯寮€鍙戞湭閰嶇疆鏃剁殑闄嶇骇鏂规锛?
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

  // 鐧诲綍/娉ㄥ唽鍑芥暟锛堝甫澶村儚鍜屾樀绉帮級
  login: function (nickName, avatarUrl) {
    return new Promise((resolve, reject) => {
      console.log('寮€濮嬫敞鍐?鐧诲綍...', { nickName, avatarUrl });

      wx.cloud.callFunction({
        name: 'login',
        data: {
          nickName,
          avatarUrl,
        },
        success: res => {
          console.log('鐧诲綍鎴愬姛:', res);
          if (res.result && res.result.success) {
            this.globalData.userInfo = res.result.userInfo;
            this.globalData.openid = res.result.openid;
            resolve(res.result);
          } else {
            console.error('鐧诲綍澶辫触:', res.result);
            reject(res.result);
          }
        },
        fail: err => {
          console.error('鐧诲綍浜戝嚱鏁拌皟鐢ㄥけ璐?', err);
          reject(err);
        }
      });
    });
  },

  // 鏇存柊鐢ㄦ埛淇℃伅
  updateUserInfo: function (nickName, avatarUrl) {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'updateUserInfo',
        data: {
          nickName,
          avatarUrl,
        },
        success: res => {
          console.log('鏇存柊鐢ㄦ埛淇℃伅鎴愬姛:', res);
          if (res.result && res.result.success) {
            this.globalData.userInfo = res.result.userInfo;
            resolve(res.result.userInfo);
          } else {
            reject(res.result);
          }
        },
        fail: err => {
          console.error('鏇存柊鐢ㄦ埛淇℃伅澶辫触:', err);
          reject(err);
        }
      });
    });
  },
});
