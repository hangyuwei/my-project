import { db } from '../libs/cloudbase.js';
import { safeCount, safeGet, safeDocGet } from './repo.utils.js';
import * as afterSalesRepo from './after-sales.repo.js';

const collection = () => db.collection('orders');

const normalizeStatus = (value) => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

const normalizeTime = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'number') return new Date(value);
  if (typeof value === 'string') {
    const num = Number(value);
    if (Number.isFinite(num)) return new Date(num);
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return null;
};

// Adapter: convert mini program order shape to admin order shape.
const adaptOrder = (order) => {
  if (!order) return order;

  const isAdminShape = order.goodsSku !== undefined;
  const normalizedCreateTime = normalizeTime(order.createTime || order.createdAt) || new Date();
  const normalizedUpdateTime = normalizeTime(order.updateTime || order.updatedAt) || new Date();
  const rawStatus = normalizeStatus(order.status);
  const resolvedStatus = rawStatus ? mapOrderStatus(rawStatus) : mapOrderStatus(order.orderStatus);

  if (isAdminShape) {
    const resolvedGoodsName =
      order.goodsName || order.goodsTitle || order.title || order.goodName || '';
    return {
      ...order,
      goodsName: resolvedGoodsName,
      totalPrice: parseFloat(order.totalPrice || 0),
      status: resolvedStatus,
      createTime: normalizedCreateTime,
      updateTime: normalizedUpdateTime,
    };
  }

  const firstItem = order.orderItemVOs?.[0] || {};
  const fallbackOpenid = order.openid || order.uid || order.userId || 'mock_openid_001';

  return {
    ...order,
    id: order.orderNo || order.orderId || order.id,
    goodsName: firstItem.goodsName || order.goodsName || '',
    goodsSku: firstItem.skuId || firstItem.goodsName || 'unknown',
    num: firstItem.buyQuantity || 1,
    openid: order.openid || fallbackOpenid,
    uid: order.uid || fallbackOpenid,
    userId: order.userId || fallbackOpenid,
    logisticsVO: order.logisticsVO || null,
    totalPrice:
      order.totalPrice !== undefined
        ? parseFloat(order.totalPrice || 0)
        : parseFloat(order.totalAmount || order.paymentAmount || 0) / 100,
    status: resolvedStatus,
    createTime: normalizedCreateTime,
    updateTime: normalizedUpdateTime,
  };
};

// Map order status to admin status.
const mapOrderStatus = (orderStatus) => {
  if (typeof orderStatus === 'string') {
    const trimmed = orderStatus.trim();
    if (!trimmed) return 'pending';
    const numeric = Number(trimmed);
    if (Number.isFinite(numeric)) return mapOrderStatus(numeric);
    // 处理中文状态名
    const chineseStatusMap = {
      '待付款': 'pending_payment',
      '待发货': 'pending',
      '已发货': 'shipped',
      '待收货': 'shipped',
      '已完成': 'completed',
      '已退款': 'refunded',
      '售后中': 'after_sale',
      '售后处理中': 'after_sale',
    };
    if (chineseStatusMap[trimmed]) {
      return chineseStatusMap[trimmed];
    }
    return trimmed;
  }
  switch (orderStatus) {
    case 5:
      return 'pending_payment';
    case 10:
      return 'pending';
    case 20:
      return 'shipped';
    case 30:
      return 'completed';
    case 40:
      return 'shipped';
    case 50:
      return 'completed';
    case 60:
    case 70:
      return 'after_sale'; // 售后相关状态
    case 80:
      return 'refunded';
    default:
      return 'pending';
  }
};

const mapStatusToOrderStatus = (status) => {
  switch (normalizeStatus(status)) {
    case 'pending_payment':
      return [5];
    case 'pending':
      return [10];
    case 'shipped':
      return [20, 40]; // 20 和 40 都是已发货/待收货状态
    case 'completed':
      return [50]; // 只有 50 是已完成状态（30 已废弃）
    case 'refunded':
      return [80];
    default:
      return null;
  }
};

