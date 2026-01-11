import Toast from 'tdesign-miniprogram/toast/index';
import { createGoods } from '../../../services/good/createGoods';
import { findLocalGoodsRecord, updateLocalGoodsRecord } from '../../../services/good/localGoods';

const PRICE_SCALE = 100;

const parsePrice = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  return Math.round(num * PRICE_SCALE);
};

const parseStock = (value) => {
  const num = parseInt(value, 10);
  return Number.isNaN(num) ? 0 : num;
};

const formatPriceInput = (value) => {
  if (!value) return '';
  return (Number(value) / PRICE_SCALE).toFixed(2).replace(/\.00$/, '');
};

const mapImagesToFiles = (images = []) =>
  images.map((url, index) => ({
    url,
    name: `image-${index + 1}`,
    status: 'done',
    percent: 100,
  }));

Page({
  data: {
    title: '',
    price: '',
    originPrice: '',
    stock: '',
    intro: '',
    uploadFiles: [],
    gridConfig: {
      column: 3,
      width: 218,
      height: 218,
    },
    imageProps: {
      mode: 'aspectFill',
    },
    submitting: false,
    canSubmit: false,
    editingId: '',
  },

  onLoad(options) {
    if (options && options.spuId) {
      this.loadForEdit(options.spuId);
    }
  },

  loadForEdit(spuId) {
    const record = findLocalGoodsRecord(String(spuId));
    if (!record) return;
    this.setData({
      title: record.title,
      price: formatPriceInput(record.price),
      originPrice: formatPriceInput(record.originPrice),
      stock: String(record.stock),
      intro: record.intro || '',
      uploadFiles: mapImagesToFiles(record.images || []),
      editingId: record.spuId,
    }, () => this.updateSubmitStatus());
  },

  onTitleChange(e) {
    this.setData({ title: e.detail.value }, () => this.updateSubmitStatus());
  },

  onPriceChange(e) {
    this.setData({ price: e.detail.value }, () => this.updateSubmitStatus());
  },

  onOriginPriceChange(e) {
    this.setData({ originPrice: e.detail.value }, () => this.updateSubmitStatus());
  },

  onStockChange(e) {
    this.setData({ stock: e.detail.value }, () => this.updateSubmitStatus());
  },

  onIntroChange(e) {
    this.setData({ intro: e.detail.value });
  },

  handleUploadSuccess(e) {
    const files = e.detail.files || [];
    this.setData({ uploadFiles: files }, () => this.updateSubmitStatus());
  },

  handleRemove(e) {
    const { index } = e.detail;
    const nextFiles = this.data.uploadFiles.slice();
    nextFiles.splice(index, 1);
    this.setData({ uploadFiles: nextFiles }, () => this.updateSubmitStatus());
  },

  updateSubmitStatus() {
    const { title, price, stock, uploadFiles } = this.data;
    const titleOk = title && title.trim();
    const priceOk = Number(price) > 0;
    const stockOk = stock !== '' && !Number.isNaN(parseInt(stock, 10));
    const canSubmit = !!titleOk && priceOk && stockOk && uploadFiles.length > 0;
    if (canSubmit !== this.data.canSubmit) {
      this.setData({ canSubmit });
    }
  },

  async onSubmit() {
    const { canSubmit, submitting, editingId } = this.data;
    if (!canSubmit || submitting) return;

    this.setData({ submitting: true });
    try {
      const price = parsePrice(this.data.price);
      const originPrice = parsePrice(this.data.originPrice) || price;
      const stock = parseStock(this.data.stock);

      if (!price) {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '?????',
          icon: '',
        });
        return;
      }

      const images = await this.persistLocalFiles();

      const record = {
        title: this.data.title.trim(),
        price,
        originPrice,
        stock,
        images,
        detailImages: images,
        intro: this.data.intro || '',
      };

      let saved = null;
      if (editingId) {
        saved = updateLocalGoodsRecord(editingId, record);
      } else {
        saved = await createGoods(record);
      }

      Toast({
        context: this,
        selector: '#t-toast',
        message: editingId ? '?????' : '?????',
        icon: 'check-circle',
      });

      if (editingId) {
        wx.navigateBack();
        return;
      }

      this.resetForm();

      if (saved && saved.spuId) {
        wx.navigateTo({ url: `/pages/goods/details/index?spuId=${saved.spuId}` });
      }
    } catch (err) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '????????',
        icon: '',
      });
    } finally {
      this.setData({ submitting: false });
    }
  },

  persistLocalFiles() {
    const files = this.data.uploadFiles;
    return Promise.all(files.map((file) => this.saveLocalFile(file.url)));
  },

  saveLocalFile(path) {
    return new Promise((resolve) => {
      wx.saveFile({
        tempFilePath: path,
        success: (res) => resolve(res.savedFilePath),
        fail: () => resolve(path),
      });
    });
  },

  resetForm() {
    this.setData({
      title: '',
      price: '',
      originPrice: '',
      stock: '',
      intro: '',
      uploadFiles: [],
      canSubmit: false,
      editingId: '',
    });
  },
});
