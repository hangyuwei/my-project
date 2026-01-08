const state = {
  token: localStorage.getItem('admin_token') || '',
  view: 'products',
  collection: 'products',
  page: 1,
  pageSize: 10,
  total: 0,
  editingId: null,
  logType: 'functions',
};

const productState = {
  list: [],
  editingId: null,
  form: {
    _id: '',
    title: '',
    subTitle: '',
    status: 'ON',
    price: '',
    linePrice: '',
    stock: '',
    coverFileId: '',
    galleryFileIds: [],
    detailBlocks: [],
  },
  coverUrl: '',
  gallery: [],
};

const COLLECTIONS = ['products', 'home', 'categories', 'orders', 'rights', 'files', 'settings'];

const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => Array.from(document.querySelectorAll(selector));

const statusEl = qs('#statusText');
const baseUrlEl = qs('#baseUrl');

const setStatus = (message) => {
  if (statusEl) statusEl.textContent = message || 'Ready';
};

const showLogin = (message) => {
  qs('#loginOverlay').classList.remove('is-hidden');
  qs('#loginError').textContent = message || '';
};

const hideLogin = () => {
  qs('#loginOverlay').classList.add('is-hidden');
  qs('#loginError').textContent = '';
};

const apiFetch = async (url, options = {}) => {
  const headers = { ...(options.headers || {}) };
  const isForm = options.body instanceof FormData;
  if (!isForm && options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (state.token) {
    headers['x-admin-token'] = state.token;
  }
  const res = await fetch(url, {
    credentials: 'include',
    ...options,
    headers,
  });
  if (res.status === 401) {
    showLogin('Admin auth required.');
    throw new Error('Unauthorized');
  }
  const data = await res.json().catch(() => null);
  if (!data) return null;
  if (data.code && data.code !== 'Success') {
    throw new Error(data.msg || data.code);
  }
  return data;
};

const unwrap = (payload) => (payload && payload.data !== undefined ? payload.data : payload);

const switchView = (name) => {
  state.view = name;
  qsa('.nav-btn').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.view === name);
  });
  qsa('.view').forEach((view) => {
    view.classList.toggle('is-active', view.id === `view-${name}`);
  });
};

const formatTime = (value) => {
  if (!value) return '-';
  try {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
  } catch (err) {
    return String(value);
  }
};

const prettyJson = (data) => JSON.stringify(data, null, 2);

const toCent = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  return Math.round(num * 100);
};

const toYuan = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '';
  return (num / 100).toString();
};

const resetProductForm = () => {
  productState.editingId = null;
  productState.form = {
    _id: '',
    title: '',
    subTitle: '',
    status: 'ON',
    price: '',
    linePrice: '',
    stock: '',
    coverFileId: '',
    galleryFileIds: [],
    detailBlocks: [],
  };
  productState.coverUrl = '';
  productState.gallery = [];
};

const loadCollections = () => {
  const select = qs('#collectionSelect');
  select.innerHTML = '';
  COLLECTIONS.forEach((name) => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    select.appendChild(option);
  });
  select.value = state.collection;
};

const getCurrentCollection = () => {
  const manual = qs('#collectionInput').value.trim();
  return manual || qs('#collectionSelect').value;
};

const renderTable = (list = []) => {
  const table = qs('#collectionTable');
  table.innerHTML = '';
  list.forEach((item) => {
    const row = document.createElement('tr');
    const summary = JSON.stringify(item).slice(0, 80);
    row.innerHTML = `
      <td class="mono">${item._id || item.id || '-'}</td>
      <td>${item.name || item.title || item.goodsName || '-'}</td>
      <td>${formatTime(item.updatedAt || item.createdAt)}</td>
      <td>${summary}</td>
      <td><button data-id="${item._id || item.id}">Edit</button></td>
    `;
    row.querySelector('button').addEventListener('click', () => {
      state.editingId = item._id || item.id;
      qs('#docEditor').value = prettyJson(item);
      setStatus(`Editing ${state.collection}`);
    });
    table.appendChild(row);
  });
};

