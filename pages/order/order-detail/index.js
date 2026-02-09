import { formatTime } from '../../../utils/util';
import { OrderStatus, LogisticsIconMap, OrderButtonTypes } from '../config';
import { fetchBusinessTime, fetchOrderDetail } from '../../../services/order/orderDetail';
import Toast from 'tdesign-miniprogram/toast/index';
import Dialog from 'tdesign-miniprogram/dialog/index';
import { getAddressPromise } from '../../../services/address/list';
import { getAfterSaleEntry } from '../../../services/after-sale/index';
import { updateLocalOrderStatus } from '../../../services/order/localOrders';

// 订单状态中文名称映射
const STATUS_NAME_MAP = {
  5: '待付款',
  10: '待发货',
  40: '待收货',
  50: '已完成',
  80: '已取消',
};

// 获取中文状态名称
const getStatusName = (status, fallbackName) => {
  // 如果后端提供了明确的状态名称，优先使用（例如"已退款"）
  if (fallbackName && fallbackName !== '未知状态') {
    return fallbackName;
  }
  return STATUS_NAME_MAP[status] || fallbackName || '未知状态';
};

// 根据订单状态生成按钮
const generateButtonsByStatus = (orderStatus, hasCommented = false) => {
  const buttons = [];
  switch (orderStatus) {
    case 5: // 待付款
      buttons.push({ type: OrderButtonTypes.PAY, name: '付款', primary: true });
      buttons.push({ type: OrderButtonTypes.CANCEL, name: '取消订单', primary: false });
      break;
    case 10: // 待发货
      buttons.push({ type: OrderButtonTypes.APPLY_REFUND, name: '申请退款', primary: false });
      break;
    case 40: // 待收货
      buttons.push({ type: OrderButtonTypes.CONFIRM, name: '确认收货', primary: true });
      buttons.push({ type: OrderButtonTypes.DELIVERY, name: '查看物流', primary: false });
      break;
    case 50: // 已完成
      // 只有未评价的订单才显示评价按钮
      if (!hasCommented) {
        buttons.push({ type: OrderButtonTypes.COMMENT, name: '评价', primary: true });
      }
      buttons.push({ type: OrderButtonTypes.REBUY, name: '再次购买', primary: !hasCommented ? false : true });
      buttons.push({ type: OrderButtonTypes.DELETE, name: '删除订单', primary: false });
      break;
    case 80: // 已取消
      buttons.push({ type: OrderButtonTypes.DELETE, name: '删除订单', primary: false });
      break;
  }
  return buttons;
};

