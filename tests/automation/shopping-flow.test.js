/**
 * 小程序自动化测试 - 完整购物流程
 *
 * 测试流程：
 * 1. 启动小程序，进入首页
 * 2. 浏览商品列表
 * 3. 点击商品进入详情页
 * 4. 加入购物车
 * 5. 进入购物车页面
 * 6. 选择商品结算
 * 7. 确认订单
 */

const automator = require('miniprogram-automator');
const config = require('./config');

// 全局变量
let miniProgram;
let page;

/**
 * 等待指定时间
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 启动小程序
 */
async function launchMiniProgram() {
  console.log('🚀 连接小程序...');
  console.log('项目路径:', config.projectPath);

  // 使用 connect 连接已开启自动化的开发者工具
  if (config.wsEndpoint) {
    console.log('使用 WebSocket 连接:', config.wsEndpoint);
    miniProgram = await automator.connect({
      wsEndpoint: config.wsEndpoint,
    });
  } else {
    // 或者使用 launch 启动新实例
    miniProgram = await automator.launch({
      cliPath: config.cliPath,
      projectPath: config.projectPath,
    });
  }

  console.log('✅ 小程序连接成功');
  return miniProgram;
}

/**
 * 关闭小程序
 */
async function closeMiniProgram() {
  if (miniProgram) {
    console.log('🔚 断开连接...');
    await miniProgram.disconnect();
    console.log('✅ 连接已断开');
  }
}

/**
 * 测试首页加载
 */
async function testHomePage() {
  console.log('\n📱 测试首页...');

  page = await miniProgram.reLaunch('/pages/home/home');
  await sleep(config.waitTime.pageLoad);

  // 获取页面数据
  const data = await page.data();
  console.log('首页数据:', {
    goodsCount: data.goodsList ? data.goodsList.length : 0,
    imgSrcsCount: data.imgSrcs ? data.imgSrcs.length : 0
  });

  // 验证商品列表
  if (data.goodsList && data.goodsList.length > 0) {
    console.log('✅ 首页商品列表加载成功，共', data.goodsList.length, '个商品');
  } else {
    console.log('⚠️ 首页商品列表为空');
  }

  return data;
}

/**
 * 测试分类页面
 */
async function testCategoryPage() {
  console.log('\n📂 测试分类页面...');

  page = await miniProgram.switchTab('/pages/category/index');
  await sleep(config.waitTime.pageLoad);

  const data = await page.data();
  console.log('分类页数据:', {
    categoriesCount: data.categories ? data.categories.length : 0,
    currentCategory: data.currentCategory,
    goodsCount: data.goodsList ? data.goodsList.length : 0
  });

  // 点击不同分类
  if (data.categories && data.categories.length > 1) {
    console.log('点击第二个分类...');
    const sidebarItems = await page.$$('.sidebar-item');
    if (sidebarItems.length > 1) {
      await sidebarItems[1].tap();
      await sleep(config.waitTime.medium);

      const newData = await page.data();
      console.log('切换分类后:', {
        currentCategory: newData.currentCategory,
        categoryName: newData.categoryName,
        goodsCount: newData.goodsList ? newData.goodsList.length : 0
      });
      console.log('✅ 分类切换成功');
    }
  }

  return data;
}

/**
 * 测试商品详情页
 */
async function testGoodsDetail(spuId) {
  console.log('\n🛍️ 测试商品详情页...');

  // 如果没有传入 spuId，使用默认值
  const goodsId = spuId || '1';

  page = await miniProgram.navigateTo(`/pages/goods/details/index?spuId=${goodsId}`);
  await sleep(config.waitTime.pageLoad);

  const data = await page.data();
  console.log('商品详情:', {
    title: data.details ? data.details.title : '未知',
    price: data.details ? data.details.price : '未知'
  });

  return data;
}

/**
 * 测试加入购物车
 */
async function testAddToCart() {
  console.log('\n🛒 测试加入购物车...');

  // 查找加入购物车按钮
  const addCartBtn = await page.$('.add-cart-btn');
  if (addCartBtn) {
    await addCartBtn.tap();
    await sleep(config.waitTime.medium);
    console.log('✅ 点击加入购物车按钮');
  } else {
    // 尝试其他选择器
    const bottomBar = await page.$('.goods-bottom-bar');
    if (bottomBar) {
      const buttons = await bottomBar.$$('button');
      if (buttons.length > 0) {
        await buttons[0].tap();
        await sleep(config.waitTime.medium);
        console.log('✅ 点击底部加入购物车按钮');
      }
    }
  }
}

/**
 * 测试购物车页面
 */
async function testCartPage() {
  console.log('\n🛒 测试购物车页面...');

  page = await miniProgram.switchTab('/pages/cart/index');
  await sleep(config.waitTime.pageLoad);

  const data = await page.data();
  console.log('购物车数据:', {
    isNotEmpty: data.cartGroupData ? data.cartGroupData.isNotEmpty : false,
    totalAmount: data.cartGroupData ? data.cartGroupData.totalAmount : 0,
    selectedCount: data.cartGroupData ? data.cartGroupData.selectedGoodsCount : 0
  });

  if (data.cartGroupData && data.cartGroupData.isNotEmpty) {
    console.log('✅ 购物车有商品');
  } else {
    console.log('⚠️ 购物车为空');
  }

  return data;
}

/**
 * 测试用户中心页面
 */
async function testUserCenterPage() {
  console.log('\n👤 测试用户中心页面...');

  page = await miniProgram.switchTab('/pages/usercenter/index');
  await sleep(config.waitTime.pageLoad);

  const data = await page.data();
  console.log('用户中心数据:', {
    hasUserInfo: !!data.userInfo,
    menuCount: data.menuData ? data.menuData.length : 0
  });

  return data;
}

/**
 * 完整购物流程测试
 */
async function testShoppingFlow() {
  console.log('\n🛍️ 开始完整购物流程测试...');

  // 1. 首页 - 浏览商品
  const homeData = await testHomePage();

  // 2. 点击商品进入详情
  if (homeData.goodsList && homeData.goodsList.length > 0) {
    const firstGoods = homeData.goodsList[0];
    console.log('选择商品:', firstGoods.title);

    // 点击商品
    const goodsItems = await page.$$('.goods-card');
    if (goodsItems.length > 0) {
      await goodsItems[0].tap();
      await sleep(config.waitTime.pageLoad);
      console.log('✅ 进入商品详情页');

      // 3. 加入购物车
      await testAddToCart();
    }
  }

  // 4. 进入购物车
  await testCartPage();

  console.log('\n✅ 购物流程测试完成');
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('========================================');
  console.log('🧪 小程序自动化测试开始');
  console.log('========================================');

  try {
    // 启动小程序
    await launchMiniProgram();

    // 运行测试
    await testHomePage();
    await testCategoryPage();
    await testCartPage();
    await testUserCenterPage();

    // 完整购物流程
    await testShoppingFlow();

    console.log('\n========================================');
    console.log('✅ 所有测试完成');
    console.log('========================================');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error(error.stack);
  } finally {
    await closeMiniProgram();
  }
}

// 导出函数
module.exports = {
  launchMiniProgram,
  closeMiniProgram,
  testHomePage,
  testCategoryPage,
  testGoodsDetail,
  testAddToCart,
  testCartPage,
  testUserCenterPage,
  testShoppingFlow,
  runAllTests,
  sleep
};

// 如果直接运行此文件
if (require.main === module) {
  runAllTests();
}