const renderProductTable = (list = []) => {
  const table = qs('#productTable');
  table.innerHTML = '';
  list.forEach((item) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.coverUrl ? `<img class="thumb" src="${item.coverUrl}" alt="cover" />` : '-'}</td>
      <td>${item.title || '-'}</td>
      <td>${toYuan(item.price)}</td>
      <td>${item.stock ?? '-'}</td>
      <td>${item.status || 'ON'}</td>
      <td>${formatTime(item.updatedAt)}</td>
      <td><button data-id="${item._id}">Edit</button></td>
    `;
    row.querySelector('button').addEventListener('click', () => {
      loadProductDetail(item._id);
    });
    table.appendChild(row);
  });
};

const renderDetailBlocks = () => {
  const container = qs('#detailBlocks');
  container.innerHTML = '';
  productState.form.detailBlocks.forEach((block, index) => {
    const item = document.createElement('div');
    item.className = 'detail-block';
    const header = document.createElement('div');
    header.className = 'detail-block__header';
    header.innerHTML = `
      <strong>${block.type}</strong>
      <button data-index="${index}" class="danger">Remove</button>
    `;
    header.querySelector('button').addEventListener('click', () => {
      productState.form.detailBlocks.splice(index, 1);
      renderDetailBlocks();
    });
    item.appendChild(header);

    if (block.type === 'text' || block.type === 'richtext') {
      const textarea = document.createElement('textarea');
      textarea.className = 'detail-block__textarea';
      textarea.value = block.value || '';
      textarea.placeholder = block.type === 'text' ? 'Text content' : 'Richtext HTML';
      textarea.addEventListener('input', (event) => {
        block.value = event.target.value;
      });
      item.appendChild(textarea);
    }

    if (block.type === 'image') {
      const img = document.createElement('img');
      img.className = 'detail-block__image';
      img.src = block.url || '';
      item.appendChild(img);

      const input = document.createElement('input');
      input.type = 'file';
      input.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const uploaded = await uploadProductFile(file);
        if (!uploaded) return;
        block.fileId = uploaded.fileId;
        block.url = uploaded.url;
        renderDetailBlocks();
      });
      item.appendChild(input);
    }

    container.appendChild(item);
  });
};

const renderProductForm = () => {
  qs('#productTitle').value = productState.form.title || '';
  qs('#productSubTitle').value = productState.form.subTitle || '';
  qs('#productStatusField').value = productState.form.status || 'ON';
  qs('#productPrice').value = productState.form.price !== '' ? toYuan(productState.form.price) : '';
  qs('#productLinePrice').value =
    productState.form.linePrice !== '' ? toYuan(productState.form.linePrice) : '';
  qs('#productStock').value = productState.form.stock ?? '';
  qs('#productCoverPreview').src = productState.coverUrl || '';

  const gallery = qs('#productGalleryList');
  gallery.innerHTML = '';
  productState.gallery.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${item.url}" alt="gallery" />
      <div class="controls">
        <button class="danger" data-index="${index}">Remove</button>
      </div>
    `;
    card.querySelector('button').addEventListener('click', () => {
      productState.form.galleryFileIds.splice(index, 1);
      productState.gallery.splice(index, 1);
      renderProductForm();
    });
    gallery.appendChild(card);
  });

  renderDetailBlocks();
};

const syncProductFormInputs = () => {
  const titleEl = qs('#productTitle');
  const subTitleEl = qs('#productSubTitle');
  const statusEl = qs('#productStatusField');
  const priceEl = qs('#productPrice');
  const linePriceEl = qs('#productLinePrice');
  const stockEl = qs('#productStock');

  if (titleEl) productState.form.title = titleEl.value.trim();
  if (subTitleEl) productState.form.subTitle = subTitleEl.value.trim();
  if (statusEl) productState.form.status = statusEl.value;

  if (priceEl) {
    const value = priceEl.value.trim();
    productState.form.price = value === '' ? '' : toCent(value);
  }

  if (linePriceEl) {
    const value = linePriceEl.value.trim();
    productState.form.linePrice = value === '' ? '' : toCent(value);
  }

  if (stockEl) {
    const value = stockEl.value.trim();
    productState.form.stock = value === '' ? '' : Number(value);
  }
};

