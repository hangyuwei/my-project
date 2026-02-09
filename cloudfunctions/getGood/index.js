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
  product.coverImage ||
  product.coverFileId ||
  product.imageFileId ||
  product.image ||
  product.primaryImage ||
  (Array.isArray(product.galleryImages) && product.galleryImages[0]) ||
  (Array.isArray(product.gallaryImages) && product.gallaryImages[0]) ||
  (Array.isArray(product.picture) && product.picture[0]) ||
  '';

const pickThumbSource = (product = {}) =>
  product.coverImage ||
  product.coverFileId ||
  product.thumbFileId ||
  product.imageFileId ||
  product.image ||
  product.primaryImage ||
  (Array.isArray(product.galleryImages) && product.galleryImages[0]) ||
  (Array.isArray(product.gallaryImages) && product.gallaryImages[0]) ||
  (Array.isArray(product.picture) && product.picture[0]) ||
  '';

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

const uniqueList = (values = []) => Array.from(new Set(values.filter(Boolean)));

exports.main = async (event = {}) => {
  const spuId = event.spuId ? String(event.spuId) : '';
  const skuId = event.skuId ? String(event.skuId) : '';

  console.log('=== getGood 云函数开始 ===');
  console.log('接收参数 spuId:', spuId, ', skuId:', skuId);

  let query = {};
  if (spuId && skuId) {
    query = _.or([{ spuId }, { mockId: spuId }, { skuId }, { sku: spuId }, { sku: skuId }, { _id: spuId }, { _id: skuId }]);
  } else if (spuId) {
    query = _.or([{ spuId }, { mockId: spuId }, { sku: spuId }, { _id: spuId }]);
  } else if (skuId) {
    query = _.or([{ skuId }, { sku: skuId }, { _id: skuId }]);
  }

  console.log('查询条件:', JSON.stringify(query));

  const res = await db.collection('goods').where(query).limit(1).get();

  console.log('查询结果数量:', res.data ? res.data.length : 0);
  if (res.data && res.data.length > 0) {
    console.log('查询到的商品 spuId:', res.data[0].spuId);
    console.log('查询到的商品 description:', res.data[0].description);
  }

  const product = res.data && res.data[0];
  if (!product) {
    console.log('未找到商品，返回 null');
    return null;
  }

  console.log('=== 云函数 getGood 调试 ===');
  console.log('查询到的商品 description:', product.description);
  console.log('商品名称:', product.goodName);

  const imageSource = pickImageSource(product);
  const thumbSource = pickThumbSource(product);
  const rawImages = Array.isArray(product.galleryImages) && product.galleryImages.length
    ? product.galleryImages
    : Array.isArray(product.gallaryImages) && product.gallaryImages.length
      ? product.gallaryImages
      : Array.isArray(product.images) && product.images.length
        ? product.images
        : Array.isArray(product.picture) && product.picture.length
          ? product.picture
          : [];
  const detailImages = Array.isArray(product.detailImages) ? product.detailImages : [];
  let detailBlocks = Array.isArray(product.detailBlocks)
    ? product.detailBlocks
    : Array.isArray(product.detail)
      ? product.detail
      : detailImages.length
        ? detailImages.map((value) => ({ type: 'image', value }))
        : [];
  const descriptionText = typeof product.description === 'string' ? product.description.trim() : '';
  if (descriptionText) {
    detailBlocks = [{ type: 'text', value: descriptionText }, ...detailBlocks];
  }
  const detailImageSources = detailBlocks
    .filter((block) => block && block.type === 'image' && (block.fileId || block.value))
    .map((block) => block.fileId || block.value);

  const fileIds = [imageSource, thumbSource, ...rawImages, ...detailImages, ...detailImageSources].filter(isCloudFileId);
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
  const picture = uniqueList([primaryImage, ...images, ...desc]);

  const price = normalizeNumber(product.price, 0);
  const linePriceRaw = normalizeNumber(product.linePrice ?? product.price, price);
  const linePrice = Number(linePriceRaw) > Number(price) ? linePriceRaw : undefined;
  const stock = normalizeNumber(product.stock, 0);

  const result = {
    mockId: String(product.mockId || product.spuId || product.sku || product._id || ''),
    spuId: String(product.spuId || product.sku || product._id || ''),
    skuId: String(product.skuId || product.sku || ''),
    goodsName: product.goodName || product.goodsName || product.title || product.name || '',
    title: product.goodName || product.goodsName || product.title || product.name || '',
    image: primaryImage,
    primaryImage,
    primaryImageFileId: isCloudFileId(imageSource) ? imageSource : '',
    coverImage: primaryImage,
    skuImage,
    images,
    galleryImages: images,
    picture,
    price,
    linePrice,
    minSalePrice: price,
    minLinePrice: linePrice,
    maxSalePrice: price,
    maxLinePrice: linePrice,
    spuStockQuantity: stock,
    soldNum: normalizeNumber(product.soldNum, 0),
    isPutOnSale: product.status === 'OFF' || product.status === 'offline' ? 0 : 1,
    specList: Array.isArray(product.specList) ? product.specList : [],
    skuList: buildSkuList(product, skuImage, price, linePriceRaw, stock, urlMap),
    tags: Array.isArray(product.tags) ? product.tags : [],
    spuTagList: Array.isArray(product.spuTagList) ? product.spuTagList : [],
    detailImages: desc,
    desc,
    detail,
    description: product.description || '',
    status: product.status || 'online',
  };

  console.log('云函数返回的 description:', result.description);
  console.log('description 长度:', result.description ? result.description.length : 0);

  return result;
};
