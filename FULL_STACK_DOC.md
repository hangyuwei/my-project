# 前后端实现说明（小程序 + 管理后台）

本文档描述当前项目的前后端实现方式、数据流、数据库结构、接口与部署步骤，便于后续整理总架构。

## 1. 项目组成

### 1.1 小程序（前台）
- 框架：`tdesign-miniprogram-starter-retail`
- 入口：`app.js / pages/*`
- 数据访问层：`services/*`（业务页面只调 services）
- Mock/真实接口切换：`config.useMock`
- 云函数目录：`cloudfunctions/*`

### 1.2 管理后台（Web）
- 目录：`ecommerce-management-backend`
- 前端：React + Vite + Tailwind + DaisyUI
- 服务端：`ecommerce-management-backend/server/index.js`（Express）
- 访问方式：同一容器内提供静态页面 + `/api/*`

### 1.3 云开发（CloudBase）
- 数据库：集合 `goods / user / order / salesPromotion`
- 存储：图片可使用 `cloud://` fileID
- 小程序通过云函数读取数据
- 管理后台通过 Node SDK 读写数据

## 2. 数据库设计（核心字段）

完整字段见：`ecommerce-management-backend/DB_SCHEMA.md`

### 2.1 goods（商品）
- `sku`：SKU 唯一编码
- `goodName`：商品名
- `price`：价格（元）
- `description`：描述
- `stock`：库存
- `coverImage`：封面图 URL 或 fileID
- `galleryImages`：展示图数组
- `detailImages`：详情图数组
- `picture`：兼容字段（默认同步为 `galleryImages`）
- `status`：`online` / `offline`
- `createTime / updateTime`

### 2.2 其他集合
`user / order / salesPromotion` 结构详见 `DB_SCHEMA.md`

### 2.3 索引建议
- `goods`: `sku`(唯一)、`goodName`
- `order`: `id`(唯一)、`goodsSku`、`userId`、`status`
- `user`: `id`(唯一)
- `salesPromotion`: `id`(唯一)

## 3. 图片字段规则（重点）

- 封面图：`coverImage`（优先展示）
- 展示图：`galleryImages`（轮播/列表）
- 详情图：`detailImages`（详情页内容）
- 兼容字段：`picture`（历史字段，等同于 `galleryImages`）

后台保存商品时会自动：
- `coverImage` 为空时，使用 `galleryImages[0]` 作为封面
- 同步 `picture = galleryImages` 保持兼容

## 4. 小程序前端实现

### 4.1 数据流

```
pages/* → services/* → cloudfunctions/* → CloudBase DB
```

- `services` 统一封装请求
- `config.useMock` 控制 Mock/真实云函数
- 真实数据通过云函数返回，业务层无需改动

### 4.2 关键云函数

#### getHome
路径：`cloudfunctions/getHome/index.js`
- 读取 `goods` 集合
- 只取 `status = online/ON` 的商品
- 返回 `swiper / tabList / activityImg / goodsList`
- 封面图优先 `coverImage`

#### getGoodsList
路径：`cloudfunctions/getGoodsList/index.js`
- 读取 `goods` 集合
- 支持 `keyword` 查询
- 支持 `status` 过滤（默认 online/ON）
- 输出列表包含：
  - `primaryImage / images / detailImages`
  - `goodsName / price / linePrice / stock`
  - `spuId / skuId`

#### getGood
路径：`cloudfunctions/getGood/index.js`
- 读取 `goods` 集合
- 支持 `spuId / skuId / _id / sku` 查询
- 输出详情包含：
  - `primaryImage`（coverImage）
  - `images`（galleryImages）
  - `detail`（由 detailImages 生成图片块）
  - `desc`（详情图数组，兜底）

### 4.3 前端适配层
关键文件：
- `services/good/fetchGood.js`
- `services/good/fetchGoodsList.js`
- `services/good/goodsTransform.js`
- `model/good.js`

当前适配逻辑：
- `detailImages` 会映射为详情页内容
- `galleryImages` 会映射为轮播/列表图片
- `coverImage` 作为主图显示

## 5. 管理后台实现

### 5.1 架构
```
React 页面 → /api/* → Express → CloudBase Node SDK → 数据库
```

优势：
- 前端不再直接调用 CloudBase Web SDK
- 无 CORS 问题（同域 API）
- 管理端走 SecretId/Key，权限独立

### 5.2 API 列表
服务端文件：`ecommerce-management-backend/server/index.js`

- `GET /api/dashboard`
- `GET /api/goods`
- `POST /api/goods`
- `DELETE /api/goods/:id`
- `PATCH /api/goods/:id/status`
- `GET /api/users`
- `POST /api/users`
- `DELETE /api/users/:id`
- `GET /api/orders`
- `POST /api/orders`
- `DELETE /api/orders/:id`
- `PATCH /api/orders/batch`
- `GET /api/orders/:id/detail`
- `GET /api/promotions`
- `POST /api/promotions`
- `DELETE /api/promotions/:id`

### 5.3 前端调用
调用封装在：
`ecommerce-management-backend/src/utils/api.js`

页面使用：
- `GoodsPage.jsx`
- `UsersPage.jsx`
- `OrdersPage.jsx`
- `PromotionsPage.jsx`
- `DashboardPage.jsx`

## 6. 部署流程（云托管）

### 6.1 管理后台部署
构建配置：
- 目标目录：`ecommerce-management-backend`
- Dockerfile：`Dockerfile`
- 服务端口：`3001`

环境变量：
```
CLOUDBASE_ENV_ID=你的环境ID
CLOUDBASE_SECRET_ID=你的SecretId
CLOUDBASE_SECRET_KEY=你的SecretKey
PORT=3001
```

### 6.2 小程序云函数部署
在微信开发者工具：
右键 `cloudfunctions/getHome`、`getGoodsList`、`getGood`
→ 上传并部署（云端安装依赖）

### 6.3 数据库初始化
创建集合：
`goods / user / order / salesPromotion`

权限建议（开发期）：
选择“读取全部数据，修改本人数据”
（管理后台走 SecretId/Key，不受影响）

## 7. 常见问题

### 7.1 数据库集合不存在
报错：`DATABASE_COLLECTION_NOT_EXIST`
解决：在云开发控制台先建集合（可以为空）。

### 7.2 管理后台空白 / 样式错乱
原因：Tailwind 配置缺失
已补：`ecommerce-management-backend/tailwind.config.js`

### 7.3 CORS
后台已改为同源 API，不再走前端 CloudBase SDK。

## 8. 后续可扩展方向
- SKU 多规格
- 类目与筛选
- 订单支付状态流转
- 数据报表与权限角色
- 图库管理与批量上传

