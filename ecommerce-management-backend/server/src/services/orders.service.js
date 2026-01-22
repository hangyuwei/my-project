import { create, findPaged, findById, removeById, updateById } from '../repositories/orders.repo.js';
import { findByUserId, adaptUser } from '../repositories/users.repo.js';
import { safeGet } from '../repositories/repo.utils.js';
import { db } from '../libs/cloudbase.js';
import { createLog, findLogsByOrderId, deleteLogsByOrderId } from '../repositories/orderLogs.repo.js';

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

const statusMetaMap = {
  pending_payment: { orderStatus: 5, orderStatusName: '待付款' },
  pending: { orderStatus: 10, orderStatusName: '待发货' },
  shipped: { orderStatus: 40, orderStatusName: '待收货' },
  completed: { orderStatus: 50, orderStatusName: '已完成' },
  refunded: { orderStatus: 80, orderStatusName: '已退款' },
};

const getStatusMeta = (status) => statusMetaMap[status] || null;

export const listOrders = async ({ page, pageSize, search, status, userId }) => {
  return findPaged({ page, pageSize, search, status, userId });
};

export const saveOrder = async (payload = {}, operator = 'system') => {
  const status = normalizeString(payload.status) || 'pending';
  const statusMeta = getStatusMeta(status);
  const data = {
    id: normalizeString(payload.id),
    goodsSku: normalizeString(payload.goodsSku),
    num: toInt(payload.num),
    userId: normalizeString(payload.userId),
    salesPromotionId: normalizeString(payload.salesPromotionId) || null,
    totalPrice: toFloat(payload.totalPrice),
    status,
    ...(statusMeta
      ? { orderStatus: statusMeta.orderStatus, orderStatusName: statusMeta.orderStatusName }
      : {}),
    updateTime: new Date(),
  };

  if (payload._id) {
    // Update existing order
    const oldOrder = await findById(payload._id);
    const oldStatus = oldOrder.data?.[0]?.status;

    await updateById(payload._id, data);

    // Log status change if status changed
    if (oldStatus && oldStatus !== status) {
      await createLog({
        orderId: payload._id,
        orderNo: data.id,
        status,
        statusName: statusMeta?.orderStatusName || status,
        action: 'updated',
        operator,
        notes: `订单状态从 ${oldStatus} 更新为 ${status}`,
      });
    }

    return { id: payload._id };
  }

  // Create new order
  const result = await create({ ...data, createTime: new Date() });

  // Log order creation
  await createLog({
    orderId: result.id,
    orderNo: data.id,
    status,
    statusName: statusMeta?.orderStatusName || status,
    action: 'created',
    operator,
    notes: '订单创建',
  });

  return { id: result.id };
};

export const deleteOrder = async (id) => {
  // Delete order logs first
  await deleteLogsByOrderId(id);
  // Then delete the order
  await removeById(id);
  return { success: true };
};

export const batchUpdateOrders = async ({ ids, status }, operator = 'system') => {
  const normalizedStatus = normalizeString(status);
  if (!ids || !ids.length || !normalizedStatus) return { success: false };
  const statusMeta = getStatusMeta(normalizedStatus);
  const updateData = {
    status: normalizedStatus,
    ...(statusMeta
      ? { orderStatus: statusMeta.orderStatus, orderStatusName: statusMeta.orderStatusName }
      : {}),
    updateTime: new Date(),
  };

  // Update all orders and create logs
  await Promise.all(
    ids.map(async (id) => {
      // Get order info before update
      const orderResult = await findById(id);
      const order = orderResult.data?.[0];

      // Update order
      await db.collection('orders').doc(id).update({
        ...updateData,
      });

      // Create log entry
      if (order) {
        await createLog({
          orderId: id,
          orderNo: order.id,
          status: normalizedStatus,
          statusName: statusMeta?.orderStatusName || normalizedStatus,
          action: 'batch_updated',
          operator,
          notes: `批量更新订单状态为 ${statusMeta?.orderStatusName || normalizedStatus}`,
        });
      }
    }),
  );

  return { success: true };
};

export const getOrderDetail = async (id) => {
  const orderResult = await findById(id);
  const order = orderResult.data?.[0];
  if (!order) return null;

  const [goodsResult, userResult, promotionResult, logs] = await Promise.all([
    order.goodsSku
      ? safeGet(db.collection('goods').where({ sku: order.goodsSku }).limit(1))
      : Promise.resolve({ data: [] }),
    order.userId ? findByUserId(order.userId) : Promise.resolve({ data: [] }),
    order.salesPromotionId
      ? safeGet(db.collection('salesPromotion').where({ id: order.salesPromotionId }).limit(1))
      : Promise.resolve({ data: [] }),
    findLogsByOrderId(id),
  ]);

  const user = userResult.data?.[0] ? adaptUser(userResult.data[0]) : null;

  return {
    ...order,
    goods: goodsResult.data?.[0] || null,
    user,
    promotion: promotionResult.data?.[0] || null,
    logs: logs || [],
  };
};
