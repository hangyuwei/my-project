const STORAGE_KEY = 'local_cart_items';

const toInt = (value, fallback = 0) => {
  const num = parseInt(value, 10);
  return Number.isNaN(num) ? fallback : num;
};

const normalizeQuantity = (value) => {
  const qty = toInt(value, 1);
  return qty > 0 ? qty : 1;
};

export function getLocalCartItems() {
  const data = wx.getStorageSync(STORAGE_KEY);
  return Array.isArray(data) ? data : [];
}

export function setLocalCartItems(items = []) {
  const next = Array.isArray(items) ? items : [];
  wx.setStorageSync(STORAGE_KEY, next);
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
      price: item.price || 0,
      originPrice: item.originPrice || item.price || 0,
      quantity: qty,
      stockQuantity: toInt(item.stockQuantity, 999),
      specInfo: Array.isArray(item.specInfo) ? item.specInfo : [],
      storeId: item.storeId || 'local',
      category: item.category || null,
    });
  }
  wx.setStorageSync(STORAGE_KEY, list);
  return list;
}

export function updateLocalCartItemQuantity(spuId, skuId, quantity) {
  const list = getLocalCartItems();
  const nextQuantity = normalizeQuantity(quantity);
  const index = list.findIndex((entry) => entry.spuId === spuId && entry.skuId === skuId);
  if (index < 0) return list;
  list[index].quantity = nextQuantity;
  wx.setStorageSync(STORAGE_KEY, list);
  return list;
}

export function removeLocalCartItem(spuId, skuId) {
  const list = getLocalCartItems();
  const nextList = list.filter((entry) => !(entry.spuId === spuId && entry.skuId === skuId));
  if (nextList.length === list.length) return list;
  wx.setStorageSync(STORAGE_KEY, nextList);
  return nextList;
}

export function clearLocalCartItems() {
  wx.setStorageSync(STORAGE_KEY, []);
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
