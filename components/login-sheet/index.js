import Toast from 'tdesign-miniprogram/toast/index';
import { saveToken, saveUserInfo } from '../../utils/login';

/**
 * 半屏登录弹窗组件
 * 使用微信授权（昵称+头像）登录
 * 会弹出微信官方的用户信息授权弹窗
 */
Component({
  properties: {
    visible: {
      type: Boolean,
      value: false,
    },
    successTip: {
      type: String,
      value: '登录成功,优惠券已到账',
    },
  },

  data: {
    isAgreed: false,
    isLoading: false,
  },

  methods: {
    handleClose() {
      this.triggerEvent('close');
    },

    handleAgreementChange(e) {
      this.setData({
        isAgreed: e.detail.checked,
      });
    },

    handleShowAgreement(e) {
      const type = e.currentTarget.dataset.type;
      const title = type === 'user' ? '用户协议' : '隐私政策';
      wx.showModal({
        title: title,
        content: `这里应该展示${title}的完整内容。`,
        showCancel: false,
        confirmText: '我知道了',
      });
    },

    // 微信授权登录
    async handleWxLogin() {
      // 检查协议
      if (!this.data.isAgreed) {
        wx.vibrateShort({ type: 'medium' });
        Toast({
          context: this,
          selector: '#t-toast',
          message: '请先阅读并同意用户协议和隐私政策',
          theme: 'warning',
        });
        return;
      }

      this.setData({ isLoading: true });

      try {
        // 使用 wx.login 获取登录凭证
        const loginRes = await new Promise((resolve, reject) => {
          wx.login({
            success: resolve,
            fail: reject,
          });
        });

        console.log('[登录弹窗] wx.login 结果:', loginRes);

        // 调用 app.login 云函数，获取/创建用户信息
        const app = getApp();
        const result = await app.login();

        if (result && result.success) {
          // 使用云函数返回的用户信息（从数据库读取的）
          const userInfo = result.userInfo || {};
          const nickName = userInfo.nickName || '微信用户';
          const avatarUrl = userInfo.avatarUrl || '';

          // 保存登录信息到本地
          saveToken('wx_token_' + Date.now());
          saveUserInfo({
            userId: result.openid,
            nickname: nickName,
            avatar: avatarUrl,
          });

          // 清除退出登录标记
          wx.removeStorageSync('hasLoggedOut');

          // 同步到全局数据
          app.globalData.userInfo = {
            nickName: nickName,
            avatarUrl: avatarUrl,
          };
          app.globalData.openid = result.openid;

          this.onLoginSuccess({
            nickname: nickName,
            avatar: avatarUrl,
            userId: result.openid,
          });
        } else {
          throw new Error('登录失败');
        }
      } catch (error) {
        console.error('[登录弹窗] 登录失败:', error);
        this.setData({ isLoading: false });

        Toast({
          context: this,
          selector: '#t-toast',
          message: '登录失败，请重试',
          theme: 'error',
        });
      }
    },

    onLoginSuccess(userInfo) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: this.properties.successTip,
        theme: 'success',
        duration: 2000,
      });

      setTimeout(() => {
        this.setData({ isLoading: false });
        this.handleClose();
        this.triggerEvent('success', { userInfo });
      }, 1500);
    },
  },

  lifetimes: {
    attached() {
      console.log('[登录弹窗] 组件已挂载');
    },
  },
});
