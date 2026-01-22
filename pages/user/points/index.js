import Toast from 'tdesign-miniprogram/toast/index';

Page({
  data: {
    userPoints: 0,
    pointsHistory: [],
    pageLoading: true,
    pointsRules: [
      { title: '每日签到', points: '+10', desc: '每天签到可获得10积分' },
      { title: '完成订单', points: '+订单金额的1%', desc: '订单完成后获得积分' },
      { title: '评价商品', points: '+20', desc: '每次评价商品可获得20积分' },
      { title: '邀请好友', points: '+50', desc: '邀请新用户注册可获得50积分' },
    ],
    canSignIn: true,
    hasSignedToday: false,
  },

  onLoad() {
    this.loadPointsData();
  },

  onShow() {
    this.loadPointsData();
  },

  // 加载积分数据
  async loadPointsData() {
    this.setData({ pageLoading: true });

    try {
      // 这里应该调用云函数获取用户积分信息
      // const res = await wx.cloud.callFunction({ name: 'getUserPoints' });

      // 模拟数据
      const mockData = {
        userPoints: 1280,
        pointsHistory: [
          {
            id: 1,
            type: 'earn',
            points: 50,
            reason: '完成订单',
            time: Date.now() - 86400000,
            orderNo: 'ORD20260120001'
          },
          {
            id: 2,
            type: 'earn',
            points: 10,
            reason: '每日签到',
            time: Date.now() - 172800000
          },
          {
            id: 3,
            type: 'use',
            points: -100,
            reason: '积分兑换优惠券',
            time: Date.now() - 259200000,
            couponName: '满100减10优惠券'
          },
          {
            id: 4,
            type: 'earn',
            points: 20,
            reason: '评价商品',
            time: Date.now() - 345600000,
            goodsName: 'iPhone 13'
          },
        ],
        hasSignedToday: false,
      };

      this.setData({
        userPoints: mockData.userPoints,
        pointsHistory: mockData.pointsHistory,
        hasSignedToday: mockData.hasSignedToday,
        canSignIn: !mockData.hasSignedToday,
        pageLoading: false,
      });
    } catch (error) {
      console.error('加载积分数据失败:', error);
      this.setData({ pageLoading: false });
      Toast({
        context: this,
        selector: '#t-toast',
        message: '加载失败，请重试',
        theme: 'error',
      });
    }
  },

  // 每日签到
  async onSignIn() {
    if (!this.data.canSignIn) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '今日已签到',
        icon: '',
      });
      return;
    }

    try {
      // 调用云函数进行签到
      // const res = await wx.cloud.callFunction({ name: 'userSignIn' });

      Toast({
        context: this,
        selector: '#t-toast',
        message: '签到成功，获得10积分',
        theme: 'success',
      });

      // 更新数据
      this.setData({
        userPoints: this.data.userPoints + 10,
        canSignIn: false,
        hasSignedToday: true,
      });

      // 刷新积分历史
      this.loadPointsData();
    } catch (error) {
      console.error('签到失败:', error);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '签到失败，请重试',
        theme: 'error',
      });
    }
  },

  // 跳转到积分兑换页面
  onExchangePoints() {
    wx.navigateTo({
      url: '/pages/user/points-exchange/index',
    });
  },

  // 格式化时间
  formatTime(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
  },

  onPullDownRefresh() {
    this.loadPointsData().then(() => {
      wx.stopPullDownRefresh();
    });
  },
});
