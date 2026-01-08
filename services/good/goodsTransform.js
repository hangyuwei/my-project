const DEFAULT_SPEC_ID = 'spec-default';
const DEFAULT_SPEC_VALUE_ID = 'spec-value-default';

const toNumber = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  return Math.round(num);
};

const toInt = (value) => {
  const num = parseInt(value, 10);
  return Number.isNaN(num) ? 0 : num;
};

const toArray = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);

export function normalizeGoodsRecord(record = {}) {
  const images = toArray(record.images);
  const detailImages = toArray(record.detailImages);
  const price = toNumber(record.price);
  let originPrice = toNumber(record.originPrice || price);
  if (!originPrice || originPrice < price) originPrice = price;
  const stock = toInt(record.stock);

  return {
    spuId: record.spuId || '',
    title: (record.title || '').trim(),
    price,
    originPrice,
    stock: stock < 0 ? 0 : stock,
    images,
    detailImages: detailImages.length ? detailImages : images,
    tags: toArray(record.tags),
    intro: record.intro || '',
    createdAt: record.createdAt || Date.now(),
    isPutOnSale: record.isPutOnSale === 0 ? 0 : 1,
  };
}

export function recordToListItem(record = {}) {
  const normalized = normalizeGoodsRecord(record);
  return {
    spuId: normalized.spuId,
    thumb: normalized.images[0] || '',
    title: normalized.title,
    price: normalized.price,
    originPrice: normalized.originPrice,
    tags: normalized.tags,
    stock: normalized.stock,
    isPutOnSale: normalized.isPutOnSale,
  };
}

export function recordToDetail(record = {}) {
  const normalized = normalizeGoodsRecord(record);
  const primaryImage = normalized.images[0] || '';

  return {
    saasId: 'local',
    storeId: 'local',
    spuId: normalized.spuId,
    title: normalized.title,
    primaryImage,
    images: normalized.images,
    video: null,
    available: normalized.isPutOnSale ? 1 : 0,
    minSalePrice: normalized.price,
    minLinePrice: normalized.originPrice,
    maxSalePrice: normalized.price,
    maxLinePrice: normalized.originPrice,
    spuStockQuantity: normalized.stock,
    soldNum: 0,
    isPutOnSale: normalized.isPutOnSale,
    categoryIds: [],
    specList: [
      {
        specId: DEFAULT_SPEC_ID,
        title: '??',
        specValueList: [
          {
            specValueId: DEFAULT_SPEC_VALUE_ID,
            specId: null,
            saasId: null,
            specValue: '??',
            image: null,
          },
        ],
      },
    ],
    skuList: [
      {
        skuId: `${normalized.spuId || 'spu'}-sku-default`,
        skuImage: primaryImage,
        specInfo: [
          {
            specId: DEFAULT_SPEC_ID,
            specTitle: null,
            specValueId: DEFAULT_SPEC_VALUE_ID,
            specValue: null,
          },
        ],
        price: normalized.price,
        priceInfo: [
          { priceType: 1, price: String(normalized.price), priceTypeName: null },
          { priceType: 2, price: String(normalized.originPrice), priceTypeName: null },
        ],
        stockInfo: {
          stockQuantity: normalized.stock,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: { value: null, unit: 'KG' },
        volume: null,
        profitPrice: null,
      },
    ],
    desc: normalized.detailImages,
    limitInfo: [{ text: '' }],
    spuTagList: normalized.tags.map((tag) => ({ title: tag })),
  };
}
