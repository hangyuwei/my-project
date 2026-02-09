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
    const addressId = addressData.addressId || addressData._id || `addr_${now}`;

    const address = {
      addressId,
      phone: addressData.phone,
      name: addressData.name,
      countryName: addressData.countryName || '中国',
      countryCode: addressData.countryCode || 'chn',
      provinceName: addressData.provinceName,
      provinceCode: addressData.provinceCode,
      cityName: addressData.cityName,
      cityCode: addressData.cityCode,
      districtName: addressData.districtName,
      districtCode: addressData.districtCode,
      detailAddress: addressData.detailAddress,
      isDefault: addressData.isDefault === 1 || addressData.isDefault === true ? 1 : 0,
      addressTag: addressData.addressTag || '',
      latitude: addressData.latitude || '',
      longitude: addressData.longitude || '',
      updateTime: now,
    };

    // 查找用户文档
    const userResult = await db.collection('user')
      .where(_.or([
        { openid },
        { _openid: openid },
      ]))
      .get();

    if (!userResult.data || userResult.data.length === 0) {
      // 用户不存在，创建用户并添加地址
      address.createTime = now;
      const newUser = {
        openid,
        _openid: openid,
        addresses: [address],
        createTime: now,
        updateTime: now,
      };

      await db.collection('user').add({ data: newUser });
      console.log('[保存地址] 新用户，创建成功');

      return {
        success: true,
        addressId: address.addressId,
        message: '地址添加成功',
      };
    }

    const user = userResult.data[0];
    let addresses = user.addresses || [];

    // 如果设置为默认地址，先将其他地址的默认状态取消
    if (address.isDefault === 1) {
      addresses = addresses.map(addr => ({
        ...addr,
        isDefault: 0,
      }));
    }

    // 查找是否已存在该地址
    const existingIndex = addresses.findIndex(
      addr => addr.addressId === addressId
    );

    if (existingIndex >= 0) {
      // 更新现有地址
      addresses[existingIndex] = {
        ...addresses[existingIndex],
        ...address,
      };
      console.log('[保存地址] 更新地址:', addressId);
    } else {
      // 新增地址
      address.createTime = now;
      addresses.push(address);
      console.log('[保存地址] 新增地址:', addressId);
    }

    // 更新用户文档
    await db.collection('user').doc(user._id).update({
      data: {
        addresses,
        updateTime: now,
      },
    });

    return {
      success: true,
      addressId: address.addressId,
      message: existingIndex >= 0 ? '地址更新成功' : '地址添加成功',
    };
  } catch (error) {
    console.error('[保存地址] 失败:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
