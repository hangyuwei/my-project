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

const banners = [
  'https://tdesign.gtimg.com/miniprogram/template/retail/home/v2/banner1.png',
  'https://tdesign.gtimg.com/miniprogram/template/retail/home/v2/banner2.png',
];

const tabList = [{ text: '精选推荐', key: 0 }];

const activityImg =
  'https://we-retail-static-1300977798.cos.ap-guangzhou.myqcloud.com/retail-mp/activity/banner.png';

const mapTags = (tags = []) =>
  Array.isArray(tags)
    ? tags.map((tag) => (typeof tag === 'object' && tag ? tag.title || tag.name || '' : tag)).filter(Boolean)
    : [];

const pickCoverSource = (item = {}) =>
  item.coverImage ||
  item.coverFileId ||
  item.thumbFileId ||
  item.imageFileId ||
  item.image ||
  item.primaryImage ||
  '';

const mapCard = (item = {}, urlMap = {}) => {
  const fileId = pickCoverSource(item);
  const baseUrl = urlMap[fileId] || item.image || item.primaryImage || '';
  return {
    spuId: String(item.spuId || item._id || ''),
    title: item.title || item.name || item.goodsName || '',
    thumb: appendResize(baseUrl, 400),
    price: item.price || 0,
    originPrice: item.linePrice || item.price || 0,
    tags: mapTags(item.tags),
  };
};

exports.main = async () => {
  const products = await db
    .collection('goods')
    .where(db.command.or([{ status: 'ON' }, { status: 'online' }]))
    .limit(10)
    .get();

  const list = products.data || [];
  const fileIds = list.map((item) => pickCoverSource(item));
  const urlMap = await buildUrlMap(fileIds);
  const goodsList = list.map((item) => mapCard(item, urlMap));

  return {
    swiper: banners,
    tabList,
    activityImg,
    goodsList,
  };
};
