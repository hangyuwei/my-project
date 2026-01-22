const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

export const toCents = (value) => {
  const num = toNumber(value);
  if (num === null) return 0;
  // 总是将元转换为分，避免歧义
  return Math.round(num * 100);
};

export const fromCents = (value) => {
  const num = toNumber(value);
  if (num === null) return 0;
  // 总是将分转换为元，避免歧义
  return Math.round(num) / 100;
};
