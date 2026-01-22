const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.join(process.cwd(), 'server', 'data', 'db.json');
const COLLECTIONS = ['products', 'home', 'categories', 'orders', 'rights'];

const generateId = () => {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

const nowIso = () => new Date().toISOString();

const readDb = () => {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8').replace(/^\uFEFF/, '');
    const data = JSON.parse(raw);
    return ensureCollections(data);
  } catch (err) {
    return ensureCollections({});
  }
};

const writeDb = (db) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
};

const ensureCollections = (db = {}) => {
  const next = { ...db };
  COLLECTIONS.forEach((name) => {
    if (!Array.isArray(next[name])) next[name] = [];
  });
  return next;
};

const ensureArray = (value) => (Array.isArray(value) ? value : value ? [value] : []);

const toNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isNaN(num) ? fallback : num;
};

const toString = (value, fallback = '') => {
  if (value === undefined || value === null) return fallback;
  return String(value);
};

const pickFirst = (...values) => {
  for (const val of values) {
    if (val !== undefined && val !== null && val !== '') return val;
  }
  return values.length ? values[values.length - 1] : undefined;
};

const matchId = (item = {}, id) => {
  if (id === undefined || id === null) return false;
  const target = String(id);
  return [item._id, item.id, item.mockId].some((value) => String(value) === target);
};

const findById = (list = [], id) => list.find((item) => matchId(item, id));

const buildOrderItem = (item = {}, orderNo, index) => {
  const quantity = toNumber(pickFirst(item.quantity, item.buyQuantity, 1), 1);
  const price = toNumber(pickFirst(item.price, item.actualPrice, 0), 0);
  const originPrice = toNumber(pickFirst(item.originPrice, item.linePrice, price), price);
  return {
    id: item.id || `${orderNo}-${index}`,
    spuId: toString(pickFirst(item.spuId, item.productId, '')),
    skuId: toString(pickFirst(item.skuId, item.variantId, item.productId, '')),
    name: pickFirst(item.goodsName, item.title, item.name, ''),
    image: pickFirst(item.primaryImage, item.thumb, item.image, ''),
    price,
    originPrice,
    quantity,
    specs: ensureArray(item.specInfo || item.specifications || item.specs),
  };
};

const createOrderFromEvent = (event = {}, db) => {
  const goodsRequestList = ensureArray(event.goodsRequestList || event.items || event.goods);
  const orderNo = toString(event.orderNo, `O${Date.now()}`);
  const orderStatus = toNumber(event.orderStatus || 5, 5);
  const orderItems = goodsRequestList.map((item, index) => buildOrderItem(item, orderNo, index));
  const totalAmount = orderItems.reduce((sum, item) => sum + toNumber(item.price, 0) * toNumber(item.quantity, 1), 0);
  const order = {
    id: orderNo,
    orderNo,
    orderStatus,
    orderStatusName: pickFirst(event.orderStatusName, '待付款'),
    totalAmount,
    goodsAmount: totalAmount,
    paymentAmount: totalAmount,
    freightFee: toNumber(event.freightFee, 0),
    discountAmount: toNumber(event.discountAmount, 0),
    createdAt: nowIso(),
    items: orderItems,
  };
  db.orders.unshift(order);
  return order;
};

module.exports = {
  readDb,
  writeDb,
  ensureCollections,
  ensureArray,
  toNumber,
  toString,
  pickFirst,
  findById,
  generateId,
  nowIso,
  createOrderFromEvent,
};
