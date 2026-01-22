Page({
  data: {
    helpCategories: [
      {
        id: 1,
        title: '新手入门',
        icon: 'help-circle',
        questions: [
          { id: 101, question: '如何注册账号？', answer: '点击首页右上角的"登录/注册"按钮，按照提示完成手机号验证即可注册成功。' },
          { id: 102, question: '如何完善个人信息？', answer: '进入"个人中心" > "个人信息"，可以修改头像、昵称等信息。' },
          { id: 103, question: '忘记密码怎么办？', answer: '在登录页面点击"忘记密码"，通过手机验证码重置密码。' },
        ],
      },
      {
        id: 2,
        title: '购物相关',
        icon: 'cart',
        questions: [
          { id: 201, question: '如何下单购买？', answer: '选择商品 > 加入购物车 > 去结算 > 填写收货地址 > 提交订单 > 完成支付。' },
          { id: 202, question: '支持哪些支付方式？', answer: '目前支持微信支付、支付宝等主流支付方式。' },
          { id: 203, question: '订单支付后多久发货？', answer: '一般情况下，订单支付成功后24小时内发货，节假日可能会延迟。' },
          { id: 204, question: '如何查看物流信息？', answer: '进入"我的订单"，点击相应订单查看详情，即可看到物流信息。' },
        ],
      },
      {
        id: 3,
        title: '售后服务',
        icon: 'service',
        questions: [
          { id: 301, question: '如何申请退款？', answer: '进入"我的订单"，选择要退款的订单，点击"申请售后"，选择退款原因并提交申请。' },
          { id: 302, question: '退款多久到账？', answer: '退款审核通过后，款项将在1-7个工作日内原路返回到您的支付账户。' },
          { id: 303, question: '可以退换货吗？', answer: '商品签收后7天内，如商品存在质量问题或与描述不符，可申请退换货。' },
          { id: 304, question: '退换货运费谁承担？', answer: '如因商品质量问题导致的退换货，运费由商家承担；其他情况由买家承担。' },
        ],
      },
      {
        id: 4,
        title: '账号安全',
        icon: 'lock-on',
        questions: [
          { id: 401, question: '如何修改密码？', answer: '进入"个人中心" > "账号安全" > "修改密码"，验证身份后即可修改。' },
          { id: 402, question: '如何绑定手机号？', answer: '进入"个人中心" > "账号安全" > "绑定手机"，输入手机号并验证即可。' },
          { id: 403, question: '账号被盗怎么办？', answer: '立即联系客服，提供账号信息和身份证明，客服会协助您找回账号。' },
        ],
      },
      {
        id: 5,
        title: '优惠活动',
        icon: 'coupon',
        questions: [
          { id: 501, question: '如何获得优惠券？', answer: '可以通过参与平台活动、签到、邀请好友等方式获得优惠券。' },
          { id: 502, question: '优惠券如何使用？', answer: '在结算页面选择可用优惠券，系统会自动抵扣相应金额。' },
          { id: 503, question: '积分有什么用？', answer: '积分可以用于兑换优惠券、参与抽奖等活动。' },
        ],
      },
    ],
    expandedCategory: null,
    expandedQuestion: null,
    searchKeyword: '',
    searchResults: [],
    isSearching: false,
  },

  onLoad() {},

  // 展开/收起分类
  onCategoryTap(e) {
    const { id } = e.currentTarget.dataset;
    this.setData({
      expandedCategory: this.data.expandedCategory === id ? null : id,
      expandedQuestion: null,
    });
  },

  // 展开/收起问题
  onQuestionTap(e) {
    const { id } = e.currentTarget.dataset;
    this.setData({
      expandedQuestion: this.data.expandedQuestion === id ? null : id,
    });
  },

  // 搜索问题
  onSearchInput(e) {
    const keyword = e.detail.value.trim();
    this.setData({ searchKeyword: keyword });

    if (!keyword) {
      this.setData({ searchResults: [], isSearching: false });
      return;
    }

    const results = [];
    this.data.helpCategories.forEach((category) => {
      category.questions.forEach((q) => {
        if (
          q.question.toLowerCase().includes(keyword.toLowerCase()) ||
          q.answer.toLowerCase().includes(keyword.toLowerCase())
        ) {
          results.push({
            ...q,
            categoryTitle: category.title,
          });
        }
      });
    });

    this.setData({
      searchResults: results,
      isSearching: true,
    });
  },

  // 清空搜索
  onSearchClear() {
    this.setData({
      searchKeyword: '',
      searchResults: [],
      isSearching: false,
    });
  },

  // 联系客服
  onContactService() {
    wx.navigateTo({
      url: '/pages/user/customer-service/index',
    });
  },
});
