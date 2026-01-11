const { readDb, ensureArray, findById, toNumber, toString } = require('./_helpers');

exports.main = async (event = {}) => {
  const db = readDb();
  const orderNo = event.orderNo || event.parameter;
  const order = findById(ensureArray(db.orders), orderNo);
  if (!order) return {};
  const item = order?.items?.[0] || null;
  if (!item) return {};
  const quantity = toNumber(event.numOfSku || item?.quantity || 1, 1);
  const price = toNumber(item?.price || 0, 0);
  const total = price * quantity;

  return {
    orderNo: toString(orderNo, ''),
    skuId: toString(event.skuId || item?.skuId, ''),
    spuId: toString(event.spuId || item?.spuId, ''),
    numOfSku: quantity,
    numOfSkuAvailable: toNumber(item?.quantity || quantity, quantity),
    refundableAmount: total,
    refundableDiscountAmount: 0,
    shippingFeeIncluded: 0,
    paidAmountEach: price,
    boughtQuantity: toNumber(item?.quantity || quantity, quantity),
    goodsInfo: {
      goodsName: item?.name || event.goodsName || '',
      skuImage: item?.image || event.image || '',
      specInfo: ensureArray(item?.specs),
    },
  };
};
