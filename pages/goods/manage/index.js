import Dialog from 'tdesign-miniprogram/dialog/index';
import Toast from 'tdesign-miniprogram/toast/index';
import { getLocalGoodsRecords, removeLocalGoodsRecord, updateLocalGoodsRecord } from '../../../services/good/localGoods';

Page({
  data: {
    goodsList: [],
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const list = getLocalGoodsRecords().sort((a, b) => b.createdAt - a.createdAt);
    this.setData({ goodsList: list });
  },

  onEdit(e) {
    const { id } = e.currentTarget.dataset;
    if (!id) return;
    wx.navigateTo({ url: `/pages/goods/publish/index?spuId=${id}` });
  },

  onView(e) {
    const { id } = e.currentTarget.dataset;
    if (!id) return;
    wx.navigateTo({ url: `/pages/goods/details/index?spuId=${id}` });
  },

  onToggleStatus(e) {
    const { id } = e.currentTarget.dataset;
    if (!id) return;
    const item = this.data.goodsList.find((goods) => goods.spuId === id);
    if (!item) return;
    const nextStatus = item.isPutOnSale ? 0 : 1;
    updateLocalGoodsRecord(id, { isPutOnSale: nextStatus });
    Toast({
      context: this,
      selector: '#t-toast',
      message: nextStatus ? '???' : '???',
      icon: '',
    });
    this.refresh();
  },

  onDelete(e) {
    const { id } = e.currentTarget.dataset;
    if (!id) return;
    Dialog.confirm({
      title: '????',
      content: '?????????',
      confirmBtn: '??',
      cancelBtn: '??',
    })
      .then(() => {
        const removed = removeLocalGoodsRecord(id);
        if (removed) {
          Toast({
            context: this,
            selector: '#t-toast',
            message: '???',
            icon: '',
          });
          this.refresh();
        }
      })
      .catch(() => {});
  },
});