export const findPaged = async ({ page, pageSize, search, status, userId }) => {
  const _ = db.command;
  const conditions = [];

  if (search) {
    conditions.push({ id: db.RegExp({ regexp: search, options: 'i' }) });
  }

  const normalizedStatus = normalizeStatus(status);
  if (normalizedStatus) {
    const mappedStatuses = mapStatusToOrderStatus(normalizedStatus);
    if (mappedStatuses !== null) {
      // 匹配 status 字段或 orderStatus 字段中的任意一个值
      conditions.push(_.or([
        { status: normalizedStatus },
        { orderStatus: _.in(mappedStatuses) }
      ]));
    } else {
      conditions.push({ status: normalizedStatus });
    }
  }

  if (userId) {
    conditions.push({ userId });
  }

  const whereClause = conditions.length === 1 ? conditions[0] : conditions.length ? _.and(conditions) : {};
  const baseQuery = conditions.length ? collection().where(whereClause) : collection();

  const listResult = await safeGet(
    baseQuery
      .orderBy('createTime', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize),
  );
  const countResult = await safeCount(
    conditions.length ? collection().where(whereClause) : collection(),
  );

  // Enrich orders with goods and after-sales information
  const orders = listResult.data || [];

  // 收集所有需要查询售后的订单号
  const orderNosWithAfterSale = orders
    .filter(o => o.hasAfterSale || o.afterSaleId)
    .map(o => o.orderNo || o.id);

  // 批量查询售后信息
  let afterSalesMap = {};
  if (orderNosWithAfterSale.length > 0) {
    try {
      const afterSalesList = await afterSalesRepo.findByOrderNos(orderNosWithAfterSale);
      afterSalesMap = afterSalesList.reduce((acc, as) => {
        acc[as.orderNo] = as;
        return acc;
      }, {});
    } catch (error) {
      console.error('Error fetching after-sales for orders:', error);
    }
  }

  const enrichedOrders = await Promise.all(
    orders.map(async (order) => {
      const adaptedOrder = adaptOrder(order);

      // Fetch goods information if goodsSku exists
      if (adaptedOrder.goodsSku && !adaptedOrder.goodsName) {
        try {
          const goodsResult = await safeGet(
            db.collection('goods').where({ sku: adaptedOrder.goodsSku }).limit(1)
          );
          const goods = goodsResult.data?.[0];
          if (goods) {
            adaptedOrder.goodsName = goods.goodsName || goods.goodName || goods.title || '';
          }
        } catch (error) {
          console.error('Error fetching goods for order:', adaptedOrder._id, error);
        }
      }

      // 添加售后信息
      const orderNo = adaptedOrder.orderNo || adaptedOrder.id;
      if (orderNo && afterSalesMap[orderNo]) {
        const afterSale = afterSalesMap[orderNo];
        adaptedOrder.afterSaleInfo = {
          afterSaleNo: afterSale.afterSaleNo,
          status: afterSale.status,
          statusDesc: afterSale.statusDesc,
          type: afterSale.type,
          applyTime: afterSale.applyTime,
        };
      }

      return adaptedOrder;
    })
  );

  // 如果有状态筛选，过滤掉 adaptOrder 转换后状态不匹配的订单
  const filteredOrders = normalizedStatus
    ? enrichedOrders.filter(order => order.status === normalizedStatus)
    : enrichedOrders;

  return {
    list: filteredOrders,
    total: countResult.total || 0,
  };
};

export const create = async (data) => collection().add(data);

export const updateById = async (id, data) => collection().doc(id).update(data);

export const removeById = async (id) => collection().doc(id).remove();

export const findById = async (id) => {
  const result = await safeDocGet('orders', id);
  if (result.data && result.data[0]) {
    result.data[0] = adaptOrder(result.data[0]);
  }
  return result;
};
