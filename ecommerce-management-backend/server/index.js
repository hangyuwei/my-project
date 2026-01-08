import express from 'express';
import cloudbase from '@cloudbase/node-sdk';
import path from 'node:path';

const PORT = Number.parseInt(process.env.PORT || '3001', 10);
const ENV_ID = process.env.CLOUDBASE_ENV_ID || process.env.VITE_ENV_ID;
const SECRET_ID =
  process.env.CLOUDBASE_SECRET_ID ||
  process.env.CLOUDBASE_SECRETID ||
  process.env.TENCENTCLOUD_SECRET_ID;
const SECRET_KEY =
  process.env.CLOUDBASE_SECRET_KEY ||
  process.env.CLOUDBASE_SECRETKEY ||
  process.env.TENCENTCLOUD_SECRET_KEY;

const requireEnv = (name, value) => {
  if (!value) {
    console.error(`Missing required env: ${name}`);
    process.exit(1);
  }
};

requireEnv('CLOUDBASE_ENV_ID', ENV_ID);
requireEnv('CLOUDBASE_SECRET_ID', SECRET_ID);
requireEnv('CLOUDBASE_SECRET_KEY', SECRET_KEY);

const cloudApp = cloudbase.init({
  env: ENV_ID,
  secretId: SECRET_ID,
  secretKey: SECRET_KEY,
});
const db = cloudApp.database();

const server = express();
server.use(express.json({ limit: '2mb' }));

const sendData = (res, data) => res.json({ data });

const asyncHandler = (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (error) {
    next(error);
  }
};

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toFloat = (value, fallback) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeString = (value) => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

const normalizeDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const normalizePicture = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeString(item)).filter((item) => item);
  }
  const single = normalizeString(value);
  return single ? [single] : [];
};

const isCollectionMissing = (error) => {
  const message = String(error?.message || '');
  const code = error?.code || error?.errorCode;
  return (
    code === 'DATABASE_COLLECTION_NOT_EXIST' ||
    message.includes('DATABASE_COLLECTION_NOT_EXIST') ||
    message.includes('Db or Table not exist')
  );
};

const safeCount = async (query) => {
  try {
    return await query.count();
  } catch (error) {
    if (isCollectionMissing(error)) {
      return { total: 0 };
    }
    throw error;
  }
};

const safeGet = async (query) => {
  try {
    return await query.get();
  } catch (error) {
    if (isCollectionMissing(error)) {
      return { data: [] };
    }
    throw error;
  }
};

const safeDocGet = async (collectionName, id) => {
  try {
    return await db.collection(collectionName).doc(id).get();
  } catch (error) {
    if (isCollectionMissing(error)) {
      return { data: [] };
    }
    throw error;
  }
};

const applyWhere = (collection, where) => {
  if (where && Object.keys(where).length > 0) {
    return collection.where(where);
  }
  return collection;
};

server.get('/api/health', (req, res) => {
  sendData(res, { ok: true, envId: ENV_ID });
});

server.get(
  '/api/dashboard',
  asyncHandler(async (req, res) => {
    const goodsCollection = db.collection('goods');
    const userCollection = db.collection('user');
    const orderCollection = db.collection('order');
    const promotionCollection = db.collection('salesPromotion');

    const [
      goodsCount,
      usersCount,
      ordersCount,
      promotionsCount,
      onlineGoodsCount,
      completedOrdersCount,
    ] = await Promise.all([
      safeCount(goodsCollection),
      safeCount(userCollection),
      safeCount(orderCollection),
      safeCount(promotionCollection),
      safeCount(goodsCollection.where({ status: 'online' })),
      safeCount(orderCollection.where({ status: 'completed' })),
    ]);

    const recentOrdersResult = await safeGet(
      orderCollection
      .orderBy('createTime', 'desc')
      .limit(5)
    );

    const promotionsResult = await safeGet(promotionCollection.limit(200));
    const now = Date.now();
    const activePromotions = (promotionsResult.data || []).filter((item) => {
      const start = new Date(item.startTime).getTime();
      const end = new Date(item.endTime).getTime();
      if (!Number.isFinite(start) || !Number.isFinite(end)) return false;
      return start <= now && now <= end;
    }).length;

    const completedOrdersResult = await safeGet(
      orderCollection.where({ status: 'completed' }).limit(1000),
    );
    const totalRevenue = (completedOrdersResult.data || []).reduce(
      (sum, item) => sum + toFloat(item.totalPrice, 0),
      0,
    );

    sendData(res, {
      stats: {
        totalGoods: goodsCount.total || 0,
        totalUsers: usersCount.total || 0,
        totalOrders: ordersCount.total || 0,
        totalPromotions: promotionsCount.total || 0,
        onlineGoods: onlineGoodsCount.total || 0,
        completedOrders: completedOrdersCount.total || 0,
        activePromotions,
        totalRevenue,
      },
      recentOrders: recentOrdersResult.data || [],
    });
  }),
);

