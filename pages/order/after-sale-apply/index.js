import { applyAfterSale, AfterSaleType, AfterSaleTypeDesc, RefundReasons, ReturnReasons } from '../../../services/after-sale/index';
import Toast from 'tdesign-miniprogram/toast/index';

Page({
  data: {
    orderNo: '',
    maxAmount: 0,
    availableTypes: [],

    // 表单数据
    selectedType: '',
    refundAmount: '',
    selectedReason: null,
    reasonText: '',
    evidence: [],

    // 选项
    typeOptions: [],
    reasonOptions: [],

    // UI状态
    showReasonPicker: false,
    submitting: false,
  },

  onLoad(options) {
    const { orderNo, maxAmount, types } = options;
    const availableTypes = types ? types.split(',') : [];

    // 构建类型选项
    const typeOptions = availableTypes.map(type => ({
      value: type,
      label: AfterSaleTypeDesc[type] || type,
    }));

    // 默认选择第一个类型
    const selectedType = availableTypes[0] || '';
    const reasonOptions = this.getReasonOptions(selectedType);

    this.setData({
      orderNo,
      maxAmount: parseFloat(maxAmount) || 0,
      availableTypes,
      typeOptions,
      selectedType,
      reasonOptions,
      refundAmount: maxAmount,
    });
  },

  // 根据售后类型获取原因选项
  getReasonOptions(type) {
    if (type === AfterSaleType.ONLY_REFUND) {
      return RefundReasons;
    } else if (type === AfterSaleType.RETURN_REFUND) {
      return ReturnReasons;
    }
    return [];
  },

  // 选择售后类型
  onTypeChange(e) {
    const selectedType = e.currentTarget.dataset.detail;
    const reasonOptions = this.getReasonOptions(selectedType);
    this.setData({
      selectedType,
      reasonOptions,
      selectedReason: null,
    });
  },

  // 输入退款金额
  onAmountInput(e) {
    let value = e.detail.value;
    // 限制最大金额
    if (parseFloat(value) > this.data.maxAmount) {
      value = this.data.maxAmount.toString();
    }
    this.setData({ refundAmount: value });
  },

  // 打开原因选择器
  openReasonPicker() {
    this.setData({ showReasonPicker: true });
  },

  // 关闭原因选择器
  closeReasonPicker() {
    this.setData({ showReasonPicker: false });
  },

  // 选择原因
  onReasonSelect(e) {
    const { code } = e.currentTarget.dataset;
    const reason = this.data.reasonOptions.find(r => r.code === code);
    this.setData({
      selectedReason: reason,
      showReasonPicker: false,
    });
  },

  // 输入补充说明
  onReasonTextInput(e) {
    this.setData({ reasonText: e.detail.value });
  },

  // 选择图片
  async chooseImage() {
    try {
      const res = await wx.chooseMedia({
        count: 9 - this.data.evidence.length,
        mediaType: ['image'],
        sourceType: ['album', 'camera'],
      });

      const newImages = res.tempFiles.map(file => file.tempFilePath);
      this.setData({
        evidence: [...this.data.evidence, ...newImages],
      });
    } catch (error) {
      console.log('取消选择');
    }
  },

  // 删除图片
  removeImage(e) {
    const { index } = e.currentTarget.dataset;
    const evidence = [...this.data.evidence];
    evidence.splice(index, 1);
    this.setData({ evidence });
  },

  // 预览图片
  previewImage(e) {
    const { url } = e.currentTarget.dataset;
    wx.previewImage({
      current: url,
      urls: this.data.evidence,
    });
  },

  // 提交申请
  async onSubmit() {
    const { orderNo, selectedType, refundAmount, selectedReason, reasonText, evidence, submitting } = this.data;

    if (submitting) return;

    // 校验
    if (!selectedType) {
      Toast({ context: this, selector: '#t-toast', message: '请选择售后类型' });
      return;
    }
    if (!refundAmount || parseFloat(refundAmount) <= 0) {
      Toast({ context: this, selector: '#t-toast', message: '请输入退款金额' });
      return;
    }
    if (!selectedReason) {
      Toast({ context: this, selector: '#t-toast', message: '请选择退款原因' });
      return;
    }

    this.setData({ submitting: true });

    try {
      // 上传图片到云存储
      let uploadedEvidence = [];
      if (evidence.length > 0) {
        Toast({ context: this, selector: '#t-toast', message: '正在上传图片...' });
        uploadedEvidence = await this.uploadImages(evidence);
      }

      const result = await applyAfterSale({
        orderNo,
        type: selectedType,
        amount: parseFloat(refundAmount),
        reasonCode: selectedReason.code,
        reasonText: selectedReason.text + (reasonText ? `（${reasonText}）` : ''),
        evidence: uploadedEvidence,
      });

      Toast({ context: this, selector: '#t-toast', message: '申请已提交', theme: 'success' });

      // 跳转到售后详情页
      setTimeout(() => {
        wx.redirectTo({
          url: `/pages/order/after-sale-detail/index?afterSaleId=${result.afterSaleId}`,
        });
      }, 1500);

    } catch (error) {
      console.error('提交售后申请失败:', error);
      Toast({ context: this, selector: '#t-toast', message: error.message || '提交失败' });
      this.setData({ submitting: false });
    }
  },

  // 上传图片
  async uploadImages(images) {
    const uploadPromises = images.map((filePath, index) => {
      const cloudPath = `after-sale/${Date.now()}-${index}-${Math.random().toString(36).substr(2, 8)}.jpg`;
      return wx.cloud.uploadFile({
        cloudPath,
        filePath,
      }).then(res => res.fileID);
    });

    return Promise.all(uploadPromises);
  },
});
