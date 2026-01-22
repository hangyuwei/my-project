const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  console.log('[保存地址] openid:', openid, 'event:', event);

  try {
    const { addressData } = event;

    if (!addressData) {
      return {
        success: false,
        error: '地址数据不能为空',
      };
    }

    const now = Date.now();
    const address = {
      ...addressData,
      openid,
      updateTime: String(now),
      deleted: false,
    };

    // 如果设置为默认地址，需要先将其他地址的默认状态取消
    if (address.isDefault === 1 || address.isDefault === true) {
      address.isDefault = 1;
      await db.collection('address')
        .where({
          openid: openid,
          isDefault: 1,
        })
        .update({
          data: {
            isDefault: 0,
            updateTime: String(now),
          },
        });
    } else {
      address.isDefault = 0;
    }

    let result;
    // 如果有 addressId 或 _id，表示更新现有地址
    if (addressData.addressId || addressData._id) {
      const docId = addressData._id || addressData.addressId;
      delete address._id;
      delete address.addressId;

      result = await db.collection('address').doc(docId).update({
        data: address,
      });

      console.log('[保存地址] 更新成功:', docId);
      return {
        success: true,
        addressId: docId,
        message: '地址更新成功',
      };
    } else {
      // 新增地址
      address.createTime = String(now);
      address.id = `addr_${openid}_${now}`;

      result = await db.collection('address').add({
        data: address,
      });

      console.log('[保存地址] 新增成功:', result._id);
      return {
        success: true,
        addressId: result._id,
        id: address.id,
        message: '地址添加成功',
      };
    }
  } catch (error) {
    console.error('[保存地址] 失败:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
