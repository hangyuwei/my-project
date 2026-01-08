import { db } from '../libs/cloudbase.js';
import { applyWhere, safeCount, safeGet, safeDocGet } from './repo.utils.js';

const collection = () => db.collection('goods');

export const findPaged = async ({ page, pageSize, search }) => {
  const where = {};
  if (search) {
    where.goodName = db.RegExp({ regexp: search, options: 'i' });
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

export const updateStatus = async (id, status) =>
  collection().doc(id).update({ status, updateTime: new Date() });

export const findById = async (id) => safeDocGet('goods', id);
