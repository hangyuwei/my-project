# 开发部署指南

## 环境准备

### 1. 开发工具安装

**必需工具:**
- [x] 微信开发者工具 (最新版本)
- [x] Node.js (v16+)
- [x] Git

**推荐工具:**
- VS Code 或其他代码编辑器
- Postman (API测试)

### 2. 账号准备

- 微信小程序账号 (已注册并通过认证)
- 腾讯云账号 (开通云开发服务)
- 获取云开发环境ID

## 快速开始

### 第一步: 克隆项目

```bash
git clone -b main https://gitee.com/william2241/cloudbase-admin.git
cd cloudbase-admin
```

### 第二步: 安装依赖

**小程序依赖:**
```bash
npm install
```

**管理后台依赖:**
```bash
cd ecommerce-management-backend
npm install
cd ..
```

### 第三步: 配置云开发环境

1. 打开微信开发者工具
2. 导入项目 → 选择 `cloudbase-admin` 目录
3. 填写 AppID
4. 开通云开发 → 创建环境(建议创建两个环境: dev开发环境, prod生产环境)
5. 记录环境ID (格式: `xxx-xxx`)

### 第四步: 配置小程序

编辑 `project.config.json`:
```json
{
  "appid": "你的小程序AppID",
  "cloudfunctionRoot": "cloudfunctions/"
}
```

编辑 `config/index.js`:
```javascript
const config = {
  useMock: false,  // 开发阶段可设为true
  cloudBaseUrl: '', // 使用云函数时可留空
}

export default config
```

### 第五步: 初始化数据库

1. 打开云开发控制台
2. 数据库 → 创建以下集合:
   - `goods` (商品)
   - `user` (用户)
   - `order` (订单)
   - `salesPromotion` (促销)

3. 设置集合权限(开发阶段):
   - 所有用户可读,仅创建者可写

### 第六步: 部署云函数

在微信开发者工具中:

1. 展开 `cloudfunctions/` 目录
2. 右键每个云函数文件夹 → 上传并部署: 云端安装依赖

**需要部署的云函数:**
- getHome
- getGoodsList
- getGood
- searchGoods
- (其他根据需要部署)

### 第七步: 运行小程序

1. 微信开发者工具 → 工具 → 构建npm
2. 点击 "编译" 运行小程序
3. 查看控制台,确认无错误

### 第八步: 配置管理后台

编辑 `ecommerce-management-backend/.env.production`:
```env
CLOUDBASE_ENV_ID=你的云开发环境ID
CLOUDBASE_SECRET_ID=你的SecretId
CLOUDBASE_SECRET_KEY=你的SecretKey
PORT=3001
```

**获取 SecretId/Key:**
1. 腾讯云控制台 → 访问管理 → API密钥管理
2. 新建密钥 → 保存 SecretId 和 SecretKey

### 第九步: 运行管理后台(本地开发)

```bash
cd ecommerce-management-backend
npm run dev      # 前端开发服务器(Vite)
```

另开一个终端:
```bash
cd ecommerce-management-backend
npm start        # 后端API服务器
```

访问: `http://localhost:5173` (前端) + `http://localhost:3001` (API)

## 开发模式

### Mock模式 (无需云服务)

**适用场景:** 开发前端UI,无需真实数据

**配置:**
```javascript
// config/index.js
export default {
  useMock: true,
}
```

**优点:**
- 无需部署云函数
- 快速开发迭代
- 降低成本

**数据来源:** `model/*.js` 中的Mock数据生成函数

### 真实模式 (连接云服务)

**适用场景:** 测试完整功能,联调前后端

**配置:**
```javascript
// config/index.js
export default {
  useMock: false,
}
```

**要求:**
- 云函数已部署
- 数据库已初始化
- 网络连接正常

## 数据库管理

### 通过云开发控制台

