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
  if (item.coverImage) return item.coverImage;
  if (item.coverFileId) return item.coverFileId;
  if (item.thumbFileId) return item.thumbFileId;
  if (item.imageFileId) return item.imageFileId;
  if (item.image) return item.image;
  if (Array.isArray(item.galleryImages) && item.galleryImages.length) return item.galleryImages[0];
  if (Array.isArray(item.picture) && item.picture.length) return item.picture[0];
  if (Array.isArray(item.images) && item.images.length) return item.images[0];
  return '';
};

const pickGalleryImages = (item = {}) => {
  if (Array.isArray(item.galleryImages) && item.galleryImages.length) return item.galleryImages;
  if (Array.isArray(item.images) && item.images.length) return item.images;
  if (Array.isArray(item.picture) && item.picture.length) return item.picture;
  return [];
};

const pickDetailImages = (item = {}) => {
  if (Array.isArray(item.detailImages) && item.detailImages.length) return item.detailImages;
  return [];
};

const normalizeNumber = (value, fallback) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const mapItem = (item = {}, urlMap = {}) => {
  const imageSource = pickImageSource(item);
  const imageUrl = resolveUrl(imageSource, urlMap, 400);
  const galleryImages = pickGalleryImages(item).map((value) => resolveUrl(value, urlMap, 400)).filter(Boolean);
  const detailImages = pickDetailImages(item).map((value) => resolveUrl(value, urlMap, 750)).filter(Boolean);
  const primaryImage = imageUrl || galleryImages[0] || '';
  return {
    spuId: String(item.spuId || item.sku || item._id || ''),
    skuId: String(item.skuId || item.sku || ''),
    name: item.goodName || item.title || item.name || '',
    title: item.goodName || item.title || item.name || '',
    goodsName: item.goodName || item.title || item.name || '',
    image: primaryImage,
    primaryImage,
    images: galleryImages.length ? galleryImages : primaryImage ? [primaryImage] : [],
    price: item.price || 0,
    linePrice: item.linePrice || item.price || 0,
    stock: item.stock || 0,
    tags: Array.isArray(item.tags) ? item.tags : [],
    skus: Array.isArray(item.skus) ? item.skus : [],
    detailImages,
  };
};

exports.main = async (event = {}) => {
  const pageNum = Math.max(normalizeNumber(event.pageNum || event.page || 1, 1), 1);
  const pageSize = Math.max(normalizeNumber(event.pageSize || event.limit || 20, 20), 1);
  const skip = (pageNum - 1) * pageSize;

  const keyword = typeof event.keyword === 'string' ? event.keyword.trim() : '';
  const rawStatus = typeof event.status === 'string' ? event.status.trim() : '';
  let statusValues = [];
  if (rawStatus) {
    const upper = rawStatus.toUpperCase();
    if (upper === 'OFF' || rawStatus.toLowerCase() === 'offline') {
      statusValues = ['OFF', 'offline'];
    } else if (upper === 'ON' || rawStatus.toLowerCase() === 'online') {
      statusValues = ['ON', 'online'];
    } else {
      statusValues = [rawStatus];
    }
  } else {
    statusValues = ['ON', 'online'];
  }

  const conditions = [];
  if (statusValues.length) {
    conditions.push(db.command.or(statusValues.map((value) => ({ status: value }))));
  }
  if (keyword) {
    const reg = db.RegExp({
      regexp: keyword,
      options: 'i',
    });
    conditions.push(db.command.or([{ title: reg }, { name: reg }, { goodsName: reg }]));
  }
  const whereClause = conditions.length > 1 ? db.command.and(conditions) : conditions[0] || {};

  const dataQuery = db.collection('goods').where(whereClause);
  const total = await dataQuery.count();
  const res = await dataQuery.skip(skip).limit(pageSize).get();
  const dataList = res.data || [];
  const fileIds = dataList
    .flatMap((item) => [pickImageSource(item), ...pickGalleryImages(item), ...pickDetailImages(item)])
    .filter(isCloudFileId);
  const urlMap = await buildUrlMap(fileIds);
  const list = dataList.map((item) => mapItem(item, urlMap));

  return {
    list,
    pageNum,
    pageSize,
    totalCount: total.total || 0,
  };
};
