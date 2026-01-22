import { callCloudFunction } from './_utils/cloud';

export function call(name, data = {}) {
  return callCloudFunction(name, data);
}
