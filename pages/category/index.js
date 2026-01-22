import Toast from 'tdesign-miniprogram/toast/index';
import { getCategoryList } from '../../services/good/fetchCategoryList';
import { fetchGoodsList } from '../../services/good/fetchGoods';
import { addLocalCartItem } from '../../services/cart/localCart';

Page({
  data: {
    categories: [],      // 分类列表
    categoryName: '',
    goodsList: [],
    currentCategory: '', // 当前选中的分类
  },

  async init(categoryKey) {
    try {
      const categories = await getCategoryList();
      const firstCategory = categories?.[0];
      // 默认选择第一个分类（全部商品，key为空字符串）
      const selectedKey = categoryKey !== undefined ? categoryKey : (firstCategory?.key ?? '');
      const selectedName = categories.find(c => c.key === selectedKey)?.name || firstCategory?.name || '全部商品';

      // 调用 fetchGoodsList，如果 category 为空则不传递分类参数（显示全部）
      let goodsList = await fetchGoodsList({
        pageIndex: 0,
        pageSize: 20,
        ...(selectedKey ? { category: selectedKey } : {})
      });

      this.setData({
        categories,
        categoryName: selectedName,
        currentCategory: selectedKey,
        goodsList: goodsList || [],
      });
    } catch (error) {
      console.error('err:', error);
    }
  },

  // 切换分类
  async onCategoryTap(e) {
    const { key = '', name } = e.currentTarget.dataset;
    if (key === this.data.currentCategory) return;

    this.setData({
      currentCategory: key,
      categoryName: name,
      goodsList: [],
    });

    // 加载该分类的商品，如果 key 为空则显示全部
    try {
      const goodsList = await fetchGoodsList({
        pageIndex: 0,
        pageSize: 20,
        ...(key ? { category: key } : {})
      });
      this.setData({ goodsList: goodsList || [] });
    } catch (error) {
      console.error('Load category goods error:', error);
    }
  },

  onShow() {
    this.getTabBar().init();
  },

  onLoad() {
    this.init();
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
