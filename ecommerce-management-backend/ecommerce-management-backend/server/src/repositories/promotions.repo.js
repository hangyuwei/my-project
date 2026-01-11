import { db } from '../libs/cloudbase.js';
import { applyWhere, safeCount, safeGet } from './repo.utils.js';

const collection = () => db.collection('salesPromotion');

export const findPaged = async ({ page, pageSize, search }) => {
  const where = {};
  if (search) {
    where.name = db.RegExp({ regexp: search, options: 'i' });
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
