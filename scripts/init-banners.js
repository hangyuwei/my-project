// 初始化 Banner 数据的脚本
// 使用方法：在微信开发者工具的云函数中运行此脚本

const cloud = require('wx-server-sdk');

cloud.init({
  env: 'dfhxcx-7gwr0cb34dd24d36' // 你的云环境 ID
});

const db = cloud.database();

// 测试用的 Banner 数据
const banners = [
  {
    title: '精选好物',
    imageUrl: 'https://tdesign.gtimg.com/miniprogram/template/retail/home/v2/banner1.png',
    linkUrl: '/pages/goods/list/index',
    sort: 1,
    status: 'active',
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    title: '春季新品',
    imageUrl: 'https://tdesign.gtimg.com/miniprogram/template/retail/home/v2/banner2.png',
    linkUrl: '/pages/goods/list/index',
    sort: 2,
    status: 'active',
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    title: '限时特惠',
    imageUrl: 'https://tdesign.gtimg.com/miniprogram/template/retail/home/v2/banner3.png',
    linkUrl: '/pages/goods/list/index',
    sort: 3,
    status: 'active',
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    title: '品质生活',
    imageUrl: 'https://tdesign.gtimg.com/miniprogram/template/retail/home/v2/banner4.png',
    linkUrl: '/pages/goods/list/index',
    sort: 4,
    status: 'active',
    createTime: new Date(),
    updateTime: new Date()
  }
];

exports.main = async (event, context) => {
  try {
    // 清空现有的 banner（可选）
    if (event.clearExisting) {
      const existing = await db.collection('banners').get();
      for (const item of existing.data) {
        await db.collection('banners').doc(item._id).remove();
      }
      console.log('已清空现有 banner 数据');
    }

    // 添加新的 banner
    const promises = banners.map(banner =>
      db.collection('banners').add({ data: banner })
    );

    const results = await Promise.all(promises);

    return {
      success: true,
      message: `成功添加 ${results.length} 条 banner 数据`,
      ids: results.map(r => r._id)
    };
  } catch (error) {
    console.error('初始化 banner 失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
