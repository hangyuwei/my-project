const { ensureArray } = require('./_helpers');

exports.main = async (event = {}) => {
  const items = ensureArray(event.items || event.goods || event.cartItems);
  return {
    items,
    storeName: event.storeName,
  };
};
