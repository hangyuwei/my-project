import express from 'express';
import path from 'node:path';
import dashboardRoutes from './routes/dashboard.routes.js';
import goodsRoutes from './routes/goods.routes.js';
import ordersRoutes from './routes/orders.routes.js';
import promotionsRoutes from './routes/promotions.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import usersRoutes from './routes/users.routes.js';
import bannersRoutes from './routes/banners.routes.js';
import afterSalesRoutes from './routes/after-sales.routes.js';
import cloudfunctionsRoutes from './routes/cloudfunctions.routes.js';

const app = express();

app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (req, res) => {
  res.json({ data: { ok: true } });
});

app.use('/cloudfunctions', cloudfunctionsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/goods', goodsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/promotions', promotionsRoutes);
app.use('/api/salesPromotions', promotionsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/banners', bannersRoutes);
app.use('/api/after-sales', afterSalesRoutes);

// 静态文件服务（dist目录可能不存在，所以不要在这里崩溃）
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  // 只处理HTML请求，API请求已经在上面处理了
  if (req.accepts('html')) {
    const indexPath = path.join(distPath, 'index.html');
    res.sendFile(indexPath, (err) => {
      if (err) {
        res.status(404).send('管理后台前端未构建，请运行 npm run build');
      }
    });
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

app.use((error, req, res, next) => {
  console.error('API error:', error);
  res.status(500).json({ error: error?.message || 'Server error' });
});

export default app;
