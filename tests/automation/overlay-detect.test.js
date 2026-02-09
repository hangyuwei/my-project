/**
 * 小程序自动化测试 - 遮罩层问题检测
 *
 * 检测内容：
 * 1. 检查所有页面是否有遮罩层遮挡内容
 * 2. 检查 z-index 层级是否正确
 * 3. 检查 overlay/popup/dialog 组件状态
 * 4. 验证点击事件是否被遮挡
 */

const automator = require('miniprogram-automator');
const config = require('./config');

let miniProgram;
let page;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 连接小程序
 */
async function connect() {
  console.log('🚀 连接小程序...');

  if (config.wsEndpoint) {
    miniProgram = await automator.connect({
      wsEndpoint: config.wsEndpoint,
    });
  } else {
    miniProgram = await automator.launch({
      cliPath: config.cliPath,
      projectPath: config.projectPath,
    });
  }

  console.log('✅ 小程序连接成功');
  return miniProgram;
}

/**
 * 断开连接
 */
async function disconnect() {
  if (miniProgram) {
    await miniProgram.disconnect();
    console.log('✅ 连接已断开');
  }
}

/**
 * 检测页面上的遮罩层元素
 */
async function detectOverlayElements(pagePath) {
  console.log(`\n🔍 检测页面遮罩层: ${pagePath}`);

  // 导航到页面
  if (pagePath.includes('pages/home') || pagePath.includes('pages/category') ||
      pagePath.includes('pages/cart') || pagePath.includes('pages/usercenter')) {
    page = await miniProgram.switchTab('/' + pagePath);
  } else {
    page = await miniProgram.navigateTo('/' + pagePath);
  }
  await sleep(config.waitTime.pageLoad);

  const issues = [];

  // 1. 检查 t-overlay 组件
  const overlays = await page.$$('t-overlay');
  console.log(`  发现 ${overlays.length} 个 t-overlay 组件`);

  for (let i = 0; i < overlays.length; i++) {
    const overlay = overlays[i];
    try {
      const visible = await overlay.property('visible');
      const zIndex = await overlay.property('zIndex');

      if (visible) {
        console.log(`  ⚠️ t-overlay[${i}] 可见, z-index: ${zIndex}`);
        issues.push({
          type: 't-overlay',
          index: i,
          visible: true,
          zIndex: zIndex,
          page: pagePath
        });
      }
    } catch (e) {
      // 忽略属性读取错误
    }
  }

  // 2. 检查 t-popup 组件
  const popups = await page.$$('t-popup');
  console.log(`  发现 ${popups.length} 个 t-popup 组件`);

  for (let i = 0; i < popups.length; i++) {
    const popup = popups[i];
    try {
      const visible = await popup.property('visible');
      if (visible) {
        console.log(`  ⚠️ t-popup[${i}] 可见`);
        issues.push({
          type: 't-popup',
          index: i,
          visible: true,
          page: pagePath
        });
      }
    } catch (e) {
      // 忽略属性读取错误
    }
  }

  // 3. 检查 t-dialog 组件
  const dialogs = await page.$$('t-dialog');
  console.log(`  发现 ${dialogs.length} 个 t-dialog 组件`);

  for (let i = 0; i < dialogs.length; i++) {
    const dialog = dialogs[i];
    try {
      const visible = await dialog.property('visible');
      if (visible) {
        console.log(`  ⚠️ t-dialog[${i}] 可见`);
        issues.push({
          type: 't-dialog',
          index: i,
          visible: true,
          page: pagePath
        });
      }
    } catch (e) {
      // 忽略属性读取错误
    }
  }

  // 4. 检查固定定位的遮罩元素
  const fixedElements = await page.$$('[style*="position: fixed"]');
  console.log(`  发现 ${fixedElements.length} 个固定定位元素`);

  // 5. 检查页面数据中的遮罩相关状态
  const pageData = await page.data();
  const maskRelatedKeys = Object.keys(pageData).filter(key =>
    key.toLowerCase().includes('visible') ||
    key.toLowerCase().includes('show') ||
    key.toLowerCase().includes('mask') ||
    key.toLowerCase().includes('overlay') ||
    key.toLowerCase().includes('popup') ||
    key.toLowerCase().includes('dialog') ||
    key.toLowerCase().includes('modal')
  );

  if (maskRelatedKeys.length > 0) {
    console.log(`  遮罩相关数据状态:`);
    maskRelatedKeys.forEach(key => {
      const value = pageData[key];
      if (value === true) {
        console.log(`    ⚠️ ${key}: ${value}`);
        issues.push({
          type: 'data-state',
          key: key,
          value: value,
          page: pagePath
        });
      } else {
        console.log(`    ✓ ${key}: ${value}`);
      }
    });
  }

  return issues;
}

/**
 * 测试点击是否被遮挡
 */
