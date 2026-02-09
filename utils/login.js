/**
 * 登录工具函数
 * 用于管理用户登录状态和 Token
 */

const TOKEN_KEY = 'user_token';
const USER_INFO_KEY = 'user_info';

/**
 * 检查用户是否已登录
 * @returns {boolean} 是否已登录
 */
export function checkLoginStatus() {
  const token = wx.getStorageSync(TOKEN_KEY);
  return !!token;
}

/**
 * 获取用户 Token
 * @returns {string|null} Token 或 null
 */
export function getToken() {
  return wx.getStorageSync(TOKEN_KEY) || null;
}

/**
 * 保存用户 Token
 * @param {string} token - 用户 Token
 */
export function saveToken(token) {
  wx.setStorageSync(TOKEN_KEY, token);
}

/**
 * 保存用户信息
 * @param {object} userInfo - 用户信息对象
 */
export function saveUserInfo(userInfo) {
  wx.setStorageSync(USER_INFO_KEY, userInfo);
}

/**
 * 获取用户信息
 * @returns {object|null} 用户信息或 null
 */
export function getUserInfo() {
  return wx.getStorageSync(USER_INFO_KEY) || null;
}

/**
 * 清除登录信息
 */
export function clearLoginInfo() {
  wx.removeStorageSync(TOKEN_KEY);
  wx.removeStorageSync(USER_INFO_KEY);
}

/**
 * 退出登录
 * 清除登录信息并显示提示
 * @returns {Promise<void>}
 */
export function logout() {
  return new Promise((resolve) => {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗?',
      success: (res) => {
        if (res.confirm) {
          // 清除登录信息
          clearLoginInfo();

          // 显示退出成功提示
          wx.showToast({
            title: '已退出登录',
            icon: 'success',
            duration: 2000,
          });

          resolve(true);
        } else {
          resolve(false);
        }
      },
    });
  });
}

/**
 * 模拟后端登录接口
 * 实际使用时需要替换为真实的后端接口调用
 *
 * @param {object} params - 登录参数
 * @param {string} params.code - 微信登录 code
 * @param {string} params.encryptedData - 加密数据
 * @param {string} params.iv - 加密算法的初始向量
 * @returns {Promise<object>} 返回登录结果
 */
export function mockLoginApi({ code, encryptedData, iv }) {
  return new Promise((resolve, reject) => {
    // 模拟网络延迟
    setTimeout(() => {
      // 模拟成功响应
      const mockResponse = {
        success: true,
        data: {
          token: 'mock_token_' + Date.now(),
          userInfo: {
            userId: 'user_' + Date.now(),
            phone: '138****8888',
            nickname: '微信用户',
            avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132',
            couponAmount: 50, // 新人优惠券金额
          },
        },
        message: '登录成功',
      };

      resolve(mockResponse);

      // 模拟失败情况(取消注释以测试错误处理)
      // reject({
      //   success: false,
      //   message: '登录失败,请稍后重试',
      // });
    }, 1000);
  });
}

/**
 * 执行完整的登录流程
 * 1. 获取微信登录 code
 * 2. 获取手机号授权数据
 * 3. 调用后端接口换取 token
 * 4. 保存登录信息
 *
 * @param {object} phoneData - 手机号授权数据
 * @param {string} phoneData.encryptedData - 加密数据
 * @param {string} phoneData.iv - 加密算法的初始向量
 * @returns {Promise<object>} 返回登录结果
 */
export async function performLogin(phoneData) {
  try {
    // Step 1: 获取微信登录 code
    const loginRes = await wx.login();
    if (!loginRes.code) {
      throw new Error('获取登录凭证失败');
    }

    // Step 2: 调用后端接口
    const result = await mockLoginApi({
      code: loginRes.code,
      encryptedData: phoneData.encryptedData,
      iv: phoneData.iv,
    });

    if (result.success) {
      // Step 3: 保存登录信息
      saveToken(result.data.token);
      saveUserInfo(result.data.userInfo);
      return {
        success: true,
        userInfo: result.data.userInfo,
      };
    } else {
      throw new Error(result.message || '登录失败');
    }
  } catch (error) {
    console.error('[登录工具] 登录失败:', error);
    return {
      success: false,
      message: error.message || '登录失败,请稍后重试',
    };
  }
}
