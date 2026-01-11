# 电商小程序架构设计文档

## 项目概述

基于腾讯云开发(CloudBase)的电商小程序全栈解决方案,包含小程序前端、管理后台和云端服务。

## 技术栈

### 小程序端
- 框架: 微信小程序 + TDesign UI组件库
- 语言: JavaScript
- 状态管理: 页面级状态 + 全局配置
- 数据层: services/ 封装

### 管理后台
- 前端: React 19 + Vite + Tailwind CSS + DaisyUI
- 后端: Node.js + Express
- 数据访问: CloudBase Node SDK

### 云服务
- 云函数: CloudBase Functions
- 数据库: CloudBase NoSQL Database
- 存储: CloudBase Storage
- 部署: 云托管 (Docker)

## 架构设计

### 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        用户层                                 │
├──────────────────────┬──────────────────────────────────────┤
│   小程序用户端         │        管理员后台                      │
└──────────────────────┴──────────────────────────────────────┘
           │                            │
           ▼                            ▼
┌──────────────────────┐    ┌──────────────────────────────┐
│   小程序 Pages        │    │   React Admin Frontend       │
│   - 首页              │    │   - 商品管理                  │
│   - 商品列表/详情     │    │   - 订单管理                  │
│   - 购物车/结算       │    │   - 用户管理                  │
│   - 订单/售后         │    │   - 数据统计                  │
│   - 个人中心          │    └─────────────┬────────────────┘
└──────────┬───────────┘                  │
           │                              │
           ▼                              ▼
┌──────────────────────┐    ┌──────────────────────────────┐
│   Services 层         │    │   Express API Server         │
│   - 数据转换          │    │   - /api/goods               │
│   - Mock/真实切换     │    │   - /api/orders              │
└──────────┬───────────┘    │   - /api/users               │
           │                └─────────────┬────────────────┘
           │                              │
           ▼                              │
┌──────────────────────────────────────────┴─────────────────┐
│                    云函数层 (API Gateway)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐  │
│  │  getHome    │  │ getGoods    │  │  getOrderList    │  │
│  │  getGood    │  │ searchGoods │  │  createOrder     │  │
│  │getGoodsList │  │ getCart     │  │  applyService    │  │
│  └─────────────┘  └─────────────┘  └──────────────────┘  │
└────────────────────────────┬───────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    CloudBase Database                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐│
│  │  goods   │  │  order   │  │   user   │  │salesPromotion││
│  └──────────┘  └──────────┘  └──────────┘  └─────────────┘│
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │  CloudBase Storage   │
                  │  (图片/文件存储)      │
                  └──────────────────────┘
```

## 模块拆分方案

### 1. 商品模块 (Goods Module)

**职责:**
- 商品展示、搜索、详情
- 商品分类管理
- 库存管理
- SKU规格管理

**前端页面:**
- `pages/goods/` - 商品列表页
- `pages/goods/details/` - 商品详情页
- `pages/goods/search/` - 商品搜索页
- `pages/goods/category/` - 分类页

**云函数:**
- `getGoodsList` - 获取商品列表
- `getGood` - 获取商品详情
- `searchGoods` - 搜索商品
- `getCategoryList` - 获取分类列表

**数据库:**
- `goods` 集合

**管理后台:**
- 商品列表/新增/编辑/删除
- 商品状态管理(上架/下架)
- 图片上传管理
- SKU管理

---

### 2. 订单模块 (Order Module)

**职责:**
- 购物车管理
- 订单创建、支付
- 订单查询、详情
- 售后服务

**前端页面:**
- `pages/cart/` - 购物车
- `pages/order/order-confirm/` - 订单确认
- `pages/order/order-list/` - 订单列表
- `pages/order/order-detail/` - 订单详情
- `pages/order/apply-service/` - 申请售后

**云函数:**
- `getCartGroupData` - 获取购物车数据
- `getSettleDetail` - 获取结算详情
- `commitPay` - 提交支付
- `getOrderList` - 获取订单列表
- `getOrderDetail` - 获取订单详情
- `applyService` - 申请售后

**数据库:**
- `order` 集合
- `cart` 集合(可选)

**管理后台:**
- 订单列表/详情查看
- 订单状态管理
- 批量操作
- 订单统计

---

### 3. 用户模块 (User Module)

**职责:**
- 用户信息管理
- 收货地址管理
- 优惠券管理
- 个人中心功能

**前端页面:**
- `pages/usercenter/` - 个人中心
- `pages/usercenter/person-info/` - 个人信息
- `pages/usercenter/address/` - 地址管理
- `pages/coupon/` - 优惠券

**云函数:**
- `getUserCenter` - 获取用户中心数据
- `getPerson` - 获取个人信息
- `getAddressList` - 获取地址列表
- `getAddress` - 获取地址详情
- `getCouponList` - 获取优惠券列表

**数据库:**
- `user` 集合
- `address` 集合(可选)
- `coupon` 集合(可选)

**管理后台:**
- 用户列表/详情
- 用户管理

---

### 4. 营销模块 (Marketing Module)

**职责:**
- 首页内容配置
- 促销活动管理
- 优惠券发放
- Banner管理

**前端页面:**
- `pages/home/` - 首页
- `pages/promotion-detail/` - 活动详情

**云函数:**
- `getHome` - 获取首页数据
- `getActivityList` - 获取活动列表
- `getActivity` - 获取活动详情
- `getPromotion` - 获取促销信息

**数据库:**
- `salesPromotion` 集合
- `banner` 集合(可选)
- `activity` 集合(可选)

**管理后台:**
- 促销活动管理
- 优惠券管理
- 首页配置

---

## 数据流设计

### 小程序数据流

```
Page (页面)
  ↓ 调用
