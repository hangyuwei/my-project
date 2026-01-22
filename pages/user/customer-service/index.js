Page({
  data: {
    serviceInfo: {
      hotline: '400-123-4567',
      workTime: '工作时间：周一至周日 9:00-21:00',
      email: 'service@example.com',
      wechat: 'CustomerService001',
    },
    quickQuestions: [
      { id: 1, question: '订单支付问题', icon: 'money-circle' },
      { id: 2, question: '物流查询', icon: 'location' },
      { id: 3, question: '退款/售后', icon: 'rollback' },
      { id: 4, question: '账号问题', icon: 'user-circle' },
      { id: 5, question: '优惠券使用', icon: 'coupon' },
      { id: 6, question: '其他问题', icon: 'help-circle' },
    ],
    chatHistory: [],
    inputMessage: '',
    isOnline: true,
  },

  onLoad() {
    this.initChatHistory();
    this.checkServiceStatus();
  },

  // 初始化聊天记录
  initChatHistory() {
    const welcomeMessage = {
      id: 1,
      type: 'service',
      content: '您好！我是智能客服小助手，很高兴为您服务。请问有什么可以帮助您的？',
      time: Date.now(),
    };

    this.setData({
      chatHistory: [welcomeMessage],
    });
  },

  // 检查客服状态
  checkServiceStatus() {
    // 这里可以调用云函数检查客服是否在线
    // 模拟数据
    const now = new Date();
    const hour = now.getHours();
    const isOnline = hour >= 9 && hour < 21;

    this.setData({ isOnline });
  },

  // 快捷问题点击
  onQuickQuestionTap(e) {
    const { question } = e.currentTarget.dataset;
    this.sendMessage(question);
  },

  // 输入消息
  onInputChange(e) {
    this.setData({ inputMessage: e.detail.value });
  },

  // 发送消息
  sendMessage(message) {
    const content = message || this.data.inputMessage.trim();

    if (!content) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content,
      time: Date.now(),
    };

    // 添加用户消息
    this.setData({
      chatHistory: [...this.data.chatHistory, userMessage],
      inputMessage: '',
    });

    // 滚动到底部
    setTimeout(() => {
      this.scrollToBottom();
    }, 100);

    // 模拟客服回复
    this.simulateServiceReply(content);
  },

  // 模拟客服回复
  simulateServiceReply(userMessage) {
    setTimeout(() => {
      let replyContent = '';

      // 根据关键词给出回复
      if (userMessage.includes('支付') || userMessage.includes('付款')) {
        replyContent = '关于支付问题，您可以：\n1. 检查网络连接是否正常\n2. 确认银行卡余额是否充足\n3. 更换其他支付方式\n\n如仍无法解决，请拨打客服热线 400-123-4567。';
      } else if (userMessage.includes('物流') || userMessage.includes('快递')) {
        replyContent = '您可以在"我的订单"中查看物流信息。点击订单详情，即可看到包裹的实时位置和预计送达时间。';
      } else if (userMessage.includes('退款') || userMessage.includes('售后')) {
        replyContent = '申请售后流程：\n1. 进入"我的订单"\n2. 选择需要售后的订单\n3. 点击"申请售后"\n4. 填写售后原因并提交\n\n我们会在1-3个工作日内处理您的申请。';
      } else if (userMessage.includes('优惠券')) {
        replyContent = '优惠券使用说明：\n1. 在结算页面选择可用优惠券\n2. 系统会自动抵扣相应金额\n3. 每个订单限用一张优惠券\n\n注意查看优惠券的使用条件和有效期哦！';
      } else {
        replyContent = '感谢您的咨询！如需人工客服，请拨打热线 400-123-4567（工作时间：9:00-21:00），我们会尽快为您解答。';
      }

      const serviceMessage = {
        id: Date.now(),
        type: 'service',
        content: replyContent,
        time: Date.now(),
      };

      this.setData({
        chatHistory: [...this.data.chatHistory, serviceMessage],
      });

      // 滚动到底部
      setTimeout(() => {
        this.scrollToBottom();
      }, 100);
    }, 1000);
  },

  // 滚动到底部
  scrollToBottom() {
    wx.pageScrollTo({
      scrollTop: 99999,
      duration: 300,
    });
  },

  // 拨打电话
  makePhoneCall() {
    wx.makePhoneCall({
      phoneNumber: this.data.serviceInfo.hotline,
    });
  },

  // 复制微信号
  copyWechat() {
    wx.setClipboardData({
      data: this.data.serviceInfo.wechat,
      success: () => {
        wx.showToast({
          title: '微信号已复制',
          icon: 'success',
        });
      },
    });
  },

  // 转人工客服
  transferToHuman() {
    if (!this.data.isOnline) {
      wx.showToast({
        title: '当前非工作时间',
        icon: 'none',
      });
      return;
    }

    // 这里可以调用云函数转接人工客服
    wx.showToast({
      title: '正在为您转接...',
      icon: 'loading',
      duration: 2000,
    });
  },
});
