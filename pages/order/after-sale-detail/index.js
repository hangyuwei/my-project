import { getAfterSaleDetail, cancelAfterSale, buyerShip, AfterSaleTypeDesc } from '../../../services/after-sale/index';
import Toast from 'tdesign-miniprogram/toast/index';
import Dialog from 'tdesign-miniprogram/dialog/index';

// 售后状态
const AfterSaleStatus = {
  APPLIED: 'APPLIED',
  SELLER_AGREED: 'SELLER_AGREED',
  SELLER_REJECTED: 'SELLER_REJECTED',
  WAIT_BUYER_RETURN: 'WAIT_BUYER_RETURN',
  BUYER_SHIPPED: 'BUYER_SHIPPED',
  SELLER_RECEIVED: 'SELLER_RECEIVED',
  REFUNDING: 'REFUNDING',
  REFUNDED: 'REFUNDED',
  CANCELED: 'CANCELED',
};

// 状态标题和描述
const StatusConfig = {
  [AfterSaleStatus.APPLIED]: {
    title: '等待商家处理',
    desc: '商家将在48小时内处理您的申请',
    icon: 'time',
  },
  [AfterSaleStatus.SELLER_AGREED]: {
    title: '商家已同意',
    desc: '退款将在1-3个工作日内到账',
    icon: 'check-circle',
  },
  [AfterSaleStatus.SELLER_REJECTED]: {
    title: '商家已拒绝',
    desc: '您可以修改申请或联系客服处理',
    icon: 'close-circle',
  },
  [AfterSaleStatus.WAIT_BUYER_RETURN]: {
    title: '请寄回商品',
    desc: '请在7天内将商品寄回并填写物流单号',
    icon: 'deliver',
  },
  [AfterSaleStatus.BUYER_SHIPPED]: {
    title: '等待商家收货',
    desc: '商家确认收货后将为您退款',
    icon: 'time',
  },
  [AfterSaleStatus.SELLER_RECEIVED]: {
    title: '商家已收货',
    desc: '退款将在1-3个工作日内到账',
    icon: 'check-circle',
  },
  [AfterSaleStatus.REFUNDING]: {
    title: '退款处理中',
    desc: '退款将在1-3个工作日内到账',
    icon: 'time',
  },
  [AfterSaleStatus.REFUNDED]: {
    title: '退款成功',
    desc: '退款已原路退回您的付款账户',
    icon: 'check-circle',
  },
  [AfterSaleStatus.CANCELED]: {
    title: '售后已取消',
    desc: '您已取消本次售后申请',
    icon: 'close-circle',
  },
};

Page({
  data: {
    pageLoading: true,
    afterSale: null,
    statusConfig: null,

    // 物流填写弹窗
    showLogisticsPopup: false,
    logisticsCompany: '',
    logisticsNo: '',
  },

  onLoad(options) {
    this.afterSaleId = options.afterSaleId;
    this.loadDetail();
  },

  onShow() {
    if (this.data.afterSale) {
      this.loadDetail();
    }
  },

  async loadDetail() {
    try {
      const afterSale = await getAfterSaleDetail(this.afterSaleId);
      const statusConfig = StatusConfig[afterSale.status] || {};

      // 确保金额以"元"为单位显示
      // applyAmountYuan 是云函数存储的元字段，applyAmount 是分字段
      if (afterSale.applyAmountYuan !== undefined && afterSale.applyAmountYuan !== null) {
        afterSale.displayAmount = parseFloat(afterSale.applyAmountYuan).toFixed(2);
      } else if (afterSale.applyAmount) {
        // 旧数据或 applyAmount 存的是分，转换为元
        afterSale.displayAmount = (afterSale.applyAmount / 100).toFixed(2);
      } else {
        afterSale.displayAmount = '0.00';
      }

      // 格式化申请时间
      if (afterSale.applyTime) {
        afterSale.applyTimeFormatted = this.formatTime(afterSale.applyTime);
      }

      this.setData({
        afterSale,
        statusConfig,
        pageLoading: false,
      });
    } catch (error) {
      console.error('加载售后详情失败:', error);
      Toast({ context: this, selector: '#t-toast', message: '加载失败' });
      this.setData({ pageLoading: false });
    }
  },

  // 取消售后
  async onCancelTap() {
    const result = await Dialog.confirm({
      context: this,
      title: '确认取消',
      content: '确定要取消这个售后申请吗？',
      confirmBtn: '确认取消',
      cancelBtn: '再想想',
    });

    if (result.confirm) {
      try {
        await cancelAfterSale(this.afterSaleId);
        Toast({ context: this, selector: '#t-toast', message: '已取消', theme: 'success' });
        this.loadDetail();
      } catch (error) {
        Toast({ context: this, selector: '#t-toast', message: error.message || '取消失败' });
      }
    }
  },

  // 打开填写物流弹窗
  openLogisticsPopup() {
    this.setData({ showLogisticsPopup: true });
  },

  // 关闭物流弹窗
  closeLogisticsPopup() {
    this.setData({ showLogisticsPopup: false });
  },

  // 输入物流公司
  onCompanyInput(e) {
    this.setData({ logisticsCompany: e.detail.value });
  },

  // 输入物流单号
  onLogisticsNoInput(e) {
    this.setData({ logisticsNo: e.detail.value });
  },

  // 提交物流信息
  async submitLogistics() {
    const { logisticsCompany, logisticsNo } = this.data;

    if (!logisticsCompany.trim()) {
      Toast({ context: this, selector: '#t-toast', message: '请输入物流公司' });
      return;
    }
    if (!logisticsNo.trim()) {
      Toast({ context: this, selector: '#t-toast', message: '请输入物流单号' });
      return;
    }

    try {
      await buyerShip(this.afterSaleId, logisticsCompany, logisticsNo);
      Toast({ context: this, selector: '#t-toast', message: '提交成功', theme: 'success' });
      this.setData({ showLogisticsPopup: false });
      this.loadDetail();
    } catch (error) {
      Toast({ context: this, selector: '#t-toast', message: error.message || '提交失败' });
    }
  },

  // 预览凭证图片
  previewEvidence(e) {
    const { url } = e.currentTarget.dataset;
    wx.previewImage({
      current: url,
      urls: this.data.afterSale.evidence || [],
    });
  },

  // 查看订单
  goToOrder() {
    const { afterSale } = this.data;
    if (afterSale && afterSale.orderNo) {
      wx.navigateTo({
        url: `/pages/order/order-detail/index?orderNo=${afterSale.orderNo}`,
      });
    }
  },

  // 格式化时间
  formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
  },
});
