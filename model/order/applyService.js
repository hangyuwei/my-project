import { mockIp, mockReqId } from '../../utils/mock';
import { ensureArray, ensureObject, pickFirst, toString } from '../adaptUtils';

const orderResps = [
  {
    data: {
      saasId: '88888888',
      uid: '88888888205468',
      storeId: '1000',
      skuId: '',
      numOfSku: 1,
      numOfSkuAvailable: 1,
      refundableAmount: '0',
      refundableDiscountAmount: '0',
      shippingFeeIncluded: '0',
      paidAmountEach: '0',
      boughtQuantity: 1,
      orderNo: '',
      goodsInfo: {
        goodsName: '',
        skuImage: '',
        specInfo: [],
      },
    },
    code: 'Success',
    msg: null,
    requestId: mockReqId(),
    clientIp: mockIp(),
    rt: 36,
    success: true,
  },
];

export function genRightsPreview(params) {
  // 只保留一个商品时，直接返回第一条，避免 orderNo/skuId 传参不匹配导致页面拿不到数据
  return orderResps[0];
}

export function genApplyReasonList(params) {
  const resp = {
    data: {
      saasId: '70000001',
      rightsReasonList: [
        { id: '1', desc: '实际商品与描述不符' },
        { id: '2', desc: '质量问题' },
        { id: '3', desc: '少件/漏发' },
        { id: '4', desc: '包装/商品/污迹/裂痕/变形' },
        { id: '5', desc: '发货太慢' },
        { id: '6', desc: '物流配送太慢' },
        { id: '7', desc: '商家发错货' },
        { id: '8', desc: '不喜欢' },
      ],
    },
    code: 'Success',
    msg: null,
    requestId: mockReqId(),
    clientIp: mockIp(),
    rt: 6,
    success: true,
  };

  // 未收货对应的原因列表
  if (params.rightsReasonType === 'REFUND_MONEY') {
    resp.data.rightsReasonList = [
      { id: '9', desc: '空包裹' },
      { id: '10', desc: '快递/物流一直未送到' },
      { id: '11', desc: '货物破损已拒签' },
      { id: '12', desc: '不喜欢' },
    ];
  }
  return resp;
}

export function applyService() {
  const resp = {
    data: {
      rightsNo: '123123423',
      saasId: '70000001',
      uid: '700000011070005',
      storeId: '542',
      result: null,
    },
    code: 'Success',
    msg: null,
    requestId: mockReqId(),
    clientIp: mockIp(),
    rt: 269,
    success: true,
  };
  return resp;
}

export function adaptRightsPreview(real = {}) {
  if (real && real.data && real.data.goodsInfo) return real;
  const source = ensureObject(real);
  const base = genRightsPreview();
  const data = ensureObject(source.data || source);
  if (!Object.keys(data).length) return base;

  return {
    ...base,
    data: {
      ...base.data,
      saasId: pickFirst(data.saasId, base.data.saasId),
      uid: pickFirst(data.uid, base.data.uid),
      storeId: pickFirst(data.storeId, base.data.storeId),
      skuId: toString(pickFirst(data.skuId, data.variantId, base.data.skuId)),
      numOfSku: pickFirst(data.numOfSku, base.data.numOfSku),
      numOfSkuAvailable: pickFirst(data.numOfSkuAvailable, base.data.numOfSkuAvailable),
      refundableAmount: pickFirst(data.refundableAmount, base.data.refundableAmount),
      refundableDiscountAmount: pickFirst(data.refundableDiscountAmount, base.data.refundableDiscountAmount),
      shippingFeeIncluded: pickFirst(data.shippingFeeIncluded, base.data.shippingFeeIncluded),
      paidAmountEach: pickFirst(data.paidAmountEach, base.data.paidAmountEach),
      boughtQuantity: pickFirst(data.boughtQuantity, base.data.boughtQuantity),
      orderNo: pickFirst(data.orderNo, base.data.orderNo),
      goodsInfo: {
        ...base.data.goodsInfo,
        goodsName: pickFirst(data.goodsInfo?.goodsName, data.goodsName, base.data.goodsInfo.goodsName),
        skuImage: pickFirst(data.goodsInfo?.skuImage, data.image, base.data.goodsInfo.skuImage),
        specInfo: ensureArray(data.goodsInfo?.specInfo || data.specInfo || base.data.goodsInfo.specInfo),
      },
    },
  };
}

export function adaptApplyReasonList(real = {}) {
  if (real && real.data && Array.isArray(real.data.rightsReasonList)) return real;
  const source = ensureObject(real);
  const list = ensureArray(source.rightsReasonList || source.list || source.items);
  if (!list.length) return genApplyReasonList({ rightsReasonType: source.rightsReasonType });

  return {
    data: {
      saasId: pickFirst(source.saasId, '70000001'),
      rightsReasonList: list.map((item, index) => ({
        id: toString(pickFirst(item.id, index)),
        desc: pickFirst(item.desc, item.reason, ''),
      })),
    },
    code: 'Success',
    msg: null,
    requestId: mockReqId(),
    clientIp: mockIp(),
    rt: 0,
    success: true,
  };
}

export function adaptApplyService(real = {}) {
  console.log('[adaptApplyService] 输入数据:', JSON.stringify(real, null, 2));

  // 如果已经有正确格式的数据，直接返回
  if (real && real.data && real.data.rightsNo) {
    console.log('[adaptApplyService] 已有rightsNo，直接返回');
    return real;
  }

  const source = ensureObject(real);
  const data = ensureObject(source.data || source);

  console.log('[adaptApplyService] 解析后的data:', JSON.stringify(data, null, 2));

  // 获取售后单号，优先使用 afterSaleNo
  const rightsNo = data.afterSaleNo || data.rightsNo;

  if (!rightsNo) {
    console.error('[adaptApplyService] 未找到售后单号!', { data });
    throw new Error('售后单号获取失败');
  }

  console.log('[adaptApplyService] 最终售后单号:', rightsNo);

  const result = {
    data: {
      rightsNo,
      saasId: pickFirst(data.saasId, '70000001'),
      uid: pickFirst(data.uid, '700000011070005'),
      storeId: pickFirst(data.storeId, '542'),
      result: data.result ?? null,
    },
    code: 'Success',
    msg: null,
    requestId: mockReqId(),
    clientIp: mockIp(),
    rt: 0,
    success: true,
  };

  console.log('[adaptApplyService] 适配结果:', JSON.stringify(result, null, 2));
  return result;
}