Services (服务层)
  ↓ 判断 useMock
  ├─→ Mock (model/*.js) - 开发模式
  └─→ Cloud Function (云函数) - 生产模式
        ↓ 访问
      CloudBase Database
        ↓ 返回
      Adapt Layer (数据适配)
        ↓ 返回
      Services
        ↓ 返回
      Page (更新UI)
```

### 管理后台数据流

```
React Component (组件)
  ↓ 调用
API Utils (utils/api.js)
  ↓ HTTP请求
Express API Server
  ↓ 使用
CloudBase Node SDK
  ↓ 操作
CloudBase Database
  ↓ 返回
Express (JSON响应)
  ↓ 返回
React Component (更新UI)
```

## 关键设计决策

### 1. Mock/真实数据切换

**配置文件:** `config/index.js`

```javascript
const config = {
  useMock: false, // true=使用Mock数据, false=使用真实云函数
  cloudBaseUrl: 'https://your-env.ap-shanghai.app.tcloudbase.com',
}
```

**优势:**
- 开发阶段无需云服务即可运行
- 快速原型验证
- 降低云服务调用成本

### 2. 数据适配层 (Adapt Layer)

**位置:** `model/*.js`

**作用:**
- 将云函数返回的数据结构转换为小程序期望的格式
- 处理字段差异(如 `id` vs `spuId`)
- 兼容历史数据结构

**示例:** `model/good.js`

```javascript
function adaptGoodDetail(realData) {
  return {
    spuId: realData.id,
    goodsName: realData.name,
    primaryImage: realData.coverImage,
    images: realData.galleryImages,
    detailImages: realData.detailImages,
    // ... 更多字段映射
  }
}
```

### 3. 图片字段规则

- **coverImage**: 封面图(主图)
- **galleryImages**: 展示图(轮播/列表)
- **detailImages**: 详情图(详情页内容)
- **picture**: 兼容字段(等同于 galleryImages)

**自动处理规则:**
1. 如果 `coverImage` 为空,自动使用 `galleryImages[0]`
2. 保存时同步 `picture = galleryImages`

### 4. 云函数设计原则

- **单一职责**: 每个云函数只负责一个业务功能
- **统一返回格式**:
  ```javascript
  {
    code: 'Success' | 'Error',
    data: {...},
    message: '...'
  }
  ```
- **错误处理**: 统一的错误捕获和日志记录
- **性能优化**: 合理使用数据库索引、限制返回字段

## 数据库设计

### goods 集合

```javascript
{
  _id: String,
  sku: String,              // SKU编码(唯一)
  goodName: String,         // 商品名称
  price: Number,            // 价格(分)
  stock: Number,            // 库存
  coverImage: String,       // 封面图URL
  galleryImages: [String],  // 展示图数组
  detailImages: [String],   // 详情图数组
  picture: [String],        // 兼容字段
  description: String,      // 商品描述
  status: String,           // online/offline
  createTime: Date,
  updateTime: Date
}
```

**索引:**
- `sku` (唯一索引)
- `goodName` (文本索引,支持搜索)
- `status` (普通索引)

### order 集合

```javascript
{
  _id: String,
  id: String,               // 订单号(唯一)
  userId: String,           // 用户ID
  goodsSku: String,         // 商品SKU
  quantity: Number,         // 数量
  totalAmount: Number,      // 总金额(分)
  status: String,           // 订单状态
  createTime: Date,
  updateTime: Date
}
```

**索引:**
- `id` (唯一索引)
- `userId` (普通索引)
- `status` (普通索引)
- 复合索引: `userId + status`

### user 集合

```javascript
{
  _id: String,
  id: String,               // 用户ID(唯一)
  nickName: String,         // 昵称
  avatarUrl: String,        // 头像
  phoneNumber: String,      // 手机号
  createTime: Date
}
```

**索引:**
- `id` (唯一索引)

### salesPromotion 集合

```javascript
{
  _id: String,
  id: String,               // 促销ID(唯一)
  title: String,            // 促销标题
  type: String,             // 促销类型
  startTime: Date,
  endTime: Date,
  status: String,           // active/inactive
  createTime: Date
}
```

## 部署架构

### 小程序部署

1. **云函数部署**
   - 微信开发者工具 → 云开发 → 云函数
   - 右键云函数目录 → 上传并部署(云端安装依赖)

2. **小程序代码发布**
   - 微信开发者工具 → 上传
   - 微信公众平台 → 版本管理 → 提审/发布

### 管理后台部署

**部署方式: 云托管 (Docker)**

**Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["node", "server/index.js"]
```

**环境变量:**
```
CLOUDBASE_ENV_ID=your-env-id
CLOUDBASE_SECRET_ID=your-secret-id
CLOUDBASE_SECRET_KEY=your-secret-key
PORT=3001
```

**部署步骤:**
1. 云开发控制台 → 云托管 → 新建服务
2. 选择 Dockerfile 构建
3. 设置环境变量
4. 配置端口: 3001
5. 部署

### 数据库初始化

**集合创建:**
```bash
# 在云开发控制台创建以下集合:
- goods
- user
- order
- salesPromotion
```

**权限配置(开发期):**
- 小程序端: 所有用户可读,仅创建者可写
- 管理后台: 通过 SecretId/Key 访问(不受限)

## 安全设计

### 1. 权限控制

- **小程序端**: 使用云开发安全规则控制数据访问
- **管理后台**: 使用 SecretId/Key + 管理员登录验证
- **云函数**: 校验用户身份和权限

### 2. 数据验证

- **前端**: 基础表单验证
- **后端**: 云函数内严格数据验证
- **数据库**: 字段类型约束

### 3. 敏感信息保护

- **环境变量**: 使用云托管环境变量存储密钥
- **传输加密**: HTTPS
- **存储加密**: CloudBase 自动加密

## 性能优化

### 1. 数据库优化

- 建立合适的索引
- 限制返回字段(`field()`)
- 使用分页查询
- 数据缓存策略

### 2. 图片优化

- 使用 WebP 格式
- 图片懒加载
- CDN 加速(CloudBase Storage自带)
- 缩略图生成

### 3. 代码优化

- 按需加载(小程序分包)
- 组件复用
- 防抖/节流
- 请求合并

## 监控与运维

### 1. 日志

- **小程序**: 微信小程序管理后台 → 运维中心
- **云函数**: 云开发控制台 → 云函数日志
- **管理后台**: Express日志中间件

### 2. 性能监控

- 小程序性能分析
- 云函数调用统计
- 数据库查询性能

### 3. 告警

- 云函数异常告警
- 数据库容量告警
- 接口调用异常

## 开发规范

### 1. 代码规范

- ESLint + Prettier
- Git commit规范(commitlint)
- 代码审查流程

### 2. 命名规范

- **文件**: kebab-case (goods-list.js)
- **组件**: PascalCase (GoodsList)
- **函数**: camelCase (fetchGoodsList)
- **常量**: UPPER_SNAKE_CASE (MAX_PAGE_SIZE)

### 3. 目录规范

```
pages/          # 页面(按业务模块分组)
  goods/
  order/
  usercenter/
components/     # 公共组件
services/       # 服务层(按模块分组)
  good/
  order/
  user/
model/          # 数据适配层
utils/          # 工具函数
config/         # 配置文件
```

## 扩展方向

### 短期优化
- SKU多规格支持
- 支付功能完善
- 订单状态流转优化
- 搜索功能增强

### 中期规划
- 会员体系
- 积分系统
- 消息通知
- 数据报表

### 长期规划
- 多商户支持
- 供应链管理
- 分销系统
- AI推荐

## 参考文档

- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [TDesign组件库](https://tdesign.tencent.com/miniprogram/overview)
- [腾讯云开发文档](https://cloud.tencent.com/document/product/876)
- [CloudBase Node SDK](https://docs.cloudbase.net/api-reference/server/node-sdk/introduction.html)
