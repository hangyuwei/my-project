# UI 自动化回放系统使用文档

## 概述

这是一个完整的小程序 UI 自动化回放系统，支持录制用户的所有交互操作并进行回放，可用于自动化测试、演示、用户行为分析等场景。

## 功能特性

- ✅ **事件录制**：自动捕获用户的点击、输入、滚动等所有交互事件
- ✅ **事件回放**：按照录制的时间序列精确回放用户操作
- ✅ **存储管理**：支持保存、加载、删除录制记录
- ✅ **可视化控制**：提供友好的控制面板，支持录制/回放控制
- ✅ **速度调节**：支持 0.5x - 5x 的回放速度调节
- ✅ **暂停/恢复**：支持录制和回放过程中的暂停/恢复
- ✅ **导入/导出**：支持录制数据的导入导出

## 系统架构

```
utils/automation/
├── index.js          # 主入口，统一导出
├── recorder.js       # 事件录制器
├── player.js         # 事件回放器
├── storage.js        # 存储管理器
├── injector.js       # 事件注入器
└── page-mixin.js     # 页面混入（可选）

components/
└── automation-panel/ # 可视化控制面板
    ├── automation-panel.wxml
    ├── automation-panel.wxss
    ├── automation-panel.js
    └── automation-panel.json
```

## 快速开始

### 1. 在页面中添加控制面板

在任意页面的 WXML 中添加控制面板组件：

```xml
<!-- pages/home/home.wxml -->
<view class="container">
  <!-- 你的页面内容 -->

  <!-- 添加自动化控制面板 -->
  <automation-panel />
</view>
```

### 2. 开始使用

打开小程序后，你会在页面底部看到一个"自动化"按钮：

1. **点击按钮**展开控制面板
2. **录制模式**：
   - 点击"开始录制"按钮
   - 进行你想要录制的操作
   - 点击"停止录制"保存
3. **回放模式**：
   - 切换到"回放模式"
   - 在录制列表中选择一条记录
   - 点击"开始回放"观看自动回放

## API 使用

### 全局访问

自动化系统已集成到 `app.js`，可以通过 `getApp().globalData.automation` 访问：

```javascript
const app = getApp();
const automation = app.globalData.automation;

// 开始录制
automation.startRecord('我的测试会话');

// 停止录制
const recordData = automation.stopRecord();

// 开始回放
await automation.startPlay('session_id', { speed: 1.5 });

// 停止回放
automation.stopPlay();
```

### 录制器 API

```javascript
const recorder = require('../../utils/automation/recorder');

// 开始录制
recorder.start('会话名称');

// 停止录制
const data = recorder.stop();

// 暂停录制
recorder.pause();

// 恢复录制
recorder.resume();

// 手动记录事件
recorder.recordEvent('tap', eventData);

// 获取录制状态
const status = recorder.getStatus();

// 监听录制事件
recorder.on('recordStart', (data) => {
  console.log('录制开始', data);
});

recorder.on('eventRecorded', (event) => {
  console.log('记录了一个事件', event);
});
```

### 回放器 API

```javascript
const player = require('../../utils/automation/player');

// 开始回放
await player.play(recordData, { speed: 1.0 });

// 停止回放
player.stop();

// 暂停回放
player.pause();

// 恢复回放
player.resume();

// 设置回放速度
player.setSpeed(2.0); // 2倍速

// 跳转到指定事件
player.seekTo(10); // 跳到第10个事件

// 获取回放状态
const status = player.getStatus();

// 监听回放事件
player.on('playStart', () => {
  console.log('回放开始');
});

player.on('progress', (data) => {
  console.log('回放进度', data.progress);
});

player.on('playComplete', () => {
  console.log('回放完成');
});
```

### 存储管理 API

```javascript
const storage = require('../../utils/automation/storage');

// 保存录制记录
await storage.saveRecord(recordData);

// 获取所有记录
const records = await storage.getAllRecords();

// 获取单条记录
const record = await storage.getRecord('session_id');

// 删除记录
await storage.deleteRecord('session_id');

// 清空所有记录
await storage.clearAllRecords();

// 导出记录为 JSON
const json = await storage.exportRecord('session_id');

// 从 JSON 导入记录
await storage.importRecord(jsonString);

// 获取存储统计
const info = await storage.getStorageInfo();
```

## 高级用法

### 1. 在页面中自动捕获事件（可选）

如果想要自动捕获页面中的所有事件，可以使用页面混入：

```javascript
// pages/home/home.js
const { wrapPage } = require('../../utils/automation/page-mixin');

const pageConfig = {
  data: {
    // 你的数据
  },

  onLoad() {
    // 你的代码
  },

  onTapButton(e) {
    // 这个事件会被自动捕获
    console.log('按钮被点击');
  }
};

// 使用 wrapPage 包装页面配置
Page(wrapPage(pageConfig));
```

### 2. 手动记录自定义事件

```javascript
const recorder = require('../../utils/automation/recorder');

// 在你的业务逻辑中手动记录事件
onCustomAction() {
  // 记录自定义事件
  recorder.recordEvent('custom_action', {
    action: 'purchase',
    productId: '12345',
    amount: 99.99
  });

  // 执行你的业务逻辑
  this.doPurchase();
}
```

### 3. 监听自动化事件

