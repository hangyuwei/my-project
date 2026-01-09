import { cdnBase } from '../config/index';
import { ensureArray, ensureObject, pickFirst, toInt, toString } from './adaptUtils';
const imgPrefix = cdnBase;

const defaultDesc = [`${imgPrefix}/goods/details-1.png`];

const allGoods = [
  {
    saasId: '88888888',
    storeId: '1000',
    spuId: '0',
    goodsName: '航天神舟牌鱼蛋白粉固体饮料',
    skuImage: 'https://youke3.picui.cn/s1/2026/01/06/695c78fdae97a.png',
    title: '航天神舟牌鱼蛋白粉固体饮料',
    primaryImage: 'https://youke3.picui.cn/s1/2026/01/06/695c78fdae97a.png',
    images: [
      'https://youke3.picui.cn/s1/2026/01/06/695c78fdae97a.png',
      'https://youke3.picui.cn/s1/2026/01/06/695ca883deca6.png',
    ],
    video: null,
    available: 1,
    minSalePrice: 95800,
    minLinePrice: 95800,
    maxSalePrice: 95800,
    maxLinePrice: 100000,
    spuStockQuantity: 510,
    soldNum: 1020,
    isPutOnSale: 1,
    categoryIds: ['127880527393854975', '127880527393854976', '127880537778953984'],
    specList: [],
    skuList: [
      {
        skuId: '135676631',
        skuImage: 'https://youke3.picui.cn/s1/2026/01/06/695c78fdae97a.png',
        specInfo: [],
        priceInfo: [
          { priceType: 1, price: '95800', priceTypeName: null },
          { priceType: 2, price: '100000', priceTypeName: null },
        ],
        stockInfo: {
          stockQuantity: 175,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: { value: null, unit: 'KG' },
        volume: null,
        profitPrice: null,
      },
    ],
    spuTagList: [{ id: '13001', title: '限时抢购', image: null }],
    limitInfo: [
      {
        text: '限购5件',
      },
    ],
    desc: [
      'https://youke3.picui.cn/s1/2026/01/06/695ca884cd53b.png',
      
    ],
    etitle: '',
  },
  {
    saasId: '88888888',
    storeId: '1000',
    spuId: '135686633',
    title: '纯色纯棉休闲圆领短袖T恤纯白亲肤厚柔软细腻面料纯白短袖套头T恤',
    primaryImage: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/nz-08b.png',
    minSalePrice: '25900',
    minLinePrice: '31900',
    maxSalePrice: '26900',
    maxLinePrice: '31900',
    isSoldOut: false,
    images: [
      'https://tdesign.gtimg.com/miniprogram/template/retail/goods/nz-08a.png',
      'https://tdesign.gtimg.com/miniprogram/template/retail/goods/nz-08a1.png',
      'https://tdesign.gtimg.com/miniprogram/template/retail/goods/nz-08b.png',
    ],
    groupIdList: ['15029', '14023'],
    spuTagList: [
      {
        id: null,
        title: '2020夏季新款',
        image: null,
      },
    ],
    skuList: [
      {
        skuId: '135686634',
        skuImage: null,
        specInfo: [
          {
            specId: '10000',
            specTitle: null,
            specValueId: '10001',
            specValue: '白色',
          },
          {
            specId: '10002',
            specTitle: null,
            specValueId: '10003',
            specValue: 'M',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '25900',
            priceTypeName: '销售价格',
          },
          {
            priceType: 2,
            price: '31900',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: -9,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135691631',
        skuImage: null,
        specInfo: [
          {
            specId: '10000',
            specTitle: null,
            specValueId: '10001',
            specValue: '白色',
          },
          {
            specId: '10002',
            specTitle: null,
            specValueId: '11003',
            specValue: 'S',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '26900',
            priceTypeName: '销售价格',
          },
          {
            priceType: 2,
            price: '31900',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: 177,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135691632',
        skuImage: null,
        specInfo: [
          {
            specId: '10000',
            specTitle: null,
            specValueId: '10001',
            specValue: '白色',
          },
          {
            specId: '10002',
            specTitle: null,
            specValueId: '11002',
            specValue: 'L',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '26900',
            priceTypeName: '销售价格',
          },
          {
            priceType: 2,
            price: '31900',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: 194,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
    ],
    isAvailable: 1,
    spuStockQuantity: 371,
    soldNum: 1032,
    isPutOnSale: 1,
    specList: [
      {
        specId: '10000',
        title: '颜色',
        specValueList: [
          {
            specValueId: '10001',
            specId: '10000',
            saasId: '88888888',
            specValue: '白色',
            image: '',
          },
        ],
      },
      {
        specId: '10002',
        title: '尺码',
        specValueList: [
          {
            specValueId: '11003',
            specId: '10002',
            saasId: '88888888',
            specValue: 'S',
            image: '',
          },
          {
            specValueId: '10003',
            specId: '10002',
            saasId: '88888888',
            specValue: 'M',
            image: '',
          },
          {
            specValueId: '11002',
            specId: '10002',
            saasId: '88888888',
            specValue: 'L',
            image: '',
          },
        ],
      },
    ],
    promotionList: null,
    minProfitPrice: null,
    etitle: '',
    desc: [
      'https://tdesign.gtimg.com/miniprogram/template/retail/goods/nz-08c.png',
      'https://tdesign.gtimg.com/miniprogram/template/retail/goods/nz-08d.png',
    ],
  },
  {
    saasId: '88888888',
    storeId: '1000',
    spuId: '135691628',
    title: '运动连帽拉链卫衣休闲开衫长袖多色运动细绒面料运动上衣',
    images: [
      'https://tdesign.gtimg.com/miniprogram/template/retail/goods/nz-17a.png',
      'https://tdesign.gtimg.com/miniprogram/template/retail/goods/nz-17a1.png',
      'https://tdesign.gtimg.com/miniprogram/template/retail/goods/nz-17b.png',
      'https://tdesign.gtimg.com/miniprogram/template/retail/goods/nz-17b1.png',
    ],
    primaryImage: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/nz-17a.png',
    minSalePrice: '25900',
    minLinePrice: '39900',
    maxSalePrice: '25900',
    maxLinePrice: '39900',
    isSoldOut: true,
    groupIdList: ['15029', '14023'],
    spuTagList: [
      {
        id: null,
        title: '2020夏季新款',
        image: null,
      },
    ],
    skuList: [
      {
        skuId: '135686631',
        skuImage: null,
        specInfo: [
          {
            specId: '127904180600844800',
            specTitle: null,
            specValueId: '127904180768617216',
            specValue: '军绿色',
          },
          {
            specId: '127904861604820480',
            specTitle: null,
            specValueId: '127904862494014208',
            specValue: 'XS',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '25900',
            priceTypeName: '销售价格',
          },
          {
            priceType: 2,
            price: '39900',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: 0,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135686632',
        skuImage: null,
        specInfo: [
          {
            specId: '127904180600844800',
            specTitle: null,
            specValueId: '127904180768617216',
            specValue: '军绿色',
          },
          {
            specId: '127904861604820480',
            specTitle: null,
            specValueId: '127904862007474176',
            specValue: 'M',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '25900',
            priceTypeName: '销售价格',
          },
          {
            priceType: 2,
            price: '39900',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: 0,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135691629',
        skuImage: null,
        specInfo: [
          {
            specId: '127904180600844800',
            specTitle: null,
            specValueId: '127904180768617216',
            specValue: '军绿色',
          },
          {
            specId: '127904861604820480',
            specTitle: null,
            specValueId: '127904862175246592',
            specValue: 'S',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '25900',
            priceTypeName: '销售价格',
          },
          {
            priceType: 2,
            price: '39900',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: 0,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135691630',
        skuImage: null,
        specInfo: [
          {
            specId: '127904180600844800',
            specTitle: null,
            specValueId: '127904180768617216',
            specValue: '军绿色',
          },
          {
            specId: '127904861604820480',
            specTitle: null,
            specValueId: '127904861755815680',
            specValue: 'L',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '25900',
            priceTypeName: '销售价格',
          },
          {
            priceType: 2,
            price: '39900',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: 0,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
    ],
    isAvailable: 1,
    spuStockQuantity: 0,
    soldNum: 1022,
    isPutOnSale: 1,
    specList: [
      {
        specId: '127904180600844800',
        title: '颜色',
        specValueList: [
          {
            specValueId: '127904180768617216',
            specId: '127904180600844800',
            saasId: '88888888',
            specValue: '军绿色',
            image: '',
          },
        ],
      },
      {
        specId: '127904861604820480',
        title: '尺码',
        specValueList: [
          {
            specValueId: '127904862494014208',
            specId: '127904861604820480',
            saasId: '88888888',
            specValue: 'XS',
            image: '',
          },
          {
            specValueId: '127904862175246592',
            specId: '127904861604820480',
            saasId: '88888888',
            specValue: 'S',
            image: '',
          },
          {
            specValueId: '127904862007474176',
            specId: '127904861604820480',
            saasId: '88888888',
            specValue: 'M',
            image: '',
          },
          {
            specValueId: '127904861755815680',
            specId: '127904861604820480',
            saasId: '88888888',
            specValue: 'L',
            image: '',
          },
        ],
      },
    ],
    promotionList: null,
    minProfitPrice: null,
    etitle: '',
    desc: [
      'https://tdesign.gtimg.com/miniprogram/template/retail/goods/nz-17c.png',
      'https://tdesign.gtimg.com/miniprogram/template/retail/goods/nz-17d.png',
    ],
  },
  {
    saasId: '88888888',
    storeId: '1000',
    spuId: '135686623',
    title: '腾讯极光盒子4智能网络电视机顶盒6K千兆网络机顶盒4K高分辨率',
    primaryImage: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/dz-3a.png',
    images: [
      'https://tdesign.gtimg.com/miniprogram/template/retail/goods/dz-3a.png',
      'https://tdesign.gtimg.com/miniprogram/template/retail/goods/dz-3b.png',
    ],
    minSalePrice: '9900',
    minLinePrice: '16900',
    maxSalePrice: '10900',
    maxLinePrice: '16900',
    isSoldOut: false,
    groupIdList: [
      '15029',
      '15030',
      '14023',
      '127886731843219200',
      '127886732665303040',
      '127886733101511680',
      '127886733923595520',
      '14025',
      '127886726071855616',
      '14026',
      '127886727481142784',
      '127886731440566784',
    ],
    spuTagList: [
      {
        id: null,
        title: '联名系列',
        image: null,
      },
    ],
    skuList: [
      {
        skuId: '135686624',
        skuImage: null,
        specInfo: [
          {
            specId: '10000',
            specTitle: null,
            specValueId: '10001',
            specValue: '经典白',
          },
          {
            specId: '10002',
            specTitle: null,
            specValueId: '10003',
            specValue: '节能套装',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '9900',
            priceTypeName: '销售价格',
          },
          {
            priceType: 2,
            price: '16900',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: 98,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135686625',
        skuImage: null,
        specInfo: [
          {
            specId: '10000',
            specTitle: null,
            specValueId: '11000',
            specValue: '贵族青',
          },
          {
            specId: '10002',
            specTitle: null,
            specValueId: '11003',
            specValue: '经典套装',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '9900',
            priceTypeName: '销售价格',
          },
          {
            priceType: 2,
            price: '16900',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: 100,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135686626',
        skuImage: null,
        specInfo: [
          {
            specId: '10000',
            specTitle: null,
            specValueId: '11000',
            specValue: '经典白',
          },
          {
            specId: '10002',
            specTitle: null,
            specValueId: '11002',
            specValue: '尊享礼盒装',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '9900',
            priceTypeName: '销售价格',
          },
          {
            priceType: 2,
            price: '16900',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: 100,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135691622',
        skuImage: null,
        specInfo: [
          {
            specId: '10000',
            specTitle: null,
            specValueId: '10001',
            specValue: '经典白',
          },
          {
            specId: '10002',
            specTitle: null,
            specValueId: '11003',
            specValue: 'S',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '9900',
            priceTypeName: '销售价格',
          },
          {
            priceType: 2,
            price: '16900',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: 100,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135691623',
        skuImage: null,
        specInfo: [
          {
            specId: '10000',
            specTitle: null,
            specValueId: '10001',
            specValue: '经典白',
          },
          {
            specId: '10002',
            specTitle: null,
            specValueId: '11002',
            specValue: '尊享礼盒装',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '10900',
            priceTypeName: '销售价格',
          },
          {
            priceType: 2,
            price: '16900',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: 100,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135691624',
        skuImage: null,
        specInfo: [
          {
            specId: '10000',
            specTitle: null,
            specValueId: '11000',
            specValue: '贵族青',
          },
          {
            specId: '10002',
            specTitle: null,
            specValueId: '10003',
            specValue: '节能套装',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '9900',
            priceTypeName: '销售价格',
          },
          {
            priceType: 2,
            price: '16900',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: 100,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
    ],
    isAvailable: 1,
    spuStockQuantity: 598,
    soldNum: 102,
    isPutOnSale: 1,
    desc: [
      'https://tdesign.gtimg.com/miniprogram/template/retail/goods/dz-3c.png',
      'https://tdesign.gtimg.com/miniprogram/template/retail/goods/dz-3d.png',
    ],
    specList: [
      {
        specId: '10000',
        title: '颜色',
        specValueList: [
          {
            specValueId: '10001',
            specId: '10000',
            saasId: '88888888',
            specValue: '经典白',
            image: '',
          },
          {
            specValueId: '11000',
            specId: '10000',
            saasId: '88888888',
            specValue: '贵族青',
            image: '',
          },
        ],
      },
      {
        specId: '10002',
        title: '尺码',
        specValueList: [
          {
            specValueId: '11003',
            specId: '10002',
            saasId: '88888888',
            specValue: '经典套装',
            image: '',
          },
          {
            specValueId: '10003',
            specId: '10002',
            saasId: '88888888',
            specValue: '节能套装',
            image: '',
          },
          {
            specValueId: '11002',
            specId: '10002',
            saasId: '88888888',
            specValue: '尊享礼盒装',
            image: '',
          },
        ],
      },
    ],
    promotionList: null,
    minProfitPrice: null,
    etitle: '',
  },
  {
    saasId: '88888888',
    storeId: '1000',
    spuId: '135681628',
    title: '带帽午休毯虎年款多功能加厚加大加绒简约多功能午休毯连帽披肩',
    primaryImage: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/muy-3a.png',
    images: [
      'https://tdesign.gtimg.com/miniprogram/template/retail/goods/muy-3a.png',
      'https://tdesign.gtimg.com/miniprogram/template/retail/goods/muy-3a1.png',
      'https://tdesign.gtimg.com/miniprogram/template/retail/goods/muy-3b.png',
    ],
    minSalePrice: '29900',
    minLinePrice: '39900',
    maxSalePrice: '39900',
    maxLinePrice: '39900',
    isSoldOut: false,
    groupIdList: [
      '14023',
      '127886732245873408',
      '127886733487386880',
      '14025',
      '127886726071855616',
      '14026',
      '127886728420666112',
      '127886728957538048',
      '127886729779621888',
      '127886730165497088',
      '127886730652037376',
      '127886731037912576',
      '127886731440566784',
      '127886729360190464',
      '15029',
      '15030',
    ],
    spuTagList: [
      {
        id: null,
        title: '限时抢购',
        image: null,
      },
    ],
    skuList: [
      {
        skuId: '135676629',
        skuImage: null,
        specInfo: [
          {
            specId: '127904180600844800',
            specTitle: null,
            specValueId: '127904181322265856',
            specValue: '浅灰色',
          },
          {
            specId: '127904861604820480',
            specTitle: null,
            specValueId: '127904862175246592',
            specValue: 'S',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '29900',
            priceTypeName: '销售价格',
          },
          {
            priceType: 2,
            price: '39900',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: 80,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135676630',
        skuImage: null,
        specInfo: [
          {
            specId: '127904180600844800',
            specTitle: null,
            specValueId: '127904181322265856',
            specValue: '浅灰色',
          },
          {
            specId: '127904861604820480',
            specTitle: null,
            specValueId: '127904861755815680',
            specValue: 'L',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '39900',
            priceTypeName: '销售价格',
          },
          {
            priceType: 2,
            price: '39900',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: 122,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135681629',
        skuImage: null,
        specInfo: [
          {
            specId: '127904180600844800',
            specTitle: null,
            specValueId: '127904181322265856',
            specValue: '浅灰色',
          },
          {
            specId: '127904861604820480',
            specTitle: null,
            specValueId: '127904862007474176',
            specValue: 'M',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '39900',
            priceTypeName: '销售价格',
          },
          {
            priceType: 2,
            price: '39900',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: 119,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
    ],
    desc: [
      'https://tdesign.gtimg.com/miniprogram/template/retail/goods/muy-3c.png',
      'https://tdesign.gtimg.com/miniprogram/template/retail/goods/muy-3d.png',
    ],
    isAvailable: 1,
    spuStockQuantity: 321,
    soldNum: 102,
    isPutOnSale: 1,
    specList: [
      {
        specId: '127904180600844800',
        title: '颜色',
        specValueList: [
          {
            specValueId: '127904181322265856',
            specId: '127904180600844800',
            saasId: '88888888',
            specValue: '浅灰色',
            image: '',
          },
        ],
      },
      {
        specId: '127904861604820480',
        title: '尺码',
        specValueList: [
          {
            specValueId: '127904862175246592',
            specId: '127904861604820480',
            saasId: '88888888',
            specValue: 'S',
            image: '',
          },
          {
            specValueId: '127904862007474176',
            specId: '127904861604820480',
            saasId: '88888888',
            specValue: 'M',
            image: '',
          },
          {
            specValueId: '127904861755815680',
            specId: '127904861604820480',
            saasId: '88888888',
            specValue: 'L',
            image: '',
          },
        ],
      },
    ],
    promotionList: null,
    minProfitPrice: null,
    etitle: '',
  },
  {
    saasId: '88888888',
    storeId: '1000',
    spuId: '135681626',
    title: '迷你便携高颜值蓝牙无线耳机立体声只能触控式操作简约立体声耳机',
    primaryImage: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/dz-2a.png',
    images: [
      'https://tdesign.gtimg.com/miniprogram/template/retail/goods/dz-2a.png',
      'https://tdesign.gtimg.com/miniprogram/template/retail/goods/dz-2a1.png',
      'https://tdesign.gtimg.com/miniprogram/template/retail/goods/dz-2b.png',
    ],
    minSalePrice: '29000',
    minLinePrice: '40000',
    maxSalePrice: '39000',
    maxLinePrice: '40000',
    isSoldOut: false,
    groupIdList: [
      '15029',
      '15030',
      '14023',
      '127886732245873408',
      '127886733487386880',
      '14025',
      '127886726071855616',
      '14026',
      '127886728420666112',
      '127886728957538048',
      '127886730652037376',
      '127886731037912576',
    ],
    spuTagList: [
      {
        id: null,
        title: '限时抢购',
        image: null,
      },
    ],
    skuList: [
      {
        skuId: '135676627',
        skuImage: null,
        specInfo: [
          {
            specId: '10006',
            specTitle: null,
            specValueId: '10007',
            specValue: '黑色',
          },
          {
            specId: '11007',
            specTitle: null,
            specValueId: '10009',
            specValue: '简约款',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '29000',
            priceTypeName: '销售价格',
          },
          {
            priceType: 2,
            price: '40000',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: 123,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135676628',
        skuImage: null,
        specInfo: [
          {
            specId: '10006',
            specTitle: null,
            specValueId: '10007',
            specValue: '黑色',
          },
          {
            specId: '11007',
            specTitle: null,
            specValueId: '10008',
            specValue: '礼盒装',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '39000',
            priceTypeName: '销售价格',
          },
          {
            priceType: 2,
            price: '40000',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: 123,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135681627',
        skuImage: null,
        specInfo: [
          {
            specId: '10006',
            specTitle: null,
            specValueId: '10007',
            specValue: '黑色',
          },
          {
            specId: '11007',
            specTitle: null,
            specValueId: '11008',
            specValue: '带充电线简约款',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '39000',
            priceTypeName: '销售价格',
          },
          {
            priceType: 2,
            price: '40000',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: 120,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
    ],
    desc: [
      'https://tdesign.gtimg.com/miniprogram/template/retail/goods/dz-2c.png',
      'https://tdesign.gtimg.com/miniprogram/template/retail/goods/dz-2d.png',
    ],
    isAvailable: 1,
    spuStockQuantity: 366,
    soldNum: 102,
    isPutOnSale: 1,
    specList: [
      {
        specId: '10006',
        title: '颜色',
        specValueList: [
          {
            specValueId: '10007',
            specId: '10006',
            saasId: '88888888',
            specValue: '黑色',
            image: '',
          },
        ],
      },
      {
        specId: '11007',
        title: '类型',
        specValueList: [
          {
            specValueId: '10009',
            specId: '11007',
            saasId: '88888888',
            specValue: '简约款',
            image: '',
          },
          {
            specValueId: '11008',
            specId: '11007',
            saasId: '88888888',
            specValue: '带充电线简约款',
            image: '',
          },
          {
            specValueId: '10008',
            specId: '11007',
            saasId: '88888888',
            specValue: '礼盒款',
            image: '',
          },
        ],
      },
    ],
    promotionList: null,
    minProfitPrice: null,
    etitle: '',
  },
  {
    saasId: '88888888',
    storeId: '1000',
    spuId: '135681622',
    title: '简约餐盘耐热家用盘子菜盘套装多颜色简约餐盘耐热家用盘子',
    primaryImage: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/gh-1a.png',
    images: [
      'https://tdesign.gtimg.com/miniprogram/template/retail/goods/gh-1a.png',
      'https://tdesign.gtimg.com/miniprogram/template/retail/goods/gh-1a2.png',
      'https://tdesign.gtimg.com/miniprogram/template/retail/goods/gh-1b.png',
    ],
    minSalePrice: '129900',
    minLinePrice: '218000',
    maxSalePrice: '139900',
    maxLinePrice: '218000',
    isSoldOut: false,
    desc: [
      'https://tdesign.gtimg.com/miniprogram/template/retail/goods/gh-1c.png',
      'https://tdesign.gtimg.com/miniprogram/template/retail/goods/gh-1d.png',
    ],
    groupIdList: [
      '14023',
      '127886732665303040',
      '127886733101511680',
      '127886733923595520',
      '14025',
      '127886726071855616',
      '14026',
      '127886728957538048',
      '127886727481142784',
      '127886729779621888',
      '127886730165497088',
      '127886730652037376',
      '127886731440566784',
      '127886729360190464',
      '15029',
      '15030',
    ],
    spuTagList: [
      {
        id: null,
        title: '掌柜热卖',
        image: null,
      },
    ],
    skuList: [
      {
        skuId: '135676623',
        skuImage: null,
        specInfo: [
          {
            specId: '127904180600844800',
            specTitle: null,
            specValueId: '127904181506815488',
            specValue: '奶黄色',
          },
          {
            specId: '127904861604820480',
            specTitle: null,
            specValueId: '127904862175246592',
            specValue: '单盘',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '129900',
            priceTypeName: '销售价格',
          },
          {
            priceType: 2,
            price: '218000',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: 119,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135676624',
        skuImage: null,
        specInfo: [
          {
            specId: '127904180600844800',
            specTitle: null,
            specValueId: '127904181506815488',
            specValue: '奶黄色',
          },
          {
            specId: '127904861604820480',
            specTitle: null,
            specValueId: '127904861755815680',
            specValue: '盘+碗',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '139900',
            priceTypeName: '销售价格',
          },
          {
            priceType: 2,
            price: '218000',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: 116,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135681623',
        skuImage: null,
        specInfo: [
          {
            specId: '127904180600844800',
            specTitle: null,
            specValueId: '127904181506815488',
            specValue: '奶黄色',
          },
          {
            specId: '127904861604820480',
            specTitle: null,
            specValueId: '127904862007474176',
            specValue: '单盘',
          },
        ],
        priceInfo: [
          {
            priceType: 1,
            price: '139900',
            priceTypeName: '销售价格',
          },
          {
            priceType: 2,
            price: '218000',
            priceTypeName: '划线价格',
          },
        ],
        stockInfo: {
          stockQuantity: 122,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
    ],
    isAvailable: 1,
    spuStockQuantity: 357,
    soldNum: 23102,
    isPutOnSale: 1,
    specList: [
      {
        specId: '127904180600844800',
        title: '颜色',
        specValueList: [
          {
            specValueId: '127904181506815488',
            specId: '127904180600844800',
            saasId: '88888888',
            specValue: '奶黄色',
            image: '',
          },
        ],
      },
      {
        specId: '127904861604820480',
        title: '类型',
        specValueList: [
          {
            specValueId: '127904862175246592',
            specId: '127904861604820480',
            saasId: '88888888',
            specValue: '单盘',
            image: '',
          },
          {
            specValueId: '127904862007474176',
            specId: '127904861604820480',
            saasId: '88888888',
            specValue: '单碗',
            image: '',
          },
          {
            specValueId: '127904861755815680',
            specId: '127904861604820480',
            saasId: '88888888',
            specValue: '盘+碗',
            image: '',
          },
        ],
      },
    ],
    promotionList: null,
    minProfitPrice: null,
    etitle: '',
  },
  {
    saasId: '88888888',
    storeId: '1000',
    spuId: '135681624',
    title: '不锈钢刀叉勺套装家用西餐餐具ins简约耐用不锈钢金色银色可选',
    primaryImage: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/gh-2b.png',
    images: [
      'https://tdesign.gtimg.com/miniprogram/template/retail/goods/gh-2a.png',
      'https://tdesign.gtimg.com/miniprogram/template/retail/goods/gh-2a1.png',
      'https://tdesign.gtimg.com/miniprogram/template/retail/goods/gh-2b.png',
    ],
    video: null,
    available: 1,
    minSalePrice: '19900',
    minLinePrice: '19900',
    maxSalePrice: '29900',
    maxLinePrice: '29900',
    spuStockQuantity: 0,
    soldNum: 102,
    isPutOnSale: 1,
    categoryIds: ['127880527393854975', '127880527393854977', '127880526789875961'],
    specList: [
      {
        specId: '127904180600844800',
        title: '颜色',
        specValueList: [
          {
            specValueId: '127904180768617216',
            specId: null,
            saasId: null,
            specValue: '奶黄色',
            image: null,
          },
        ],
      },
      {
        specId: '127904861604820480',
        title: '数量',
        specValueList: [
          {
            specValueId: '127904862175246592',
            specId: null,
            saasId: null,
            specValue: '三件套',
            image: null,
          },
          {
            specValueId: '127904862007474176',
            specId: null,
            saasId: null,
            specValue: '六件套',
            image: null,
          },
          {
            specValueId: '127904861755815680',
            specId: null,
            saasId: null,
            specValue: '八件套',
            image: null,
          },
        ],
      },
    ],
    skuList: [
      {
        skuId: '135676625',
        skuImage: null,
        specInfo: [
          {
            specId: '127904180600844800',
            specTitle: null,
            specValueId: '127904180768617216',
            specValue: null,
          },
          {
            specId: '127904861604820480',
            specTitle: null,
            specValueId: '127904862175246592',
            specValue: null,
          },
        ],
        priceInfo: [
          { priceType: 1, price: '19900', priceTypeName: null },
          { priceType: 2, price: '29900', priceTypeName: null },
        ],
        stockInfo: {
          stockQuantity: 0,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: { value: null, unit: 'KG' },
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135676626',
        skuImage: null,
        specInfo: [
          {
            specId: '127904180600844800',
            specTitle: null,
            specValueId: '127904180768617216',
            specValue: null,
          },
          {
            specId: '127904861604820480',
            specTitle: null,
            specValueId: '127904861755815680',
            specValue: null,
          },
        ],
        priceInfo: [
          { priceType: 1, price: '29900', priceTypeName: null },
          { priceType: 2, price: '29900', priceTypeName: null },
        ],
        stockInfo: {
          stockQuantity: 0,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: { value: null, unit: 'KG' },
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135681625',
        skuImage: null,
        specInfo: [
          {
            specId: '127904180600844800',
            specTitle: null,
            specValueId: '127904180768617216',
            specValue: null,
          },
          {
            specId: '127904861604820480',
            specTitle: null,
            specValueId: '127904862007474176',
            specValue: null,
          },
        ],
        priceInfo: [
          { priceType: 1, price: '29900', priceTypeName: null },
          { priceType: 2, price: '29900', priceTypeName: null },
        ],
        stockInfo: {
          stockQuantity: 0,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: { value: null, unit: 'KG' },
        volume: null,
        profitPrice: null,
      },
    ],
    spuTagList: [{ id: '19011', title: '2020秋季新款', image: null }],
    spuLimitList: null,
    desc: [
      'https://tdesign.gtimg.com/miniprogram/template/retail/goods/gh-2c.png',
      'https://tdesign.gtimg.com/miniprogram/template/retail/goods/gh-2d.png',
    ],
    etitle: '',
  },
  {
    saasId: '88888888',
    storeId: '1000',
    spuId: '135681628',
    title: '带帽午休毯虎年款多功能加厚加大加绒简约多功能午休毯连帽披肩',
    primaryImage: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/muy-3a.png',
    images: ['https://tdesign.gtimg.com/miniprogram/template/retail/goods/muy-3a.png'],
    video: null,
    available: 1,
    minSalePrice: '29900',
    minLinePrice: '29900',
    maxSalePrice: '39900',
    maxLinePrice: '39900',
    spuStockQuantity: 321,
    soldNum: 103,
    isPutOnSale: 1,
    categoryIds: ['127880527393854975', '127880527393854977', '127880526789875961'],
    specList: [
      {
        specId: '127904180600844800',
        title: '颜色',
        specValueList: [
          {
            specValueId: '127904181322265856',
            specId: null,
            saasId: null,
            specValue: '浅灰色',
            image: null,
          },
        ],
      },
      {
        specId: '127904861604820480',
        title: '尺码',
        specValueList: [
          {
            specValueId: '127904862175246592',
            specId: null,
            saasId: null,
            specValue: 'S',
            image: null,
          },
          {
            specValueId: '127904862007474176',
            specId: null,
            saasId: null,
            specValue: 'M',
            image: null,
          },
          {
            specValueId: '127904861755815680',
            specId: null,
            saasId: null,
            specValue: 'L',
            image: null,
          },
        ],
      },
    ],
    skuList: [
      {
        skuId: '135676629',
        skuImage: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/muy-3a.png',
        specInfo: [
          {
            specId: '127904180600844800',
            specTitle: null,
            specValueId: '127904181322265856',
            specValue: null,
          },
          {
            specId: '127904861604820480',
            specTitle: null,
            specValueId: '127904862175246592',
            specValue: null,
          },
        ],
        priceInfo: [
          { priceType: 1, price: '29900', priceTypeName: null },
          { priceType: 2, price: '39900', priceTypeName: null },
        ],
        stockInfo: {
          stockQuantity: 80,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: { value: null, unit: 'KG' },
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135676630',
        skuImage: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/muy-3a.png',
        specInfo: [
          {
            specId: '127904180600844800',
            specTitle: null,
            specValueId: '127904181322265856',
            specValue: null,
          },
          {
            specId: '127904861604820480',
            specTitle: null,
            specValueId: '127904861755815680',
            specValue: null,
          },
        ],
        priceInfo: [
          { priceType: 1, price: '39900', priceTypeName: null },
          { priceType: 2, price: '39900', priceTypeName: null },
        ],
        stockInfo: {
          stockQuantity: 122,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: { value: null, unit: 'KG' },
        volume: null,
        profitPrice: null,
      },
      {
        skuId: '135681629',
        skuImage: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/muy-3a.png',
        specInfo: [
          {
            specId: '127904180600844800',
            specTitle: null,
            specValueId: '127904181322265856',
            specValue: null,
          },
          {
            specId: '127904861604820480',
            specTitle: null,
            specValueId: '127904862007474176',
            specValue: null,
          },
        ],
        priceInfo: [
          { priceType: 1, price: '39900', priceTypeName: null },
          { priceType: 2, price: '39900', priceTypeName: null },
        ],
        stockInfo: {
          stockQuantity: 119,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: { value: null, unit: 'KG' },
        volume: null,
        profitPrice: null,
      },
    ],
    spuTagList: [{ id: '13001', title: '限时抢购', image: null }],
    spuLimitList: null,
    desc: [
      'https://tdesign.gtimg.com/miniprogram/template/retail/goods/muy-3c.png',
      'https://tdesign.gtimg.com/miniprogram/template/retail/goods/muy-3d.png',
    ],
    etitle: '',
  },
];

/**
 * @param {string} id
 * @param {number} [available] 库存, 默认1
 */
export function genGood(id, available = 1) {
  const specID = ['135681624', '135681628'];
  if (specID.indexOf(id) > -1) {
    return allGoods.filter((good) => good.spuId === id)[0];
  }
  const item = allGoods[id % allGoods.length];
  return {
    ...item,
    spuId: `${id}`,
    available: available,
    desc: item?.desc || defaultDesc,
    images: item?.images || [item?.primaryImage],
  };
}

const normalizeTagList = (tags = [], fallback = []) => {
  const list = ensureArray(tags).map((tag, index) => {
    if (tag && typeof tag === 'object') {
      return {
        id: toString(pickFirst(tag.id, index)),
        title: pickFirst(tag.title, tag.name, ''),
        image: pickFirst(tag.image, null),
      };
    }
    return {
      id: toString(index),
      title: toString(tag, ''),
      image: null,
    };
  });
  return list.length ? list : ensureArray(fallback);
};

const buildSpecListFromReal = (source = {}, fallback = {}) => {
  const specs = ensureArray(source.specs || source.specList);
  if (!specs.length) return ensureArray(fallback.specList || []);

  return specs.map((spec, index) => {
    const values = ensureArray(spec.values || spec.specValueList);
    const specId = toString(pickFirst(spec.specId, spec.id, index));
    return {
      specId,
      title: pickFirst(spec.title, spec.name, ''),
      specValueList: values.map((value, valueIndex) => ({
        specValueId: toString(pickFirst(value.specValueId, value.id, valueIndex)),
        specId,
        saasId: pickFirst(value.saasId, source.saasId, fallback.saasId, null),
        specValue: pickFirst(value.specValue, value.value, value.name, ''),
        image: pickFirst(value.image, ''),
      })),
    };
  });
};

const buildSkuListFromReal = (source = {}, fallback = {}, specList = []) => {
  const skus = ensureArray(source.skus || source.skuList);
  if (!skus.length) {
    const baseSku = ensureArray(fallback.skuList)[0];
    if (!baseSku) return [];
    return [
      {
        ...baseSku,
        skuId: toString(pickFirst(source.skuId, baseSku.skuId, fallback.spuId)),
        skuImage: pickFirst(source.skuImage, source.image, baseSku.skuImage),
        priceInfo: baseSku.priceInfo,
        stockInfo: {
          ...baseSku.stockInfo,
          stockQuantity: toInt(pickFirst(source.stockQuantity, source.stock, fallback.spuStockQuantity), baseSku.stockInfo?.stockQuantity || 0),
        },
      },
    ];
  }

  return skus.map((sku, index) => {
    const info = ensureObject(sku);
    const fallbackSku = ensureArray(fallback.skuList)[index] || ensureArray(fallback.skuList)[0] || {};
    const price = pickFirst(info.price, source.price, fallback.minSalePrice);
    const linePrice = pickFirst(info.linePrice, source.linePrice, fallback.maxLinePrice, price);
    const specInfo = ensureArray(info.specInfo || info.specs).map((spec, specIndex) => ({
      specId: toString(pickFirst(spec.specId, spec.id, specIndex)),
      specTitle: pickFirst(spec.specTitle, spec.title, spec.name, null),
      specValueId: toString(pickFirst(spec.specValueId, spec.valueId, specIndex)),
      specValue: pickFirst(spec.specValue, spec.value, ''),
    }));
    const weight = info.weight !== undefined ? info.weight : fallbackSku.weight;
    const volume = info.volume !== undefined ? info.volume : fallbackSku.volume;

    return {
      skuId: toString(pickFirst(info.skuId, info.id, index)),
      skuImage: pickFirst(info.skuImage, info.image, source.image, fallback.skuImage),
      specInfo,
      priceInfo: [
        { priceType: 1, price: toString(price), priceTypeName: null },
        { priceType: 2, price: toString(linePrice), priceTypeName: null },
      ],
      stockInfo: {
        stockQuantity: toInt(pickFirst(info.stockQuantity, info.stock, source.stock, fallback.spuStockQuantity), 0),
        safeStockQuantity: 0,
        soldQuantity: 0,
      },
      weight,
      volume,
      profitPrice: null,
    };
  });
};

export function adaptGoodDetail(real = {}) {
  if (real && real.spuId && Array.isArray(real.skuList)) return real;
  const source = ensureObject(real);
  const base = genGood(pickFirst(source.mockId, source.id, source.spuId, 0));

  const goodsName = pickFirst(source.goodsName, source.name, source.title, base.goodsName || base.title);
  const primaryImage = pickFirst(source.primaryImage, source.image, base.primaryImage);
  const images = ensureArray(source.images).length
    ? source.images
    : primaryImage
      ? [primaryImage].concat(ensureArray(base.images).slice(1))
      : base.images;

  const specList = buildSpecListFromReal(source, base);
  const skuList = buildSkuListFromReal(source, base, specList);
  const rawTags = source.tags || source.spuTagList;
  const spuTagList = normalizeTagList(rawTags, []);
  const salePrice = pickFirst(source.minSalePrice, source.price, base.minSalePrice);
  let linePrice = pickFirst(source.maxLinePrice, source.linePrice, source.minLinePrice);
  if (linePrice !== undefined && linePrice !== null && linePrice !== '') {
    const saleNum = Number(salePrice);
    const lineNum = Number(linePrice);
    if (Number.isFinite(saleNum) && Number.isFinite(lineNum) && lineNum <= saleNum) {
      linePrice = undefined;
    }
  } else {
    linePrice = undefined;
  }
  const detail = ensureArray(source.detail || source.detailBlocks || []).map((block) => {
    if (block && block.type === 'text' && typeof block.value === 'string') {
      return { ...block, value: block.value.replace(/\\n/g, '\n') };
    }
    return block;
  });

  return {
    ...base,
    saasId: pickFirst(source.saasId, base.saasId),
    storeId: pickFirst(source.storeId, base.storeId),
    spuId: toString(pickFirst(source.mockId, source.id, source.spuId), base.spuId),
    goodsName,
    skuImage: pickFirst(source.skuImage, source.image, base.skuImage),
    title: goodsName,
    primaryImage,
    images,
    minSalePrice: salePrice,
    minLinePrice: linePrice,
    maxSalePrice: pickFirst(source.maxSalePrice, source.price, salePrice),
    maxLinePrice: linePrice,
    spuStockQuantity: toInt(pickFirst(source.spuStockQuantity, source.stockQuantity, source.stock, base.spuStockQuantity), base.spuStockQuantity),
    soldNum: pickFirst(source.soldNum, source.sold, base.soldNum),
    isPutOnSale: pickFirst(source.isPutOnSale, base.isPutOnSale),
    specList,
    skuList,
    spuTagList,
    detail,
    desc: ensureArray(source.desc || source.detailImages || base.desc),
    etitle: pickFirst(source.etitle, base.etitle),
  };
}

export function adaptGoodsListItem(real = {}, options = {}) {
  const detail = real && real.spuId && Array.isArray(real.skuList) ? real : adaptGoodDetail(real);
  const sku = ensureArray(detail.skuList)[0] || {};
  const goodsName = detail.goodsName || detail.title;
  const skuImage = detail.skuImage || detail.primaryImage;
  const stockQuantity = toInt(
    pickFirst(detail.spuStockQuantity, sku.stockInfo?.stockQuantity, detail.stockQuantity, 0),
    0,
  );
  const tags = [];
  const originPrice =
    detail.maxLinePrice && detail.minSalePrice && Number(detail.maxLinePrice) > Number(detail.minSalePrice)
      ? detail.maxLinePrice
      : undefined;

  return {
    spuId: detail.spuId,
    skuId: pickFirst(sku.skuId, detail.spuId),
    storeId: pickFirst(detail.storeId, 'local'),
    thumb: pickFirst(skuImage, detail.primaryImage, ''),
    title: goodsName,
    goodsName,
    skuImage: pickFirst(skuImage, ''),
    price: pickFirst(detail.minSalePrice, detail.price),
    originPrice,
    stockQuantity,
    tags,
  };
}
