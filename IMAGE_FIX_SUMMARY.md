# 图片403错误修复说明

## 问题描述

订单列表页面出现大量图片加载失败,返回 403 (HTTP/1.1 403) 错误。错误的图片URL如下:
```
https://6466-dfhxcx-7gwr0cb34dd24d36-1317897048.tcb.qcloud.la/goods/goods-1768379943167-2tzr2b.png?sign=xxx&t=1768959195
```

## 根本原因

1. **临时URL过期**: 云函数使用 `cloud.getTempFileURL()` 生成的临时URL,有效期约2小时
2. **无刷新机制**: 临时URL过期后,前端没有重新获取新URL的机制
3. **客户端缓存问题**: 过期的URL被缓存,导致持续出现403错误

## 解决方案

### 1. 创建云文件管理器 (cloudFileManager.js)

**位置**: `utils/cloudFileManager.js`

**功能**:
- 统一管理云存储文件ID到临时URL的转换
- 实现1.5小时的客户端缓存(临时URL有效期2小时,留0.5小时缓冲)
- 提供批量转换功能,提高性能
- 支持URL过期检测和缓存清理

**主要方法**:
```javascript
getTempFileURL(fileId)           // 单个转换
batchGetTempFileURL(fileIds)     // 批量转换
isCloudFileId(url)               // 检查是否为云存储ID
isTempCloudUrl(url)              // 检查是否为临时URL
isUrlExpired(url)                // 检查URL是否过期
clearCache(fileId)               // 清除指定缓存
```

### 2. 修改云函数

#### getOrderList (订单列表)
**文件**: `cloudfunctions/getOrderList/index.js`

**修改内容**:
- ❌ 移除服务端URL转换逻辑(第93-126行)
- ✅ 保留原始 `cloud://` fileID
- ✅ 让客户端负责转换和缓存管理

#### getOrderDetail (订单详情)
**文件**: `cloudfunctions/getOrderDetail/index.js`

**修改内容**:
- ❌ 移除服务端URL转换逻辑(第41-83行)
- ✅ 保留原始 `cloud://` fileID

### 3. 修改前端页面

#### 订单列表页面
**文件**: `pages/order/order-list/index.js`

**修改内容**:
1. 引入 cloudFileManager 工具
2. 在 `getOrderList()` 方法中:
   - 收集所有云存储 fileID
   - 批量转换为临时URL
   - 同时保存 fileID 供后续重试使用

**关键代码**:
```javascript
import { batchGetTempFileURL, isCloudFileId } from '../../../utils/cloudFileManager';

// 在获取订单数据后
const cloudFileIds = [];
orders.forEach(order => {
  order.orderItemVOs.forEach(goods => {
    if (isCloudFileId(goods.goodsPictureUrl)) {
      cloudFileIds.push(goods.goodsPictureUrl);
    }
  });
});

const urlMap = await batchGetTempFileURL(cloudFileIds);
```

#### 订单详情页面
**文件**: `pages/order/order-detail/index.js`

**修改内容**: 与订单列表类似,实现客户端URL转换

### 4. 增强 webp-image 组件

**文件**: `components/webp-image/index.js` 和 `index.wxml`

**新增功能**:

1. **新属性 cloudFileId**:
   - 用于传递原始云存储 fileID
   - 当图片加载失败时可以重新获取临时URL

2. **自动URL转换**:
   - 组件初始化时自动转换 cloudFileId
   - 监听 src/cloudFileId 变化并自动更新

3. **智能错误重试**:
   - 检测图片加载失败(403错误)
   - 自动清除过期缓存
   - 重新获取新的临时URL
   - 最多重试2次

**关键代码**:
```javascript
async handleError(e) {
  const { cloudFileId } = this.properties;
  const { retryCount } = this.data;

  if (cloudFileId && isCloudFileId(cloudFileId) && retryCount < 2) {
    clearCache(cloudFileId);
    const tempUrl = await getTempFileURL(cloudFileId);
    if (tempUrl !== actualSrc) {
      this.setData({
        actualSrc: tempUrl,
        retryCount: retryCount + 1,
      });
      return; // 自动重试加载
    }
  }

  this.triggerEvent('error', e.detail);
}
```

## 技术优势

### 1. 客户端缓存
- 减少云函数调用次数
- 1.5小时缓存时间,在URL过期前自动刷新
- 提升用户体验

### 2. 批量处理
- 一次性转换多个 fileID
- 减少网络请求
- 提高页面加载速度

### 3. 自动重试
- 检测403错误自动重试
- 无需用户手动刷新
- 透明处理过期URL

### 4. 向后兼容
- 同时支持 `cloud://` fileID 和普通 HTTP URL
- 不影响现有的图片处理逻辑(cosThumb, imageMogr)
- 组件 API 向后兼容

## 使用示例

### 在页面中使用
```javascript
import { batchGetTempFileURL, isCloudFileId } from '../../utils/cloudFileManager';

// 批量转换
const fileIds = ['cloud://xxx-1.png', 'cloud://xxx-2.png'];
const urlMap = await batchGetTempFileURL(fileIds);

// 使用转换后的URL
const tempUrl = urlMap['cloud://xxx-1.png'];
```

### 在组件中使用
```xml
<!-- 传递 cloudFileId 属性 -->
<webp-image
  src="{{imageUrl}}"
  cloudFileId="{{cloudFileId}}"
  mode="aspectFill"
/>
```

## 注意事项

1. **首次加载**: 首次转换 fileID 时需要调用云开发 API,会有轻微延迟
2. **缓存管理**: 缓存保存在内存中,小程序重启后会清空
3. **网络依赖**: 需要确保小程序已正确初始化云开发环境
4. **并发限制**: 批量转换时,单次最多处理50个文件(微信限制)

## 测试建议

1. **清除缓存测试**: 关闭并重新打开小程序,验证图片是否正常加载
2. **过期URL测试**: 等待2小时后,验证图片是否自动刷新
3. **网络异常测试**: 断网情况下的错误处理
4. **大量图片测试**: 订单列表包含大量商品时的性能表现

## 后续优化建议

1. **持久化缓存**: 考虑使用 `wx.setStorage` 持久化缓存
2. **预加载机制**: 在URL即将过期前(1.5小时)主动刷新
3. **降级策略**: 当云存储不可用时,使用默认占位图
4. **监控告警**: 添加图片加载失败的监控和上报

## 相关文件清单

### 新增文件
- `utils/cloudFileManager.js` - 云文件管理器

### 修改文件
- `cloudfunctions/getOrderList/index.js` - 订单列表云函数
- `cloudfunctions/getOrderDetail/index.js` - 订单详情云函数
- `pages/order/order-list/index.js` - 订单列表页面
- `pages/order/order-detail/index.js` - 订单详情页面
- `components/webp-image/index.js` - 图片组件逻辑
- `components/webp-image/index.wxml` - 图片组件模板

## 部署步骤

1. **上传云函数**:
   ```bash
   # 上传 getOrderList 云函数
   # 上传 getOrderDetail 云函数
   ```

2. **发布小程序代码**:
   - 确保所有文件都已提交
   - 在微信开发者工具中编译
   - 上传代码并提审

3. **验证功能**:
   - 测试订单列表图片加载
   - 测试订单详情图片加载
   - 验证错误重试机制

## 联系与支持

如有问题,请检查:
1. 云开发环境是否正确初始化
2. 云函数是否成功部署
3. 控制台是否有错误日志

---
**修复日期**: 2026-01-21
**版本**: 1.0.0