```javascript
const automation = getApp().globalData.automation;

// 监听录制开始
automation.recorder.on('recordStart', (data) => {
  console.log('开始录制:', data.sessionId);
  // 可以在这里做一些初始化工作
});

// 监听回放进度
automation.player.on('progress', (data) => {
  console.log(`回放进度: ${data.progress}%`);
  // 可以更新 UI 显示进度
});

// 监听回放完成
automation.player.on('playComplete', () => {
  console.log('回放完成');
  // 可以执行一些清理工作或跳转页面
});
```

### 4. 编程式控制

```javascript
// 在代码中控制录制和回放
const automation = getApp().globalData.automation;

// 场景1: 自动化测试
async function runTest() {
  // 开始录制
  automation.startRecord('自动化测试');

  // 执行一系列操作
  await doSomeActions();

  // 停止录制
  const record = automation.stopRecord();

  // 立即回放验证
  await automation.startPlay(record.sessionId, { speed: 2.0 });
}

// 场景2: 用户引导
async function showGuide() {
  // 加载预先录制的引导流程
  const records = await automation.storage.getAllRecords();
  const guideRecord = records.find(r => r.sessionId.includes('引导'));

  if (guideRecord) {
    await automation.startPlay(guideRecord.sessionId, { speed: 0.8 });
  }
}
```

## 数据格式

### 录制数据结构

```javascript
{
  sessionId: "session_1234567890",
  startTime: 1234567890000,
  endTime: 1234567900000,
  duration: 10000,
  eventCount: 25,
  events: [
    {
      id: "event_1",
      type: "tap",
      timestamp: 1234567890100,
      relativeTime: 100,
      route: "pages/home/home",
      data: {
        target: {
          id: "btn-submit",
          dataset: { handler: "onSubmit" },
          offsetLeft: 100,
          offsetTop: 200
        },
        detail: {}
      }
    },
    // 更多事件...
  ]
}
```

### 支持的事件类型

- `tap` - 点击事件
- `longpress` - 长按事件
- `input` - 输入事件
- `confirm` - 确认事件
- `scroll` - 滚动事件
- `change` - 改变事件
- `touchstart` - 触摸开始
- `touchmove` - 触摸移动
- `touchend` - 触摸结束
- `pageInfo` - 页面信息（用于页面跳转）

## 注意事项

1. **性能考虑**：录制会捕获所有事件，在复杂页面可能影响性能，建议在需要时才开启录制
2. **存储限制**：默认最多保存 50 条录制记录，可以通过配置调整
3. **隐私保护**：录制数据包含用户操作信息，请注意数据安全和隐私保护
4. **回放准确性**：回放依赖于页面状态，如果页面结构变化可能导致回放失败
5. **网络请求**：回放不会重新发起网络请求，只是模拟 UI 操作

## 常见问题

### Q: 为什么回放时某些操作没有执行？

A: 可能的原因：
- 页面结构发生了变化，元素 ID 不匹配
- 某些操作依赖于特定的页面状态
- 网络请求返回的数据不同

### Q: 如何在生产环境禁用自动化功能？

A: 可以通过环境变量控制：

```javascript
// app.js
onLaunch: function () {
  // 只在开发环境启用
  if (process.env.NODE_ENV === 'development') {
    automation.init({ maxRecords: 50 });
  }
}
```

### Q: 录制数据可以跨设备使用吗？

A: 可以，通过导出/导入功能：

```javascript
// 设备A：导出
const json = await storage.exportRecord('session_id');
// 将 json 发送到设备B

// 设备B：导入
await storage.importRecord(json);
```

## 示例场景

### 场景1: 自动化测试

```javascript
// 测试购物流程
async function testPurchaseFlow() {
  const automation = getApp().globalData.automation;

  // 开始录制
  automation.startRecord('购物流程测试');

  // 手动执行一次完整的购物流程
  // 1. 浏览商品
  // 2. 加入购物车
  // 3. 结算
  // 4. 支付

  // 停止录制
  const record = automation.stopRecord();

  // 后续可以反复回放这个流程进行测试
  await automation.startPlay(record.sessionId);
}
```

### 场景2: 用户行为分析

```javascript
// 分析用户操作路径
const automation = getApp().globalData.automation;

// 获取所有录制记录
const records = await automation.storage.getAllRecords();

// 分析用户最常访问的页面
const pageVisits = {};
records.forEach(record => {
  record.events.forEach(event => {
    if (event.type === 'pageInfo') {
      pageVisits[event.route] = (pageVisits[event.route] || 0) + 1;
    }
  });
});

console.log('页面访问统计:', pageVisits);
```

### 场景3: 新手引导

```javascript
// 创建新手引导
async function createGuide() {
  const automation = getApp().globalData.automation;

  // 录制引导流程
  automation.startRecord('新手引导_v1');

  // 执行引导操作...

  const record = automation.stopRecord();

  // 保存为引导记录
  await automation.storage.updateRecordMetadata(record.sessionId, {
    type: 'guide',
    version: '1.0'
  });
}

// 播放新手引导
async function playGuide() {
  const automation = getApp().globalData.automation;
  const records = await automation.storage.getAllRecords();

  // 找到引导记录
  const guide = records.find(r => r.type === 'guide');

  if (guide) {
    // 慢速播放引导
    await automation.startPlay(guide.sessionId, { speed: 0.5 });
  }
}
```

## 总结

这个 UI 自动化回放系统提供了完整的录制和回放功能，可以应用于：

- ✅ 自动化测试
- ✅ 用户行为分析
- ✅ 新手引导演示
- ✅ Bug 复现
- ✅ 功能演示

系统设计灵活，支持编程式控制和可视化操作，可以根据实际需求进行扩展和定制。
