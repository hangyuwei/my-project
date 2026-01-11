import { create, findPaged, removeById, updateById } from '../repositories/users.repo.js';

const normalizeString = (value) => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

export const listUsers = async ({ page, pageSize, search }) => {
  return findPaged({ page, pageSize, search });
};

export const saveUser = async (payload = {}) => {
  const data = {
    id: normalizeString(payload.id),
    name: normalizeString(payload.name),
    grade: normalizeString(payload.grade) || 'bronze',
    orderIds: Array.isArray(payload.orderIds) ? payload.orderIds : [],
    updateTime: new Date(),
  };

  if (payload._id) {
    await updateById(payload._id, data);
    return { id: payload._id };
  }

  const result = await create({ ...data, createTime: new Date() });
  return { id: result.id };
};

export const deleteUser = async (id) => {
  await removeById(id);
  return { success: true };
};
