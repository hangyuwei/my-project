import { cloudApp } from '../libs/cloudbase.js';
import { fromCents, toCents } from '../utils/money.js';
import { generateId } from '../utils/id.js';
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
  const galleryImagesValue = normalizeList(record.galleryImages);
  const gallaryImagesValue = normalizeList(record.gallaryImages);
  const galleryImages = galleryImagesValue.length
    ? galleryImagesValue
    : gallaryImagesValue.length
      ? gallaryImagesValue
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
    category: normalized.category || null,
  };
};

const isCloudFileId = (value) => typeof value === 'string' && value.startsWith('cloud://');

const resolveUrl = (value, urlMap) => {
  if (!value) return '';
  if (isCloudFileId(value)) return urlMap[value] || '';
  return value;
};

const collectFileIds = (records = []) =>
  records
    .flatMap((record) => [
      record.coverImage,
      ...(record.galleryImages || []),
      ...(record.detailImages || []),
      ...(record.picture || []),
    ])
    .filter(isCloudFileId);

const buildTempUrlMap = async (fileIds = []) => {
  const unique = Array.from(new Set(fileIds.filter(Boolean)));
  if (!unique.length) return {};
  const res = await cloudApp.getTempFileURL({
    fileList: unique.map((fileID) => ({ fileID, maxAge: 3600 })),
  });
  return (res.fileList || []).reduce((acc, item) => {
    acc[item.fileID] = item.tempFileURL || '';
    return acc;
  }, {});
};

const attachImageUrls = (record = {}, urlMap = {}) => ({
  ...record,
  coverUrl: resolveUrl(record.coverImage, urlMap),
  galleryUrls: (record.galleryImages || []).map((value) => resolveUrl(value, urlMap)).filter(Boolean),
  detailUrls: (record.detailImages || []).map((value) => resolveUrl(value, urlMap)).filter(Boolean),
});

export const listGoods = async ({ page, pageSize, search }) => {
  const result = await findPaged({ page, pageSize, search });
  const mappedList = result.list.map(mapOutput);
  const urlMap = await buildTempUrlMap(collectFileIds(mappedList));
  return {
    list: mappedList.map((item) => attachImageUrls(item, urlMap)),
    total: result.total,
  };
};

export const saveGoods = async (payload = {}) => {
  const galleryImages = normalizeList(
    payload.galleryImages || payload.gallaryImages || payload.picture,
  );
  const detailImages = normalizeList(payload.detailImages);
  const coverImage = normalizeString(payload.coverImage) || galleryImages[0] || '';
  const picture = buildPicture({ coverImage, galleryImages, detailImages });
  const mockId = normalizeString(payload.mockId);

  const skuValue = normalizeString(payload.sku);
  const spuIdValue = normalizeString(payload.spuId);
  const categoryValue = normalizeString(payload.category);
  const data = {
    goodName: normalizeString(payload.goodName),
    price: toCents(payload.price),
    description: normalizeString(payload.description),
    stock: Number.parseInt(payload.stock || 0, 10) || 0,
    coverImage,
    galleryImages,
    detailImages,
    picture,
    status: payload.status === 'offline' ? 'offline' : 'online',
    category: categoryValue || null,
    updateTime: new Date(),
    ...(mockId ? { mockId } : {}),
    ...(spuIdValue ? { spuId: spuIdValue } : {}),
  };

  if (payload._id) {
    const updateData = {
      ...data,
      ...(skuValue ? { sku: skuValue } : {}),
    };
    await updateById(payload._id, updateData);
    return { id: payload._id };
  }

  const result = await create({
    ...data,
    sku: skuValue || generateId('SKU'),
    createTime: new Date(),
  });
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
