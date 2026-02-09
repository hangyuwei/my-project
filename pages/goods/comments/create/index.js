import Toast from 'tdesign-miniprogram/toast/index';
import { markLocalOrderCommented } from '../../../../services/order/localOrders';

Page({
  data: {
    serviceRateValue: 1,
    goodRateValue: 1,
    conveyRateValue: 1,
    isAnonymous: false,
    uploadFiles: [],
    gridConfig: {
      width: 218,
      height: 218,
      column: 3,
    },
    isAllowedSubmit: false,
    imgUrl: '',
    title: '',
    goodsDetail: '',
    orderNo: '',
    spuId: '',
    imageProps: {
      mode: 'aspectFit',
    },
    submitting: false,
  },

  onLoad(options) {
    // 解码URL参数
    const imgUrl = options.imgUrl ? decodeURIComponent(options.imgUrl) : '';
    const title = options.title ? decodeURIComponent(options.title) : '';
    const specs = options.specs ? decodeURIComponent(options.specs) : '';

    this.setData({
      imgUrl,
      title,
      goodsDetail: specs,
      orderNo: options.orderNo || '',
      spuId: options.spuId || '',
    });
  },

  onRateChange(e) {
    const { value } = e?.detail;
    const item = e?.currentTarget?.dataset?.item;
    this.setData({ [item]: value }, () => {
      this.updateButtonStatus();
    });
  },

  onAnonymousChange(e) {
    const status = !!e?.detail?.checked;
    this.setData({ isAnonymous: status });
  },

  handleSuccess(e) {
    const { files } = e.detail;

    this.setData({
      uploadFiles: files,
    });
  },

  handleRemove(e) {
    const { index } = e.detail;
    const { uploadFiles } = this.data;
    uploadFiles.splice(index, 1);
    this.setData({
      uploadFiles,
    });
  },

  onTextAreaChange(e) {
    const value = e?.detail?.value;
    this.textAreaValue = value;
    this.updateButtonStatus();
  },

  updateButtonStatus() {
    const { serviceRateValue, goodRateValue, conveyRateValue, isAllowedSubmit } = this.data;
    const { textAreaValue } = this;
    const temp = serviceRateValue && goodRateValue && conveyRateValue && textAreaValue;
    if (temp !== isAllowedSubmit) this.setData({ isAllowedSubmit: temp });
  },

  async onSubmitBtnClick() {
    const { isAllowedSubmit, submitting } = this.data;
    if (!isAllowedSubmit || submitting) return;

    this.setData({ submitting: true });
    wx.showLoading({ title: '提交中...' });

    try {
      const {
        orderNo,
        spuId,
        title,
        imgUrl,
        goodRateValue,
        serviceRateValue,
        conveyRateValue,
        isAnonymous,
        uploadFiles,
      } = this.data;

      // 上传评价图片到云存储
      const imageUrls = [];
      for (const file of uploadFiles) {
        if (file.url && file.url.startsWith('wxfile://')) {
          try {
            const uploadRes = await wx.cloud.uploadFile({
              cloudPath: `comments/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`,
              filePath: file.url,
            });
            imageUrls.push(uploadRes.fileID);
          } catch (e) {
            console.error('[上传图片失败]', e);
          }
        } else if (file.url) {
          imageUrls.push(file.url);
        }
      }

      // 获取用户信息
      let userInfo = {};
      try {
        const app = getApp();
        userInfo = app.globalData?.userInfo || {};
      } catch (e) {
        console.log('[获取用户信息] 失败', e);
      }

      // 调用云函数提交评价
      const res = await wx.cloud.callFunction({
        name: 'submitComment',
        data: {
          orderNo,
          spuId,
          goodsName: title,
          goodsImage: imgUrl,
          content: this.textAreaValue,
          goodsRating: goodRateValue,
          serviceRating: serviceRateValue,
          logisticsRating: conveyRateValue,
          images: imageUrls,
          isAnonymous,
          userName: userInfo.nickName || userInfo.nickname || '',
          userAvatar: userInfo.avatarUrl || userInfo.avatar || '',
        },
      });

      wx.hideLoading();

      if (res.result && res.result.success) {
        // 更新本地订单的评价状态
        if (orderNo) {
          markLocalOrderCommented(orderNo);
        }

        // 通知上一页刷新数据
        const pages = getCurrentPages();
        if (pages.length >= 2) {
          const prevPage = pages[pages.length - 2];
          if (prevPage) {
            prevPage.setData({ backRefresh: true });
          }
        }

        Toast({
          context: this,
          selector: '#t-toast',
          message: '评价提交成功',
          icon: 'check-circle',
        });

        // 延迟返回，让用户看到成功提示
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        this.setData({ submitting: false });
        Toast({
          context: this,
          selector: '#t-toast',
          message: res.result?.error || '提交失败',
          icon: 'error-circle',
        });
      }
    } catch (error) {
      wx.hideLoading();
      this.setData({ submitting: false });
      console.error('[提交评价] 异常:', error);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '提交失败，请重试',
        icon: 'error-circle',
      });
    }
  },
});
