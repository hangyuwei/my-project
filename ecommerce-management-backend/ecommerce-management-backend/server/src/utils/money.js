const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

export const toCents = (value) => {
  const num = toNumber(value);
  if (num === null) return 0;
  if (Number.isInteger(num) && num >= 1000) return num;
  return Math.round(num * 100);
};

export const fromCents = (value) => {
  const num = toNumber(value);
  if (num === null) return 0;
  if (num >= 1000) return Math.round(num) / 100;
  return num;
};
