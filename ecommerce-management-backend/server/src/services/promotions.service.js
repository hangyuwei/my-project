import { create, findPaged, removeById, updateById } from '../repositories/promotions.repo.js';

const normalizeString = (value) => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

const normalizeDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const toFloat = (value) => {
  const num = Number.parseFloat(value);
  return Number.isFinite(num) ? num : 0;
};

export const listPromotions = async ({ page, pageSize, search }) => {
  return findPaged({ page, pageSize, search });
};

export const savePromotion = async (payload = {}) => {
  const startTime = normalizeDate(payload.startTime) || new Date();
  const endTime = normalizeDate(payload.endTime) || new Date();

  const data = {
    id: normalizeString(payload.id),
    name: normalizeString(payload.name),
    description: normalizeString(payload.description),
    startTime,
    endTime,
    multiPrize: toFloat(payload.multiPrize),
    lowestPrice: toFloat(payload.lowestPrice),
    updateTime: new Date(),
  };

  if (payload._id) {
    await updateById(payload._id, data);
    return { id: payload._id };
  }

  const result = await create({ ...data, createTime: new Date() });
  return { id: result.id };
};

export const deletePromotion = async (id) => {
  await removeById(id);
  return { success: true };
};
