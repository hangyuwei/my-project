import Toast from 'tdesign-miniprogram/toast/index';
import { addLocalCartItem } from '../../../services/cart/localCart';
import { fetchGood } from '../../../services/good/fetchGood';
import { fetchActivityList } from '../../../services/activity/fetchActivityList';
import {
  getGoodsDetailsCommentList,
  getGoodsDetailsCommentsCount,
} from '../../../services/good/fetchGoodsDetailsComments';

import { cdnBase } from '../../../config/index';
import { DEFAULT_AVATAR_URL, normalizeAvatarUrl } from '../../../constants/avatar';
import { checkLoginStatus } from '../../../utils/login';

const imgPrefix = `${cdnBase}/`;

const recLeftImg = `${imgPrefix}common/rec-left.png`;
const recRightImg = `${imgPrefix}common/rec-right.png`;

/** 检查是否是云存储fileID */
const isCloudFileId = (url) => typeof url === 'string' && url.startsWith('cloud://');

/** 批量转换云存储URL为临时URL */
const convertCloudUrls = async (urls) => {
  const cloudIds = urls.filter(isCloudFileId);
  if (cloudIds.length === 0) return urls;

  try {
    const res = await wx.cloud.getTempFileURL({ fileList: [...new Set(cloudIds)] });
    const urlMap = {};
    if (res.fileList) {
      res.fileList.forEach((file) => {
        if (file.tempFileURL) {
          urlMap[file.fileID] = file.tempFileURL;
        }
      });
    }
    return urls.map((url) => urlMap[url] || url);
  } catch (e) {
    console.error('[商品详情] 转换云存储URL失败', e);
    return urls;
  }
};

const obj2Params = (obj = {}, encode = false) => {
  const result = [];
  Object.keys(obj).forEach((key) => result.push(`${key}=${encode ? encodeURIComponent(obj[key]) : obj[key]}`));

  return result.join('&');
};

const normalizeDetailBlocks = (detail = []) => {
  if (!Array.isArray(detail)) return [];
  return detail.map((block) => {
    if (!block || block.type !== 'text') return block;
    const value = typeof block.value === 'string' ? block.value.replace(/\\n/g, '\n') : '';
    const lines = value.split(/\r?\n/).map((line) => (line === '' ? ' ' : line));
    return {
      ...block,
      value,
      lines,
    };
  });
};

