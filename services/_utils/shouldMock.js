import { config } from '../../config/index';

const normalizeList = (value) => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

export function shouldMock(serviceKey) {
  const realOverrides = normalizeList(config.realServices);
  if (realOverrides.includes(serviceKey)) return false;

  if (config.useMock) return true;

  if (realOverrides.length) {
    return !realOverrides.includes(serviceKey);
  }

  const mockOverrides = normalizeList(config.mockServices);
  return mockOverrides.includes(serviceKey);
}