server.get(
  '/api/goods',
  asyncHandler(async (req, res) => {
    const page = toInt(req.query.page, 1);
    const pageSize = toInt(req.query.pageSize, 10);
    const search = normalizeString(req.query.search);
    const where = {};

    if (search) {
      where.goodName = db.RegExp({ regexp: search, options: 'i' });
    }

    const collection = db.collection('goods');
    const listResult = await safeGet(
      applyWhere(collection, where)
        .orderBy('createTime', 'desc')
        .skip((page - 1) * pageSize)
        .limit(pageSize),
    );
    const countResult = await safeCount(applyWhere(collection, where));

    sendData(res, {
      list: listResult.data || [],
      total: countResult.total || 0,
    });
  }),
);

server.post(
  '/api/goods',
  asyncHandler(async (req, res) => {
    const payload = req.body || {};
    const data = {
      sku: normalizeString(payload.sku),
      goodName: normalizeString(payload.goodName),
      price: toFloat(payload.price, 0),
      description: normalizeString(payload.description),
      stock: toInt(payload.stock, 0),
      picture: normalizePicture(payload.picture),
      status: payload.status === 'offline' ? 'offline' : 'online',
      updateTime: new Date(),
    };

    if (payload._id) {
      await db.collection('goods').doc(payload._id).update(data);
      sendData(res, { id: payload._id });
      return;
    }

    const result = await db.collection('goods').add({
      ...data,
      createTime: new Date(),
    });
    sendData(res, { id: result.id });
  }),
);

server.delete(
  '/api/goods/:id',
  asyncHandler(async (req, res) => {
    await db.collection('goods').doc(req.params.id).remove();
    sendData(res, { success: true });
  }),
);

server.patch(
  '/api/goods/:id/status',
  asyncHandler(async (req, res) => {
    const status = req.body?.status === 'offline' ? 'offline' : 'online';
    await db.collection('goods').doc(req.params.id).update({
      status,
      updateTime: new Date(),
    });
    sendData(res, { success: true });
  }),
);

server.get(
  '/api/promotions',
  asyncHandler(async (req, res) => {
    const page = toInt(req.query.page, 1);
    const pageSize = toInt(req.query.pageSize, 10);
    const search = normalizeString(req.query.search);
    const where = {};

    if (search) {
      where.name = db.RegExp({ regexp: search, options: 'i' });
    }

    const collection = db.collection('salesPromotion');
    const listResult = await safeGet(
      applyWhere(collection, where)
        .orderBy('createTime', 'desc')
        .skip((page - 1) * pageSize)
        .limit(pageSize),
    );
    const countResult = await safeCount(applyWhere(collection, where));

    sendData(res, {
      list: listResult.data || [],
      total: countResult.total || 0,
    });
  }),
);

server.post(
  '/api/promotions',
  asyncHandler(async (req, res) => {
    const payload = req.body || {};
    const startTime = normalizeDate(payload.startTime) || new Date();
    const endTime = normalizeDate(payload.endTime) || new Date();

    const data = {
      id: normalizeString(payload.id),
      name: normalizeString(payload.name),
      description: normalizeString(payload.description),
      startTime,
      endTime,
      multiPrize: toFloat(payload.multiPrize, 0),
      lowestPrice: toFloat(payload.lowestPrice, 0),
      updateTime: new Date(),
    };

    if (payload._id) {
      await db.collection('salesPromotion').doc(payload._id).update(data);
      sendData(res, { id: payload._id });
      return;
    }

    const result = await db.collection('salesPromotion').add({
      ...data,
      createTime: new Date(),
    });
    sendData(res, { id: result.id });
  }),
);

server.delete(
  '/api/promotions/:id',
  asyncHandler(async (req, res) => {
    await db.collection('salesPromotion').doc(req.params.id).remove();
    sendData(res, { success: true });
  }),
);

server.get(
  '/api/users',
  asyncHandler(async (req, res) => {
    const page = toInt(req.query.page, 1);
    const pageSize = toInt(req.query.pageSize, 10);
    const search = normalizeString(req.query.search);
    const where = {};

    if (search) {
      where.name = db.RegExp({ regexp: search, options: 'i' });
    }

    const collection = db.collection('user');
    const listResult = await safeGet(
      applyWhere(collection, where)
        .orderBy('createTime', 'desc')
        .skip((page - 1) * pageSize)
        .limit(pageSize),
    );
    const countResult = await safeCount(applyWhere(collection, where));

    sendData(res, {
      list: listResult.data || [],
      total: countResult.total || 0,
    });
  }),
);

