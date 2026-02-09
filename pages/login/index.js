// pages/login/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null, // 用户信息
    agreed: true, // 是否同意协议
    hasUserInfo: false, // 是否已获取用户信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 检查是否已经登录
    this.checkLoginStatus();
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        hasUserInfo: true
      });
    }
  },

  /**
   * 获取用户信息（一键登录）
   */
  handleGetUserProfile(e) {
    // 检查是否同意协议
    if (!this.data.agreed) {
      wx.showToast({
        title: '请先同意用户协议和隐私政策',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 获取用户信息
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        console.log('获取用户信息成功', res);
        const userInfo = res.userInfo;
        
        // 保存用户信息到本地
        wx.setStorageSync('userInfo', userInfo);
        
        // 更新页面数据
        this.setData({
          userInfo: userInfo,
          hasUserInfo: true
        });

        // 调用登录接口
        this.doLogin(userInfo);
      },
      fail: (err) => {
        console.error('获取用户信息失败', err);
        wx.showToast({
          title: '获取用户信息失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  /**
   * 执行登录逻辑
   */
  doLogin(userInfo) {
    wx.showLoading({
      title: '登录中...',
      mask: true
    });

    // 调用微信登录获取 code
    wx.login({
      success: (res) => {
        if (res.code) {
          console.log('登录成功，code:', res.code);
          
          // 这里应该调用后端接口，将 code 和 userInfo 发送到服务器
          // 示例：
          // wx.request({
          //   url: 'https://your-api.com/login',
          //   method: 'POST',
          //   data: {
          //     code: res.code,
          //     userInfo: userInfo
          //   },
          //   success: (response) => {
          //     // 保存 token 等信息
          //     wx.setStorageSync('token', response.data.token);
          //     wx.setStorageSync('userId', response.data.userId);
          //     
          //     wx.hideLoading();
          //     wx.showToast({
          //       title: '登录成功',
          //       icon: 'success',
          //       duration: 2000
          //     });
          //   },
          //   fail: (error) => {
          //     wx.hideLoading();
          //     wx.showToast({
          //       title: '登录失败，请重试',
          //       icon: 'none',
          //       duration: 2000
          //     });
          //   }
          // });

          // 模拟登录成功
          setTimeout(() => {
            wx.hideLoading();
            wx.showToast({
              title: '登录成功',
              icon: 'success',
              duration: 1500
            });
            
            // 保存登录状态
            wx.setStorageSync('isLogin', true);
            wx.setStorageSync('loginTime', new Date().getTime());
          }, 1000);
        } else {
          wx.hideLoading();
          wx.showToast({
            title: '登录失败，请重试',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('wx.login 调用失败', err);
        wx.showToast({
          title: '登录失败，请重试',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  /**
   * 获取手机号
   */
  handleGetPhoneNumber(e) {
    console.log('获取手机号', e);
    
    // 检查是否同意协议
    if (!this.data.agreed) {
      wx.showToast({
        title: '请先同意用户协议和隐私政策',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    if (e.detail.errMsg === 'getPhoneNumber:ok') {
      // 获取成功
      console.log('手机号加密数据', e.detail);
      
      // 这里需要将加密数据发送到后端解密
      // wx.request({
      //   url: 'https://your-api.com/decryptPhone',
      //   method: 'POST',
      //   data: {
      //     encryptedData: e.detail.encryptedData,
      //     iv: e.detail.iv,
      //     sessionKey: wx.getStorageSync('sessionKey')
      //   },
      //   success: (res) => {
      //     console.log('手机号', res.data.phoneNumber);
      //     // 继续登录流程
      //   }
      // });

      wx.showToast({
        title: '获取手机号成功',
        icon: 'success',
        duration: 2000
      });
    } else {
      wx.showToast({
        title: '获取手机号失败',
        icon: 'none',
        duration: 2000
      });
    }
  },

  /**
   * 进入小程序
   */
  handleEnterApp() {
    // 跳转到首页
    wx.switchTab({
      url: '/pages/home/home'
    });
  },

  /**
   * 游客登录
   */
  handleVisitorLogin() {
    wx.showModal({
      title: '游客登录',
      content: '游客模式下部分功能将受限，确定以游客身份登录吗？',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 设置游客模式
          wx.setStorageSync('isVisitor', true);
          wx.setStorageSync('isLogin', true);
          
          wx.showToast({
            title: '已进入游客模式',
            icon: 'success',
            duration: 1500,
            success: () => {
              setTimeout(() => {
                wx.switchTab({
                  url: '/pages/home/home'
                });
              }, 1500);
            }
          });
        }
      }
    });
  },

  /**
   * 协议勾选变化
   */
  handleAgreementChange(e) {
    const agreed = e.detail.value.includes('agree');
    this.setData({
      agreed: agreed
    });
  },

  /**
   * 查看协议
   */
  handleShowAgreement(e) {
    const type = e.currentTarget.dataset.type;
    const title = type === 'user' ? '用户协议' : '隐私政策';
    
    wx.showModal({
      title: title,
      content: `这里是${title}的内容，实际使用时应该跳转到协议页面或使用 web-view 展示完整协议。`,
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面显示时检查登录状态
    this.checkLoginStatus();
  },

  /**
   * 页面分享
   */
  onShareAppMessage() {
    return {
      title: '欢迎使用我们的小程序',
      path: '/pages/login/index'
    };
  }
});
