const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  console.log('[获取评价] event:', event);

  try {
    // 支持两种参数格式
    const queryParameter = event.queryParameter || {};
    const spuId = event.spuId || queryParameter.spuId;
    const pageNum = event.pageNum || 1;
    const pageSize = event.pageSize || 10;
    const type = event.type || 'list';
    const commentLevel = queryParameter.commentLevel; // 3=好评, 2=中评, 1=差评
    const hasImage = queryParameter.hasImage; // true=有图

    // 构建查询条件
    const where = { status: 1 };
    if (spuId) {
      where.spuId = String(spuId);
    }

    if (type === 'count') {
      // 获取评价统计
      const result = await db.collection('comments')
        .where(where)
        .get();

      const comments = result.data || [];
      const commentCount = comments.length;

      // 计算好评数（4-5星）、中评数（3星）、差评数（1-2星）
      let goodCount = 0;
      let middleCount = 0;
      let badCount = 0;
      let hasImageCount = 0;

      comments.forEach((comment) => {
        const rating = comment.goodsRating || 0;
        if (rating >= 4) {
          goodCount++;
        } else if (rating === 3) {
          middleCount++;
        } else {
          badCount++;
        }
        if (comment.images && comment.images.length > 0) {
          hasImageCount++;
        }
      });

      const goodRate = commentCount > 0 ? Math.round((goodCount / commentCount) * 1000) / 10 : 100;

      return {
        success: true,
        data: {
          commentCount,
          goodCount,
          middleCount,
          badCount,
          hasImageCount,
          goodRate,
        },
      };
    } else {
      // 根据筛选条件构建查询
      let listWhere = { ...where };

      // 按评价等级筛选
      if (commentLevel === 3) {
        // 好评：4-5星
        listWhere.goodsRating = _.gte(4);
      } else if (commentLevel === 2) {
        // 中评：3星
        listWhere.goodsRating = 3;
      } else if (commentLevel === 1) {
        // 差评：1-2星
        listWhere.goodsRating = _.lte(2);
      }

      // 按是否有图筛选
      if (hasImage === true) {
        listWhere['images.0'] = _.exists(true);
      }

      // 获取评价列表
      const result = await db.collection('comments')
        .where(listWhere)
        .orderBy('createTime', 'desc')
        .skip((pageNum - 1) * pageSize)
        .limit(pageSize)
        .get();

      // 获取符合条件的总数
      const countResult = await db.collection('comments')
        .where(listWhere)
        .count();
      const totalCount = countResult.total || 0;

      // 收集所有云存储 fileID
      const fileIds = new Set();
      result.data.forEach((comment) => {
        if (comment.userAvatar && comment.userAvatar.startsWith('cloud://')) {
          fileIds.add(comment.userAvatar);
        }
        if (comment.images && Array.isArray(comment.images)) {
          comment.images.forEach((img) => {
            if (img && img.startsWith('cloud://')) {
              fileIds.add(img);
            }
          });
        }
      });

      // 批量转换云存储 URL
      let urlMap = {};
      if (fileIds.size > 0) {
        try {
          const tempUrlResult = await cloud.getTempFileURL({
            fileList: [...fileIds],
          });
          if (tempUrlResult.fileList) {
            tempUrlResult.fileList.forEach((file) => {
              if (file.tempFileURL) {
                urlMap[file.fileID] = file.tempFileURL;
              }
            });
          }
        } catch (e) {
          console.error('[转换URL失败]', e);
        }
      }

      // 转换评价数据格式
      const comments = result.data.map((comment) => ({
        commentId: comment._id,
        spuId: comment.spuId,
        userName: comment.isAnonymous ? '匿名用户' : (comment.userName || '用户'),
        userHeadUrl: comment.isAnonymous ? '' : (urlMap[comment.userAvatar] || comment.userAvatar || ''),
        commentScore: comment.goodsRating || 5,
        commentContent: comment.content || '',
        commentResources: (comment.images || []).map((img) => ({
          src: urlMap[img] || img,
          type: 'image',
        })),
        commentTime: String(comment.createTime || ''),
        isAnonymity: comment.isAnonymous || false,
        goodsDetailInfo: comment.goodsName ? `${comment.goodsName}` : '',
      }));

      return {
        success: true,
        data: {
          pageNum,
          pageSize,
          totalCount,
          homePageComments: comments,
        },
      };
    }
  } catch (error) {
    console.error('[获取评价] 失败:', error);
    return {
      success: false,
      error: error.message,
      data: {
        commentCount: 0,
        goodCount: 0,
        middleCount: 0,
        badCount: 0,
        hasImageCount: 0,
        goodRate: 100,
        homePageComments: [],
      },
    };
  }
};
