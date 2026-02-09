const STORAGE_KEY_PREFIX = 'local_cart_items';
const LEGACY_STORAGE_KEY = 'local_cart_items'; // 旧的固定key，用于数据迁移

const toInt = (value, fallback = 0) => {
  const num = parseInt(value, 10);
  return Number.isNaN(num) ? fallback : num;
};

const normalizeQuantity = (value) => {
  const qty = toInt(value, 1);
  return qty > 0 ? qty : 1;
};

// 获取当前用户的购物车存储key
function getStorageKey() {
  const app = getApp();
  const openid = app?.globalData?.openid;

  if (!openid) {
    console.warn('[购物车] 未获取到openid，使用默认key');
    return LEGACY_STORAGE_KEY;
  }

  return `${STORAGE_KEY_PREFIX}_${openid}`;
}

// 迁移旧的购物车数据到新的用户专属key
function migrateOldCartData() {
  try {
    const currentKey = getStorageKey();

    // 如果当前key就是旧key，说明没有openid，不需要迁移
    if (currentKey === LEGACY_STORAGE_KEY) {
      return;
    }

    // 检查新key是否已有数据
    const newData = wx.getStorageSync(currentKey);
    if (newData && Array.isArray(newData) && newData.length > 0) {
      // 新key已有数据，不需要迁移
      return;
    }

    // 读取旧key的数据
    const oldData = wx.getStorageSync(LEGACY_STORAGE_KEY);
    if (oldData && Array.isArray(oldData) && oldData.length > 0) {
      console.log('[购物车] 迁移旧购物车数据到用户专属存储', { count: oldData.length });

      // 将旧数据迁移到新key
      wx.setStorageSync(currentKey, oldData);

      // 清除旧key的数据
      wx.removeStorageSync(LEGACY_STORAGE_KEY);

      console.log('[购物车] 数据迁移完成');
    }
  } catch (error) {
    console.error('[购物车] 数据迁移失败', error);
  }
}

export function getLocalCartItems() {
  // 尝试迁移旧数据
  migrateOldCartData();

  const storageKey = getStorageKey();
  const data = wx.getStorageSync(storageKey);
  return Array.isArray(data) ? data : [];
}

export function setLocalCartItems(items = []) {
  const next = Array.isArray(items) ? items : [];
  const storageKey = getStorageKey();
  wx.setStorageSync(storageKey, next);
  return next;
}

export function addLocalCartItem(item = {}, quantity = 1) {
  const list = getLocalCartItems();
  const qty = normalizeQuantity(quantity);
  const spuId = String(item.spuId || '');
  const skuId = String(item.skuId || '');
  const index = list.findIndex((entry) => entry.spuId === spuId && entry.skuId === skuId);
  if (index >= 0) {
    list[index].quantity = normalizeQuantity(list[index].quantity + qty);
  } else {
    list.unshift({
      spuId,
      skuId,
      title: item.title || '',
      thumb: item.thumb || '',
      thumbFileId: item.thumbFileId || '',
      price: item.price || 0,
      originPrice: item.originPrice || item.price || 0,
      quantity: qty,
      stockQuantity: toInt(item.stockQuantity, 999),
      specInfo: Array.isArray(item.specInfo) ? item.specInfo : [],
      storeId: item.storeId || 'local',
      category: item.category || null,
    });
  }
  const storageKey = getStorageKey();
  wx.setStorageSync(storageKey, list);
  return list;
}

export function updateLocalCartItemQuantity(spuId, skuId, quantity) {
  const list = getLocalCartItems();
  const nextQuantity = normalizeQuantity(quantity);
  const index = list.findIndex((entry) => entry.spuId === spuId && entry.skuId === skuId);
  if (index < 0) return list;
  list[index].quantity = nextQuantity;
  const storageKey = getStorageKey();
  wx.setStorageSync(storageKey, list);
  return list;
}

