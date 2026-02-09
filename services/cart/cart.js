import { config } from '../../config/index';
import { buildCartGroupData, getLocalCartItems } from './localCart';
import { callCloudFunction } from '../_utils/cloud';
import { shouldMock } from '../_utils/shouldMock';
import { adaptCartGroupData } from '../../model/cart';

/** 检查是否是云存储fileID */
const isCloudFileId = (url) => typeof url === 'string' && url.startsWith('cloud://');

/** 检查URL是否可能已过期（临时URL通常包含token参数） */
const isTempUrl = (url) => typeof url === 'string' && url.includes('tmp.') && url.includes('?');

/** 刷新购物车商品图片 - 根据spuId重新获取 */
async function refreshCartImages(items) {
  if (!items || items.length === 0) return items;

  // 收集需要刷新图片的商品spuId
  const spuIds = [];
  items.forEach((item) => {
    if (!item.thumb || isTempUrl(item.thumb) || isCloudFileId(item.thumb)) {
      if (item.spuId) {
        spuIds.push(item.spuId);
      }
    }
  });

  if (spuIds.length === 0) return items;

  try {
    // 调用云函数批量获取商品图片
    const res = await callCloudFunction('getCartImages', { spuIds: [...new Set(spuIds)] });

    if (res && res.images) {
      const imageMap = res.images;
      items.forEach((item) => {
        if (imageMap[item.spuId]) {
          item.thumb = imageMap[item.spuId];
        }
      });
    }
  } catch (e) {
    console.error('[购物车] 刷新商品图片失败', e);

    // 回退：尝试转换云存储URL
    await convertCloudUrls(items);
  }

  return items;
}

/** 批量转换云存储URL */
async function convertCloudUrls(items) {
  const fileIds = [];
  const indexMap = {};

  items.forEach((item, index) => {
    const fileId = item.thumbFileId || (isCloudFileId(item.thumb) ? item.thumb : '');
    if (fileId) {
      fileIds.push(fileId);
      indexMap[fileId] = indexMap[fileId] || [];
      indexMap[fileId].push(index);
    }
  });

  if (fileIds.length === 0) return items;

  try {
    const res = await wx.cloud.getTempFileURL({ fileList: [...new Set(fileIds)] });
    if (res.fileList) {
      res.fileList.forEach((file) => {
        if (file.tempFileURL && indexMap[file.fileID]) {
          indexMap[file.fileID].forEach((idx) => {
            items[idx].thumb = file.tempFileURL;
          });
        }
      });
    }
  } catch (e) {
    console.error('[购物车] 转换云存储URL失败', e);
  }

  return items;
}

/** 获取购物车mock数据 */
async function mockFetchCartGroupData() {
  const { delay } = require('../_utils/delay');
  let localItems = getLocalCartItems();
  localItems = await refreshCartImages(localItems);
  const data = buildCartGroupData(localItems);
  return delay().then(() => ({ data }));
}

/** 获取购物车数据 */
export async function fetchCartGroupData(params) {
  if (shouldMock('cart.fetchCartGroupData')) {
    return mockFetchCartGroupData();
  }
  let localItems = getLocalCartItems();
  localItems = await refreshCartImages(localItems);
  return callCloudFunction('getCartGroupData', { ...(params || {}), items: localItems }).then((real) =>
    adaptCartGroupData(real),
  );
}