server.post(
  '/api/users',
  asyncHandler(async (req, res) => {
    const payload = req.body || {};
    const data = {
      id: normalizeString(payload.id),
      name: normalizeString(payload.name),
      grade: normalizeString(payload.grade) || 'bronze',
      orderIds: Array.isArray(payload.orderIds) ? payload.orderIds : [],
      updateTime: new Date(),
    };

    if (payload._id) {
      await db.collection('user').doc(payload._id).update(data);
      sendData(res, { id: payload._id });
      return;
    }

    const result = await db.collection('user').add({
      ...data,
      createTime: new Date(),
    });
    sendData(res, { id: result.id });
  }),
);

server.delete(
  '/api/users/:id',
  asyncHandler(async (req, res) => {
    await db.collection('user').doc(req.params.id).remove();
    sendData(res, { success: true });
  }),
);

server.get(
  '/api/orders',
  asyncHandler(async (req, res) => {
    const page = toInt(req.query.page, 1);
    const pageSize = toInt(req.query.pageSize, 10);
    const search = normalizeString(req.query.search);
    const status = normalizeString(req.query.status);
    const userId = normalizeString(req.query.userId);
    const where = {};

    if (search) {
      where.id = db.RegExp({ regexp: search, options: 'i' });
    }
    if (status) {
      where.status = status;
    }
    if (userId) {
      where.userId = userId;
    }

    const collection = db.collection('order');
    const listResult = await safeGet(
      applyWhere(collection, where)
        .orderBy('createTime', 'desc')
        .skip((page - 1) * pageSize)
        .limit(pageSize),
    );
    const countResult = await safeCount(applyWhere(collection, where));

    sendData(res, {
      list: listResult.data || [],
      total: countResult.total || 0,
    });
  }),
);

server.post(
  '/api/orders',
  asyncHandler(async (req, res) => {
    const payload = req.body || {};
    const data = {
      id: normalizeString(payload.id),
      goodsSku: normalizeString(payload.goodsSku),
      num: toInt(payload.num, 0),
      userId: normalizeString(payload.userId),
      salesPromotionId: normalizeString(payload.salesPromotionId) || null,
      totalPrice: toFloat(payload.totalPrice, 0),
      status: normalizeString(payload.status) || 'pending',
      updateTime: new Date(),
    };

    if (payload._id) {
      await db.collection('order').doc(payload._id).update(data);
      sendData(res, { id: payload._id });
      return;
    }

    const result = await db.collection('order').add({
      ...data,
      createTime: new Date(),
    });
    sendData(res, { id: result.id });
  }),
);

server.delete(
  '/api/orders/:id',
  asyncHandler(async (req, res) => {
    await db.collection('order').doc(req.params.id).remove();
    sendData(res, { success: true });
  }),
);

server.patch(
  '/api/orders/batch',
  asyncHandler(async (req, res) => {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
    const status = normalizeString(req.body?.status);
    if (!ids.length || !status) {
      sendData(res, { success: false });
      return;
    }

    await Promise.all(
      ids.map((id) =>
        db.collection('order').doc(id).update({
          status,
          updateTime: new Date(),
        }),
      ),
    );

    sendData(res, { success: true });
  }),
);

server.get(
  '/api/orders/:id/detail',
  asyncHandler(async (req, res) => {
    const orderResult = await safeDocGet('order', req.params.id);
    const order = orderResult.data?.[0];

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const [goodsResult, userResult, promotionResult] = await Promise.all([
      order.goodsSku
        ? safeGet(
            db.collection('goods').where({ sku: order.goodsSku }).limit(1),
          )
        : Promise.resolve({ data: [] }),
      order.userId
        ? safeGet(db.collection('user').where({ id: order.userId }).limit(1))
        : Promise.resolve({ data: [] }),
      order.salesPromotionId
        ? safeGet(
            db
              .collection('salesPromotion')
              .where({ id: order.salesPromotionId })
              .limit(1),
          )
        : Promise.resolve({ data: [] }),
    ]);

    const detail = {
      ...order,
      goods: goodsResult.data?.[0] || null,
      user: userResult.data?.[0] || null,
      promotion: promotionResult.data?.[0] || null,
    };

    sendData(res, detail);
  }),
);

server.use(express.static(path.join(process.cwd(), 'dist')));

server.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

server.use((error, req, res, next) => {
  console.error('API error:', error);
  res.status(500).json({ error: error?.message || 'Server error' });
});

server.listen(PORT, () => {
  console.log(`Admin server running at http://127.0.0.1:${PORT}`);
});
