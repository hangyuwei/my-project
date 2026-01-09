import express from 'express';
import path from 'node:path';
import dashboardRoutes from './routes/dashboard.routes.js';
import goodsRoutes from './routes/goods.routes.js';
import ordersRoutes from './routes/orders.routes.js';
import promotionsRoutes from './routes/promotions.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import usersRoutes from './routes/users.routes.js';

const app = express();

app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (req, res) => {
  res.json({ data: { ok: true } });
});

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/goods', goodsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/promotions', promotionsRoutes);
app.use('/api/salesPromotions', promotionsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', usersRoutes);

app.use(express.static(path.join(process.cwd(), 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

app.use((error, req, res, next) => {
  console.error('API error:', error);
  res.status(500).json({ error: error?.message || 'Server error' });
});

export default app;
