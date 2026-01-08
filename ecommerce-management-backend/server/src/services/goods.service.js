import { fromCents, toCents } from '../utils/money.js';
import {
  create,
  findPaged,
  removeById,
  updateById,
  updateStatus,
} from '../repositories/goods.repo.js';

const normalizeString = (value) => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

const normalizeList = (value) => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => normalizeString(item)).filter(Boolean);
};

const uniqueList = (value) => Array.from(new Set(value.filter(Boolean)));

const buildPicture = ({ coverImage, galleryImages, detailImages }) =>
  uniqueList([coverImage, ...galleryImages, ...detailImages]);

const ensureImages = (record = {}) => {
  const picture = normalizeList(record.picture);
  const coverImage = normalizeString(record.coverImage) || picture[0] || '';
  const galleryImages = normalizeList(record.galleryImages).length
    ? normalizeList(record.galleryImages)
    : picture;
  const detailImages = normalizeList(record.detailImages);
  return {
    ...record,
    coverImage,
    galleryImages,
    detailImages,
    picture: picture.length ? picture : galleryImages,
  };
};

const mapOutput = (record = {}) => {
  const normalized = ensureImages(record);
  return {
    ...normalized,
    price: fromCents(normalized.price),
    linePrice: normalized.linePrice ? fromCents(normalized.linePrice) : undefined,
  };
};

export const listGoods = async ({ page, pageSize, search }) => {
  const result = await findPaged({ page, pageSize, search });
  return {
    list: result.list.map(mapOutput),
    total: result.total,
  };
};

export const saveGoods = async (payload = {}) => {
  const galleryImages = normalizeList(payload.galleryImages || payload.picture);
  const detailImages = normalizeList(payload.detailImages);
  const coverImage = normalizeString(payload.coverImage) || galleryImages[0] || '';
  const picture = buildPicture({ coverImage, galleryImages, detailImages });

  const data = {
    sku: normalizeString(payload.sku),
    goodName: normalizeString(payload.goodName),
    price: toCents(payload.price),
    description: normalizeString(payload.description),
    stock: Number.parseInt(payload.stock || 0, 10) || 0,
    coverImage,
    galleryImages,
    detailImages,
    picture,
    status: payload.status === 'offline' ? 'offline' : 'online',
    updateTime: new Date(),
  };

  if (payload._id) {
    await updateById(payload._id, data);
    return { id: payload._id };
  }

  const result = await create({ ...data, createTime: new Date() });
  return { id: result.id };
};

export const deleteGoods = async (id) => {
  await removeById(id);
  return { success: true };
};

export const setGoodsStatus = async (id, status) => {
  const nextStatus = status === 'offline' ? 'offline' : 'online';
  await updateStatus(id, nextStatus);
  return { success: true };
};
