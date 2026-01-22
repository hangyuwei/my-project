import { cloudApp, getDb } from '../libs/cloudbase.js';
import { isCollectionMissing, safeGet } from './repo.utils.js';

const isFileId = (value) => typeof value === 'string' && value.startsWith('cloud://');

const normalizeStatus = (value) => {
  if (value === 'active' || value === true || value === 1 || value === '1') return 'active';
  if (value === 'inactive' || value === false || value === 0 || value === '0') return 'inactive';
  return 'active';
};

const buildTempUrlMap = async (fileIds = []) => {
  const unique = Array.from(new Set(fileIds.filter(Boolean)));
  if (!unique.length) return {};
  const result = await cloudApp.getTempFileURL({
    fileList: unique.map((fileID) => ({ fileID, maxAge: 3600 })),
  });
  return (result.fileList || []).reduce((acc, item) => {
    acc[item.fileID] = item.tempFileURL || '';
    return acc;
  }, {});
};

export const getBanners = async () => {
  const db = getDb();
  const res = await safeGet(
    db.collection('banners').orderBy('sort', 'asc').orderBy('createTime', 'desc'),
  );
  const list = res.data || [];
  console.log('📊 从数据库获取的 banner 数量:', list.length);
  console.log('📊 原始数据结构示例:', list[0]);

  // 处理嵌套的 data 字段，展平数据结构
  const flatList = list.map((item) => ({
    _id: item._id,
    ...(item.data || item),
  }));

  const fileIds = flatList
    .map((item) => item.imageUrl || item.image)
    .filter(isFileId);
  console.log('📊 需要转换的云文件 IDs:', fileIds);

  const tempUrlMap = await buildTempUrlMap(fileIds);
  console.log('📊 临时 URL 映射:', Object.keys(tempUrlMap).length > 0 ? '✅ 成功生成' : '❌ 未生成');

  const result = {
    list: flatList.map((item) => {
      const imageUrl = item.imageUrl || item.image;
      const imageTempUrl = tempUrlMap[imageUrl] || '';
      console.log(`📊 处理 banner "${item.title}":`, {
        imageUrl: imageUrl ? imageUrl.substring(0, 50) + '...' : 'none',
        hasTempUrl: !!imageTempUrl
      });
      return {
        ...item,
        status: normalizeStatus(item.status),
        imageTempUrl,
      };
    }),
  };

  console.log('📊 最终返回 banner 数量:', result.list.length);
  return result;
};

const isCollectionExists = (error) => {
  const message = String(error?.message || '');
  const code = error?.code || error?.errorCode;
  return (
    code === 'DATABASE_COLLECTION_ALREADY_EXIST' ||
    message.includes('DATABASE_COLLECTION_ALREADY_EXIST') ||
    message.includes('already exists')
  );
};

const ensureBannersCollection = async (db) => {
  if (typeof db.createCollection !== 'function') return;
  try {
    await db.createCollection('banners');
  } catch (error) {
    if (!isCollectionMissing(error) && !isCollectionExists(error)) {
      throw error;
    }
  }
};

export const saveBanner = async (payload) => {
  const db = getDb();
  const data = {
    title: payload.title || '',
    imageUrl: payload.imageUrl || payload.image || '',
    linkUrl: payload.linkUrl || payload.url || '',
    sort: Number.isFinite(Number(payload.sort)) ? Number(payload.sort) : 0,
    status: normalizeStatus(payload.status),
    updateTime: new Date(),
  };

  const saveOnce = async () => {
    if (payload._id) {
      // 更新
      const id = String(payload._id);
      const existing = await db.collection('banners').doc(id).get().catch(() => null);
      if (existing?.data) {
        data.createTime = existing.data.createTime || new Date();
      }
      await db.collection('banners').doc(id).set({ data });
      return id;
    }

    // 新增
    data.createTime = new Date();
    const addRes = await db.collection('banners').add({ data });
    return addRes._id || addRes.id;
  };

  try {
    return await saveOnce();
  } catch (error) {
    if (isCollectionMissing(error)) {
      await ensureBannersCollection(db);
      return await saveOnce();
    }
    throw error;
  }
};

export const deleteBanner = async (id) => {
  const db = getDb();
  await db.collection('banners').doc(id).remove();
};
