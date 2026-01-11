import { create, findPaged, findById, removeById, updateById } from '../repositories/orders.repo.js';
import { findByUserId } from '../repositories/users.repo.js';
import { safeGet } from '../repositories/repo.utils.js';
import { db } from '../libs/cloudbase.js';

const normalizeString = (value) => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

const toInt = (value) => {
  const num = Number.parseInt(value, 10);
  return Number.isFinite(num) ? num : 0;
};

const toFloat = (value) => {
  const num = Number.parseFloat(value);
  return Number.isFinite(num) ? num : 0;
};

export const listOrders = async ({ page, pageSize, search, status, userId }) => {
  return findPaged({ page, pageSize, search, status, userId });
};

export const saveOrder = async (payload = {}) => {
  const data = {
    id: normalizeString(payload.id),
    goodsSku: normalizeString(payload.goodsSku),
    num: toInt(payload.num),
    userId: normalizeString(payload.userId),
    salesPromotionId: normalizeString(payload.salesPromotionId) || null,
    totalPrice: toFloat(payload.totalPrice),
    status: normalizeString(payload.status) || 'pending',
    updateTime: new Date(),
  };

  if (payload._id) {
    await updateById(payload._id, data);
    return { id: payload._id };
  }

  const result = await create({ ...data, createTime: new Date() });
  return { id: result.id };
};

export const deleteOrder = async (id) => {
  await removeById(id);
  return { success: true };
};

export const batchUpdateOrders = async ({ ids, status }) => {
  if (!ids || !ids.length || !status) return { success: false };
  await Promise.all(
    ids.map((id) =>
      db.collection('order').doc(id).update({
        status,
        updateTime: new Date(),
      }),
    ),
  );
  return { success: true };
};

export const getOrderDetail = async (id) => {
  const orderResult = await findById(id);
  const order = orderResult.data?.[0];
  if (!order) return null;

  const [goodsResult, userResult, promotionResult] = await Promise.all([
    order.goodsSku
      ? safeGet(db.collection('goods').where({ sku: order.goodsSku }).limit(1))
      : Promise.resolve({ data: [] }),
    order.userId ? findByUserId(order.userId) : Promise.resolve({ data: [] }),
    order.salesPromotionId
      ? safeGet(db.collection('salesPromotion').where({ id: order.salesPromotionId }).limit(1))
      : Promise.resolve({ data: [] }),
  ]);

  return {
    ...order,
    goods: goodsResult.data?.[0] || null,
    user: userResult.data?.[0] || null,
    promotion: promotionResult.data?.[0] || null,
  };
};