async function testClickBlocked(pagePath, selector, description) {
  console.log(`\n🖱️ 测试点击: ${description} (${selector})`);

  // 导航到页面
  if (pagePath.includes('pages/home') || pagePath.includes('pages/category') ||
      pagePath.includes('pages/cart') || pagePath.includes('pages/usercenter')) {
    page = await miniProgram.switchTab('/' + pagePath);
  } else {
    page = await miniProgram.navigateTo('/' + pagePath);
  }
  await sleep(config.waitTime.pageLoad);

  try {
    const element = await page.$(selector);
    if (!element) {
      console.log(`  ⚠️ 未找到元素: ${selector}`);
      return { blocked: null, reason: 'element_not_found' };
    }

    // 获取元素位置
    const rect = await element.boundingClientRect();
    console.log(`  元素位置: x=${rect.left}, y=${rect.top}, w=${rect.width}, h=${rect.height}`);

    // 尝试点击
    await element.tap();
    await sleep(config.waitTime.short);

    console.log(`  ✅ 点击成功`);
    return { blocked: false };

  } catch (error) {
    console.log(`  ❌ 点击失败: ${error.message}`);
    return { blocked: true, reason: error.message };
  }
}

/**
 * 检测所有主要页面的遮罩层问题
 */
async function detectAllPages() {
  console.log('\n========================================');
  console.log('🔍 开始遮罩层问题检测');
  console.log('========================================');

  const allIssues = [];

  // 检测主要页面
  const pagesToCheck = [
    'pages/home/home',
    'pages/category/index',
    'pages/cart/index',
    'pages/usercenter/index'
  ];

  for (const pagePath of pagesToCheck) {
    try {
      const issues = await detectOverlayElements(pagePath);
      allIssues.push(...issues);
    } catch (error) {
      console.log(`  ❌ 检测失败: ${error.message}`);
    }
  }

  // 汇总报告
  console.log('\n========================================');
  console.log('📊 检测报告');
  console.log('========================================');

  if (allIssues.length === 0) {
    console.log('✅ 未发现遮罩层问题');
  } else {
    console.log(`⚠️ 发现 ${allIssues.length} 个潜在问题:\n`);
    allIssues.forEach((issue, index) => {
      console.log(`${index + 1}. [${issue.page}]`);
      console.log(`   类型: ${issue.type}`);
      if (issue.key) {
        console.log(`   状态: ${issue.key} = ${issue.value}`);
      }
      if (issue.zIndex) {
        console.log(`   z-index: ${issue.zIndex}`);
      }
      console.log('');
    });
  }

  return allIssues;
}

/**
 * 测试商品详情页的遮罩层
 */
async function testGoodsDetailOverlay() {
  console.log('\n🛍️ 测试商品详情页遮罩层...');

  // 先进入首页
  page = await miniProgram.switchTab('/pages/home/home');
  await sleep(config.waitTime.pageLoad);

  // 获取商品列表
  const pageData = await page.data();
  if (pageData.goodsList && pageData.goodsList.length > 0) {
    const spuId = pageData.goodsList[0].spuId;

    // 进入商品详情
    page = await miniProgram.navigateTo(`/pages/goods/details/index?spuId=${spuId}`);
    await sleep(config.waitTime.pageLoad);

    // 检测遮罩层
    const issues = await detectOverlayElements('pages/goods/details/index');

    // 测试点击加入购物车按钮 (使用正确的选择器)
    console.log('\n🖱️ 测试点击: 加入购物车按钮');
    try {
      // buy-bar 组件中的按钮
      const addCartBtn = await page.$('.bar-separately');
      if (addCartBtn) {
        const rect = await addCartBtn.boundingClientRect();
        console.log(`  元素位置: x=${rect.left}, y=${rect.top}, w=${rect.width}, h=${rect.height}`);
        await addCartBtn.tap();
        await sleep(config.waitTime.short);
        console.log('  ✅ 点击成功');
      } else {
        console.log('  ⚠️ 未找到 .bar-separately 按钮');

        // 尝试其他选择器
        const buyButtons = await page.$('.buy-buttons');
        if (buyButtons) {
          console.log('  找到 .buy-buttons 容器');
        }
      }
    } catch (error) {
      console.log(`  ❌ 点击失败: ${error.message}`);
      issues.push({
        type: 'click-blocked',
        element: '加入购物车按钮',
        reason: error.message,
        page: 'pages/goods/details/index'
      });
    }

    return issues;
  }

  return [];
}

/**
 * 运行遮罩层检测测试
 */
async function runOverlayTests() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   遮罩层问题检测自动化测试             ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');

  try {
    await connect();

    // 检测所有页面
    const pageIssues = await detectAllPages();

    // 测试商品详情页
    const detailIssues = await testGoodsDetailOverlay();

    const allIssues = [...pageIssues, ...detailIssues];

    console.log('\n========================================');
    if (allIssues.length === 0) {
      console.log('✅ 所有检测通过，未发现遮罩层问题');
    } else {
      console.log(`⚠️ 共发现 ${allIssues.length} 个问题需要处理`);
    }
    console.log('========================================');

    return allIssues;

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error(error.stack);
    return [];
  } finally {
    await disconnect();
  }
}

module.exports = {
  connect,
  disconnect,
  detectOverlayElements,
  testClickBlocked,
  detectAllPages,
  testGoodsDetailOverlay,
  runOverlayTests
};

if (require.main === module) {
  runOverlayTests();
}
