exports.main = async (event = {}) => {
  const parsed = Number(event.len);
  const len = Number.isFinite(parsed) ? parsed : 10;
  const list = Array.from({ length: len }, (_, index) => ({ id: index }));
  return list;
};
