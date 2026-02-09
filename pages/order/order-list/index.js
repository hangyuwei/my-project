import { OrderStatus, OrderButtonTypes } from '../config';
import { fetchOrders, fetchOrdersCount } from '../../../services/order/orderList';
import { cosThumb } from '../../../utils/util';

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
  page: {
    size: 5,
    num: 1,
  },

  data: {
    tabs: [
      { key: -1, text: '全部' },
      { key: OrderStatus.PENDING_PAYMENT, text: '待付款', info: '' },
      { key: OrderStatus.PENDING_DELIVERY, text: '待发货', info: '' },
      { key: OrderStatus.PENDING_RECEIPT, text: '待收货', info: '' },
      { key: OrderStatus.COMPLETE, text: '已完成', info: '' },
    ],
    curTab: -1,
    orderList: [],
    listLoading: 0,
    pullDownRefreshing: false,
    emptyImg: 'https://tdesign.gtimg.com/miniprogram/template/retail/order/empty-order-list.png',
    backRefresh: false,
    status: -1,
  },

  onLoad(query) {
    let status = parseInt(query.status);
    status = this.data.tabs.map((t) => t.key).includes(status) ? status : -1;
    this.init(status);
    this.pullDownRefresh = this.selectComponent('#pull-down-refresh');
  },

  onShow() {
    if (!this.data.backRefresh) return;
    this.onRefresh();
    this.setData({ backRefresh: false });
  },

  onReachBottom() {
    if (this.data.listLoading === 0) {
      this.getOrderList(this.data.curTab);
    }
  },

  onPageScroll(e) {
    this.pullDownRefresh && this.pullDownRefresh.onPageScroll(e);
  },

  onPullDownRefresh_() {
    this.setData({ pullDownRefreshing: true });
    this.refreshList(this.data.curTab, true)
      .then(() => {
        this.setData({ pullDownRefreshing: false });
      })
      .catch((err) => {
        this.setData({ pullDownRefreshing: false });
        console.error('[订单列表] 刷新失败:', err);
      });
  },

  init(status) {
    status = status !== undefined ? status : this.data.curTab;
    this.setData({
      status,
    });
    this.refreshList(status);
  },

  getOrderList(statusCode = -1, reset = false) {
    const params = {
      parameter: {
        pageSize: this.page.size,
        pageNum: this.page.num,
      },
    };
    if (statusCode !== -1) params.parameter.orderStatus = statusCode;
    this.setData({ listLoading: 1 });
    return fetchOrders(params)
      .then((res) => {
        this.page.num++;
        let orderList = [];
        if (res && res.data && res.data.orders) {
          orderList = (res.data.orders || []).map((order) => {
            return {
              id: order.orderId,
              orderNo: order.orderNo,
              parentOrderNo: order.parentOrderNo,
              storeId: order.storeId,
              storeName: order.storeName,
              status: order.orderStatus,
              statusDesc: getStatusName(order.orderStatus, order.orderStatusName),
              amount: order.paymentAmount,
              totalAmount: order.totalAmount,
              logisticsNo: order.logisticsVO ? order.logisticsVO.logisticsNo : '',
              createTime: order.createTime,
              goodsList: (order.orderItemVOs || []).map((goods) => ({
                id: goods.id,
                thumb: cosThumb(goods.goodsPictureUrl, 70),
                title: goods.goodsName,
                skuId: goods.skuId,
                spuId: goods.spuId,
                specs: (goods.specifications || []).map((spec) => spec.specValue),
                price: goods.tagPrice ? goods.tagPrice : goods.actualPrice,
                num: goods.buyQuantity,
                titlePrefixTags: goods.tagText ? [{ text: goods.tagText }] : [],
              })),
              hasCommented: order.hasCommented === true,
              buttons: (order.buttonVOs && order.buttonVOs.length > 0) ? order.buttonVOs : generateButtonsByStatus(order.orderStatus, order.hasCommented === true),
              groupInfoVo: order.groupInfoVo,
              freightFee: order.freightFee,
            };
          });
        }
        // reset 为 true 时直接替换列表，避免下拉刷新时闪烁
        const newOrderList = reset ? orderList : this.data.orderList.concat(orderList);
        this.setData({
          orderList: newOrderList,
          listLoading: orderList.length > 0 ? 0 : 2,
        });
      })
      .catch((err) => {
        this.setData({ listLoading: 3 });
        return Promise.reject(err);
      });
  },

  onReTryLoad() {
    this.getOrderList(this.data.curTab);
  },

  onTabChange(e) {
    const { value } = e.detail;
    this.setData({
      status: value,
    });
    this.refreshList(value);
  },

  getOrdersCount() {
    return fetchOrdersCount().then((res) => {
      const tabsCount = res.data || [];
      const { tabs } = this.data;
      tabs.forEach((tab) => {
        const tabCount = tabsCount.find((c) => c.tabType === tab.key);
        if (tabCount) {
          tab.info = tabCount.orderNum;
        }
      });
      this.setData({ tabs });
    });
  },

  refreshList(status = -1, keepList = false) {
    this.page = {
      size: this.page.size,
      num: 1,
    };
    // keepList 为 true 时保留当前列表，避免下拉刷新时闪烁
    if (keepList) {
      this.setData({ curTab: status });
    } else {
      this.setData({ curTab: status, orderList: [] });
    }

    return Promise.all([this.getOrderList(status, true), this.getOrdersCount()]);
  },

  onRefresh() {
    this.refreshList(this.data.curTab);
  },

  onOrderCardTap(e) {
    const { order } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/order/order-detail/index?orderNo=${order.orderNo}`,
    });
  },
});