Page({
  data: {
    pageLoading: true,
    order: {}, // 后台返回的原始数据
    _order: {}, // 内部使用和提供给 order-card 的数据
    storeDetail: {},
    countDownTime: null,
    addressEditable: false,
    backRefresh: false, // 用于接收其他页面back时的状态
    formatCreateTime: '', //格式化订单创建时间
    logisticsNodes: [],
    /** 订单评论状态 */
    orderHasCommented: true,
    /** 售后入口信息 */
    afterSaleEntry: null,
  },

  onLoad(query) {
    this.orderNo = query.orderNo;
    this.init();
    this.navbar = this.selectComponent('#navbar');
    this.pullDownRefresh = this.selectComponent('#t-pull-down-refresh');
  },

  onShow() {
    // 当从其他页面返回，并且 backRefresh 被置为 true 时，刷新数据
    if (!this.data.backRefresh) return;
    this.onRefresh();
    this.setData({ backRefresh: false });
  },

  onPageScroll(e) {
    this.pullDownRefresh && this.pullDownRefresh.onPageScroll(e);
  },

  onImgError(e) {
    if (e.detail) {
      console.error('img 加载失败');
    }
  },

  // 页面初始化，会展示pageLoading
  init() {
    this.setData({ pageLoading: true });
    this.getStoreDetail();
    this.getDetail()
      .then(() => {
        this.setData({ pageLoading: false });
        // 获取售后入口信息
        this.fetchAfterSaleEntry();
      })
      .catch((e) => {
        console.error(e);
      });
  },

  // 页面刷新，展示下拉刷新
  onRefresh() {
    this.init();
    // 如果上一页为订单列表，通知其刷新数据
    const pages = getCurrentPages();
    const lastPage = pages[pages.length - 2];
    if (lastPage) {
      lastPage.data.backRefresh = true;
    }
  },

  // 页面刷新，展示下拉刷新
  onPullDownRefresh_(e) {
    const callback = e && e.detail && e.detail.callback;
    return this.getDetail().then(() => callback && callback());
  },

  getDetail() {
    const params = {
      parameter: this.orderNo,
    };
    return fetchOrderDetail(params).then((res) => {
      const order = res.data;
      const _order = {
        id: order.orderId,
        orderNo: order.orderNo,
        parentOrderNo: order.parentOrderNo,
        storeId: order.storeId,
        storeName: order.storeName,
        status: order.orderStatus,
        statusDesc: getStatusName(order.orderStatus, order.orderStatusName),
        amount: order.paymentAmount,
        totalAmount: order.goodsAmountApp,
        logisticsNo: order.logisticsVO ? order.logisticsVO.logisticsNo : '',
        goodsList: (order.orderItemVOs || []).map((goods) =>
          Object.assign({}, goods, {
            id: goods.id,
            thumb: goods.goodsPictureUrl,
            title: goods.goodsName,
            skuId: goods.skuId,
            spuId: goods.spuId,
            specs: (goods.specifications || []).map((s) => s.specValue),
            price: goods.tagPrice ? goods.tagPrice : goods.actualPrice,
            num: goods.buyQuantity,
            titlePrefixTags: goods.tagText ? [{ text: goods.tagText }] : [],
            buttons: goods.buttonVOs || [],
          }),
        ),
        hasCommented: order.hasCommented === true,
        buttons: (order.buttonVOs && order.buttonVOs.length > 0) ? order.buttonVOs : generateButtonsByStatus(order.orderStatus, order.hasCommented === true),
        createTime: order.createTime,
        receiverAddress: this.composeAddress(order),
        groupInfoVo: order.groupInfoVo,
      };
      this.setData({
        order,
        _order,
        formatCreateTime: formatTime(parseFloat(`${order.createTime}`), 'YYYY-MM-DD HH:mm'), // 格式化订单创建时间
        countDownTime: this.computeCountDownTime(order),
        addressEditable:
          [OrderStatus.PENDING_PAYMENT, OrderStatus.PENDING_DELIVERY].includes(order.orderStatus) &&
          order.orderSubStatus !== -1, // 订单正在取消审核时不允许修改地址（但是返回的状态码与待发货一致）
        isPaid: !!(order.paymentVO && order.paymentVO.paySuccessTime),
        invoiceStatus: this.datermineInvoiceStatus(order),
        invoiceDesc: order.invoiceDesc,
        invoiceType: order.invoiceVO?.invoiceType === 5 ? '电子普通发票' : '不开发票', //是否开票 0-不开 5-电子发票
        logisticsNodes: this.flattenNodes(order.trajectoryVos || []),
      });
    });
  },

  // 展开物流节点
  flattenNodes(nodes) {
    return (nodes || []).reduce((res, node) => {
      return (node.nodes || []).reduce((res1, subNode, index) => {
        res1.push({
          title: index === 0 ? node.title : '', // 子节点中仅第一个显示title
          desc: subNode.status,
          date: formatTime(+subNode.timestamp, 'YYYY-MM-DD HH:mm:ss'),
          icon: index === 0 ? LogisticsIconMap[node.code] || '' : '', // 子节点中仅第一个显示icon
        });
        return res1;
      }, res);
    }, []);
  },

  datermineInvoiceStatus(order) {
    // 1-已开票
    // 2-未开票（可补开）
    // 3-未开票
    // 4-门店不支持开票
    return order.invoiceStatus;
  },

  // 拼接省市区
  composeAddress(order) {
    return [
      //order.logisticsVO.receiverProvince,
      order.logisticsVO.receiverCity,
      order.logisticsVO.receiverCountry,
      order.logisticsVO.receiverArea,
      order.logisticsVO.receiverAddress,
    ]
      .filter((s) => !!s)
      .join(' ');
  },

  getStoreDetail() {
    fetchBusinessTime().then((res) => {
      const storeDetail = {
        storeTel: res.data.telphone,
        storeBusiness: res.data.businessTime.join('\n'),
      };
      this.setData({ storeDetail });
    });
  },

  // 仅对待支付状态计算付款倒计时
  // 返回时间若是大于2020.01.01，说明返回的是关闭时间，否则说明返回的直接就是剩余时间
  computeCountDownTime(order) {
    if (order.orderStatus !== OrderStatus.PENDING_PAYMENT) return null;
    return order.autoCancelTime > 1577808000000 ? order.autoCancelTime - Date.now() : order.autoCancelTime;
  },

  onCountDownFinish() {
    //this.setData({ countDownTime: -1 });
    const { countDownTime, order } = this.data;
    if (countDownTime > 0 || (order && order.groupInfoVo && order.groupInfoVo.residueTime > 0)) {
      this.onRefresh();
    }
  },

  onGoodsCardTap(e) {
    const { index } = e.currentTarget.dataset;
    const goods = this.data.order.orderItemVOs[index];
    wx.navigateTo({ url: `/pages/goods/details/index?spuId=${goods.spuId}` });
  },

  onEditAddressTap() {
    getAddressPromise()
      .then((address) => {
        this.setData({
          'order.logisticsVO.receiverName': address.name,
          'order.logisticsVO.receiverPhone': address.phone,
          '_order.receiverAddress': address.address,
        });
      })
      .catch(() => {});

    wx.navigateTo({
      url: `/pages/user/address/list/index?selectMode=1`,
    });
  },

  onOrderNumCopy() {
    wx.setClipboardData({
      data: this.data.order.orderNo,
    });
  },

  onDeliveryNumCopy() {
    wx.setClipboardData({
      data: this.data.order.logisticsVO.logisticsNo,
    });
  },

  onToInvoice() {
    wx.navigateTo({
      url: `/pages/order/invoice/index?orderNo=${this.data._order.orderNo}`,
    });
  },

  onSuppleMentInvoice() {
    wx.navigateTo({
      url: `/pages/order/receipt/index?orderNo=${this.data._order.orderNo}`,
    });
  },

  onDeliveryClick() {
    const logisticsData = {
      nodes: this.data.logisticsNodes,
      company: this.data.order.logisticsVO.logisticsCompanyName,
      logisticsNo: this.data.order.logisticsVO.logisticsNo,
      phoneNumber: this.data.order.logisticsVO.logisticsCompanyTel,
    };
    wx.navigateTo({
      url: `/pages/order/delivery-detail/index?data=${encodeURIComponent(JSON.stringify(logisticsData))}`,
    });
  },

  /** 跳转订单评价 */
  navToCommentCreate() {
    wx.navigateTo({
      url: `/pages/order/createComment/index?orderNo=${this.orderNo}`,
    });
  },

  /** 跳转拼团详情/分享页*/
  toGrouponDetail() {
    wx.showToast({ title: '点击了拼团' });
  },

  clickService() {
    Toast({
      context: this,
      selector: '#t-toast',
      message: '您点击了联系客服',
    });
  },

  onOrderInvoiceView() {
    wx.navigateTo({
      url: `/pages/order/invoice/index?orderNo=${this.orderNo}`,
    });
  },

  // 获取售后入口信息
  async fetchAfterSaleEntry() {
    try {
      const entry = await getAfterSaleEntry(this.orderNo);
      this.setData({ afterSaleEntry: entry });
    } catch (error) {
      console.error('[售后入口] 获取失败:', error);
    }
  },

  // 点击售后按钮
  onAfterSaleTap() {
    const { afterSaleEntry, order } = this.data;

    if (!afterSaleEntry) return;

    if (afterSaleEntry.hasOngoing) {
      // 有进行中的售后，跳转到售后详情页
      wx.navigateTo({
        url: `/pages/order/after-sale-detail/index?afterSaleId=${afterSaleEntry.afterSaleId}`,
      });
    } else if (afterSaleEntry.canApply) {
      // 可以申请售后，跳转到售后申请页
      wx.navigateTo({
        url: `/pages/order/after-sale-apply/index?orderNo=${this.orderNo}&maxAmount=${afterSaleEntry.refundableAmount}&types=${afterSaleEntry.availableTypes.join(',')}`,
      });
    }
  },

  // 取消订单 - 跳转到售后申请页面
  onCancelOrderTap() {
    const { order } = this.data;
    // 金额从分转换为元
    const maxAmountFen = order.paymentAmount || order.totalAmount || 0;
    const maxAmount = (maxAmountFen / 100).toFixed(2);
    const orderNo = order.orderNo || this.orderNo;

    wx.navigateTo({
      url: `/pages/order/after-sale-apply/index?orderNo=${orderNo}&maxAmount=${maxAmount}&types=ONLY_REFUND`,
    });
  },
});
