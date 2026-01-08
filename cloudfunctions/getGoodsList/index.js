const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

const isCloudFileId = (value) => typeof value === 'string' && value.startsWith('cloud://');

const appendResize = (url, width) => {
  if (!url || !width) return url || '';
  const joiner = url.includes('?') ? '&' : '?';
  return `${url}${joiner}imageView2/2/w/${width}`;
};

const buildUrlMap = async (fileIds) => {
  const unique = Array.from(new Set(fileIds.filter(isCloudFileId)));
  if (!unique.length) return {};
  const res = await cloud.getTempFileURL({ fileList: unique });
  const map = {};
  (res.fileList || []).forEach((item) => {
    map[item.fileID] = item.tempFileURL || '';
  });
  return map;
};

const resolveUrl = (value, urlMap = {}, width) => {
  if (!value) return '';
  const mapped = urlMap[value];
  if (mapped) return appendResize(mapped, width);
  return value;
};

const pickImageSource = (item = {}) => {
  if (item.coverFileId) return item.coverFileId;
  if (item.thumbFileId) return item.thumbFileId;
  if (item.imageFileId) return item.imageFileId;
  if (item.image) return item.image;
  if (Array.isArray(item.images) && item.images.length) return item.images[0];
  return '';
};

const normalizeNumber = (value, fallback) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const mapItem = (item = {}, urlMap = {}) => {
  const imageSource = pickImageSource(item);
  const imageUrl = resolveUrl(imageSource, urlMap, 400);
  return {
    spuId: String(item.spuId || item._id || ''),
    skuId: String(item.skuId || ''),
    name: item.title || item.name || item.goodsName || '',
    title: item.title || item.name || item.goodsName || '',
    goodsName: item.title || item.name || item.goodsName || '',
    image: imageUrl,
    images: imageUrl ? [imageUrl] : [],
    price: item.price || 0,
    linePrice: item.linePrice || item.price || 0,
    stock: item.stock || 0,
    tags: Array.isArray(item.tags) ? item.tags : [],
    skus: Array.isArray(item.skus) ? item.skus : [],
    detailImages: Array.isArray(item.detailImages) ? item.detailImages : [],
  };
};

exports.main = async (event = {}) => {
  const pageNum = Math.max(normalizeNumber(event.pageNum || event.page || 1, 1), 1);
  const pageSize = Math.max(normalizeNumber(event.pageSize || event.limit || 20, 20), 1);
  const skip = (pageNum - 1) * pageSize;

  const keyword = typeof event.keyword === 'string' ? event.keyword.trim() : '';
  const status = event.status === 'OFF' ? 'OFF' : 'ON';
  let whereClause = { status };
  if (keyword) {
    const reg = db.RegExp({
      regexp: keyword,
      options: 'i',
    });
    whereClause = db.command.and([
      { status },
      db.command.or([{ title: reg }, { name: reg }, { goodsName: reg }]),
    ]);
  }

  const dataQuery = db.collection('products').where(whereClause);
  const total = await dataQuery.count();
  const res = await dataQuery.skip(skip).limit(pageSize).get();
  const dataList = res.data || [];
  const fileIds = dataList.map((item) => pickImageSource(item)).filter(isCloudFileId);
  const urlMap = await buildUrlMap(fileIds);
  const list = dataList.map((item) => mapItem(item, urlMap));

  return {
    list,
    pageNum,
    pageSize,
    totalCount: total.total || 0,
  };
};
