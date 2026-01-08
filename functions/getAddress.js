exports.main = async (event = {}) => {
  const id = event.id ?? event.addressId ?? 0;
  return { id };
};
