/**
 * 小程序自动化测试配置
 */
module.exports = {
  // 微信开发者工具路径 (Windows)
  cliPath: 'C:/Program Files (x86)/Tencent/微信web开发者工具/cli.bat',

  // 项目路径
  projectPath: __dirname.replace(/\\/g, '/').replace('/tests/automation', ''),

  // 自动化连接配置 (连接已开启的自动化端口)
  wsEndpoint: 'ws://127.0.0.1:9420',

  // 测试超时时间
  timeout: 60000,

  // 等待时间配置
  waitTime: {
    short: 500,
    medium: 1000,
    long: 2000,
    pageLoad: 3000
  },

  // 测试数据
  testData: {
    // 测试商品
    goods: {
      name: '测试',
      price: 0.01
    },
    // 测试地址
    address: {
      name: '测试用户',
      phone: '13800138000',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      detail: '测试地址详情'
    }
  }
};