const loadProducts = async () => {
  const q = qs('#productSearch').value.trim();
  const status = qs('#productStatus').value;
  setStatus('Loading products...');
  const payload = await apiFetch(`/admin/api/products?q=${encodeURIComponent(q)}&status=${encodeURIComponent(status)}`);
  const data = unwrap(payload) || {};
  productState.list = data.list || [];
  renderProductTable(productState.list);
  setStatus('Loaded products');
};

const loadProductDetail = async (id) => {
  setStatus('Loading product...');
  const payload = await apiFetch(`/admin/api/products/${id}`);
  const product = unwrap(payload) || {};
  productState.editingId = product._id || id;
  productState.form = {
    _id: product._id || id,
    title: product.title || product.name || product.goodsName || '',
    subTitle: product.subTitle || '',
    status: product.status || 'ON',
    price: product.price || 0,
    linePrice: product.linePrice || 0,
    stock: product.stock ?? 0,
    coverFileId: product.coverFileId || '',
    galleryFileIds: Array.isArray(product.galleryFileIds) ? product.galleryFileIds : [],
    detailBlocks: Array.isArray(product.detailBlocks) ? product.detailBlocks : [],
  };
  productState.coverUrl = product.coverUrl || '';
  productState.gallery = (product.galleryFileIds || []).map((fileId, index) => ({
    fileId,
    url: product.galleryUrls ? product.galleryUrls[index] : '',
  }));
  productState.form.detailBlocks = (product.detailBlocks || []).map((block) => {
    if (block.type === 'image') {
      return { ...block, url: block.url || '' };
    }
    return { ...block };
  });
  renderProductForm();
  setStatus('Editing product');
};

const uploadProductFile = async (file) => {
  const form = new FormData();
  form.append('file', file);
  setStatus('Uploading...');
  try {
    const payload = await apiFetch('/storage/upload', {
      method: 'POST',
      body: form,
    });
    const data = unwrap(payload) || {};
    if (!data.fileId) {
      setStatus('Upload failed');
      return null;
    }
    setStatus('Uploaded');
    return data;
  } catch (err) {
    setStatus(`Upload failed: ${err.message}`);
    return null;
  }
};

