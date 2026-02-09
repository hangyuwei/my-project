/**
 * 小程序自动化测试 - 分类浏览流程
 *
 * 测试流程：
 * 1. 进入分类页面
 * 2. 遍历所有分类
 * 3. 验证每个分类的商品列表
 * 4. 点击商品查看详情
 * 5. 加入购物车
 */

const automator = require('miniprogram-automator');
const config = require('./config');

let miniProgram;
let page;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 启动小程序
 */
async function launch() {
  console.log('🚀 连接小程序...');

  // 使用 connect 连接已开启自动化的开发者工具
  if (config.wsEndpoint) {
    console.log('使用 WebSocket 连接:', config.wsEndpoint);
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
 * 关闭小程序
 */
async function close() {
  if (miniProgram) {
    await miniProgram.disconnect();
    console.log('✅ 连接已断开');
  }
}

/**
 * 测试分类页面完整流程
 */
async function testCategoryFlow() {
  console.log('\n📂 开始分类浏览测试...');

  // 进入分类页面
  page = await miniProgram.switchTab('/pages/category/index');
  await sleep(config.waitTime.pageLoad);

  // 获取分类数据
  const data = await page.data();
  const categories = data.categories || [];

  console.log(`发现 ${categories.length} 个分类`);

  // 遍历每个分类
  for (let i = 0; i < Math.min(categories.length, 5); i++) {
    const category = categories[i];
    console.log(`\n--- 测试分类 ${i + 1}: ${category.name} ---`);

    // 点击分类
    const sidebarItems = await page.$$('.sidebar-item');
    if (sidebarItems[i]) {
      await sidebarItems[i].tap();
      await sleep(config.waitTime.medium);

      // 获取该分类下的商品
      const categoryData = await page.data();
      const goodsList = categoryData.goodsList || [];

      console.log(`分类 "${category.name}" 下有 ${goodsList.length} 个商品`);

      // 如果有商品，点击第一个
      if (goodsList.length > 0) {
        console.log(`第一个商品: ${goodsList[0].title}, 价格: ¥${goodsList[0].price}`);

        // 点击商品进入详情
        const goodsCards = await page.$$('.goods-card');
        if (goodsCards.length > 0) {
          await goodsCards[0].tap();
          await sleep(config.waitTime.pageLoad);

          // 获取详情页数据
          const detailPage = await miniProgram.currentPage();
          const detailData = await detailPage.data();

          if (detailData.details) {
            console.log(`✅ 进入商品详情: ${detailData.details.title}`);
          }

          // 返回分类页
          await miniProgram.navigateBack();
          await sleep(config.waitTime.medium);
        }
      }
    }
  }

  console.log('\n✅ 分类浏览测试完成');
}

/**
 * 测试分类页面加入购物车
 */
async function testCategoryAddToCart() {
  console.log('\n🛒 测试从分类页加入购物车...');

  // 进入分类页面
  page = await miniProgram.switchTab('/pages/category/index');
  await sleep(config.waitTime.pageLoad);

  // 获取商品列表
  const data = await page.data();
  const goodsList = data.goodsList || [];

  if (goodsList.length > 0) {
    // 查找购物车按钮
    const cartButtons = await page.$$('.goods-card .cart-icon');
    if (cartButtons.length > 0) {
      await cartButtons[0].tap();
      await sleep(config.waitTime.short);
      console.log('✅ 点击加入购物车按钮');
    } else {
      console.log('⚠️ 未找到购物车按钮，尝试其他方式');

      // 尝试点击商品卡片上的购物车图标
      const addCartBtns = await page.$$('[class*="add-cart"]');
      if (addCartBtns.length > 0) {
        await addCartBtns[0].tap();
        await sleep(config.waitTime.short);
        console.log('✅ 通过其他选择器点击加入购物车');
      }
    }
  }

  // 验证购物车
  await miniProgram.switchTab('/pages/cart/index');
  await sleep(config.waitTime.pageLoad);

  const cartData = await (await miniProgram.currentPage()).data();
  if (cartData.cartGroupData && cartData.cartGroupData.isNotEmpty) {
    console.log('✅ 商品已成功加入购物车');
  }
}

/**
 * 运行分类测试
 */
async function runCategoryTests() {
  console.log('========================================');
  console.log('🧪 分类浏览自动化测试');
  console.log('========================================');

  try {
    await launch();
    await testCategoryFlow();
    await testCategoryAddToCart();

    console.log('\n========================================');
    console.log('✅ 分类测试完成');
    console.log('========================================');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error(error.stack);
  } finally {
    await close();
  }
}

module.exports = {
  launch,
  close,
  testCategoryFlow,
  testCategoryAddToCart,
  runCategoryTests
};

if (require.main === module) {
  runCategoryTests();
}
