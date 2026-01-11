// 产品分类常量定义

export const PRODUCT_CATEGORIES = {
  HEALTH_FOOD: 'health_food',           // 保健食品类
  NUTRITION: 'nutrition',               // 营养补充类
  BEAUTY_SKINCARE: 'beauty_skincare',   // 美容护肤类
  HOME_LIVING: 'home_living',           // 家居生活类
  SENIOR_LEISURE_FOOD: 'senior_leisure_food', // 适老休闲食品类
};

export const CATEGORY_NAMES = {
  [PRODUCT_CATEGORIES.HEALTH_FOOD]: '保健食品类',
  [PRODUCT_CATEGORIES.NUTRITION]: '营养补充类',
  [PRODUCT_CATEGORIES.BEAUTY_SKINCARE]: '美容护肤类',
  [PRODUCT_CATEGORIES.HOME_LIVING]: '家居生活类',
  [PRODUCT_CATEGORIES.SENIOR_LEISURE_FOOD]: '适老休闲食品类',
};

// 获取分类名称
export function getCategoryName(categoryKey) {
  return CATEGORY_NAMES[categoryKey] || '未分类';
}

// 获取所有分类列表
export function getAllCategories() {
  return Object.keys(PRODUCT_CATEGORIES).map(key => ({
    key: PRODUCT_CATEGORIES[key],
    name: CATEGORY_NAMES[PRODUCT_CATEGORIES[key]],
  }));
}

// 验证分类是否有效
export function isValidCategory(categoryKey) {
  return Object.values(PRODUCT_CATEGORIES).includes(categoryKey);
}
