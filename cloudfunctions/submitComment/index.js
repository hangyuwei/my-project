const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  console.log('[提交评价] openid:', openid, 'event:', event);

  try {
    const {
      orderNo,
      spuId,
      goodsName,
      goodsImage,
      content,
      goodsRating,
      serviceRating,
      logisticsRating,
      images = [],
      isAnonymous = false,
      userName: clientUserName = '',
      userAvatar: clientUserAvatar = '',
    } = event;

    if (!orderNo || !spuId) {
      return {
        success: false,
        error: '参数不完整',
      };
    }

    // 检查订单是否已评价
    const userScope = _.or([{ openid }, { uid: openid }, { userId: openid }]);
    const orderResult = await db.collection('orders')
      .where(_.and([userScope, { orderNo }]))
      .get();

    if (orderResult.data && orderResult.data.length > 0) {
      const order = orderResult.data[0];
      if (order.hasCommented) {
        return {
          success: false,
          error: '该订单已评价，不能重复评价',
        };
      }
    }

    const now = Date.now();
    const commentId = `comment_${openid}_${now}`;

    // 获取用户信息
    let userName = '用户';
    let userAvatar = '';

    if (!isAnonymous) {
      // 优先使用前端传来的用户信息
      if (clientUserName) {
        userName = clientUserName;
        userAvatar = clientUserAvatar;
      } else {
        // 回退到从数据库查询
        try {
          const userResult = await db.collection('users')
            .where({ openid })
            .get();

          if (userResult.data && userResult.data[0]) {
            userName = userResult.data[0].nickName || userResult.data[0].nickname || '用户';
            userAvatar = userResult.data[0].avatarUrl || userResult.data[0].avatar || '';
          }
        } catch (e) {
          console.log('[提交评价] 获取用户信息失败，使用默认值');
        }
      }
    } else {
      userName = '匿名用户';
      userAvatar = '';
    }

    // 创建评价记录
    const comment = {
      _id: commentId,
      commentId,
      openid,
      orderNo,
      spuId,
      goodsName,
      goodsImage,
      content,
      goodsRating,
      serviceRating,
      logisticsRating,
      images,
      isAnonymous,
      userName: isAnonymous ? '匿名用户' : userName,
      userAvatar: isAnonymous ? '' : userAvatar,
      createTime: now,
      updateTime: now,
      status: 1, // 1=正常显示
    };

    await db.collection('comments').add({ data: comment });

    // 更新订单的评价状态
    if (orderResult.data && orderResult.data.length > 0) {
      const order = orderResult.data[0];
      await db.collection('orders')
        .doc(order._id)
        .update({
          data: {
            hasCommented: true,
            commentTime: now,
            commentId: commentId,
          },
        });
      console.log('[提交评价] 已更新订单评价状态, orderNo:', orderNo);
    }

    console.log('[提交评价] 成功, commentId:', commentId);

    return {
      success: true,
      data: {
        commentId,
        orderNo,
      },
    };
  } catch (error) {
    console.error('[提交评价] 失败:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
