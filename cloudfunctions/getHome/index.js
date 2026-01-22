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

const fallbackBanners = [
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

const uniqueList = (values = []) => Array.from(new Set(values.filter(Boolean)));

const mapCard = (item = {}, urlMap = {}) => {
  const fileId = pickCoverSource(item);
  const baseUrl = urlMap[fileId] || item.image || item.primaryImage || '';
  const coverImage = appendResize(baseUrl, 400);
  const picture = uniqueList([coverImage]);
  const price = item.price || 0;
  const linePrice = item.linePrice;
  const originPrice = Number(linePrice) > Number(price) ? linePrice : undefined;
  return {
    mockId: String(item.mockId || item.spuId || item.sku || item._id || ''),
    spuId: String(item.spuId || item._id || ''),
    title: item.goodName || item.goodsName || item.title || item.name || '',
    thumb: coverImage,
    coverImage,
    picture,
    price,
    originPrice,
    tags: [],
  };
};

exports.main = async () => {
  const products = await db
    .collection('goods')
    .where(db.command.or([{ status: 'ON' }, { status: 'online' }]))
    .limit(10)
    .get();

  // 展平嵌套的 data 字段
  const rawProducts = products.data || [];
  const list = rawProducts.map((item) => ({
    _id: item._id,
    ...(item.data || item),
  }));

  const fileIds = list.map((item) => pickCoverSource(item));
  const urlMap = await buildUrlMap(fileIds);
  const goodsList = list.map((item) => mapCard(item, urlMap));

  const bannersResult = await db
    .collection('banners')
    .orderBy('sort', 'asc')
    .orderBy('createTime', 'desc')
    .get()
    .catch(() => ({ data: [] }));

  // 展平嵌套的 data 字段
  const rawBanners = bannersResult.data || [];
  const flatBanners = rawBanners.map((item) => ({
    _id: item._id,
    ...(item.data || item),
  }));

  // 过滤启用的 banner
  const bannerList = flatBanners.filter((item) => {
    const status = item?.status;
    if (status === undefined || status === null || status === '') return true;
    if (status === 'active' || status === true || status === 1 || status === '1') return true;
    if (status === 'inactive' || status === false || status === 0 || status === '0') return false;
    if (status === '启用') return true;
    if (status === '禁用') return false;
    return true;
  });

  // 转换云文件 ID 为临时 URL
  const bannerFileIds = bannerList
    .map((item) => item.imageUrl || item.image || '')
    .filter(Boolean);
  const bannerUrlMap = await buildUrlMap(bannerFileIds);

  // 组装最终的 banner 数据
  const banners = bannerList.map((item) => {
    const raw = item.imageUrl || item.image || '';
    const image = bannerUrlMap[raw] || raw;
    return {
      id: item._id || item.id || '',
      image,
      linkUrl: item.linkUrl || item.url || '',
      title: item.title || '',
    };
  });

  const swiper = banners.length
    ? banners.map((item) => item.image).filter(Boolean)
    : fallbackBanners;

  return {
    swiper,
    banners,
    tabList,
    activityImg,
    goodsList,
  };
};
