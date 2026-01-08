import { normalizeGoodsRecord } from './goodsTransform';

const STORAGE_KEY = 'local_goods_records';

const createLocalId = () => `local-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

export function getLocalGoodsRecords() {
  const data = wx.getStorageSync(STORAGE_KEY);
  const list = Array.isArray(data) ? data : [];
  return list.map((item) => normalizeGoodsRecord(item));
}

export function addLocalGoodsRecord(record) {
  const normalized = normalizeGoodsRecord({
    ...record,
    spuId: record.spuId || createLocalId(),
  });
  const list = getLocalGoodsRecords();
  const nextList = [normalized, ...list];
  wx.setStorageSync(STORAGE_KEY, nextList);
  return normalized;
}

export function updateLocalGoodsRecord(spuId, updates = {}) {
  if (!spuId) return null;
  const list = getLocalGoodsRecords();
  const index = list.findIndex((item) => item.spuId === spuId);
  if (index < 0) return null;
  const next = normalizeGoodsRecord({
    ...list[index],
    ...updates,
    spuId,
  });
  list.splice(index, 1, next);
  wx.setStorageSync(STORAGE_KEY, list);
  return next;
}

export function removeLocalGoodsRecord(spuId) {
  if (!spuId) return false;
  const list = getLocalGoodsRecords();
  const nextList = list.filter((item) => item.spuId !== spuId);
  if (nextList.length === list.length) return false;
  wx.setStorageSync(STORAGE_KEY, nextList);
  return true;
}

export function findLocalGoodsRecord(spuId) {
  if (!spuId) return null;
  const list = getLocalGoodsRecords();
  return list.find((item) => item.spuId === spuId) || null;
}
