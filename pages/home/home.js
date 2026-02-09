import { fetchHome } from '../../services/home/home';
import { fetchGoodsList } from '../../services/good/fetchGoods';
import { addLocalCartItem } from '../../services/cart/localCart';
import Toast from 'tdesign-miniprogram/toast/index';
import recorder from '../../utils/automation/recorder';

Page({
  data: {
    imgSrcs: [],
    tabList: [],
    goodsList: [],
    goodsListLoadStatus: 0,
    pageLoading: false,
    current: 1,
    autoplay: true,
    duration: '500',
    interval: 5000,
    navigation: { type: 'dots' },
    swiperImageProps: { mode: 'scaleToFill' },
    statusBarHeight: 20,
    navBarHeight: 64,
  },

  goodListPagination: {
    index: 0,
    num: 20,
  },

  privateData: {
    tabIndex: 0,
  },

  onLoad() {
    // 获取系统信息设置导航栏高度
    const systemInfo = wx.getSystemInfoSync();
    const statusBarHeight = systemInfo.statusBarHeight || 20;
    const navBarHeight = statusBarHeight + 44;
    this.setData({
      statusBarHeight,
      navBarHeight,
    });
    this.init();
  },

  onShow() {
    this.getTabBar().init();
  },

  onReachBottom() {
    if (this.data.goodsListLoadStatus === 0) {
      this.loadGoodsList();
    }
  },

  onPullDownRefresh() {
    this.init();
  },

  init() {
    this.loadHomePage();
  },

  loadHomePage() {
    wx.stopPullDownRefresh();

    this.setData({
      pageLoading: true,
    });
    fetchHome().then(({ swiper, tabList }) => {
      this.setData({
        tabList,
        imgSrcs: swiper,
        pageLoading: false,
      });
      this.loadGoodsList(true);
    });
  },

  tabChangeHandle(e) {
    this.privateData.tabIndex = e.detail;
    this.loadGoodsList(true);
  },

  onReTry() {
    this.loadGoodsList();
  },

  async loadGoodsList(fresh = false) {
    if (fresh) {
      wx.pageScrollTo({
        scrollTop: 0,
      });
    }

    this.setData({ goodsListLoadStatus: 1 });

    const pageSize = this.goodListPagination.num;
    let pageIndex;
    if (fresh) {
      pageIndex = 0;
      this.goodListPagination.index = 0;
    } else {
      pageIndex = this.goodListPagination.index;
    }

    try {
      const nextList = await fetchGoodsList(pageIndex, pageSize);
      this.setData({
        goodsList: fresh ? nextList : this.data.goodsList.concat(nextList),
        goodsListLoadStatus: nextList.length === 0 ? 2 : 0,
      });

      if (nextList.length > 0) {
        this.goodListPagination.index = pageIndex + 1;
      }
    } catch (err) {
      this.setData({ goodsListLoadStatus: 3 });
    }
  },

  goodListClickHandle(e) {
    // 记录点击商品事件
    recorder.recordEvent('tap', {
      target: { id: 'goods-item', dataset: { action: 'viewGoods' } },
      detail: e.detail
    });

    const { index } = e.detail;
    const { spuId } = this.data.goodsList[index];
    wx.navigateTo({
      url: `/pages/goods/details/index?spuId=${spuId}`,
    });
  },

  goodListAddCartHandle(e) {
    // 记录加入购物车事件
    recorder.recordEvent('tap', {
      target: { id: 'add-cart-btn', dataset: { action: 'addCart' } },
      detail: e.detail
    });

    const { goods } = e.detail;
    if (!goods || !goods.spuId) {
      Toast({ context: this, selector: '#t-toast', message: '商品信息错误' });
      return;
    }
    addLocalCartItem({
      spuId: goods.spuId,
      skuId: goods.skuId || goods.spuId,
      title: goods.title,
      thumb: goods.thumb,
      price: goods.price,
      originPrice: goods.originPrice || goods.price,
      stockQuantity: goods.stockQuantity || 999,
    }, 1);
    Toast({ context: this, selector: '#t-toast', message: '已加入购物车' });
  },

  navToSearchPage() {
    // 记录搜索点击事件
    recorder.recordEvent('tap', {
      target: { id: 'search-bar', dataset: { action: 'search' } },
      detail: {}
    });

    wx.navigateTo({ url: '/pages/goods/search/index' });
  },

  navToActivityDetail({ detail }) {
    // 记录活动点击事件
    recorder.recordEvent('tap', {
      target: { id: 'swiper-item', dataset: { action: 'viewActivity' } },
      detail: detail
    });

    const { index: promotionID = 0 } = detail || {};
    wx.navigateTo({
      url: `/pages/promotion/promotion-detail/index?promotion_id=${promotionID}`,
    });
  },

  navToGoodsListPage() {
    // 记录查看全部商品事件
    recorder.recordEvent('tap', {
      target: { id: 'view-all-btn', dataset: { action: 'viewAllGoods' } },
      detail: {}
    });

    wx.navigateTo({
      url: '/pages/goods/list/index',
    });
  },

  // 处理自动化回放事件
  handleAutomationEvent(eventName, detail) {
    console.log('[Home] 收到自动化事件:', eventName, detail);

    if (eventName === 'automation-tap') {
      const action = detail.dataset && detail.dataset.action;
      switch (action) {
        case 'search':
          this.navToSearchPage();
          break;
        case 'viewAllGoods':
          this.navToGoodsListPage();
          break;
        case 'viewGoods':
          if (detail.detail && detail.detail.index !== undefined) {
            this.goodListClickHandle({ detail: detail.detail });
          }
          break;
        case 'addCart':
          if (detail.detail && detail.detail.goods) {
            this.goodListAddCartHandle({ detail: detail.detail });
          }
          break;
        case 'viewActivity':
          this.navToActivityDetail({ detail: detail.detail });
          break;
      }
    }
  },
});
