import { fetchUserCenter } from '../../services/usercenter/fetchUsercenter';
import Toast from 'tdesign-miniprogram/toast/index';
import { checkLoginStatus, getUserInfo, logout } from '../../utils/login';

const menuData = [
  [
    {
      title: '收货地址',
      tit: '',
      url: '',
      type: 'address',
    },
    {
      title: '积分',
      tit: '',
      url: '',
      type: 'point',
    },
  ],
  [
    {
      title: '帮助中心',
      tit: '',
      url: '',
      type: 'help-center',
    },
    {
      title: '客服热线',
      tit: '',
      url: '',
      type: 'service',
      icon: 'service',
    },
  ],
  [
    {
      title: '退出登录',
      tit: '',
      url: '',
      type: 'logout',
      icon: '',
    },
  ],
];

const orderTagInfos = [
  {
    title: '待付款',
    iconName: 'wallet',
    orderNum: 0,
    tabType: 5,
    status: 1,
  },
  {
    title: '待发货',
    iconName: 'deliver',
    orderNum: 0,
    tabType: 10,
    status: 1,
  },
  {
    title: '待收货',
    iconName: 'package',
    orderNum: 0,
    tabType: 40,
    status: 1,
  },
  {
    title: '待评价',
    iconName: 'comment',
    orderNum: 0,
    tabType: 51,  // 待评价（虚拟状态，筛选未评价的已完成订单）
    status: 1,
  },
  {
    title: '退款/售后',
    iconName: 'exchang',
    orderNum: 0,
    tabType: 0,
    status: 1,
  },
];

const getDefaultData = () => ({
  showMakePhone: false,
  userInfo: {
    avatarUrl: '',
    nickName: '正在登录...',
    phoneNumber: '',
  },
  menuData,
  orderTagInfos,
  customerServiceInfo: {},
  currAuthStep: 1,
  showKefu: true,
  versionNo: '',
  showLoginSheet: false, // 登录弹窗
  isLoggedIn: false, // 登录状态
});

