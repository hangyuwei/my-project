const { generateId } = require('./_helpers');

exports.main = async (event = {}) => {
  const orderNo = event.orderNo || `O${Date.now()}`;
  return {
    isSuccess: true,
    tradeNo: orderNo,
    transactionId: generateId(),
    orderNo,
  };
};
