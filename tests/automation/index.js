/**
 * 小程序自动化测试 - 主入口
 *
 * 运行方式：
 * node tests/automation/index.js [test-name]
 *
 * 可用测试：
 * - all: 运行所有测试
 * - shopping: 购物流程测试
 * - category: 分类浏览测试
 */

const shoppingFlow = require('./shopping-flow.test');
const categoryFlow = require('./category-flow.test');

// 获取命令行参数
const testName = process.argv[2] || 'all';

async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   微信小程序 UI 自动化测试             ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');
  console.log('测试项目: miniprogram-1');
  console.log('测试类型:', testName);
  console.log('时间:', new Date().toLocaleString('zh-CN'));
  console.log('');

  try {
    switch (testName) {
      case 'shopping':
        await shoppingFlow.runAllTests();
        break;

      case 'category':
        await categoryFlow.runCategoryTests();
        break;

      case 'all':
      default:
        // 运行所有测试
        console.log('📋 运行所有测试...\n');

        // 购物流程测试
        await shoppingFlow.runAllTests();

        console.log('\n--- 等待 3 秒后继续下一个测试 ---\n');
        await new Promise(r => setTimeout(r, 3000));

        // 分类浏览测试
        await categoryFlow.runCategoryTests();

        break;
    }

    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   ✅ 所有测试执行完成                  ║');
    console.log('╚════════════════════════════════════════╝');

  } catch (error) {
    console.error('\n╔════════════════════════════════════════╗');
    console.error('║   ❌ 测试执行失败                      ║');
    console.error('╚════════════════════════════════════════╝');
    console.error('错误信息:', error.message);
    process.exit(1);
  }
}

main();
