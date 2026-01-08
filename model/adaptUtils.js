export const toNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

export const toInt = (value, fallback = 0) => {
  const num = parseInt(value, 10);
  return Number.isFinite(num) ? num : fallback;
};

export const toString = (value, fallback = '') => {
  if (value === undefined || value === null) return fallback;
  return String(value);
};

export const ensureArray = (value) => (Array.isArray(value) ? value : []);

export const pickFirst = (...values) => {
  for (let i = 0; i < values.length; i += 1) {
    const value = values[i];
    if (value !== undefined && value !== null) return value;
  }
  return undefined;
};

export const ensureObject = (value) => (value && typeof value === 'object' ? value : {});
