import { db } from '../libs/cloudbase.js';
import { safeCount, safeGet } from '../repositories/repo.utils.js';

const toFloat = (value) => {
  const num = Number.parseFloat(value);
  return Number.isFinite(num) ? num : 0;
};

export const getDashboard = async () => {
  const goodsCollection = db.collection('goods');
  const userCollection = db.collection('user');
  const orderCollection = db.collection('order');
  const promotionCollection = db.collection('salesPromotion');

  const [
    goodsCount,
    usersCount,
    ordersCount,
    promotionsCount,
    onlineGoodsCount,
    completedOrdersCount,
  ] = await Promise.all([
    safeCount(goodsCollection),
    safeCount(userCollection),
    safeCount(orderCollection),
    safeCount(promotionCollection),
    safeCount(goodsCollection.where({ status: 'online' })),
    safeCount(orderCollection.where({ status: 'completed' })),
  ]);

  const recentOrdersResult = await safeGet(
    orderCollection
      .orderBy('createTime', 'desc')
      .limit(5),
  );

  const promotionsResult = await safeGet(promotionCollection.limit(200));
  const now = Date.now();
  const activePromotions = (promotionsResult.data || []).filter((item) => {
    const start = new Date(item.startTime).getTime();
    const end = new Date(item.endTime).getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end)) return false;
    return start <= now && now <= end;
  }).length;

  const completedOrdersResult = await safeGet(
    orderCollection.where({ status: 'completed' }).limit(1000),
  );
  const totalRevenue = (completedOrdersResult.data || []).reduce(
    (sum, item) => sum + toFloat(item.totalPrice),
    0,
  );

  return {
    stats: {
      totalGoods: goodsCount.total || 0,
      totalUsers: usersCount.total || 0,
      totalOrders: ordersCount.total || 0,
      totalPromotions: promotionsCount.total || 0,
      onlineGoods: onlineGoodsCount.total || 0,
      completedOrders: completedOrdersCount.total || 0,
      activePromotions,
      totalRevenue,
    },
    recentOrders: recentOrdersResult.data || [],
  };
};
