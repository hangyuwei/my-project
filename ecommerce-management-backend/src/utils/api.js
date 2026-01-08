const handleResponse = async (res) => {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }
  return data?.data ?? data;
};

const apiFetch = async (path, options = {}) => {
  const headers = { ...(options.headers || {}) };
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(path, {
    ...options,
    headers,
  });
  return handleResponse(res);
};

export const getDashboard = () => apiFetch('/api/dashboard');

export const getGoods = ({ page = 1, pageSize = 10, search = '' } = {}) =>
  apiFetch(`/api/goods?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`);

export const saveGoods = (payload) =>
  apiFetch('/api/goods', { method: 'POST', body: JSON.stringify(payload) });

export const deleteGoods = (id) =>
  apiFetch(`/api/goods/${id}`, { method: 'DELETE' });

export const updateGoodsStatus = (id, status) =>
  apiFetch(`/api/goods/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });

export const getPromotions = ({ page = 1, pageSize = 10, search = '' } = {}) =>
  apiFetch(`/api/promotions?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`);

export const savePromotion = (payload) =>
  apiFetch('/api/promotions', { method: 'POST', body: JSON.stringify(payload) });

export const deletePromotion = (id) =>
  apiFetch(`/api/promotions/${id}`, { method: 'DELETE' });

export const getUsers = ({ page = 1, pageSize = 10, search = '' } = {}) =>
  apiFetch(`/api/users?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`);

export const saveUser = (payload) =>
  apiFetch('/api/users', { method: 'POST', body: JSON.stringify(payload) });

export const deleteUser = (id) =>
  apiFetch(`/api/users/${id}`, { method: 'DELETE' });

export const getUserOrders = (userId) =>
  apiFetch(`/api/orders?userId=${encodeURIComponent(userId)}&page=1&pageSize=50`);

export const getOrders = ({ page = 1, pageSize = 10, search = '', status = '' } = {}) =>
  apiFetch(
    `/api/orders?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`,
  );

export const saveOrder = (payload) =>
  apiFetch('/api/orders', { method: 'POST', body: JSON.stringify(payload) });

export const deleteOrder = (id) =>
  apiFetch(`/api/orders/${id}`, { method: 'DELETE' });

export const batchUpdateOrders = (ids, status) =>
  apiFetch('/api/orders/batch', { method: 'PATCH', body: JSON.stringify({ ids, status }) });

export const getOrderDetail = (id) =>
  apiFetch(`/api/orders/${id}/detail`);