const saveProduct = async () => {
  const title = qs('#productTitle').value.trim();
  const subTitle = qs('#productSubTitle').value.trim();
  const status = qs('#productStatusField').value;
  const price = toCent(qs('#productPrice').value.trim());
  const linePrice = toCent(qs('#productLinePrice').value.trim());
  const stock = Number(qs('#productStock').value.trim());

  if (!title) {
    setStatus('Title required');
    return;
  }
  if (price === null) {
    setStatus('Price required');
    return;
  }
  if (!Number.isFinite(stock)) {
    setStatus('Stock required');
    return;
  }

  const detailBlocks = productState.form.detailBlocks
    .map((block) => {
      if (!block) return null;
      if (block.type === 'image') {
        if (!block.fileId) return null;
        return { type: 'image', fileId: block.fileId };
      }
      if (block.type === 'richtext') {
        if (!block.value) return null;
        return { type: 'richtext', value: block.value };
      }
      if (!block.value) return null;
      return { type: 'text', value: block.value };
    })
    .filter(Boolean);

  const product = {
    _id: productState.editingId || undefined,
    title,
    subTitle,
    status,
    price,
    linePrice: linePrice ?? price,
    stock,
    coverFileId: productState.form.coverFileId,
    galleryFileIds: productState.form.galleryFileIds || [],
    detailBlocks,
  };

  try {
    await apiFetch('/admin/api/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
    setStatus('Saved');
    await loadProducts();
  } catch (err) {
    setStatus(`Save failed: ${err.message}`);
  }
};

const deleteProduct = async () => {
  if (!productState.editingId) {
    setStatus('Pick a product first');
    return;
  }
  await apiFetch(`/admin/api/products/${productState.editingId}`, { method: 'DELETE' });
  setStatus('Deleted');
  resetProductForm();
  renderProductForm();
  await loadProducts();
};

const loadCollection = async () => {
  const collection = getCurrentCollection();
  state.collection = collection;
  const q = qs('#collectionSearch').value.trim();
  const url = `/db/${collection}?page=${state.page}&pageSize=${state.pageSize}&q=${encodeURIComponent(q)}`;
  setStatus(`Loading ${collection}...`);
  const payload = await apiFetch(url);
  const data = unwrap(payload) || {};
  state.total = data.total || 0;
  renderTable(data.list || []);
  const totalPages = Math.max(1, Math.ceil(state.total / state.pageSize));
  qs('#pageInfo').textContent = `${state.page} / ${totalPages}`;
  setStatus(`Loaded ${collection}`);
};

const saveDocument = async () => {
  const collection = getCurrentCollection();
  let doc;
  try {
    doc = JSON.parse(qs('#docEditor').value);
  } catch (err) {
    setStatus('Invalid JSON');
    return;
  }
  const id = state.editingId || doc._id || doc.id;
  if (id) {
    await apiFetch(`/db/${collection}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(doc),
    });
    setStatus('Updated document');
  } else {
    await apiFetch(`/db/${collection}`, {
      method: 'POST',
      body: JSON.stringify(doc),
    });
    setStatus('Created document');
  }
  state.editingId = null;
  await loadCollection();
};

const deleteDocument = async () => {
  const collection = getCurrentCollection();
  const id = state.editingId;
  if (!id) {
    setStatus('Pick a document first');
    return;
  }
  await apiFetch(`/db/${collection}/${id}`, { method: 'DELETE' });
  setStatus('Deleted document');
  state.editingId = null;
  qs('#docEditor').value = '{}';
  await loadCollection();
};

const uploadStorage = async () => {
  const input = qs('#storageFile');
  if (!input.files.length) return;
  const form = new FormData();
  form.append('file', input.files[0]);
  setStatus('Uploading...');
  const payload = await apiFetch('/storage/upload', {
    method: 'POST',
    body: form,
  });
  const data = unwrap(payload);
  setStatus(`Uploaded ${data?.name || data?.fileId || ''}`);
  input.value = '';
  await loadStorage();
};

const loadStorage = async () => {
  const prefix = qs('#storagePrefix').value.trim();
  const payload = await apiFetch(`/storage/list?prefix=${encodeURIComponent(prefix)}`);
  const data = unwrap(payload) || {};
  const list = data.list || [];
  const container = qs('#storageList');
  container.innerHTML = '';
  list.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'card';
    const isImage = /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(item.name || '');
    card.innerHTML = `
      ${isImage ? `<img src="${item.url}" alt="${item.name}" />` : ''}
      <div class="mono">${item.name}</div>
      <div class="controls">
        <button class="ghost" data-copy="${item.url}">Copy URL</button>
        <button class="danger" data-delete="${item.fileId || item.name}">Delete</button>
      </div>
    `;
    card.querySelector('[data-copy]').addEventListener('click', () => {
      navigator.clipboard.writeText(item.url);
      setStatus('URL copied');
    });
    card.querySelector('[data-delete]').addEventListener('click', async () => {
      const query = item.fileId
        ? `fileId=${encodeURIComponent(item.fileId)}`
        : `path=${encodeURIComponent(item.name)}`;
      await apiFetch(`/storage/item?${query}`, { method: 'DELETE' });
      setStatus('Deleted file');
      loadStorage();
    });
    container.appendChild(card);
  });
};

const loadFunctions = async () => {
  const payload = await apiFetch('/admin/api/functions');
  const data = unwrap(payload) || {};
  const select = qs('#functionSelect');
  select.innerHTML = '';
  (data.functions || []).forEach((name) => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    select.appendChild(option);
  });
  if (!select.value && select.options.length) select.value = select.options[0].value;
  if (select.value) {
    await loadFunctionLogs(select.value);
  }
};

const runFunction = async () => {
  const name = qs('#functionSelect').value;
  let event;
  try {
    event = JSON.parse(qs('#functionPayload').value || '{}');
  } catch (err) {
    setStatus('Invalid JSON');
    return;
  }
  setStatus(`Running ${name}...`);
  const payload = await apiFetch(`/admin/api/functions/${name}`, {
    method: 'POST',
    body: JSON.stringify(event),
  });
  const data = unwrap(payload);
  qs('#functionResult').textContent = prettyJson(data || {});
  await loadFunctionLogs(name);
  setStatus(`Executed ${name}`);
};

const loadFunctionLogs = async (name) => {
  const payload = await apiFetch(`/logs?type=functions&name=${encodeURIComponent(name)}`);
  const data = unwrap(payload) || {};
  const list = data.list || [];
  const container = qs('#functionLogs');
  container.innerHTML = '';
  list.forEach((log) => {
    const item = document.createElement('div');
    item.className = 'log-item';
    item.innerHTML = `
      <div><strong>${log.name}</strong> · ${log.success ? 'ok' : 'fail'}</div>
      <div class="mono">${formatTime(log.createdAt)}</div>
      <div>rt: ${log.rt || 0}ms</div>
    `;
    container.appendChild(item);
  });
};

const loadLogs = async (type = 'functions') => {
  state.logType = type;
  const payload = await apiFetch(`/logs?type=${type}`);
  const data = unwrap(payload) || {};
  const list = data.list || [];
  const container = qs('#logsList');
  container.innerHTML = '';
  list.forEach((log) => {
    const item = document.createElement('div');
    item.className = 'log-item';
    item.innerHTML = `
      <div><strong>${log.name || log.path || '-'}</strong> · ${log.type}</div>
      <div class="mono">${formatTime(log.createdAt)}</div>
      <div>rt: ${log.rt || 0}ms</div>
    `;
    item.addEventListener('click', () => {
      qs('#logDetail').textContent = prettyJson(log);
    });
    container.appendChild(item);
  });
  qs('#logDetail').textContent = list[0] ? prettyJson(list[0]) : '{}';
};

const loadSettings = async () => {
  const payload = await apiFetch('/settings');
  const settings = unwrap(payload) || {};
  qs('#settingOpenId').value = settings.defaultOpenId || '';
  qs('#settingAppId').value = settings.appId || '';
  qs('#settingEnv').value = settings.env || '';
  qs('#settingRequireAdminAuth').checked = settings.requireAdminAuth !== false;
  qs('#settingRequireApiAuth').checked = settings.requireApiAuth === true;
  qs('#settingAdminPassword').value = '';
};

const saveSettings = async () => {
  const body = {
    defaultOpenId: qs('#settingOpenId').value.trim(),
    appId: qs('#settingAppId').value.trim(),
    env: qs('#settingEnv').value.trim(),
    requireAdminAuth: qs('#settingRequireAdminAuth').checked,
    requireApiAuth: qs('#settingRequireApiAuth').checked,
  };
  const password = qs('#settingAdminPassword').value.trim();
  if (password) body.adminPassword = password;
  await apiFetch('/settings', { method: 'PUT', body: JSON.stringify(body) });
  setStatus('Settings saved');
};

const handleLogin = async () => {
  const password = qs('#loginPassword').value;
  if (!password) return;
  const res = await fetch('/admin/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    showLogin(payload?.msg || 'Login failed');
    return;
  }
  const token = payload?.data?.token;
  if (token) {
    state.token = token;
    localStorage.setItem('admin_token', token);
  }
  hideLogin();
  refreshAll();
};

const signOut = () => {
  state.token = '';
  localStorage.removeItem('admin_token');
  showLogin('Signed out.');
};

const refreshAll = async () => {
  if (state.view === 'products') {
    await loadProducts();
  }
  if (state.view === 'database') {
    await loadCollection();
  }
  if (state.view === 'storage') {
    await loadStorage();
  }
  if (state.view === 'functions') {
    await loadFunctions();
  }
  if (state.view === 'logs') {
    await loadLogs(state.logType);
  }
  if (state.view === 'settings') {
    await loadSettings();
  }
};

const bindEvents = () => {
  qsa('.nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      switchView(btn.dataset.view);
      refreshAll();
    });
  });

  qs('#loadCollection').addEventListener('click', () => {
    state.page = 1;
    loadCollection();
  });
  qs('#prevPage').addEventListener('click', () => {
    if (state.page > 1) {
      state.page -= 1;
      loadCollection();
    }
  });
  qs('#nextPage').addEventListener('click', () => {
    const totalPages = Math.max(1, Math.ceil(state.total / state.pageSize));
    if (state.page < totalPages) {
      state.page += 1;
      loadCollection();
    }
  });
  qs('#newDoc').addEventListener('click', () => {
    state.editingId = null;
    qs('#docEditor').value = '{}';
  });
  qs('#saveDoc').addEventListener('click', saveDocument);
  qs('#deleteDoc').addEventListener('click', deleteDocument);

  qs('#productLoad').addEventListener('click', loadProducts);
  qs('#productNew').addEventListener('click', () => {
    resetProductForm();
    renderProductForm();
  });
  qs('#productSave').addEventListener('click', saveProduct);
  qs('#productDelete').addEventListener('click', deleteProduct);

  qs('#productCoverUpload').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const uploaded = await uploadProductFile(file);
    if (!uploaded) return;
    syncProductFormInputs();
    productState.form.coverFileId = uploaded.fileId;
    productState.coverUrl = uploaded.url;
    event.target.value = '';
    renderProductForm();
  });

  qs('#productGalleryUpload').addEventListener('change', async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    for (const file of files) {
      // eslint-disable-next-line no-await-in-loop
      const uploaded = await uploadProductFile(file);
      if (!uploaded) continue;
      productState.form.galleryFileIds.push(uploaded.fileId);
      productState.gallery.push({ fileId: uploaded.fileId, url: uploaded.url });
    }
    event.target.value = '';
    syncProductFormInputs();
    renderProductForm();
  });

  qs('#productTitle').addEventListener('input', syncProductFormInputs);
  qs('#productSubTitle').addEventListener('input', syncProductFormInputs);
  qs('#productStatusField').addEventListener('change', syncProductFormInputs);
  qs('#productPrice').addEventListener('input', syncProductFormInputs);
  qs('#productLinePrice').addEventListener('input', syncProductFormInputs);
  qs('#productStock').addEventListener('input', syncProductFormInputs);

  qs('#addDetailText').addEventListener('click', () => {
    productState.form.detailBlocks.push({ type: 'text', value: '' });
    renderDetailBlocks();
  });
  qs('#addDetailImage').addEventListener('click', () => {
    productState.form.detailBlocks.push({ type: 'image', fileId: '', url: '' });
    renderDetailBlocks();
  });
  qs('#addDetailRichtext').addEventListener('click', () => {
    productState.form.detailBlocks.push({ type: 'richtext', value: '' });
    renderDetailBlocks();
  });

  qs('#uploadFile').addEventListener('click', uploadStorage);
  qs('#refreshStorage').addEventListener('click', loadStorage);

  qs('#runFunction').addEventListener('click', runFunction);

  qsa('[data-log-type]').forEach((btn) => {
    btn.addEventListener('click', () => loadLogs(btn.dataset.logType));
  });
  qs('#refreshLogs').addEventListener('click', () => loadLogs());

  qs('#saveSettings').addEventListener('click', saveSettings);
  qs('#loginButton').addEventListener('click', handleLogin);
  qs('#signOut').addEventListener('click', signOut);
  qs('#refreshAll').addEventListener('click', refreshAll);
};

const init = async () => {
  baseUrlEl.textContent = window.location.origin;
  loadCollections();
  bindEvents();
  resetProductForm();
  renderProductForm();
  try {
    await loadProducts();
  } catch (err) {
    showLogin('Admin auth required.');
  }
};

init();
