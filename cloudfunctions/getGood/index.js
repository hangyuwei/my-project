const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

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

const normalizeNumber = (value, fallback) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const pickImageSource = (product = {}) =>
  product.coverFileId || product.imageFileId || product.image || product.primaryImage || '';

const pickThumbSource = (product = {}) =>
  product.coverFileId || product.thumbFileId || product.imageFileId || product.image || product.primaryImage || '';

const buildSkuList = (product, skuImage, price, linePrice, stock, urlMap) => {
  const skuList = Array.isArray(product.skus) ? product.skus : [];
  if (skuList.length) {
    return skuList.map((sku) => {
      const info = sku || {};
      const skuImageSource = info.skuImage || info.image || skuImage || '';
      return {
        skuId: String(info.skuId || info.id || product.skuId || product.spuId || ''),
        skuImage: resolveUrl(skuImageSource, urlMap, 750),
        specInfo: Array.isArray(info.specInfo) ? info.specInfo : [],
        priceInfo: Array.isArray(info.priceInfo) && info.priceInfo.length
          ? info.priceInfo
          : [
              { priceType: 1, price: String(info.price || price), priceTypeName: null },
              { priceType: 2, price: String(info.linePrice || linePrice), priceTypeName: null },
            ],
        stockInfo: info.stockInfo || {
          stockQuantity: normalizeNumber(info.stock || stock, stock),
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: info.weight ?? null,
        volume: info.volume ?? null,
        profitPrice: info.profitPrice ?? null,
      };
    });
  }

  return [
    {
      skuId: String(product.skuId || product.spuId || ''),
      skuImage: resolveUrl(skuImage, urlMap, 750),
      specInfo: [],
      priceInfo: [
        { priceType: 1, price: String(price), priceTypeName: null },
        { priceType: 2, price: String(linePrice), priceTypeName: null },
      ],
      stockInfo: {
        stockQuantity: stock,
        safeStockQuantity: 0,
        soldQuantity: 0,
      },
      weight: null,
      volume: null,
      profitPrice: null,
    },
  ];
};

exports.main = async (event = {}) => {
  const spuId = event.spuId ? String(event.spuId) : '';
  const skuId = event.skuId ? String(event.skuId) : '';

  let query = {};
  if (spuId && skuId) {
    query = _.or([{ spuId }, { skuId }]);
  } else if (spuId) {
    query = { spuId };
  } else if (skuId) {
    query = { skuId };
  }

  const res = await db.collection('products').where(query).limit(1).get();
  const product = res.data && res.data[0];
  if (!product) return null;

  const imageSource = pickImageSource(product);
  const thumbSource = pickThumbSource(product);
  const rawImages = Array.isArray(product.galleryFileIds) && product.galleryFileIds.length
    ? product.galleryFileIds
    : Array.isArray(product.imagesFileIds) && product.imagesFileIds.length
      ? product.imagesFileIds
      : Array.isArray(product.images) && product.images.length
        ? product.images
        : [];
  const detailBlocks = Array.isArray(product.detailBlocks)
    ? product.detailBlocks
    : Array.isArray(product.detail)
      ? product.detail
      : [];
  const detailImageSources = detailBlocks
    .filter((block) => block && block.type === 'image' && (block.fileId || block.value))
    .map((block) => block.fileId || block.value);

  const fileIds = [imageSource, thumbSource, ...rawImages, ...detailImageSources].filter(isCloudFileId);
  const urlMap = await buildUrlMap(fileIds);

  const primaryImage = resolveUrl(imageSource, urlMap, 750);
  const skuImage = resolveUrl(thumbSource || imageSource, urlMap, 750) || primaryImage;
  const images = rawImages.length
    ? rawImages.map((item) => resolveUrl(item, urlMap, 750)).filter(Boolean)
    : primaryImage
      ? [primaryImage]
      : [];
  const detail = detailBlocks.map((block) => {
    if (!block) return block;
    if (block.type === 'image' && (block.fileId || block.value)) {
      const source = block.fileId || block.value;
      return { ...block, value: resolveUrl(source, urlMap, 750) };
    }
    if (block.type === 'richtext') {
      return { ...block, value: block.value || '' };
    }
    return { ...block, value: block.value || '' };
  });
  const desc = detail
    .filter((block) => block && block.type === 'image' && block.value)
    .map((block) => block.value);

  const price = normalizeNumber(product.price, 0);
  const linePrice = normalizeNumber(product.linePrice ?? product.price, price);
  const stock = normalizeNumber(product.stock, 0);

  return {
    spuId: String(product.spuId || product._id || ''),
    skuId: String(product.skuId || ''),
    goodsName: product.title || product.name || '',
    title: product.title || product.name || '',
    image: primaryImage,
    primaryImage,
    skuImage,
    images,
    price,
    linePrice,
    minSalePrice: price,
    minLinePrice: linePrice,
    maxSalePrice: price,
    maxLinePrice: linePrice,
    spuStockQuantity: stock,
    soldNum: normalizeNumber(product.soldNum, 0),
    isPutOnSale: product.status === 'OFF' ? 0 : 1,
    specList: Array.isArray(product.specList) ? product.specList : [],
    skuList: buildSkuList(product, skuImage, price, linePrice, stock, urlMap),
    tags: Array.isArray(product.tags) ? product.tags : [],
    spuTagList: Array.isArray(product.spuTagList) ? product.spuTagList : [],
    detailImages: desc,
    desc,
    detail,
    status: product.status || 'ON',
  };
};