1. 访问 [云开发控制台](https://console.cloud.tencent.com/tcb)
2. 选择环境 → 数据库
3. 可视化操作: 新增/编辑/删除记录

### 通过管理后台

1. 访问管理后台 (部署后或本地)
2. 各个管理页面(商品/订单/用户)
3. UI界面操作

### 数据导入/导出

**导出数据:**
```bash
# 在云开发控制台 → 数据库 → 导出
# 选择集合 → 导出为JSON
```

**导入数据:**
```bash
# 使用提供的种子数据
cd ecommerce-management-backend/seed
# 查看 seed 目录中的示例数据
# 在云开发控制台 → 数据库 → 导入
```

## 部署上线

### 小程序发布

1. **准备工作**
   - 确保云函数已全部部署
   - 数据库已配置好权限
   - 测试所有核心功能

2. **上传代码**
   - 微信开发者工具 → 上传
   - 填写版本号和描述

3. **提交审核**
   - 微信公众平台 → 开发管理 → 版本管理
   - 选择待审核版本 → 提交审核
   - 填写审核信息

4. **发布**
   - 审核通过后 → 点击发布
   - 用户可通过小程序码访问

### 管理后台部署(云托管)

1. **构建Docker镜像**

检查 `ecommerce-management-backend/Dockerfile`:
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

2. **创建云托管服务**

```bash
# 访问云开发控制台
# 选择云托管 → 新建服务
# 服务名称: ecommerce-admin
# 部署方式: Dockerfile
```

3. **配置部署参数**

- 代码来源: 本地上传 或 Git仓库
- 构建目录: `ecommerce-management-backend/`
- Dockerfile路径: `Dockerfile`
- 端口: `3001`

4. **设置环境变量**

```
CLOUDBASE_ENV_ID=你的环境ID
CLOUDBASE_SECRET_ID=你的SecretId
CLOUDBASE_SECRET_KEY=你的SecretKey
PORT=3001
NODE_ENV=production
```

5. **部署**

- 点击 "部署" → 等待构建完成
- 查看部署日志
- 访问生成的URL测试

6. **绑定自定义域名(可选)**

- 云托管 → 服务设置 → 域名管理
- 添加自定义域名
- 配置DNS解析

### 环境隔离建议

**开发环境 (dev):**
- 用于日常开发测试
- 数据可随意修改
- 云函数使用开发版本

**生产环境 (prod):**
- 用于正式上线
- 数据需谨慎操作
- 云函数使用稳定版本

**切换环境:**
```javascript
// 小程序根据不同环境切换
const env = 'dev-xxx'  // 或 'prod-xxx'
wx.cloud.init({ env })
```

## 数据初始化

### 初始商品数据

使用管理后台添加商品:

1. 访问管理后台 → 商品管理
2. 点击 "新建商品"
3. 填写信息:
   - 商品名称
   - 价格
   - 库存
   - 上传图片(封面图、展示图、详情图)
4. 保存

### 批量导入(可选)

参考 `ecommerce-management-backend/seed/` 目录中的示例数据结构

## 常见问题排查

### 1. 云函数调用失败

**错误:** `cloud function execution error`

**排查步骤:**
1. 检查云函数是否已部署
2. 查看云函数日志(云开发控制台 → 云函数 → 日志)
3. 确认小程序已初始化云开发(`wx.cloud.init()`)
4. 检查环境ID是否正确

### 2. 数据库访问权限问题

**错误:** `permission denied`

**解决方案:**
1. 云开发控制台 → 数据库 → 集合 → 权限设置
2. 开发阶段设置为: "所有用户可读,仅创建者可写"
3. 或通过安全规则精细化控制

### 3. 管理后台无法连接数据库

**错误:** `Invalid credentials`

**排查步骤:**
1. 检查 `.env.production` 文件配置
2. 确认 SecretId/Key 是否正确
3. 检查腾讯云账号权限(需要云开发权限)
4. 查看服务器日志

### 4. 图片上传失败

**可能原因:**
- 图片过大(建议<2MB)
- 存储空间不足
- 网络问题

**解决方案:**
1. 压缩图片
2. 检查云存储容量
3. 使用CDN加速

### 5. 小程序构建npm失败

**错误:** `npm构建失败`

**解决方案:**
1. 删除 `miniprogram_npm/` 目录
2. 删除 `node_modules/` 目录
3. 重新 `npm install`
4. 微信开发者工具 → 工具 → 构建npm

### 6. Mock数据无法切换

**检查项:**
1. `config/index.js` 中的 `useMock` 配置
2. 清除小程序缓存(开发工具 → 清缓存)
3. 重新编译

## 性能优化建议

### 小程序端

1. **分包加载**
   ```json
   // app.json
   "subpackages": [
     {
       "root": "pages/goods",
       "pages": ["list/list", "detail/detail"]
     }
   ]
   ```

2. **图片懒加载**
   ```xml
   <image lazy-load="true" src="{{imgUrl}}" />
   ```

3. **数据预加载**
   - 首页数据提前加载
   - 使用数据缓存(`wx.setStorage`)

### 云函数端

1. **添加数据库索引**
   ```javascript
   // 在云开发控制台 → 数据库 → 索引管理
   // 为常用查询字段添加索引
   ```

2. **限制返回字段**
   ```javascript
   db.collection('goods')
     .field({ goodName: true, price: true, coverImage: true })
     .get()
   ```

3. **使用分页**
   ```javascript
   db.collection('goods')
     .limit(20)
     .skip(page * 20)
     .get()
   ```

### 管理后台

1. **代码分割**
   - Vite自动处理
   - 动态导入大组件

2. **图片优化**
   - 使用WebP格式
   - 压缩上传图片
   - 使用缩略图

## 监控和日志

### 小程序监控

1. 微信公众平台 → 统计分析
   - 访问分析
   - 性能分析
   - 实时日志

2. 云开发控制台 → 监控告警
   - 云函数调用统计
   - 数据库请求监控
   - 存储使用情况

### 管理后台监控

1. 云托管控制台
   - 服务监控
   - 日志查看
   - 资源使用

2. 自定义日志
   ```javascript
   // server/index.js
   app.use((req, res, next) => {
     console.log(`${req.method} ${req.path}`)
     next()
   })
   ```

## 安全检查清单

- [ ] 云函数已部署,本地代码已删除敏感信息
- [ ] 数据库权限已正确配置
- [ ] 管理后台已设置登录验证
- [ ] SecretId/Key使用环境变量,未提交到代码库
- [ ] 小程序已配置合法域名
- [ ] API已添加必要的参数验证
- [ ] 敏感操作已添加日志记录

## 维护和更新

### 云函数更新

1. 修改云函数代码
2. 右键 → 上传并部署
3. 测试新功能
4. 查看日志确认

### 小程序更新

1. 修改代码
2. 微信开发者工具 → 上传
3. 提交审核(新版本)
4. 审核通过后发布

### 管理后台更新

1. 修改代码
2. 提交到Git仓库
3. 云托管 → 重新部署
4. 查看部署日志
5. 测试新功能

### 数据备份

**定期备份数据库:**
1. 云开发控制台 → 数据库
2. 每个集合 → 导出
3. 保存JSON文件
4. 建议每周备份一次

## 成本优化

### 免费额度

云开发提供免费额度:
- 数据库: 2GB存储 + 5GB流量
- 云存储: 5GB容量 + 5GB流量
- 云函数: 4万次调用/月

### 优化建议

1. **合理使用缓存**
   - 减少数据库查询
   - 小程序端缓存常用数据

2. **优化图片**
   - 压缩图片大小
   - 使用合适的图片格式

3. **精简云函数**
   - 减少不必要的云函数调用
   - 合并多个小请求

## 技术支持

### 官方文档

- 微信小程序: https://developers.weixin.qq.com/miniprogram/dev/framework/
- 腾讯云开发: https://cloud.tencent.com/document/product/876
- TDesign: https://tdesign.tencent.com/miniprogram/overview

### 社区支持

- 微信开放社区
- TDesign GitHub Issues
- 云开发官方社区

## 下一步

完成部署后,建议按以下顺序进行:

1. 熟悉项目结构和代码
2. 添加初始商品数据
3. 测试核心功能(浏览/购物车/下单)
4. 根据需求定制化修改
5. 性能测试和优化
6. 提交小程序审核
7. 正式发布
