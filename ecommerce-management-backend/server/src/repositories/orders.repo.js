import { db } from '../libs/cloudbase.js';
import { applyWhere, safeCount, safeGet, safeDocGet } from './repo.utils.js';

const collection = () => db.collection('order');

export const findPaged = async ({ page, pageSize, search, status, userId }) => {
  const where = {};
  if (search) {
    where.id = db.RegExp({ regexp: search, options: 'i' });
  }
  if (status) {
    where.status = status;
  }
  if (userId) {
    where.userId = userId;
  }
  const listResult = await safeGet(
    applyWhere(collection(), where)
      .orderBy('createTime', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize),
  );
  const countResult = await safeCount(applyWhere(collection(), where));
  return {
    list: listResult.data || [],
    total: countResult.total || 0,
  };
};

export const create = async (data) => collection().add(data);

export const updateById = async (id, data) => collection().doc(id).update(data);

export const removeById = async (id) => collection().doc(id).remove();

export const findById = async (id) => safeDocGet('order', id);