Page({
  data: getDefaultData(),

  onLoad() {
    this.getVersionInfo();
  },

  onShow() {
    this.getTabBar().init();

    // 检查登录状态
    const isLoggedIn = checkLoginStatus();
    this.setData({ isLoggedIn });

    if (!isLoggedIn) {
      // 未登录,显示登录弹窗
      this.setData({
        showLoginSheet: true,
        userInfo: {
          avatarUrl: '',
          nickName: '未登录',
          phoneNumber: '',
        },
        currAuthStep: 1,
      });
    } else {
      // 已登录,加载用户信息
      const savedUserInfo = getUserInfo();
      const app = getApp();
      const globalUserInfo = app.globalData.userInfo;

      // 优先使用全局数据，其次使用本地存储
      const avatarUrl = globalUserInfo?.avatarUrl || savedUserInfo?.avatar || '';
      const nickName = globalUserInfo?.nickName || savedUserInfo?.nickname || '微信用户';

      this.setData({
        userInfo: {
          avatarUrl: avatarUrl,
          nickName: nickName,
          phoneNumber: savedUserInfo?.phone || '',
        },
        currAuthStep: 2,
        showLoginSheet: false,
      });

      // 只在首次进入时加载用户信息
      if (!this._hasLoaded) {
        this._hasLoaded = true;
        this.init();
      }
    }
  },
  onPullDownRefresh() {
    // 下拉刷新时不重新加载用户信息，避免头像闪烁
    wx.stopPullDownRefresh();
  },

  init() {
    this.loadUserInfo();
  },

  // 从全局加载用户信息
  loadUserInfo() {
    const app = getApp();
    const globalUserInfo = app.globalData.userInfo;
    const openid = app.globalData.openid;

    if (globalUserInfo) {
      // 已注册用户，显示用户信息
      const avatarUrl = globalUserInfo.avatarUrl || '';

      // 如果是 cloud:// 协议，需要转换为临时 URL
      if (avatarUrl && avatarUrl.startsWith('cloud://')) {
        this.convertCloudUrl(avatarUrl);
        this.setData({
          userInfo: {
            avatarUrl: '', // 先显示默认头像
            nickName: globalUserInfo.nickName || '微信用户',
          },
          currAuthStep: globalUserInfo.nickName && globalUserInfo.nickName !== '微信用户' ? 3 : 2,
        });
      } else {
        this.setData({
          userInfo: {
            avatarUrl: avatarUrl,
            nickName: globalUserInfo.nickName || '微信用户',
          },
          currAuthStep: globalUserInfo.nickName && globalUserInfo.nickName !== '微信用户' ? 3 : 2,
        });
      }
    } else if (openid) {
      // 有 openid 但没有 userInfo，说明是新用户，显示默认状态
      this.setData({
        userInfo: {
          avatarUrl: '',
          nickName: '微信用户',
        },
        currAuthStep: 2,
      });
    } else {
      // 如果连 openid 都没有，等待一下再试
      setTimeout(() => {
        this.loadUserInfo();
      }, 500);
    }
    wx.stopPullDownRefresh();
  },

  // 将 cloud:// 协议转换为临时 HTTPS URL
  convertCloudUrl(cloudUrl) {
    wx.cloud.getTempFileURL({
      fileList: [cloudUrl],
      success: res => {
        if (res.fileList && res.fileList[0] && res.fileList[0].tempFileURL) {
          this.setData({
            'userInfo.avatarUrl': res.fileList[0].tempFileURL,
          });
        }
      },
      fail: err => {
        console.error('转换云存储URL失败:', err);
      }
    });
  },

  fetUseriInfoHandle() {
    fetchUserCenter().then(({ userInfo, countsData, orderTagInfos: orderInfo, customerServiceInfo }) => {
      // eslint-disable-next-line no-unused-expressions
      menuData?.[0].forEach((v) => {
        countsData.forEach((counts) => {
          if (counts.type === v.type) {
            // eslint-disable-next-line no-param-reassign
            v.tit = counts.num;
          }
        });
      });
      const info = orderTagInfos.map((v, index) => ({
        ...v,
        ...orderInfo[index],
      }));
      this.setData({
        userInfo,
        menuData,
        orderTagInfos: info,
        customerServiceInfo,
        currAuthStep: 2,
      });
      wx.stopPullDownRefresh();
    });
  },

  onClickCell({ currentTarget }) {
    const { type } = currentTarget.dataset;

    switch (type) {
      case 'address': {
        wx.navigateTo({ url: '/pages/user/address/list/index' });
        break;
      }
      case 'service': {
        // 跳转到客服页面
        wx.navigateTo({ url: '/pages/user/customer-service/index' });
        break;
      }
      case 'help-center': {
        // 跳转到帮助中心页面
        wx.navigateTo({ url: '/pages/user/help-center/index' });
        break;
      }
      case 'point': {
        // 跳转到积分页面
        wx.navigateTo({ url: '/pages/user/points/index' });
        break;
      }
      case 'logout': {
        // 退出登录
        this.handleLogout();
        break;
      }
      default: {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '未知跳转',
          icon: '',
          duration: 1000,
        });
        break;
      }
    }
  },

  jumpNav(e) {
    const status = e.detail.tabType;

    if (status === 0) {
      wx.navigateTo({ url: '/pages/order/after-service-list/index' });
    } else {
      wx.navigateTo({ url: `/pages/order/order-list/index?status=${status}` });
    }
  },

  jumpAllOrder() {
    wx.navigateTo({ url: '/pages/order/order-list/index' });
  },

  openMakePhone() {
    this.setData({ showMakePhone: true });
  },

  closeMakePhone() {
    this.setData({ showMakePhone: false });
  },

  call() {
    wx.makePhoneCall({
      phoneNumber: this.data.customerServiceInfo.servicePhone,
    });
  },

  gotoUserEditPage() {
    const { currAuthStep, isLoggedIn } = this.data;

    // 检查是否真正登录(使用我们的登录状态)
    if (isLoggedIn && currAuthStep >= 2) {
      // 已登录，跳转个人信息页
      wx.navigateTo({ url: '/pages/user/person-info/index' });
    } else {
      // 未登录，显示登录弹窗
      this.setData({
        showLoginSheet: true,
      });
    }
  },

  getVersionInfo() {
    const versionInfo = wx.getAccountInfoSync();
    const { version, envVersion = __wxConfig } = versionInfo.miniProgram;
    this.setData({
      versionNo: envVersion === 'release' ? version : envVersion,
    });
  },

  /**
   * 退出登录
   */
  async handleLogout() {
    const confirmed = await logout();
    if (confirmed) {
      // 重置页面数据
      this.setData({
        userInfo: {
          avatarUrl: '',
          nickName: '未登录',
          phoneNumber: '',
        },
        currAuthStep: 1,
        isLoggedIn: false,
        showLoginSheet: true,
      });
    }
  },

  /**
   * 关闭登录弹窗
   */
  handleCloseLoginSheet() {
    this.setData({
      showLoginSheet: false,
    });
  },

  /**
   * 显示登录弹窗
   */
  showLoginSheet() {
    this.setData({
      showLoginSheet: true,
    });
  },

  /**
   * 登录成功回调
   */
  handleLoginSuccess(e) {
    console.log('[个人中心] 登录成功:', e.detail);
    const { userInfo } = e.detail;

    // 更新页面数据
    this.setData({
      userInfo: {
        avatarUrl: userInfo.avatar || '',
        nickName: userInfo.nickname || '微信用户',
        phoneNumber: userInfo.phone || '',
      },
      currAuthStep: 2,
      isLoggedIn: true,
      showLoginSheet: false,
    });

    // 加载用户数据
    this.init();
  },
});
