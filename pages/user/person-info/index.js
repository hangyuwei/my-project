import Toast from 'tdesign-miniprogram/toast/index';

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

    // 无论是否有 userInfo，都更新页面数据
    this.setData({
      personInfo: {
        avatarUrl: (globalUserInfo && globalUserInfo.avatarUrl) || 'https://tdesign.gtimg.com/miniprogram/template/retail/usercenter/icon-user-center-avatar@2x.png',
        nickName: (globalUserInfo && globalUserInfo.nickName) || '微信用户',
      },
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

  // 切换账号登录
  openUnbindConfirm() {
    wx.showModal({
      title: '切换账号',
      content: '确定要切换账号吗？当前账号信息将被清除。',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.switchAccount();
        }
      }
    });
  },

  // 切换账号
  switchAccount() {
    wx.showLoading({
      title: '切换中...',
      mask: true,
    });

    try {
      const app = getApp();

      // 清除全局用户信息
      app.globalData.userInfo = null;
      app.globalData.openid = null;

      // 清除购物车数据
      const { clearAllCartData } = require('../../../services/cart/localCart');
      clearAllCartData();

      // 清除订单数据
      const { clearAllOrders } = require('../../../services/order/localOrders');
      clearAllOrders();

      wx.hideLoading();

      Toast({
        context: this,
        selector: '#t-toast',
        message: '已切换账号',
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
      console.error('切换账号失败:', error);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '切换失败',
        theme: 'error',
      });
    }
  },
});