Page({
  data: {
    commentsList: [],
    defaultAvatarUrl: DEFAULT_AVATAR_URL,
    commentsStatistics: {
      badCount: 0,
      commentCount: 0,
      goodCount: 0,
      goodRate: 0,
      hasImageCount: 0,
      middleCount: 0,
    },
    isShowPromotionPop: false,
    activityList: [],
    recLeftImg,
    recRightImg,
    details: {},
    goodsTabArray: [
      {
        name: '商品',
        value: '', // 空字符串代表置顶
      },
      {
        name: '详情',
        value: 'goods-page',
      },
    ],
    storeLogo: `${imgPrefix}common/store-logo.png`,
    storeName: '云mall标准版旗舰店',
    jumpArray: [
      {
        title: '首页',
        url: '/pages/home/home',
        iconName: 'home',
      },
      {
        title: '购物车',
        url: '/pages/cart/index',
        iconName: 'cart',
        showCartNum: true,
      },
    ],
    isStock: true,
    cartNum: 0,
    soldout: false,
    buttonType: 1,
    buyNum: 1,
    selectedAttrStr: '',
    skuArray: [],
    primaryImage: '',
    // 登录弹窗相关
    showLoginSheet: false,
    pendingAction: null, // 记录用户登录前想要执行的操作
    specImg: '',
    isSpuSelectPopupShow: false,
    isAllSelectedSku: false,
    buyType: 0,
    outOperateStatus: false, // 是否外层加入购物车
    operateType: 0,
    selectSkuSellsPrice: 0,
    maxLinePrice: 0,
    minSalePrice: 0,
    maxSalePrice: 0,
    list: [],
    spuId: '',
    navigation: { type: 'fraction' },
    current: 0,
    autoplay: true,
    duration: 500,
    interval: 5000,
    soldNum: 0, // 已售数量
  },

  handlePopupHide() {
    this.setData({
      isSpuSelectPopupShow: false,
    });
  },

  showSkuSelectPopup(type) {
    this.setData({
      buyType: type || 0,
      outOperateStatus: type >= 1,
      isSpuSelectPopupShow: true,
    });
  },

  buyItNow() {
    this.showSkuSelectPopup(1);
  },

  toAddCart() {
    this.showSkuSelectPopup(2);
  },

  toNav(e) {
    const { url } = e.detail;
    wx.switchTab({
      url: url,
    });
  },

  showCurImg(e) {
    const { index } = e.detail;
    const { images } = this.data.details;
    wx.previewImage({
      current: images[index],
      urls: images, // 需要预览的图片http链接列表
    });
  },

  onPageScroll({ scrollTop }) {
    const goodsTab = this.selectComponent('#goodsTab');
    goodsTab && goodsTab.onScroll(scrollTop);
  },

  chooseSpecItem(e) {
    const { specList } = this.data.details;
    const { selectedSku, isAllSelectedSku } = e.detail;
    if (!isAllSelectedSku) {
      this.setData({
        selectSkuSellsPrice: 0,
      });
    }
    this.setData({
      isAllSelectedSku,
    });
    this.getSkuItem(specList, selectedSku);
  },

  getSkuItem(specList, selectedSku) {
    const { skuArray, primaryImage } = this.data;
    const selectedSkuValues = this.getSelectedSkuValues(specList, selectedSku);
    let selectedAttrStr = ` 件  `;
    selectedSkuValues.forEach((item) => {
      selectedAttrStr += `，${item.specValue}  `;
    });
    // eslint-disable-next-line array-callback-return
    const skuItem = skuArray.filter((item) => {
      let status = true;
      (item.specInfo || []).forEach((subItem) => {
        if (!selectedSku[subItem.specId] || selectedSku[subItem.specId] !== subItem.specValueId) {
          status = false;
        }
      });
      if (status) return item;
    });
    this.selectSpecsName(selectedSkuValues.length > 0 ? selectedAttrStr : '');
    if (skuItem) {
      this.setData({
        selectItem: skuItem,
        selectSkuSellsPrice: skuItem.price || 0,
      });
    } else {
      this.setData({
        selectItem: null,
        selectSkuSellsPrice: 0,
      });
    }
    this.setData({
      specImg: skuItem && skuItem.skuImage ? skuItem.skuImage : primaryImage,
    });
  },

  // 获取已选择的sku名称
  getSelectedSkuValues(skuTree, selectedSku) {
    const normalizedTree = this.normalizeSkuTree(skuTree);
    return Object.keys(selectedSku).reduce((selectedValues, skuKeyStr) => {
      const skuValues = normalizedTree[skuKeyStr];
      const skuValueId = selectedSku[skuKeyStr];
      if (skuValueId !== '') {
        const skuValue = skuValues.filter((value) => {
          return value.specValueId === skuValueId;
        })[0];
        skuValue && selectedValues.push(skuValue);
      }
      return selectedValues;
    }, []);
  },

  normalizeSkuTree(skuTree) {
    const normalizedTree = {};
    skuTree.forEach((treeItem) => {
      normalizedTree[treeItem.specId] = treeItem.specValueList;
    });
    return normalizedTree;
  },

  selectSpecsName(selectSpecsName) {
    if (selectSpecsName) {
      this.setData({
        selectedAttrStr: selectSpecsName,
      });
    } else {
      this.setData({
        selectedAttrStr: '',
      });
    }
  },

  /**
   * 检查登录状态
   * 如果未登录,显示登录弹窗并记录待执行的操作
   * @param {string} action - 待执行的操作类型 ('addCart' | 'getCoupon')
   * @returns {boolean} 是否已登录
   */
  checkLogin(action) {
    const isLoggedIn = checkLoginStatus();
    if (!isLoggedIn) {
      this.setData({
        showLoginSheet: true,
        pendingAction: action,
      });
      return false;
    }
    return true;
  },

  /**
   * 关闭登录弹窗
   */
  handleCloseLoginSheet() {
    this.setData({
      showLoginSheet: false,
      pendingAction: null,
    });
  },

  /**
   * 登录成功回调
   * 执行用户登录前想要执行的操作
   */
  handleLoginSuccess(e) {
    console.log('[商品详情] 登录成功:', e.detail);
    const { pendingAction } = this.data;

    // 关闭登录弹窗
    this.handleCloseLoginSheet();

    // 执行待执行的操作
    if (pendingAction === 'addCart') {
      // 延迟执行,确保弹窗关闭动画完成
      setTimeout(() => {
        this.addCart();
      }, 300);
    } else if (pendingAction === 'getCoupon') {
      // 领取优惠券逻辑
      setTimeout(() => {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '优惠券领取成功',
          icon: 'success',
          duration: 2000,
        });
      }, 300);
    }
  },

  addCart() {
    // 检查登录状态
    if (!this.checkLogin('addCart')) {
      return;
    }

    const { isAllSelectedSku, details, selectItem, buyNum } = this.data;
    if (!isAllSelectedSku) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请选择规格',
        icon: '',
        duration: 1000,
      });
      return;
    }

    // 防止重复添加
    if (this.addingToCart) {
      return;
    }
    this.addingToCart = true;

    if (!details) {
      this.addingToCart = false;
      return;
    }

    const skuId = selectItem?.skuId || details?.skuList?.[0]?.skuId || details?.spuId || '';
    const price = selectItem?.price || details?.minSalePrice || 0;
    const originPrice = details?.maxLinePrice || price;
    const specInfo = Array.isArray(details?.specList)
      ? details.specList
        .map((item) => ({
          specTitle: item.title,
          specValue: item.specValueList && item.specValueList[0] ? item.specValueList[0].specValue : '',
        }))
        .filter((item) => item.specTitle)
      : [];

    const goodsTitle = details.goodsName || details.title || '';
    addLocalCartItem({
      spuId: String(details.spuId || ''),
      skuId: String(skuId),
      title: goodsTitle,
      thumb: details.primaryImage || '',
      thumbFileId: details.primaryImageFileId || '',
      price,
      originPrice,
      stockQuantity: typeof details.spuStockQuantity === 'number' ? details.spuStockQuantity : 999,
      specInfo,
      storeId: details.storeId || 'local',
      category: details.category || null,
    }, buyNum);

    Toast({
      context: this,
      selector: '#t-toast',
      message: '已加入购物车',
      icon: '',
      duration: 1000,
    });

    // 300ms后解锁
    setTimeout(() => {
      this.addingToCart = false;
    }, 300);
  },

  gotoBuy(type) {
    const { isAllSelectedSku, buyNum, details, selectItem } = this.data;
    if (!isAllSelectedSku) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请选择规格',
        icon: '',
        duration: 1000,
      });
      return;
    }

    // 安全获取 skuId，参考 addCart 方法的实现
    const skuId = selectItem?.skuId || details?.skuList?.[0]?.skuId || details?.spuId || '';

    this.handlePopupHide();
    const goodsTitle = details.goodsName || details.title || '';

    // 安全处理 specInfo，防止 null 值
    const specInfo = Array.isArray(details?.specList)
      ? details.specList
        .map((item) => ({
          specTitle: item.title,
          specValue: item.specValueList && item.specValueList[0] ? item.specValueList[0].specValue : '',
        }))
        .filter((item) => item.specTitle)
      : [];

    const query = {
      quantity: buyNum,
      storeId: details.storeId || '1', // 从商品数据中获取 storeId，避免硬编码
      spuId: details.spuId || this.data.spuId || '',
      goodsName: goodsTitle,
      skuId: skuId,
      available: details.available || true,
      price: details.minSalePrice || 0,
      specInfo: specInfo,
      primaryImage: details.primaryImage || '',
      thumb: details.primaryImage || '',
      title: goodsTitle,
    };
    let urlQueryStr = obj2Params({
      goodsRequestList: JSON.stringify([query]),
    }, true); // 启用 URL 编码，防止 JSON 特殊字符导致参数损坏
    urlQueryStr = urlQueryStr ? `?${urlQueryStr}` : '';
    const path = `/pages/order/order-confirm/index${urlQueryStr}`;
    wx.navigateTo({
      url: path,
    });
  },

  specsConfirm() {
    const { buyType } = this.data;
    if (buyType === 1) {
      this.gotoBuy();
    } else {
      this.addCart();
    }
    // this.handlePopupHide();
  },

  changeNum(e) {
    this.setData({
      buyNum: e.detail.buyNum,
    });
  },

  closePromotionPopup() {
    this.setData({
      isShowPromotionPop: false,
    });
  },

  promotionChange(e) {
    const { index } = e.detail;
    wx.navigateTo({
      url: `/pages/promotion/promotion-detail/index?promotion_id=${index}`,
    });
  },

  showPromotionPopup() {
    // 检查登录状态
    if (!this.checkLogin('getCoupon')) {
      return;
    }

    this.setData({
      isShowPromotionPop: true,
    });
  },

  async getDetail(spuId) {
    const [details, activityList] = await Promise.all([fetchGood(spuId), fetchActivityList()]);

    console.log('=== 小程序端调试 ===');
    console.log('fetchGood 返回的 details:', details);
    console.log('details.description:', details?.description);

    const normalizedDetail = normalizeDetailBlocks(details?.detail || []);
    const detailTextFromBlocks = normalizedDetail
      .filter((block) => block && block.type === 'text' && typeof block.value === 'string')
      .map((block) => block.value)
      .join('\n');
    const detailText = details?.description || detailTextFromBlocks;

    console.log('最终的 detailText:', detailText);
    console.log('detailText 长度:', detailText ? detailText.length : 0);

    // 转换云存储URL为临时URL
    let images = details?.images || [];
    let primaryImage = details?.primaryImage || '';
    if (images.length > 0 || primaryImage) {
      const allUrls = primaryImage ? [primaryImage, ...images] : images;
      const convertedUrls = await convertCloudUrls(allUrls);
      if (primaryImage) {
        primaryImage = convertedUrls[0];
        images = convertedUrls.slice(1);
      } else {
        images = convertedUrls;
      }
    }

    const nextDetails = {
      ...details,
      primaryImage,
      images,
      detail: normalizedDetail,
      detailText,
    };
    const skuArray = [];
    const {
      skuList,
      isPutOnSale,
      minSalePrice,
      maxSalePrice,
      maxLinePrice,
      soldNum,
    } = nextDetails;
    const hasSpec = Array.isArray(nextDetails.specList) && nextDetails.specList.length > 0;
    skuList.forEach((item) => {
      skuArray.push({
        skuId: item.skuId,
        quantity: item.stockInfo ? item.stockInfo.stockQuantity : 0,
        specInfo: item.specInfo,
      });
    });
    const promotionArray = [];
    activityList.forEach((item) => {
      promotionArray.push({
        tag: item.promotionSubCode === 'MYJ' ? '满减' : '满折',
        label: '满100元减99.9元',
      });
    });
    this.setData({
      details: nextDetails,
      activityList,
      isStock: nextDetails.spuStockQuantity > 0,
      maxSalePrice: maxSalePrice ? parseInt(maxSalePrice) : 0,
      maxLinePrice: maxLinePrice ? parseInt(maxLinePrice) : 0,
      minSalePrice: minSalePrice ? parseInt(minSalePrice) : 0,
      list: promotionArray,
      skuArray: skuArray,
      primaryImage,
      isAllSelectedSku: !hasSpec,
      soldout: isPutOnSale === 0,
      soldNum,
    });
  },

  async getCommentsList(spuId) {
    try {
      const data = await getGoodsDetailsCommentList(spuId || this.data.spuId);
      const { homePageComments = [] } = data;
      const nextState = {
        commentsList: homePageComments.map((item) => {
          return {
            goodsSpu: item.spuId,
            userName: item.userName || '匿名用户',
            commentScore: item.commentScore || 5,
            commentContent: item.commentContent || '用户未填写评价',
            userHeadUrl: item.isAnonymity ? DEFAULT_AVATAR_URL : normalizeAvatarUrl(item.userHeadUrl),
          };
        }),
      };
      this.setData(nextState);
    } catch (error) {
      console.error('comments error:', error);
    }
  },

  onCommentAvatarError(e) {
    const { index } = e.currentTarget.dataset;
    const avatarIndex = Number(index);
    if (Number.isNaN(avatarIndex)) return;
    this.setData({
      [`commentsList[${avatarIndex}].userHeadUrl`]: DEFAULT_AVATAR_URL,
    });
  },

  onShareAppMessage() {
    // 自定义的返回信息
    const { selectedAttrStr } = this.data;
    let shareSubTitle = '';
    if (selectedAttrStr.indexOf('件') > -1) {
      const count = selectedAttrStr.indexOf('件');
      shareSubTitle = selectedAttrStr.slice(count + 1, selectedAttrStr.length);
    }
    const customInfo = {
      imageUrl: this.data.details.primaryImage,
      title: this.data.details.title + shareSubTitle,
      path: `/pages/goods/details/index?spuId=${this.data.spuId}`,
    };
    return customInfo;
  },

  /** 获取评价统计 */
  async getCommentsStatistics(spuId) {
    try {
      const data = await getGoodsDetailsCommentsCount(spuId || this.data.spuId);
      const { badCount = 0, commentCount = 0, goodCount = 0, goodRate = 100, hasImageCount = 0, middleCount = 0 } = data;
      const nextState = {
        commentsStatistics: {
          badCount: parseInt(`${badCount}`) || 0,
          commentCount: parseInt(`${commentCount}`) || 0,
          goodCount: parseInt(`${goodCount}`) || 0,
          goodRate: Math.floor((goodRate || 100) * 10) / 10,
          hasImageCount: parseInt(`${hasImageCount}`) || 0,
          middleCount: parseInt(`${middleCount}`) || 0,
        },
      };
      this.setData(nextState);
    } catch (error) {
      console.error('comments statistics error:', error);
    }
  },

  /** 跳转到评价列表 */
  navToCommentsListPage() {
    wx.navigateTo({
      url: `/pages/goods/comments/index?spuId=${this.data.spuId}`,
    });
  },

  onLoad(query) {
    const { spuId } = query;
    this.setData({
      spuId: spuId,
    });
    this.getDetail(spuId);
    this.getCommentsList(spuId);
    this.getCommentsStatistics(spuId);
  },
});
