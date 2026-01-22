const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event, context) => {
  try {
    // 从数据库获取分类列表
    const result = await db.collection('categories').get();

    // 如果数据库中没有分类数据，返回默认分类
    if (!result.data || result.data.length === 0) {
      return {
        success: true,
        data: [
          {
            groupId: '0',
            key: '',
            name: '全部商品',
            thumbnail: 'https://cdn-we-retail.ym.tencent.com/tsr/goods/nz-09a.png',
            children: [],
          },
          {
            groupId: '1',
            key: 'nutrition',
            name: '营养保健',
            thumbnail: 'https://cdn-we-retail.ym.tencent.com/tsr/goods/muy-3a.png',
            children: [],
          },
          {
            groupId: '2',
            key: 'health_food',
            name: '健康食品',
            thumbnail: 'https://cdn-we-retail.ym.tencent.com/tsr/goods/nz-08b.png',
            children: [],
          },
          {
            groupId: '3',
            key: 'beauty_skincare',
            name: '美妆护肤',
            thumbnail: 'https://cdn-we-retail.ym.tencent.com/tsr/goods/muy-2a.png',
            children: [],
          },
          {
            groupId: '4',
            key: 'home_living',
            name: '居家生活',
            thumbnail: 'https://cdn-we-retail.ym.tencent.com/tsr/goods/nz-09b.png',
            children: [],
          },
          {
            groupId: '5',
            key: 'senior_leisure_food',
            name: '老年休闲食品',
            thumbnail: 'https://cdn-we-retail.ym.tencent.com/tsr/goods/nz-08a.png',
            children: [],
          },
        ],
      };
    }

    return {
      success: true,
      data: result.data.map((item, index) => ({
        groupId: String(item.groupId || item._id || index),
        key: item.key || item.categoryKey || '',
        name: item.name || item.title || '',
        thumbnail: item.thumbnail || item.image || 'https://cdn-we-retail.ym.tencent.com/tsr/goods/nz-09a.png',
        children: item.children || [],
      })),
    };
  } catch (error) {
    console.error('[getCategoryList] 失败:', error);
    return {
      success: false,
      error: error.message,
      // 返回默认分类作为降级方案
      data: [
        {
          groupId: '0',
          key: '',
          name: '全部商品',
          thumbnail: 'https://cdn-we-retail.ym.tencent.com/tsr/goods/nz-09a.png',
          children: [],
        },
        {
          groupId: '1',
          key: 'nutrition',
          name: '营养保健',
          thumbnail: 'https://cdn-we-retail.ym.tencent.com/tsr/goods/muy-3a.png',
          children: [],
        },
        {
          groupId: '2',
          key: 'health_food',
          name: '健康食品',
          thumbnail: 'https://cdn-we-retail.ym.tencent.com/tsr/goods/nz-08b.png',
          children: [],
        },
        {
          groupId: '3',
          key: 'beauty_skincare',
          name: '美妆护肤',
          thumbnail: 'https://cdn-we-retail.ym.tencent.com/tsr/goods/muy-2a.png',
          children: [],
        },
        {
          groupId: '4',
          key: 'home_living',
          name: '居家生活',
          thumbnail: 'https://cdn-we-retail.ym.tencent.com/tsr/goods/nz-09b.png',
          children: [],
        },
        {
          groupId: '5',
          key: 'senior_leisure_food',
          name: '老年休闲食品',
          thumbnail: 'https://cdn-we-retail.ym.tencent.com/tsr/goods/nz-08a.png',
          children: [],
        },
      ],
    };
  }
};