export function removeLocalCartItem(spuId, skuId) {
  const list = getLocalCartItems();
  const nextList = list.filter((entry) => !(entry.spuId === spuId && entry.skuId === skuId));
  if (nextList.length === list.length) return list;
  const storageKey = getStorageKey();
  wx.setStorageSync(storageKey, nextList);
  return nextList;
}

export function clearLocalCartItems() {
  const storageKey = getStorageKey();
  wx.setStorageSync(storageKey, []);
}

// 清除所有用户的购物车数据（用于调试或用户登出场景）
export function clearAllCartData() {
  try {
    // 清除当前用户的购物车
    const storageKey = getStorageKey();
    wx.removeStorageSync(storageKey);

    // 清除旧的固定key购物车
    wx.removeStorageSync(LEGACY_STORAGE_KEY);

    console.log('[购物车] 已清除所有购物车数据');
  } catch (error) {
    console.error('[购物车] 清除购物车数据失败', error);
  }
}

export function buildCartGroupData(items = []) {
  if (!items.length) {
    return {
      isNotEmpty: false,
      storeGoods: [],
      invalidGoodItems: [],
      isAllSelected: false,
      selectedGoodsCount: 0,
      totalAmount: '0',
      totalDiscountAmount: '0',
    };
  }

  const goodsPromotionList = items.map((item) => {
    const quantity = normalizeQuantity(item.quantity);
    const price = toInt(item.price, 0);
    const originPrice = toInt(item.originPrice, price);
    return {
      uid: 'local',
      saasId: 'local',
      storeId: item.storeId || 'local',
      spuId: String(item.spuId || ''),
      skuId: String(item.skuId || ''),
      isSelected: 1,
      thumb: item.thumb || '',
      title: item.title || '',
      primaryImage: item.thumb || '',
      quantity,
      stockStatus: true,
      stockQuantity: toInt(item.stockQuantity, 999),
      price: String(price),
      originPrice: String(originPrice),
      tagPrice: null,
      titlePrefixTags: null,
      roomId: null,
      specInfo: Array.isArray(item.specInfo) ? item.specInfo : [],
      joinCartTime: new Date().toISOString(),
      available: 1,
      putOnSale: 1,
      etitle: null,
      category: item.category || null,
    };
  });

  const totalAmount = goodsPromotionList.reduce((sum, goods) => {
    const price = toInt(goods.price, 0);
    const quantity = toInt(goods.quantity, 0);
    return sum + price * quantity;
  }, 0);
  const selectedGoodsCount = goodsPromotionList.reduce((sum, goods) => {
    const quantity = toInt(goods.quantity, 0);
    return sum + (goods.isSelected ? quantity : 0);
  }, 0);

  return {
    isNotEmpty: true,
    storeGoods: [
      {
        storeId: goodsPromotionList[0]?.storeId || 'local',
        storeName: 'Local Store',
        storeStatus: 1,
        totalDiscountSalePrice: String(totalAmount),
        promotionGoodsList: [
          {
            title: null,
            promotionCode: 'EMPTY_PROMOTION',
            promotionSubCode: null,
            promotionId: null,
            tagText: null,
            promotionStatus: null,
            tag: null,
            description: null,
            doorSillRemain: null,
            isNeedAddOnShop: 0,
            goodsPromotionList,
            lastJoinTime: null,
          },
        ],
        lastJoinTime: null,
        postageFreePromotionVo: {
          title: null,
          promotionCode: null,
          promotionSubCode: null,
          promotionId: null,
          tagText: null,
          promotionStatus: null,
          tag: null,
          description: null,
          doorSillRemain: null,
          isNeedAddOnShop: 0,
        },
        shortageGoodsList: [],
        isSelected: true,
        storeStockShortage: false,
      },
    ],
    invalidGoodItems: [],
    isAllSelected: true,
    selectedGoodsCount,
    totalAmount: String(totalAmount),
    totalDiscountAmount: '0',
  };
}
