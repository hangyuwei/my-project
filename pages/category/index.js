import Toast from 'tdesign-miniprogram/toast/index';
import { getCategoryList } from '../../services/good/fetchCategoryList';
import { fetchGoodsList } from '../../services/good/fetchGoods';
import { addLocalCartItem } from '../../services/cart/localCart';

Page({
  data: {
    categoryName: '',
    goodsList: [],
  },

  async init() {
    try {
      const [categories, goodsList] = await Promise.all([getCategoryList(), fetchGoodsList(0, 20)]);
      const categoryName = categories?.[0]?.name || '食品保健类';
      this.setData({
        categoryName,
        goodsList,
      });
    } catch (error) {
      console.error('err:', error);
    }
  },

  onShow() {
    this.getTabBar().init();
  },

  onLoad() {
    this.init(true);
  },

  onGoodsClick(e) {
    const { index } = e.detail;
    const { spuId } = this.data.goodsList[index] || {};
    if (!spuId) return;
    wx.navigateTo({
      url: `/pages/goods/details/index?spuId=${spuId}`,
    });
  },

  onAddCart(e) {
    const { goods } = e.detail || {};
    if (!goods || !goods.spuId) return;
    addLocalCartItem({
      spuId: String(goods.spuId),
      skuId: String(goods.skuId || goods.spuId),
      title: goods.title || '',
      thumb: goods.thumb || '',
      price: goods.price || 0,
      originPrice: goods.originPrice || goods.price || 0,
      stockQuantity: goods.stockQuantity || 999,
      specInfo: [],
      storeId: goods.storeId || 'local',
    });
    Toast({
      context: this,
      selector: '#t-toast',
      message: '已加入购物车',
    });
  },
});
