import Toast from 'tdesign-miniprogram/toast/index';
import { DEFAULT_AVATAR_URL } from '../../../constants/avatar';

const DEFAULT_AVATAR = DEFAULT_AVATAR_URL;

Page({
  data: {
    personInfo: {
      avatarUrl: '',
      nickName: '',
    },
    showUnbindConfirm: false,
  },
  onLoad() {
    this.init();
  },
  init() {
    this.loadUserInfo();
  },
  loadUserInfo() {
    const app = getApp();
    const globalUserInfo = app.globalData.userInfo;
    const avatarUrl = (globalUserInfo && globalUserInfo.avatarUrl) || DEFAULT_AVATAR;

    // 如果是 cloud:// 协议，需要转换为临时 URL
    if (avatarUrl && avatarUrl.startsWith('cloud://')) {
      this.convertCloudUrl(avatarUrl);
      // 先显示默认头像，等转换完成后再更新
      this.setData({
        personInfo: {
          avatarUrl: DEFAULT_AVATAR,
          nickName: (globalUserInfo && globalUserInfo.nickName) || '微信用户',
        },
      });
    } else {
      this.setData({
        personInfo: {
          avatarUrl: avatarUrl,
          nickName: (globalUserInfo && globalUserInfo.nickName) || '微信用户',
        },
      });
    }
  },

  // 将 cloud:// 协议转换为临时 HTTPS URL
  convertCloudUrl(cloudUrl) {
    wx.cloud.getTempFileURL({
      fileList: [cloudUrl],
      success: res => {
        if (res.fileList && res.fileList[0] && res.fileList[0].tempFileURL) {
          this.setData({
            'personInfo.avatarUrl': res.fileList[0].tempFileURL,
          });
        } else {
          console.warn('获取临时URL失败，使用默认头像');
          this.setData({
            'personInfo.avatarUrl': DEFAULT_AVATAR,
          });
        }
      },
      fail: err => {
        console.error('转换云存储URL失败:', err);
        this.setData({
          'personInfo.avatarUrl': DEFAULT_AVATAR,
        });
      }
    });
  },

  // 头像加载失败时使用默认头像
  onAvatarError() {
    console.warn('头像加载失败，使用默认头像');
    this.setData({
      'personInfo.avatarUrl': DEFAULT_AVATAR,
    });
  },
  // 选择头像
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    const app = getApp();

    console.log('获取到头像:', avatarUrl);

    wx.showLoading({
      title: '上传中...',
      mask: true,
    });

    // 上传头像到云存储
    const cloudPath = `user-avatars/${app.globalData.openid}_${Date.now()}.png`;
    wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: avatarUrl,
      success: res => {
        console.log('头像上传成功:', res.fileID);

        const isNewUser = !app.globalData.userInfo || !app.globalData.userInfo._id;
        const currentNickName = this.data.personInfo.nickName || '微信用户';

        if (isNewUser) {
          // 新用户：调用登录接口注册
          console.log('新用户，调用登录接口注册');
          app.login(currentNickName, res.fileID).then(() => {
            wx.hideLoading();
            this.loadUserInfo();
            Toast({
              context: this,
              selector: '#t-toast',
              message: '注册成功',
              theme: 'success',
            });
          }).catch(err => {
            wx.hideLoading();
            console.error('注册失败:', err);
            Toast({
              context: this,
              selector: '#t-toast',
              message: '注册失败',
              theme: 'error',
            });
          });
        } else {
          // 老用户：更新用户信息
          console.log('老用户，更新头像信息');
          app.updateUserInfo(null, res.fileID).then(() => {
            wx.hideLoading();
            this.loadUserInfo();
            Toast({
              context: this,
              selector: '#t-toast',
              message: '头像设置成功',
              theme: 'success',
            });
          }).catch(err => {
            wx.hideLoading();
            console.error('更新头像失败:', err);
            Toast({
              context: this,
              selector: '#t-toast',
              message: '头像设置失败',
              theme: 'error',
            });
          });
        }
      },
      fail: err => {
        wx.hideLoading();
        console.error('头像上传失败:', err);
        Toast({
          context: this,
          selector: '#t-toast',
          message: '头像上传失败',
          theme: 'error',
        });
      }
    });
  },

  // 修改昵称
  onNicknameChange(e) {
    const nickName = e.detail.value;
    const app = getApp();

    if (nickName && nickName.trim()) {
      wx.showLoading({
        title: '保存中...',
        mask: true,
      });

      const isNewUser = !app.globalData.userInfo || !app.globalData.userInfo._id;
      const currentAvatarUrl = this.data.personInfo.avatarUrl || '';

      if (isNewUser) {
        // 新用户：调用登录接口注册
        console.log('新用户，调用登录接口注册');
        app.login(nickName.trim(), currentAvatarUrl).then(() => {
          wx.hideLoading();
          this.loadUserInfo();
          Toast({
            context: this,
            selector: '#t-toast',
            message: '注册成功',
            theme: 'success',
          });
        }).catch(err => {
          wx.hideLoading();
          console.error('注册失败:', err);
          Toast({
            context: this,
            selector: '#t-toast',
            message: '注册失败',
            theme: 'error',
          });
        });
      } else {
        // 老用户：更新昵称
        console.log('老用户，更新昵称信息');
        app.updateUserInfo(nickName.trim(), null).then(() => {
          wx.hideLoading();
          this.loadUserInfo();
          Toast({
            context: this,
            selector: '#t-toast',
            message: '昵称修改成功',
            theme: 'success',
          });
        }).catch(err => {
          wx.hideLoading();
          console.error('更新昵称失败:', err);
          Toast({
            context: this,
            selector: '#t-toast',
            message: '昵称修改失败',
            theme: 'error',
          });
        });
      }
    }
  },

  // 退出登录
  openUnbindConfirm() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.switchAccount();
        }
      }
    });
  },

  // 执行退出登录
  switchAccount() {
    wx.showLoading({
      title: '退出中...',
      mask: true,
    });

    try {
      const app = getApp();

      // 重要：先清除数据（此时 openid 还在，能正确定位到用户的存储 key）
      // 清除购物车数据
      const { clearAllCartData } = require('../../../services/cart/localCart');
      clearAllCartData();

      // 清除订单数据
      const { clearAllOrders } = require('../../../services/order/localOrders');
      clearAllOrders();

      // 清除登录 token 和用户信息存储
      const { clearLoginInfo } = require('../../../utils/login');
      clearLoginInfo();

      // 最后才清除全局用户信息（包括 openid）
      app.globalData.userInfo = null;
      app.globalData.openid = null;

      // 设置退出登录标记，防止自动重新登录
      wx.setStorageSync('hasLoggedOut', true);

      wx.hideLoading();

      Toast({
        context: this,
        selector: '#t-toast',
        message: '已退出登录',
        theme: 'success',
        duration: 1500,
      });

      // 延迟跳转到个人中心页，让用户重新登录
      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/usercenter/index',
        });
      }, 1500);
    } catch (error) {
      wx.hideLoading();
      console.error('退出登录失败:', error);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '退出失败',
        theme: 'error',
      });
    }
  },
});
