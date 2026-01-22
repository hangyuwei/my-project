import { db } from '../libs/cloudbase.js';
import { safeCount, safeGet, safeDocGet } from './repo.utils.js';

const collection = () => db.collection('after_sales');

export const findPaged = async ({ page, pageSize, status }) => {
  const _ = db.command;
  const conditions = [];

  if (status) {
    conditions.push({ status });
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

  return {
    list: listResult.data || [],
    total: countResult.total || 0,
  };
};

export const findById = async (id) => {
  const result = await safeDocGet('after_sales', id);
  return result.data?.[0] || null;
};

export const updateById = async (id, data) => {
  return collection().doc(id).update(data);
};

// 根据订单号查找售后记录
export const findByOrderNo = async (orderNo) => {
  const result = await safeGet(
    collection()
      .where({ orderNo })
      .orderBy('createTime', 'desc')
      .limit(1),
  );
  return result.data?.[0] || null;
};

// 批量根据订单号查找售后记录
export const findByOrderNos = async (orderNos) => {
  if (!orderNos || orderNos.length === 0) return [];
  const _ = db.command;
  const result = await safeGet(
    collection().where({ orderNo: _.in(orderNos) }),
  );
  return result.data || [];
};
